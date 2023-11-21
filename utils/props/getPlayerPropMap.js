const dbMappers = require('../../modules/dbMappers');
const { mapBovadaMarketToDbColumn, propMarketMappers } = dbMappers;
const dbColumns = Object.values(propMarketMappers());

const buildActivePropsMap = players => {
  const activePropsMap = {};

  players.forEach(player => {
    const playerMap = {};
    dbColumns.forEach(column => {
      playerMap[`${column}_active`] = false;
    })
    activePropsMap[player] = playerMap;
  })

  return activePropsMap;
}

module.exports = async (gameProps, gamePropPlayersInDb) => {
  const playerPropsMap = new Map();
  const activePropsMap = buildActivePropsMap(gamePropPlayersInDb);

  gameProps.forEach((prop) => {
    const playerName = prop.player;
    const dbColumn = mapBovadaMarketToDbColumn(prop.market);

    if (playerPropsMap.has(playerName)) {
      const existingPlayer = playerPropsMap.get(playerName);
      existingPlayer[dbColumn] = prop.line;
      existingPlayer[`${dbColumn}_over`] = prop.over;
      existingPlayer[`${dbColumn}_under`] = prop.under;
    } else {
      playerPropsMap.set(playerName, {
        [dbColumn]: prop.line,
        [`${dbColumn}_over`]: prop.over,
        [`${dbColumn}_under`]: prop.under,
        team: prop.team,
      });
    }

    if (activePropsMap[playerName]) {
      activePropsMap[playerName][`${dbColumn}_active`] = true;
    } else {
      activePropsMap[playerName] = {};
      dbColumns.forEach(column => {
        activePropsMap[playerName][`${column}_active`] = false;
      })
      activePropsMap[playerName][`${dbColumn}_active`] = true;
    }
  })

  // console.log('playerPropsMap is ', playerPropsMap);
  // console.log('activePropsMap is ', activePropsMap);

  // loop through the playerPropsMap. Each player name is the key. For each player name, find that player in the activePropsMap, then add all the values he has in the activePropsMap to his entry in the playerPropsMap
  for (const [player, props] of playerPropsMap) {
    const activeProps = activePropsMap[player];
    playerPropsMap.set(player, {
      ...props,
      ...activeProps,
    })
  }
  
  return playerPropsMap;
}