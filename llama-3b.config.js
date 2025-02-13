({
    url: "https://openrouter.ai/api/v1/chat/completions",
    method: "POST",
    headers: { 
      "content-type": "application/json",
      authorization: `Bearer ${OPENROUTER_KEY}` 
    },
    body: JSON.stringify({ 
      ...payload,
      model: "meta-llama/llama-3.2-3b-instruct"
  })
})
