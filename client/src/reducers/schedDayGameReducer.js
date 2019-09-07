export default (state = [], action) => {
  switch (action.type) {
    case 'SET_SCHED_DAY_GAMES':
      return action.payload;
    default:
      return state;
  }
}
