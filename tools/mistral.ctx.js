const path = require("path");
const fs = require("fs");

const cacheDir = path.join(__dirname, ".cache");
const cacheFile = path.join(cacheDir, "mistral_models.json");
let cache;

// Create cache directory if it doesn't exist
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

async function getModels(apiKey) {
  if (cache) {
    return cache;
  }
  // Check if cache exists and is less than a day old
  if (fs.existsSync(cacheFile)) {
    const stats = fs.statSync(cacheFile);
    const cacheAge = Date.now() - stats.mtimeMs;
    const oneHourMs = 60 * 60 * 1000; // 1 hour in milliseconds

    if (cacheAge < oneHourMs) {
      const cachedData = fs.readFileSync(cacheFile, "utf8");
      cache = JSON.parse(cachedData);
      return cache;
    }
  }

  // Fetch from API if cache doesn't exist, is too old, or couldn't be read
  const res = await fetch("https://api.mistral.ai/v1/models", {
    headers: {
      authorization: `Bearer ${apiKey}`,
    },
  });

  if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);

  const content = await res.json();

  cache = content.data;
  fs.writeFileSync(cacheFile, JSON.stringify(content.data, null, "  "), "utf8");

  return content.data;
}

function hashIntegerToBase62(num) {
  const crypto = require("crypto");
  const base62chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const buffer = crypto.createHash("sha256").update(num.toString()).digest();

  let hashValue = "";
  for (let i = 0; hashValue.length < 9 && i < buffer.length; i++) {
    const index = buffer[i] % base62chars.length;
    hashValue += base62chars.charAt(index);
  }

  return hashValue.padEnd(9, "0");
}

const envr = /^[A-Z_0-9]+$/;
module.exports = async function mistral(name, context, type, next) {
  if (envr.test(name)) {
    return next();
  }

  const key = await context.read("MISTRAL_KEY");
  if (!key) {
    return next();
  }

  const models = await getModels(key);
  const model = models.find((item) => item.id === name);
  if (!model) {
    return next();
  }
  return {
    type: "llm",
    exec: async (payload, ctx) => {
      const { messages, ...rest } = payload;
      const key = await context.read("MISTRAL_KEY");
      //TODO: tool id must be 9 symbols
      messages.forEach((msg) => {
        if (msg.role === "tool") {
          msg.tool_call_id = hashIntegerToBase62(msg.tool_call_id);
        }
        if (msg.tool_calls) {
          msg.tool_calls.forEach((tc) => {
            tc.id = hashIntegerToBase62(tc.id);
          });
        }
      });

      return {
        url: "https://api.mistral.ai/v1/chat/completions",
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          messages,
          ...rest,
          model: model.id,
        }),
      };
    },
  };
};
