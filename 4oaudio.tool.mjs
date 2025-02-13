"ash, ballad, coral, sage, and verse"
export default async function audio({ text }, ctx) {
  const key = await ctx.read('OPENAI_KEY');
  const messages = [
    {role: "system", content: ""},
    {role: "user", content: text}
  ]

  let res = await fetch ("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { 
      "content-type": "application/json",
      authorization: `Bearer ${key}` 
    },
    body: JSON.stringify({ 
      messages,
      audio: {voice: "ash", format: "mp3" },
      modalities: ["text", "audio"],
      model: "4o-mini-audio-preview"
    })
  })
  res = await res.json()
  res = res.choices[0].audio;
  res = Buffer.from(res.data, "base64")
}
