export default (state = {}, action) => {
  switch (action.type) {
    case 'SET_V_PLAYERS':
      return action.payload;
    default:
      return state;
  }
}
