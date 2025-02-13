module.exports = function(props) {
  return async function(payload, ctx) {
    const key = await ctx.read('OPENROUTER_KEY');

    return ({
      url: "https://openrouter.ai/api/v1/chat/completions",
      method: "POST",
      headers: { 
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
        "HTTP-Referer": "https://github.com/iovdin/tune.nvim",
        "X-Title": "Tune"
      },
      body: JSON.stringify({ 
        ...payload,
        ...props
      })
    })
  }

}
