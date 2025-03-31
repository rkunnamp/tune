## Tools & Processors & Contexts
This is a personal directory of [tools] [processors] and [contexts] and prompts.

They're supposed to be forked/cloned, and changed.
Set `TUNE_PATH` to the directory to make them available in tune editor extensions

##### Table of Contents  
- [Prompts](#prompts)  
- [LLMs](#llms)
- [Tools](#tools)
  - [rf read file](#rf-read-file)
  - [wf write file](#wf-write-file)
  - [patch](#patch)
  - [sh shell](#sh-shell)
- [Processors](#processors)
  - [shp](#shp)
  - [init](#init)
  - [mcp](#mcp)
  - [json schema](#json_schema)
  - [log](#log)
  - [mock](#mock)
  - [linenum](#linenum)
  - [text](#text)
  - [resolve](#resolve)


## Prompts
* `short.txt` - for short answers
* `echo.txt` - to debug variable expansions and context
* `dev.txt` - developer copilot prompt 

## LLMs
Contexts: `openai.ctx.js`, `openrouter.ctx.js`, `mistral.ctx.js`, `groq.ctx.js`, `gemini.ctx.js`.
Put together in `default.ctx.js`.

Download model list from the provider (saved in .cache directory), and then can be used by name in the `.chat` files.
```chat
system:
@gpt-4o - uses openai.ctx.js
@anthropic/claude-3.7-sonnet - uses openrouter.ctx.js
@mistral-small-latest - get model using mistral.ctx.js
@qwen-qwq-32b - uses groq.ctx.js
@google/gemini-2.0-flash will use gemini.ctx.js
```
To connect a model there has to be OPENAI_KEY or OPENROUTER_KEY or MISTRAL_KEY or GROQ_KEY or GEMINI_KEY in the environment or in `.env` file


`default.llm.js` - which model is called by default (i.e. without connecting @llm)

## Tools
[Tools](https://iovdin.github.io/tune/template-language/tools) is a function that llm can run on your local machine or server

### `rf` read file
```chat
user: @rf
can you read README.md?
tool_call: rf {"filename":"README.md"}
tool_result: 
@README.md
```
It takes optional `linenum` parameter so that file is included with line numbers - useful for patching

### `wf` write file
```chat
user: @wf 
make a hello world javascript
tool_call: wf {"filename":"helloWorld.js"}
console.log('Hello, World!');
tool_result:
written
```

### `patch`
```chat
user: @patch
translate "hello world" in helloWorld.js  to dutch
tool_call: patch {"filename":"helloWorld.js"}
<<<<<<< ORIGINAL
console.log('Hello, World!');
=======
console.log('Hallo, Wereld!');
>>>>>>> UPDATED
tool_result:
patched
```

### `sh` shell

```
user: @sh
find with ripgrep where echo is used
tool_call: sh
rg 'echo' ./
tool_result: 
./README.md:    echo: "You are echo, you print everything back",
./README.md:  const text = "s: \@echo\nu: hello world";
./tools/echo.txt:you are echo, you print everything back
./tools/README.md:* `echo.txt` - to debug variable expansions and context
```


## Processors
[Processors](https://iovdin.github.io/tune/template-language/processors) is a way to modify variable or insert new ones into chat.

### `shp`
Insert shell output
```chat
system:
include project file list to system prompt
@{| shp git ls-files }
```

### `init` 
Set default value for non set variables

```chat
system:
@memory|init 
if memory does not exist the chat will fail
```

### `mcp` 
Connect Model Context Protocol tools
```chat
system: 
@{| mcp npx -y @modelcontextprotocol/server-filesystem ./ }
user: 
what is in my current directory?
tool_call: list_allowed_directories
tool_result: 
Allowed directories:
/Users/username/projects/tune
```
### `json_schema`
Set llm response format to json_schema
```chat
system: 
@{ gpt-4o | json_schema path/to/schema.json }
```

### `log` 
Save LLM payload to a json file, used for debugging
```chat
system: @{ gpt-4o | log path/to/log.json }
```

### `mock` 
Set variables inline in chat. 
```
system: @{| mock hello=world } 
@echo
user: 
@hello
assistant:
world
```

### `linenum`
Prepend line numbers to a file content. 
Useful when patching file.
```chat
system:
@echo
user: 
@{ helloWorld | linenum }
assistant:
1 | console.log('Hello, World!');
```

### `text`
Treat special files (`.ctx.js`, `.llm.js`, `.tool.js`)  like text
```chat
system: 
@echo
user: 
content 
@rf.tool.mjs
assistant: 
content
u: 
content
@{ rf.tool.mjs | text}
a: 
content
import { promises as fs } from 'fs';
import { relative, dirname } from 'path' 
....
```

### `resolve`
Given filename resolve it and include
`queryimage.tool.chat`
```chat
user:  @gpt-4o-mini
@query
@{ image | resolve }
```

```chat
system: 
@queryimage
user: 
what is on the image at file file/to/image.jpg
tool_call: queryimage {"query": "what is on the image?", "image": "file/to/image.jpg" }
```

