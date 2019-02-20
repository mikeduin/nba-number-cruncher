export default (state = {}, action) => {
  switch (action.type) {
    case 'ADD_TEMPLATE':
      return {...state, [`live_${action.payload.gid}`]: action.payload };
    case 'UPDATE_LIVE_SCORE':
      return {...state, [`live_${action.payload.gid}`]: {
          ...state[`live_${action.payload.gid}`],
          [`q${action.payload.q}`]: action.payload.currentQuarter
        }
      };
    case 'ADD_SNAPSHOT':
      // If this does not work, try the approach found in react/redux tutorial note 86
      return {...state, [`live_${action.payload.gid}`]: {
          ...state[`live_${action.payload.gid}`],
          [`q${action.payload.q}`]: action.payload.quarterData,
          prevQuarters: action.payload.prevQuarters
        }
      };
    default:
      return state;
  }
}
