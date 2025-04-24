const fs = require('fs') 
const path = require('path')

const { runFile, fsctx } = require("../dist/fsctx.js");

async function makeSchema(params, ctx) {
  return runFile(path.join(__dirname, "schema.tool.chat"), ctx, params);
}
let dirs = [];
if (process.env.TUNE_PATH) {
  dirs = process.env.TUNE_PATH.split(path.delimiter);
}

module.exports = [
  fsctx(dirs, { makeSchema }),
  require("./openai.ctx.js"),
  require("./openrouter.ctx.js"),
  require("./antrophic.ctx.js"),
  require("./gemini.ctx.js"),
  require("./mistral.ctx.js"),
  require("./groq.ctx.js"),
  async function write(filename, data) {
    const directory = path.dirname(filename);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(filename, data)
  }
];
