export default (state = [], action) => {
  switch (action.type) {
    case 'SET_ACTIVE_GAMES':
      // fix this when done testing
      return action.payload;
      // return []
    default:
      return state;
  }
}
