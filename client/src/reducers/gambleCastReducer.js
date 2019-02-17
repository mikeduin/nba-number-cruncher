export default (state = {}, action) => {
  switch (action.type) {
    case 'UPDATE_LIVE_SCORE':
      return {...state, [action.payload.gid]: action.payload}
    default:
      return state;
  }
}
