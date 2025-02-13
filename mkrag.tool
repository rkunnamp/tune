 {
  "description": "Segment a file and store embeddings for RAG (Retrieval-Augmented Generation)",
  "parameters": {
    "type": "object",
    "properties": {
      "filename": {
        "type": "string",
        "description": "Name of the file to be processed"
      },
    },
    "required": ["filename"]
  }
}
