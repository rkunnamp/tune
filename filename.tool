 {
  "description": "Generate a filename based on content and conventions",
  "parameters": {
    "type": "object",
    "properties": {
      "arguments": {
        "type": "string",
        "description": "query used to generate the file"
      },
      "result": {
        "type": "string",
        "description": "The text result obtained from the tool"
      },
      "result_hex": {
        "type": "string",
        "description": "Hex representation of the result"
      },
      "conventions": {
        "type": "string",
        "description": "Filename conventions or rules to follow for naming, default is empty"
      }
    },
    "required": ["arguments", "result", "result_hex", "conventions"]
  },
  "output": {
    "filename": "pravda-latest-news.md"
  }
}
