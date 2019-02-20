export default (state = {}, action) => {
  switch (action.type) {
    case 'ADD_TEMPLATE':
      return {...state, [`live_${action.payload.gid}`]: action.payload };
    case 'SET_TO_LIVE':
      return {...state, [`live_${action.payload}`]: {
          ...state[`live_${action.payload}`],
          active: true,
          final: false
        }
      };
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
    case 'SET_TO_FINAL':
      return {...state, [`live_${action.payload}`]: {
          ...state[`live_${action.payload}`],
          active: false,
          final: true
        }
      };
    default:
      return state;
  }
}
