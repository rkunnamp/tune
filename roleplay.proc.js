function msgrole(msg) {
  if (!msg || !msg.tool_calls || !msg.tool_calls[0] || !msg.tool_calls[0]["function"]){
    return
  }
  const tc = msg.tool_calls[0]["function"];
  if (tc.name !== "turn") {
    return
  }
  return JSON.parse(tc.arguments).role
}
// all the assistant responses with role !== latest_role become { role: "user", name: "role", content  }
//
module.exports = async function(node, args, ctx) {
  const newNode = Object.assign({}, node);
  newNode.exec = async function(payload, ctx) {
    let result = payload;
    let role = "";
    const lastRole = result.messages.reduce((memo, msg) =>  msgrole(msg) || memo, "")
    result.messages = result.messages.reduce((msgs, msg) => {
      if (msg.role !== "assistant") {
        msgs.push(msg)
        return msgs;
      }
      if (role === lastRole) {
        msgs.push(msg)
        return msgs;
      }
      if (msg.content) {
        msgs.push({ 
          role: "user",
          name: role,
          content: msg.content
        })
      }
      if (msg.tool_calls) {
        msgs.push({
          role: "assistant",
          tool_calls: msg.tool_calls
        })
      }
      role = msgrole(msg) || role;

      return msgs;
    }, [])
    result = await node.exec(result, ctx)
    console.log(result)
    return result
  }
  return newNode
}
