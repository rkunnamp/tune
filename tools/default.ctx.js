const fs = require('fs') 
const path = require('path')

module.exports = [
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
