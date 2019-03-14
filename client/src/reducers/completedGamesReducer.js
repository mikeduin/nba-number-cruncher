export default (state = [], action) => {
  switch (action.type) {
    case 'SET_COMPLETED_GAMES':
      return action.payload;
    default:
      return state;
  }
}
