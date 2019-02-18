export default (state = {}, action) => {
  switch (action.type) {
    case 'UPDATE_LIVE_SCORE':
      return {...state, [`live_${action.payload.gid}`]: {
          ...state.[`live_${action.payload.gid}`],
          [`q${action.payload.q}`]: action.payload.currentQuarter
        }
      };
    case 'ADD_SNAPSHOT':
      return {...state, [`live_${action.payload.gid}`]: {
          ...state.[`live_${action.payload.gid}`],
          [`q${action.payload.q}`]: action.payload.quarterData,
          prevQuarters: action.payload.prevQuarters
        }
      };
    default:
      return state;
  }
}
