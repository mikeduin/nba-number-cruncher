export default (state = {}, action) => {
  switch (action.type) {
    case 'SET_H_COLOR':
      return action.payload;
    case 'CHANGE_H_COLOR':
      return {...state, active: action.payload.active, secondary: action.payload.secondary};
    default:
      return state;
  }
}
