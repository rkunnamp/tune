const path = require("path");
const fs = require("fs");

const cacheDir = path.join(__dirname, ".cache");
const cacheFile = path.join(cacheDir, "gemini_models.json");
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
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=200`,
  );

  if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);

  const content = await res.json();

  cache = content.models;
  fs.writeFileSync(cacheFile, JSON.stringify(cache, null, "  "), "utf8");

  return cache;
}

const envr = /^[A-Z_0-9]+$/;
module.exports = async function gemini(name, context, type, next) {
  if (envr.test(name)) {
    return next();
  }
  if (name.indexOf("google/") !== 0) {
    return next();
  }
  const key = await context.read("GEMINI_KEY");

  if (!key) {
    return next();
  }
  const shortName = name.split("/")[1];

  const models = await getModels(key);
  const model = models
    .map((item) => ({ ...item, name: item.name.split("/")[1] }))
    .find((item) => item.name === shortName);
  if (!model) {
    return next();
  }

  return {
    type: "llm",
    exec: async (payload, ctx) => {
      // google does not like content to be null
      payload.messages.forEach((message) => {
        if (message.content === null) {
          message.content = [];
        }
      });

      return {
        url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: model.name,
          ...payload,
          messages: payload.messages.filter(msg => msg.role !== 'comment'),
        }),
      };
    },
  };
};
