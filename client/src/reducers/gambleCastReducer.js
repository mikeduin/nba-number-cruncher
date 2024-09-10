export default (state = {}, action) => {
  switch (action.type) {
    case 'SET_TO_LIVE':
      return {...state, [`live_${action.payload}`]: {
          ...state[`live_${action.payload}`],
          active: true,
          final: false
        }
      };

    case 'INITIALIZE_BOX_SCORE':
      return {...state, [`live_${action.payload.gid}`]: action.payload};

    case 'UPDATE_LIVE_SCORE':
      if (state[`live_${action.payload.gid}`]) {
        let gameState = state[`live_${action.payload.gid}`];
        gameState.totals = action.payload.totals;
        gameState.clock = action.payload.clock;
        gameState[`q${action.payload.perToUpdate}`] = action.payload.quarterData;
        gameState.period = action.payload.period;
        // gameState.poss = action.payload.poss;
        gameState.playerStats = action.payload.playerStats;

        return {...state, [`live_${action.payload.gid}`]: gameState};
      } else {
        return {...state, [`live_${action.payload.gid}`]: action.payload}
      };

    case 'ADD_SNAPSHOT':
      if (state[`live_${action.payload.gid}`]) {
        let gameState = state[`live_${action.payload.gid}`];
        gameState.totals = action.payload.totals;
        gameState.clock = action.payload.clock;
        gameState[`q${action.payload.perToUpdate}`] = action.payload.endOfQuarterData;
        gameState.thru_period = action.payload.period;
        // gameState.prevQuarters = action.payload.prevQuarters;
        gameState.playerStats = action.payload.playerStats;
        return {...state, [`live_${action.payload.gid}`]: gameState};
      } else {
        return {...state, [`live_${action.payload.gid}`]: action.payload}
      };

    case 'SET_FINAL_BOX_SCORE':
      return {...state, [`live_${action.payload.gid}`]: action.payload};
    default:
      return state;
  }
}
