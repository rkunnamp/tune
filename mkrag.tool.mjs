// segment filename and store embeddings for rag
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { makeTool } from './tune.mjs?t=4';
import { resolve } from 'path';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function scan({ filename }, ctx) {
  const segment = makeTool(resolve(__dirname, "segment.tool.chat"), ctx)
  const fn = ctx.resolve(filename) 
  if (!fn) {
    throw new Error(`${filename} not found`)
  }
  const text = ctx.read(ctx.resolve(filename), "utf8")
    .split("\n")
    .map((line, index) => `${index + 1}: ${line}`)
    .join("\n");

  let result = await segment({ text } , ctx);
  result = result.split(/;\s*=+/)

  result = result.map(item => {
    const lines = item.split('\n')
    return ({
      comment: lines.filter(line => !line.match(/^\d+:/)).join("\n"),
      content: lines.filter(line => line.match(/^\d+:/)).join("\n"),  
      filename,
      date: new Date()
    })
  })

  const dbName = ctx.parent.resolve('rag.db')
  const db = new Database(dbName);
  try {
    const createQuery = `
      CREATE TABLE IF NOT EXISTS segments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      comment TEXT,
      content TEXT NOT NULL,
      date TEXT NOT NULL)`

    db.exec(createQuery);
    const stmt = db.prepare(`
      INSERT INTO my_collection (filename, comment, content, date) 
      VALUES (?, ?, ?, ?)
    `);

    const insertMany = db.transaction((records) => {
      for (const record of records) {
        stmt.run(record.filename, record.comment, record.content, record.date);
      }
    });
    insertMany(results)

  } catch () {
  } finally {
    db.close();
  }

  return JSON.stringify(result, null, "  ")
}
