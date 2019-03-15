export default (state = {}, action) => {
  switch (action.type) {

    case 'SET_TO_LIVE':
      return {...state, [`live_${action.payload}`]: {
          ...state[`live_${action.payload}`],
          active: true,
          final: false
        }
      };

    case 'INITITALIZE_BOX_SCORE':
      return {...state, [`live_${action.payload.gid}`]: action.payload};

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
        console.log('state for game NOT found, state is ', state);
        return {...state, [`live_${action.payload.gid}`]: action.payload}
      };

    case 'ADD_SNAPSHOT':
      if (state[`live_${action.payload.gid}`]) {
        let gameState = state[`live_${action.payload.gid}`];
        gameState.totals = action.payload.totals;
        gameState[`q${action.payload.perToUpdate}`] = action.payload.endOfQuarterData;
        gameState.thru_period = action.payload.period;
        gameState.prevQuarters = action.payload.prevQuarters;
        gameState.clock = action.payload.clock;
        return {...state, [`live_${action.payload.gid}`]: gameState};
      } else {
        return {...state, [`live_${action.payload.gid}`]: action.payload}
      };

    case 'SET_FINAL_BOX_SCORE':
      return {...state, [`live_${action.payload.gid}`]: action.payload};

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
