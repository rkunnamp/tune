{
  "description": "Apply patches to a specified file based on the given text",
  "parameters": {
    "type": "object",
    "properties": {
      "text": {
        "type": "string",
        "description": "The text containing patches to apply, formated:\n<<<<<<<\nold code\n=======\nnew code\n>>>>>>>"
      },
      "filename": {
        "type": "string",
        "description": "The path to the file that needs to be patched."
      }
    },
    "required": ["text", "filename"]
  }
}
