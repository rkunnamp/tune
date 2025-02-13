{
  "description": "Text2Speech using 4o-audio model from OpenAI",
  "parameters": {
    "type": "object",
    "properties": {
      "text": {
        "type": "string",
        "description": "Text script to convert to speech.\nEverything in () is not pronounced but used as a hint on how to pronounce the speech\ne.g. (very happy) They went to McDonalds, (sad) but it was closed."
      },
      "voice": {
        "type": "string",
        "enum": ["ash", "ballad", "coral", "sage", "verse"],
        "description": "Voice type to use for TTS"
      },
      "filename": {
        "type": "string",
        "description": "mp3 filename to save the audio to"
      }
    },
    "required": ["text", "voice", "filename"]
  }
}
