{
  "description": "Switch roles/agents, to the one that has to reply",
  "parameters": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "The name of the role/agent to switch to"
      },
      "filename": {
        "type": "string",
        "description": "save the role name to filename that keeps the current role"
      }
    },
    "required": ["name"]
  }
}
