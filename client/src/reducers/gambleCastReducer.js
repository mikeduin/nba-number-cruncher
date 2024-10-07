const updateGameState = (state, gid, updates) => {
  return {
    ...state,
    [`live_${gid}`]: {
      ...state[`live_${gid}`],
      ...updates
    }
  };
};

export default (state = {}, action) => {
  switch (action.type) {
    case 'INITIALIZE_BOX_SCORE':
      return {...state, [`live_${action.payload.gid}`]: action.payload};

    case 'UPDATE_LIVE_SCORE':
      // const updateLiveScore = state[`live_${action.payload.gid}`]
      //   ? {
      //       totals: action.payload.totals,
      //       clock: action.payload.clock,
      //       [`q${action.payload.perToUpdate}`]: action.payload.quarterData,
      //       period: action.payload.period,
      //       playerStats: action.payload.playerStats
      //     }
      //   : action.payload;
      // return updateGameState(state, action.payload.gid, updateLiveScore);
      return {...state, [`live_${action.payload.gid}`]: action.payload};

    case 'ADD_SNAPSHOT':
      const addSnapshot = state[`live_${action.payload.gid}`]
        ? {
            totals: action.payload.totals,
            clock: action.payload.clock,
            [`q${action.payload.perToUpdate}`]: action.payload.endOfQuarterData,
            thru_period: action.payload.period,
            playerStats: action.payload.playerStats
          }
        : action.payload;
      return updateGameState(state, action.payload.gid, addSnapshot);

    case 'SET_FINAL_BOX_SCORE':
      return {...state, [`live_${action.payload.gid}`]: action.payload};
    default:
      return state;
  }
}
