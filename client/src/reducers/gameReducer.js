export default (state = {}, action) => {
  switch (action.type) {
    case 'FETCH_GAME':
      return action.payload;
    // case 'CHANGE_VIS_COLOR':
    //   return Object.assign({...state}, state.visObj.info, {
    //     color_active: action.payload
    //   });
    default:
      return state;
  }
}
