export default (state = {}, action) => {
  switch (action.type) {
    case 'SET_HOME_COLOR':
      return action.payload;
    default:
      return state;
  }
}
