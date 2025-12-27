import { mapSportsbookMarketToDbColumn, propMarketMappers } from '../../modules/dbMappers.js';
import { SportsbookName } from '../../types';
import { playerNameMismatches } from '../../controllers/Props.Controller.js';

const buildActivePropsMap = (players, dbColumns) => {
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

const findPlayerTeam = (propPlayerName: string, dailyPlayers, sportsbook: SportsbookName) => {
  // console.log('propPlayerName is ', propPlayerName);
  // console.log('dailyPlayers is ', dailyPlayers);
  let player = dailyPlayers.find(player => player.player_name === propPlayerName);
  if (!player && sportsbook === SportsbookName.Betsson) {
    player = dailyPlayers.find(player => player.player_name === playerNameMismatches[SportsbookName.Betsson][propPlayerName])
  }
  return player ? player.team_abbreviation : null;
}

export const getPlayerPropsMap = async (gamePropsOnSportsbook, gamePropPlayersInDb, dailyPlayers, sportsbook: SportsbookName) => {
  const sportsbookMarkets = propMarketMappers(sportsbook);
  const dbColumns = Object.values(sportsbookMarkets);
  const playerPropsMap = new Map();
  const activePropsMap = buildActivePropsMap(gamePropPlayersInDb, dbColumns);

  if (gamePropsOnSportsbook) {
    gamePropsOnSportsbook.forEach((prop) => {
      let playerName = prop.player.trim();
      
      // Check if player name is formatted as "lastName, firstName" and reformat to "firstName lastName"
      if (playerName.includes(',')) {
        const [lastName, firstName] = playerName.split(',').map(part => part.trim());
        playerName = `${firstName} ${lastName}`;
      }
      
      const dbColumn = mapSportsbookMarketToDbColumn(sportsbook, prop.market.trim());

      if (dbColumn) {
        const playerTeam = sportsbook === SportsbookName.Bovada 
        ? prop.team
        : findPlayerTeam(playerName, dailyPlayers, sportsbook);

        if (!playerTeam) {
          console.log('player team not found for ', playerName, ' ... skipping team assignment');
        }
    
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
            team: playerTeam,
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
      } else {
        console.log(prop.market, ' has no associated DB column -- not adding to prop map');
      }
    })
  
    // loop through the playerPropsMap. Each player name is the key. For each player name, find that player in the activePropsMap, then add all the values he has in the activePropsMap to his entry in the playerPropsMap
    // problem is that if a player is not in the playerPropsMap, their data stays stale ... when in actuality, it should be turned to 'inactive' for each prop ...
    for (const [player, props] of playerPropsMap) {
      const activeProps = activePropsMap[player];
      playerPropsMap.set(player, {
        ...props,
        ...activeProps,
      })
    }

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