export default (state = {}, action) => {
  switch (action.type) {
    case 'FETCH_GAME':
      return action.payload;
    default:
      return state;
  }
}
