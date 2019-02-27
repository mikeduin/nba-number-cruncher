export default (state = [], action) => {
  switch (action.type) {
    case 'SET_COMPLETED_GAME':
      let newState = [...state, action.payload];
      return newState;
    default:
      return state;
  }
}
