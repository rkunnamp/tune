import fs from 'fs';
import path from 'path';

export default async function fetchFromUrl({ url, filename, links }, ctx) {
  const wurl = `https://r.jina.ai/${url}`;
  const headers = {};

  const apiKey = await ctx.read("JINA_KEY")
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`
  }

  if (links) {
    headers['X-With-Links-Summary'] = true
  }
  
  const response = await fetch(wurl, { headers } );
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  const res =  await response.text();
  if (filename) {
    const directory = path.dirname(filename);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(filename, res)
    return `@${filename}`
  }
  return res.replace(/@/g, "\\@")
}
