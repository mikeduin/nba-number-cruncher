export default (state = [], action) => {
  switch (action.type) {
    case 'FETCH_GM_WK':
      return action.payload;
    default:
      return state;
  }
}
