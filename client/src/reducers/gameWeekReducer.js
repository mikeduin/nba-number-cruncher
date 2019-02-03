export default (state = [], action) => {
  switch (action.type) {
    case 'FETCH_WEEK':
      return action.payload;
    default:
      return state;
  }
}
