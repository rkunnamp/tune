import { promises as fs } from 'fs';
import { relative, dirname } from 'path' 

export default async function writeFile({ filename, text }, ctx) {
  await fs.writeFile(filename, text, 'utf8');
  const resolved = await ctx.resolve(filename)
  if (!resolved) {
    return "File not found"
  }
  const relFile = relative(process.cwd(), filename)
  return`written`;
}
