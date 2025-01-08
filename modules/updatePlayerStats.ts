import knex from '../db/knex.js';
import axios from 'axios';
import {
  updatePlayerDbAdvancedStats,
  updatePlayerDbBaseStats,
} from "./dbBuilders.js";
import {
  getBoxScoreRequestParams,
  getGameLogsRequestParams,
  getPlayerIndexRequestParams,
  getStatRequestParams,
  formPlayerBaseGameLogsBuild,
  getCurrentSeasonStartYearInt,
  mapPlayerStatistics,
  requestHeaders,
} from "../utils";
import { NbaApiMeasureType, NbaApiSeasonType } from '../types';
import { insertPlayerBoxScoresByPeriod } from '../repositories'; 
import { BOX_SCORE_STATS_URL, GAME_LOGS_URL, PLAYER_INDEX_URL, PLAYER_STATS_URL } from '../constants/index.js';

export const updatePlayerPositions = async () => {
  const season = getCurrentSeasonStartYearInt();

  const playerIndexRequest = await axios.get(PLAYER_INDEX_URL, {
    params: getPlayerIndexRequestParams(),
    headers: requestHeaders()
  });

  const existingPlayerIds = await knex('player_data').where({ season }).pluck('player_id');

  const headers = playerIndexRequest.data.resultSets[0].headers;
  const players = playerIndexRequest.data.resultSets[0].rowSet;

  players.forEach(player => {
    const playerData = headers.reduce((acc, header, i) => {
      acc[header] = player[i];
      return acc;
    }, {});

    if (existingPlayerIds.includes(playerData.PERSON_ID)) {
      knex('player_data').where({ player_id: playerData.PERSON_ID, season }).update({
        position: playerData.POSITION,
        updated_at: new Date()
      }).then(() => console.log('updated player ', playerData.PERSON_ID, ' with position ', playerData.POSITION));
    } else {
      knex('player_data').insert({
        player_id: playerData.PERSON_ID,
        player_name: `${playerData.PLAYER_FIRST_NAME} ${playerData.PLAYER_LAST_NAME}`,
        team_id: playerData.TEAM_ID,
        season,
        position: playerData.POSITION,
        team_abbreviation: playerData.TEAM_ABBREVIATION,
        updated_at: new Date()
      }).then(() => console.log(`inserted player ${playerData.PLAYER_FIRST_NAME} ${playerData.PLAYER_LAST_NAME} with position ${playerData.POSITION}`));
    }
  })
}



// export const updatePlayerGameLogs = async () => {
//   const season = getCurrentSeasonStartYearInt();
//   const gameLogsRequest = async (playerId: string, measureType: NbaApiMeasureType) => await axios.get(GAME_LOGS_URL, {
//     params: getGameLogsRequestParams(playerId, measureType),
//     headers: requestHeaders()
//   });

//   const currentSeasonPlayerIds = await knex('player_data')
//     .where({ season })
//     .andWhere('gp_full', '>', 0)
//     .pluck('player_id'); // instead of doing for everyone, maybe just players who have not had game logs updated?

//   currentSeasonPlayerIds.forEach(async (playerId, i) => {
//     setTimeout(async () => {
//       const [traditionalLogs, advancedLogs] = await Promise.all([
//         gameLogsRequest(playerId, NbaApiMeasureType.Traditional),
//         gameLogsRequest(playerId, NbaApiMeasureType.Advanced)
//       ]);
    
//       const traditionalHeaders = traditionalLogs.data.resultSets[0].headers;
//       const advancedHeaders = advancedLogs.data.resultSets[0].headers;
    
//       const mappedGameLogs = await traditionalLogs.data.resultSets[0].rowSet.map((game: any) => {
//         const gameLog = formPlayerBaseGameLogsBuild(game, traditionalHeaders);
        
//         let usg = null;
//         try {
//           usg = advancedLogs.data.resultSets[0].rowSet.find(
//             (row: any) => row[advancedHeaders.indexOf('GAME_ID')] === gameLog.gid)[advancedHeaders.indexOf('USG_PCT')];
//         } catch (e) {
//           console.log('e calculating usage for ', playerId, ' and game ', gameLog.gid, ' and error is ', e);
//         }

//         return {
//           ...gameLog,
//           usg
//         }
//       });
    
//       updatePlayerGameLogsInDb(playerId, mappedGameLogs);
//     }, i * 3000);
//   });
// }

export const updatePlayerBoxScoresByPeriod = async (gdte: string) => {
  const yesterdayGames = await knex('schedule').where({ gdte }).pluck('gid');
  const season = getCurrentSeasonStartYearInt();
  for (const gid of yesterdayGames) {
    // period of 5 provided to fetch full game stats 
    await Promise.all([1, 2, 3, 4, 5].map(async (period) => {
      const periodChecker = await knex('player_boxscores_by_q').where({ gid, period });

      if (!periodChecker.length) {
        try {
          console.log('stats not found for game ', gid, ' and period ', period, ' so fetching now');
          const boxScorePeriod = await axios.get(BOX_SCORE_STATS_URL, {
            params: getBoxScoreRequestParams(gid, period),
            headers: requestHeaders()
          });
  
          const { boxScoreTraditional } = boxScorePeriod.data;
          const { homeTeam, homeTeamId: hTid, awayTeam, awayTeamId: vTid } = boxScoreTraditional;
          const gameCompleted = true;
          const hPlayerStats = mapPlayerStatistics(homeTeam.players, hTid, homeTeam.teamTricode, homeTeam.statistics, gameCompleted);
          const vPlayerStats = mapPlayerStatistics(awayTeam.players, vTid, awayTeam.teamTricode, awayTeam.statistics, gameCompleted);
  
          insertPlayerBoxScoresByPeriod(gid, period, hPlayerStats, homeTeam.teamTricode, season);
          insertPlayerBoxScoresByPeriod(gid, period, vPlayerStats, awayTeam.teamTricode, season);
        } catch (e) {
          console.log('error trying to do box scores by period is ', e);
        }
      } else {
        console.log('stats found for game ', gid, ' and period ', period, ' so not fetching');
      }
    }));
  }
};

const updatePlayerAdvancedStats = (games, db) => {
  axios.get(PLAYER_STATS_URL, {
    params: getStatRequestParams(games, 0, NbaApiSeasonType.RegularSeason, NbaApiMeasureType.Advanced),
    headers: requestHeaders()
  })
    .then(response => {
      const { resultSets } = response.data;
      const headers = resultSets[0].headers;
      const playerData = resultSets[0].rowSet;
      updatePlayerDbAdvancedStats(db, playerData, headers);
    });
};

const updatePlayerBaseStats = (games, db, period, seasonType) => {
  axios.get(PLAYER_STATS_URL, {
    params: getStatRequestParams(games, period, seasonType, NbaApiMeasureType.Traditional),
    headers: requestHeaders()
  })
    .then(response => {
      const { resultSets } = response.data
      const headers = resultSets[0].headers;
      const playerData = resultSets[0].rowSet;
      updatePlayerDbBaseStats(db, playerData, headers, period, seasonType);
    });
};

export const updatePlayerAdvancedStatBuilds = () => {
  updatePlayerAdvancedStats(0, 'players_full');
  updatePlayerAdvancedStats(5, 'players_l5');
  updatePlayerAdvancedStats(10, 'players_l10');
  updatePlayerAdvancedStats(5, 'players_l15');
};

export const updatePlayerBaseStatBuilds = (period) => {
  updatePlayerBaseStats(0, 'players_full', period, NbaApiSeasonType.RegularSeason);
  setTimeout(() => updatePlayerBaseStats(5, 'players_l5', period, NbaApiSeasonType.RegularSeason), 4000); 
  if (period === 0) {
    setTimeout(() => updatePlayerBaseStats(10, 'players_l10', period, NbaApiSeasonType.RegularSeason), 8000);
    setTimeout(() => updatePlayerBaseStats(15, 'players_l15', period, NbaApiSeasonType.RegularSeason), 12000); 
  }
};

export const updatePlayerBaseStatBuildsPlayoffs = async () => {
  updatePlayerBaseStats(0, 'players_playoffs', 0, NbaApiSeasonType.Playoffs); // 0 period = full game
  setTimeout(() => updatePlayerBaseStats(0, 'players_playoffs', 3, NbaApiSeasonType.Playoffs), 4000); 
  setTimeout(() => updatePlayerBaseStats(0, 'players_playoffs', 4, NbaApiSeasonType.Playoffs), 8000); 
};
