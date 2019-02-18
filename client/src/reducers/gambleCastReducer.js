export default (state = {}, action) => {
  switch (action.type) {
    case 'UPDATE_LIVE_SCORE':
      return {...state, [`live_${action.payload.gid}`]: action.payload};
    case 'ADD_SNAPSHOT':
      return {...state, [`live_${action.payload.gid}`]: {
          ...state.[`live_${action.payload.gid}`],
          [`q${action.payload.q}`]: action.payload
        }
      };
    default:
      return state;
  }
}
