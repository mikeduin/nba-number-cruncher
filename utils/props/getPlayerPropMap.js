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

module.exports = async (gamePropsOnBovada, gamePropPlayersInDb) => {
  const playerPropsMap = new Map();
  const activePropsMap = buildActivePropsMap(gamePropPlayersInDb);

  // console.log('gamePropsOnBovada are ', gamePropsOnBovada);
  // console.log('activePropsMap is ', activePropsMap);

  if (gamePropsOnBovada) {
    gamePropsOnBovada.forEach((prop) => {
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
    // problem is that if a player is not in the playerPropsMap, their data stays stale ... when in actuality, it should be turned to 'inactive' for each prop ...
    for (const [player, props] of playerPropsMap) {
      const activeProps = activePropsMap[player];
      playerPropsMap.set(player, {
        ...props,
        ...activeProps,
      })
    }

    // console.log('playerPropsMap is ', playerPropsMap);

    // loop through the keys of the activePropsMap. Each key represents a player name. If that player name is NOT in the playerPropsMap, then add it to the playerPropsMap with all the values from the activePropsMap
    for (const player of Object.keys(activePropsMap)) {
      if (!playerPropsMap.has(player)) {
        playerPropsMap.set(player, activePropsMap[player]);
      }
    }
    
    return playerPropsMap;
  } else {
    console.log('NO GAME PROPS FOUND, likely timeout error (?) - returning empty object');
    return playerPropsMap;
  }


}