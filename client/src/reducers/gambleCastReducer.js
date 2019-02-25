export default (state = {}, action) => {
  switch (action.type) {
    case 'SET_TO_LIVE':
      console.log('state being included is ', state[`live_${action.payload}`]);
      return {...state, [`live_${action.payload}`]: {
          ...state[`live_${action.payload}`],
          active: true,
          final: false
        }
      };
    case 'UPDATE_LIVE_SCORE':
      if (state[`live_${action.payload.gid}`]) {
        let gameState = state[`live_${action.payload.gid}`];
        gameState.totals = action.payload.totals;
        gameState.clock = action.payload.clock;
        gameState.period = action.payload.period;
        gameState.poss = action.payload.poss;
        gameState[`q${action.payload.perToUpdate}`] = action.payload.quarterData;
        return {...state, [`live_${action.payload.gid}`]: gameState};
      } else {
        return {...state, [`live_${action.payload.gid}`]: action.payload}
      }


    case 'ADD_SNAPSHOT':
      // Hiding this in hopes other method works, delete once confirmed
      // newState = state;
      // newState[`live_${action.payload.gid}`].totals = action.payload.totals;
      // newState[`live_${action.payload.gid}`][`q${action.payload.perToUpdate}`]: action.payload.endOfQuarterData;
      // newState[`live_${action.payload.gid}`].prevQuarters: action.payload.prevQuarters;
      // console.log('end of quarter-updated state return for ', action.payload.gid);
      // return newState;
      let gameState = state[`live_${action.payload.gid}`];
      gameState.totals = action.payload.totals;
      gameState[`q${action.payload.perToUpdate}`] = action.payload.endOfQuarterData;
      gameState.prevQuarters = action.payload.prevQuarters;
      console.log('end of quarter-updated state return for ', action.payload.gid);
      return {...state, [`live_${action.payload.gid}`]: gameState};
    case 'SET_TO_FINAL':
      let newState = state;
      if (newState[`live_${action.payload}`]) {
        newState[`live_${action.payload}`].final = true;
        return newState;
      } else {
        console.log('game not found in state, cannot set to final');
        return state;
      }
    default:
      return state;
  }
}
