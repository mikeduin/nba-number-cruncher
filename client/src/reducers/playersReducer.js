export default (state = [], action) => {
  switch (action.type) {
    case 'LOAD_PLAYER_METADATA':
      return action.payload;
    default:
      return state;
  }
}
