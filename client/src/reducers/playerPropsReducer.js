export default (state = {
  data: [],
  lastUpdated: null
}, action) => {
  switch (action.type) {
    case 'FETCH_PLAYER_PROPS':
      return action.payload;
    default:
      return state;
  }
}
