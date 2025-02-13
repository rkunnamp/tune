{
  "description": "Fetch posts from a specified subreddit",
  "parameters": {
    "type": "object",
    "properties": {
      "subreddit": {
        "type": "string",
        "description": "The name of the subreddit"
      },
      "where": {
        "type": "string",
        "enum": ["popular", "new", "gold", "default"],
        "description": "Specifies the type of posts to fetch"
      }
    },
    "required": ["subreddit", "where"]
  }
}
