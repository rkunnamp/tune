import fs from "fs";

export default async function tts({ text, voice, filename }, ctx) {
  const key = await ctx.read('OPENAI_KEY');
  const messages = [
    { 
      role: "system",
      content: "You're given a script to tts.\neverything in () is not pronounced but used as a hint on how to pronounce the speech\ne.g. (very happy) They went to McDonalds, (sad) but it was closed. in this example the text for tts is actually 'They went to McDonalds, but it was closed.' with first sentence pronounced happy and the second - sad "
    }, 
    {
      role: "user",
      content: `here is the text script:\n<script>\n${text}\n</script>`
    }
  ]

  let response = await fetch( "https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini-audio-preview",
      modalities: ["text", "audio"],
      audio: { voice, format: "mp3" },
      messages
    }),
  });

  if (!response.ok) {
    const { error } = await response.json()
    throw new Error(`Error: ${response.status} ${response.statusText}\n${error.message}`);
  }
  response = await response.json()
  response = Buffer.from(response.choices[0].message.audio.data, "base64")
  fs.writeFileSync(filename, response);
  return "speech generated"
}
