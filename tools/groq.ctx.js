const path = require("path");
const fs = require("fs");

const cacheDir = path.join(__dirname, ".cache");
const cacheFile = path.join(cacheDir, "groq_models.json");
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

  const res = await fetch("https://api.groq.com/openai/v1/models", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);

  const content = await res.json();

  cache = content.data;
  fs.writeFileSync(cacheFile, JSON.stringify(content.data, null, "  "), "utf8");

  return content.data;
}

const envr = /^[A-Z_0-9]+$/;
module.exports = async function groq(name, context, type, next) {
  if (envr.test(name)) {
    return next();
  }
  const key = await context.read("GROQ_KEY");
  if (!key) {
    return next();
  }
  // const shortName  = name.split("/")[1]
  const models = await getModels(key);

  const model = models.find((item) => item.id === name);
  if (!model) {
    return next();
  }

  return {
    type: "llm",
    exec: async (payload, ctx) => {
      const key = await ctx.read("GROQ_KEY");
      return {
        url: "https://api.groq.com/openai/v1/chat/completions",
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          ...payload,
          model: model.id,
        }),
      };
    },
  };
};
