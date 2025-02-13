export default async function bark({ text }) {
  const url = "http://192.168.178.115:5000/bark";
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer)
}
