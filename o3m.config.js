const handle = require("./openai")({ model: "o3-mini" })
module.exports = async function(payload, ctx){
  payload.messages.forEach(message => {
    if (message.role === "system")
      message.role = "developer"
  })
  return handle(payload, ctx)
}
