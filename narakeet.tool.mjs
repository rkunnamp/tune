export default async function fetchAudio({ text }, ctx) {
  let response = await fetch("https://api.narakeet.com/text-to-speech/mp3", {
    method: "POST",
    headers: {
      "x-api-key": await ctx.read("NARAKEET_KEY"),
      "Content-Type": "text/plain",
    },
    body: text
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  response = await response.json();
  const statusUrl = response.statusUrl;
  let finished = false;
  while (!finished) {
    response = await fetch(statusUrl) 
    response = await response.json()
    finished = response.finished
  }
  if (!response.succeeded) {
    throw new Error(response.message)
  }
  response = await fetch(response.result)
  return Buffer.from(await response.arrayBuffer());
}
