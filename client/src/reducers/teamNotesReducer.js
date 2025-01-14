export default (state = null, action) => {
  switch (action.type) {
    case 'SET_TEAM_NOTES':
      return action.payload.map(data => {
        return {
          abb: data.abb,
          notes: data.notes
        }
      });
    default:
      return state;
  }
}
