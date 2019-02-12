export default (state = {}, action) => {
  switch (action.type) {
    case 'SET_H_PLAYERS':
      return action.payload;
    default:
      return state;
  }
}
