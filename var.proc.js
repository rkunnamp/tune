module.exports = async function(node, args, ctx) {
  const nodes = [node];
  const re = /(?<name>\w+)\s*=/
  let lastName;
  let m;
  let text = args;
  const vars = {};
  while ((m = re.exec(text)) !== null) {
    const { name } = m.groups

    if (lastName) {
      vars[lastName] = text.slice(0, m.index).trim()
    }
    text = text.slice(m.index + m[0].length)
    lastName = name
  }
  if (lastName) {
    vars[lastName] = text.trim()
  }

  ctx.use((name, ctx, args, next)=> {
    if (!vars.hasOwnProperty(name)) {
      return next()
    }
    const newNode = Object.assign({}, node)
    newNode.name = name
    newNode.read = async function() {
      return vars[name]
    }
    return newNode
  })
  return node
}
