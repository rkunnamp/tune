import { relative, dirname, resolve } from 'path' 

export default async function searchWeb({ url, filename }, ctx) {
    const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
    
    const response = await fetch(jinaUrl);
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    if (filename) {
      const filepath = resolve(ctx.top.cwd, filename);
      ctx.write(filename, await response.text());
      const relFile = relative(dirname(ctx.top.filename), filename)
      return`{${relFile}}`
    }
    return await response.text()
  }
