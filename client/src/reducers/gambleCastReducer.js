export default (state = {}, action) => {
  switch (action.type) {
    case 'UPDATE_LIVE_SCORE':
      return {...state, [`live_${action.payload.gid}`]: action.payload};
    case 'SEND_SNAPSHOT':
      return {...state, [`live_snap_${action.payload.gid}`]: action.payload};
    default:
      return state;
  }
}
