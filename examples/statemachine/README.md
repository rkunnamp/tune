## Chat & State Machine 
It is a common pattern that AI workflow is split into a few steps. The steps might have different prompts and different set of tools.

e.g.
First you're gathering information about the user, and then build a website

So you have to switch to another prompt or an agent. The moment of switch can be decided by LLM e.g. by calling a [turn](https://iovdin.github.io/tune/examples/multi-agent) tool. 
But sometimes LLM do a switch too early or does not do the switch at all. To make the processes more reliable let LLM modify state and switching is preformed by a state machine.

### State
First lets make it possible to read and write state into a json like:
```chat
system: @setState
firstName: @state.firstName
lastName: @state.lastName 

user: 
I've just changed my first name to John

tool_call: setState {"name": "firstName"}
John
tool_result:
set
```

There is a `default.ctx.mjs` [context](https://iovdin.github.io/tune/template-language/context) middleware  that loads state from `.json` file. And allow `@state.path[0].to.variable` to resolve. `default.ctx.mjs` file is connected automatically by tune.
There is also a `setState.tool.mjs` that modifies the state and save it back to file.

If you chat filename is `main.chat` the state file would be `.main.state.json`


### Steps
Lets keep steps' prompts in `step1.prompt` `step2.prompt` etc.
and connect the prompt accoring to what step is it right now.

```chat
system:
@@state.step
```
This will read the state's `phase` property and put the file content into the system prompt.
```json
{
    "step": "@step1"
}
```

Double `@@state.step` will first expand into `@step1` and then expand into contents of the `step1.prompt`. read more about [`@` and `@@`](https://iovdin.github.io/tune/template-language/at-symbol)

Initial `step` value might be empty, so we'll user `init` [processor](https://iovdin.github.io/tune/template-language/processors) to initialize the value of the `step`.
```chat
system:
@@{ state.step | init @step1 }
```

### Make the steps
Every step is modifying some state, and `setState` calls `stateMachine` that checks if the right varaibles are set and then switch to the next step  
```javascript
export default function stateMachine(state) {
  const { firstName, lastName, step, hobby, about } = state;
  if ((!step || step === '@@step1') && !!firstName && !!lastName) {
    state.step = '@@step2'
  }
  if (step === '@@step2' && hobby?.length == 3) {
    state.step = '@@step3'
  }
  if (step === '@@step3' && !!about) {
    state.step = '@@finish'
  }
  return state
}
```


### Chat 
```chat
system:  @gpt-4o @setState
You are building about page for the user 

@@{ state.step | init @@step1 }
assistant:
Can you please tell me your first name and last name?
user: 
John
assistant:
And what is your last name, John?
user:
Wick 
tool_call: setState {"name":"firstName"}
John
tool_call: setState {"name":"lastName"}
Wick
tool_result:
set
tool_result:
set
comment:
Here is the switch to the next step happened
assistant:
Great, John Wick! Could you please tell me about your hobbies? You can mention up to three.
user:
Training in martial arts and weaponry.
tool_call: setState {"name":"hobby[0]"}
Training in martial arts
tool_call: setState {"name":"hobby[1]"}
Weaponry
tool_result:
set
tool_result:
set
assistant:
Fantastic! I've noted your hobbies as "Training in martial arts" and "Weaponry." If you have a third hobby you'd like to share, please let me know!
user: 
Riding motorcycles.

tool_call: setState {"name":"hobby[2]"}
Riding motorcycles
tool_result:
set
assistant:
Great, you enjoy "Riding motorcycles" as well. Could you share a little about your professional background or any notable achievements you have?
<cut for brevity>
```

Resulting state `.main.state.json`:
```json
{
  "lastName": "Wick",
  "firstName": "John",
  "step": "@@finish",
  "hobby": [
    "Training in martial arts",
    "Weaponry",
    "Riding motorcycles"
  ],
  "about": "## About John Wick\n\n**Name**: John Wick\n\nJohn Wick is passionate about:\n\n- Training in martial arts\n- Weaponry\n- Riding motorcycles\n\nJohn is known for his dedication to his hobbies and his unique skills in martial arts and weaponry."
}
```
