{
  "description": "return markdown represenation of the page from the url",
  "parameters": {
    "type": "object",
    "properties": {
      "url": {
        "type": "string",
        "description": "The URL to search"
      },
      "filename": {
        "type": "string",
        "description": "filename to save result to (optional), default is undefined"
      }
    },
    "required": ["url"]
  }
}
