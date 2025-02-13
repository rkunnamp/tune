"use strict";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ignore from 'ignore';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Recursively list files while checking if directories should be ignored
async function listFiles(dir, ig, relativeDir = '') {
  let results = [];
  let list;
  try {
    list = await fs.promises.readdir(dir);
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err);
    throw err
    return results;
  }
  for (const file of list) {
    const fullPath = path.join(dir, file);
    // Compute the relative path for the ignore filter.
    const relPath = relativeDir ? path.join(relativeDir, file) : file;
    // If the ignore rules match, skip this file/directory
    if (ig.ignores(relPath)) continue;
    const stat = await fs.promises.lstat(fullPath);
    if (stat.isDirectory()) {
      const recursed = await listFiles(fullPath, ig, relPath);
      results = results.concat(recursed);
    } else if (stat.isFile()) {
      results.push(fullPath);
    }
  }
  return results;
}

// Efficient cosineDistance assuming normalized embeddings
function cosineDistance(vecA, vecB) {
  let dot = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
  }
  return dot;
}

// Calls Jina embedding API. Batches input texts.
async function getEmbedding(texts, model, task, dimensions, jinaApiKey) {
  const payload = {
    model,
    task,
    late_chunking: false,
    dimensions,
    embedding_type: "float",
    input: texts
  };
  const response = await fetch('https://api.jina.ai/v1/embeddings', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jinaApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`Jina embedding API error: ${await response.text()}`);
  }
  const result = await response.json();
  return result.data.map(item => item.embedding)
}

// Calls Jina reranker API
async function rerankDocuments(query, documents, top_n, jinaApiKey) {
  const payload = {
    model: "jina-reranker-v2-base-multilingual",
    query,
    top_n,
    documents
  };
  const response = await fetch('https://api.jina.ai/v1/rerank', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jinaApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`Jina rerank API error: ${await response.text()}`);
  }
  const result = await response.json();
  return result.results.map(item => ({ index: item.index, score: item.relevance_score }))
  // Assume result.documents contains the re-ranked list of documents.
  return result.documents;
}

// Main function implementing the RAG tool
export default async function rag({ text }, ctx) {
  // Load ignore rules from .gitignore and .rgignore
  const query = text
  let ig = ignore();
  try {
    const gitignoreContents = await fs.promises.readFile(path.join(__dirname, '.gitignore'), 'utf8');
    ig.add(gitignoreContents);
  } catch (err) {
    console.log("No .gitignore file found or error reading it.");
  }
  try {
    const rgignoreContents = await fs.promises.readFile(path.join(__dirname, '.rgignore'), 'utf8');
    ig.add(rgignoreContents);
  } catch (err) {
    console.log("No .rgignore file found or error reading it.");
  }

  // Load .rag config file (expects keys: fileExtensions, jinaApiKey, dimensions)
  const ragConfig = JSON.parse(await fs.promises.readFile(path.join(__dirname, '.rag'), 'utf8'));
  const { fileExtensions, jinaApiKey, dimensions } = ragConfig;

  // Recursively list files starting in __dirname with ignore filtering.
  const allFiles = await listFiles(__dirname, ig);
  // Filter files by allowed file extensions and double-check against ignore rules.
  const filteredFiles = allFiles.filter(file => {
    const ext = path.extname(file).slice(1); // remove the dot
    if (!fileExtensions.includes(ext)) return false;
    const relativePath = path.relative(__dirname, file);
    return !ig.ignores(relativePath);
  });

  // Load local index (.ragindex) to check which files need re-indexing
  const indexPath = path.join(__dirname, '.ragindex');
  let index = {};
  try {
    index = JSON.parse(await fs.promises.readFile(indexPath, 'utf8'));
  } catch (err) {
    console.log("No .ragindex file found, starting with an empty index.");
  }

  // Batch re-index files that are outdated
  const filesToUpdate = [];
  const textsToIndex = [];
  //return filteredFiles
  for (const file of filteredFiles) {
    try {
      const stat = await fs.promises.stat(file);
      const mtime = stat.mtimeMs;
      if (!index[file] || index[file].mtime < mtime || ! index[file].embeddings) {
        const content = await fs.promises.readFile(file, 'utf8');
        filesToUpdate.push({ file, mtime });
        textsToIndex.push(content.slice(0, 2 * 8000));
      }
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
      throw err
    }
  }

  if (textsToIndex.length > 0) {
    console.log(`Indexing ${textsToIndex.length} files in one batch...`);
    const embeddingsBatch = await getEmbedding(textsToIndex, "jina-embeddings-v3", "retrieval.passage", dimensions, jinaApiKey);
    for (let i = 0; i < filesToUpdate.length; i++) {
      const { file, mtime } = filesToUpdate[i];
      index[file] = { embedding: embeddingsBatch[i], mtime };
    }
  }
  // Save updated index to disk.
  await fs.promises.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf8');

  // Get the query embedding using task "retrieval.query"
  const queryEmbeddingArr = await getEmbedding([query], "jina-embeddings-v3", "retrieval.query", dimensions, jinaApiKey);
  const queryEmbedding = queryEmbeddingArr[0]

  // Compare query embedding with all file embeddings (cosine similarity)
  const candidates = [];
  for (const [file, data] of Object.entries(index)) {
    console.log(`cosine ${file}`)
    const similarity = cosineDistance(queryEmbedding, data.embedding);
    candidates.push({ file, similarity });
  }
  // Sort candidates in descending order and take the top 50.
  candidates.sort((a, b) => b.similarity - a.similarity);
  const topCandidates = candidates.slice(0, 20);

  // Read candidate files' content and map them to their filenames.
  const candidateDocs = [];
  for (const { file } of topCandidates) {
    try {
      const content = await fs.promises.readFile(file, 'utf8');
      candidateDocs.push(content);
    } catch (err) {
      console.error(`Error reading candidate file ${file}:`, err);
      throw err
    }
  }

  if (candidateDocs.length === 0) return [];

  // Run the re-ranker API with the query and candidate documents.
  const rerankedDocs = await rerankDocuments(query, candidateDocs, 5, jinaApiKey);
  const bestFiles = [];
  for (const doc of rerankedDocs) {
    if (doc.score < 0.3) {
      continue
    }
    bestFiles.push(topCandidates[doc.index].file)
  }
  return bestFiles;
}
