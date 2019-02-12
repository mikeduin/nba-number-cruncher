export default (state = {}, action) => {
  switch (action.type) {
    case 'SET_V_COLOR':
      return action.payload;
    case 'CHANGE_V_COLOR':
      return {...state, active: action.payload.active, secondary: action.payload.secondary};
    default:
      return state;
  }
}
