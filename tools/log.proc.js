const fs = require("fs")
module.exports = async (node, args, ctx)  => {
  const newNode = Object.assign({}, node);
  newNode.exec = async function(payload, ctx) {
    const res = await node.exec(payload, ctx)
    fs.writeFileSync(args.trim() || "log.json", JSON.stringify(JSON.parse(res.body), null, "  "));
    return res
  }
  return newNode
}
