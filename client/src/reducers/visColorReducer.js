export default (state = {}, action) => {
  switch (action.type) {
    case 'SET_VIS_COLOR':
      return action.payload;
    default:
      return state;
  }
}
