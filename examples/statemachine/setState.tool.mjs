import { setProperty } from 'dot-prop'; 
import { loadState, saveState } from './default.ctx.mjs';
import stateMachine from './statemachine.mjs';

export default async function setState({ name,  text }, ctx) {
  if (!name) {
    throw Error("Path cannot be empty when setting a value");
  }
  if (name === 'step') {
    return "you can not set 'step' directly"
  }

  loadState(ctx)
  setProperty(ctx.state, name, text)
  // our state machine
  ctx.state = stateMachine(ctx.state)
  saveState(ctx)
  return "set";
}
