export default (state = [], action) => {
  switch (action.type) {
    case 'TODAY_GAMES':
      return action.payload;
    default:
      return state;
  }
}
