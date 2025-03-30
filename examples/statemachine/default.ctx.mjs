import fs from 'fs';
import path from 'path';
import { getProperty, hasProperty } from 'dot-prop'; 
const prefix = "state."
const prefixRe = /^state[^\w]*/

/*
 * This context is allows you to refer variables from json state like
 * @state.path.to.variable 
 */

export default async function state(name, context, args, next) {
  if (!prefixRe.test(name)) {
    return next()
  }
  loadState(context)
  name = name.substr(prefix.length)
  const res = (name === "") ? context.state : getProperty(context.state, name, undefined)
  if (typeof(res) === 'undefined'){
    return
  }
  return { 
    name,
    type: "text",
    read: async () => {
      if (typeof(res) === "object") {
        return JSON.stringify(res, null, "  ")
      }
      return res
    }
  } 
}

  // load state from file
function loadState(context) {
  if (!context.state) {
    const parsed = path.parse(context.stack[0].filename);
    // convert to filename.chat to .filename.state.json
    parsed.name = `.${parsed.name}.state`;
    delete parsed.base
    parsed.ext = '.json';
    const stateFile = path.format(parsed)
    if (!fs.existsSync(stateFile)) {
      fs.writeFileSync(stateFile, "{}")
    }
    context.state = JSON.parse(fs.readFileSync(stateFile, "utf8"))
    
  }
}
function saveState(context) {
  const parsed = path.parse(context.stack[0].filename);
  parsed.name = `.${parsed.name}.state`;
  delete parsed.base;
  parsed.ext = '.json';
  const stateFile = path.format(parsed);
  fs.writeFileSync(stateFile, JSON.stringify(context.state, null, 2));
}

export { saveState, loadState }
