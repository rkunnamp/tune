module.exports = async function(payload, ctx) {
  const key = await ctx.read('GROQ_KEY');

  return ({
    url: "https://api.groq.com/openai/v1/chat/completions",
    method: "POST",
    headers: { 
      "content-type": "application/json",
      authorization: `Bearer ${key}`
    },
    body: JSON.stringify({ 
      ...payload,
      model: "deepseek-r1-distill-llama-70b" 
    })
  })
}
