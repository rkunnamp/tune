import { promises as fs } from 'fs';
import { relative, dirname } from 'path' 

export default async function readFile({ filename, linenum }, ctx) {
  const resolved = await ctx.resolve(filename)
  if (!resolved) {
    return "File not found"
  }
  const relFile = relative(process.cwd(), filename)
  return`@\{ ${relFile} | text | linenum \}`;

}
