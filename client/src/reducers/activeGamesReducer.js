export default (state = [], action) => {
  switch (action.type) {
    case 'SET_ACTIVE_GAMES':
      return action.payload;
    default:
      return state;
  }
}
