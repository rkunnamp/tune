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

