export default (state = {}, action) => {
  switch (action.type) {
    case 'SET_ACTIVE_DAY':
      return action.payload;
    default:
      return state;
  }
}
