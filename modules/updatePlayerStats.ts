import knex from '../db/knex.js';
import axios from 'axios';
import {
  insertPlayerBoxScoresByPeriod,
  updatePlayerDbAdvancedStats,
  updatePlayerDbBaseStats,
  updatePlayerGameLogsInDb,
} from "./dbBuilders.js";
import {
  formApiCallParams,
  formPlayerBaseGameLogsBuild,
  getCurrentSeasonDisplayYear,
  getCurrentSeasonStartYearInt,
  mapPlayerStatistics,
  requestHeaders,
} from "../utils";
import { NbaApiMeasureType, NbaApiSeasonType } from '../types';

const advancedPlayerStats = 'https://stats.nba.com/stats/leaguedashplayerstats';
const boxScoreStats = 'https://stats.nba.com/stats/boxscoretraditionalv3';
const gameLogs = 'https://stats.nba.com/stats/playergamelogs';

export const updatePlayerGameLogs = async () => {
  const season = getCurrentSeasonStartYearInt();
  const gameLogsRequest = async (playerId: string, measureType: NbaApiMeasureType) => await axios.get(gameLogs, {
    params: {
      LastNGames: 10,
      LeagueID: '00',
      MeasureType: measureType,
      PerMode: 'Totals',
      Period: 0, // full game
      PlayerID: playerId,
      Season: getCurrentSeasonDisplayYear(),
      // SeasonType: 'Regular Season',
      PaceAdjust: 'N',
    },
    headers: requestHeaders()
  });

  const currentSeasonPlayerIds = await knex('player_data').where({ season }).pluck('player_id'); // instead of doing for everyone, maybe just players who have not had game logs updated?

  currentSeasonPlayerIds.forEach(async (playerId, i) => {
    setTimeout(async () => {
      const [traditionalLogs, advancedLogs] = await Promise.all([
        gameLogsRequest(playerId, NbaApiMeasureType.Traditional),
        gameLogsRequest(playerId, NbaApiMeasureType.Advanced)
      ]);
    
      const traditionalHeaders = traditionalLogs.data.resultSets[0].headers;
      const advancedHeaders = advancedLogs.data.resultSets[0].headers;
    
      const mappedGameLogs = await traditionalLogs.data.resultSets[0].rowSet.map((game: any) => {
        const gameLog = formPlayerBaseGameLogsBuild(game, traditionalHeaders);
        
        const usg = advancedLogs.data.resultSets[0].rowSet.find(
          (row: any) => row[advancedHeaders.indexOf('GAME_ID')] === gameLog.gid)[advancedHeaders.indexOf('USG_PCT')];
    
        return {
          ...gameLog,
          usg
        }
      });
    
      updatePlayerGameLogsInDb(playerId, mappedGameLogs);
    }, i * 1000);
  });
}

export const updatePlayerBoxScoresByPeriod = async (gdte) => {
  const yesterdayGames = await knex('schedule').where({ gdte }).pluck('gid');
  for (const gid of yesterdayGames) {
    await Promise.all([1, 2, 3, 4].map(async (period) => {
      const periodChecker = await knex('player_boxscores_by_q').where({ gid, period });

      if (!periodChecker.length) {
        console.log('stats not found for game ', gid, ' and period ', period, ' so fetching now');
        const boxScorePeriod = await axios.get(boxScoreStats, {
          params: {
            GameID: `00${gid}`,
            LeagueID: '00',
            endPeriod: period,
            endRange: 28800,
            rangeType: 1,
            startPeriod: period,
            startRange: 0,
          },
          headers: requestHeaders()
        });

        const { boxScoreTraditional } = boxScorePeriod.data;
        const { homeTeam, homeTeamId: hTid, awayTeam, awayTeamId: vTid } = boxScoreTraditional;
        const gameCompleted = true;
        const hPlayerStats = mapPlayerStatistics(homeTeam.players, hTid, homeTeam.teamTricode, homeTeam.statistics, gameCompleted);
        const vPlayerStats = mapPlayerStatistics(awayTeam.players, vTid, awayTeam.teamTricode, awayTeam.statistics, gameCompleted);

        insertPlayerBoxScoresByPeriod(gid, period, hPlayerStats, homeTeam.teamTricode);
        insertPlayerBoxScoresByPeriod(gid, period, vPlayerStats, awayTeam.teamTricode);
      } else {
        console.log('stats found for game ', gid, ' and period ', period, ' so not fetching');
      }
    }));
  }
};

const updatePlayerAdvancedStats = (games, db) => {
  axios.get(advancedPlayerStats, {
    params: formApiCallParams(games, 0, NbaApiSeasonType.RegularSeason, NbaApiMeasureType.Advanced),
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
  axios.get(advancedPlayerStats, {
    params: formApiCallParams(games, period, seasonType, NbaApiMeasureType.Traditional),
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
