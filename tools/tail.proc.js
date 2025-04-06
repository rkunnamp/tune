module.exports = async function tail(node, args, context) {
  if (!node || node.type !== 'text') {
    return node;
  }

  const n = parseInt(args, 10);
  const linesCount = (isNaN(n) || n <= 0) ? 20 : n;

  const newNode = Object.assign({}, node);

  newNode.read = async () => {
    const text = await node.read();
    return text.split(/\r?\n/).slice(-linesCount -1).join('\n');
  };

  return newNode;
};
