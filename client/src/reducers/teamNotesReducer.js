export default (state = null, action) => {
  switch (action.type) {
    case 'SET_TEAM_NOTES':
      return action.payload;
    default:
      return state;
  }
}
