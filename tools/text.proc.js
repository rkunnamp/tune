const fs = require('fs')
const util = require("util")
module.exports = async function(node, args) {
  if (! node) {
    return node
  }
  const newNode = Object.assign({}, node)
  newNode.type = "text"
  console.log(node)
  newNode.read = async function() {
    return fs.readFileSync(node.fullname, "utf8")
  }
  return newNode
}
