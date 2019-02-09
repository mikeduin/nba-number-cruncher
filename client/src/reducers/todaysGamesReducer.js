export default (state = [], action) => {
  switch (action.type) {
    case 'DAILY_GAMES':
      return action.payload;
    default:
      return state;
  }
}
