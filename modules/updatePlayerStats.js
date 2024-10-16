import knex from '../db/knex.js';
import axios from 'axios';
import { insertPlayerBoxScoresByPeriod, updatePlayerDbAdvancedStats, updatePlayerDbBaseStats } from "../modules/dbBuilders.js";
import mapPlayerStatistics from "../utils/boxScores/mapPlayerStatistics.js";
import { formApiCallParams } from "../utils/nbaApi/formApiCallParams.js";
import { requestHeaders } from "../utils/nbaApi/requestHeaders.js";

const advancedPlayerStats = 'https://stats.nba.com/stats/leaguedashplayerstats';
const boxScoreStats = 'https://stats.nba.com/stats/boxscoretraditionalv3';

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
        const hPlayerStats = mapPlayerStatistics(homeTeam.players, hTid, homeTeam.teamTricode, gameCompleted);
        const vPlayerStats = mapPlayerStatistics(awayTeam.players, vTid, awayTeam.teamTricode, gameCompleted);

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
    params: formApiCallParams(games, 0, "Regular Season", "Advanced"),
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
    params: formApiCallParams(games, period, seasonType, "Base"),
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
  updatePlayerBaseStats(0, 'players_full', period, 'Regular Season');
  setTimeout(() => updatePlayerBaseStats(5, 'players_l5', period, 'Regular Season'), 4000); 
  if (period === 0) {
    setTimeout(() => updatePlayerBaseStats(10, 'players_l10', period, 'Regular Season'), 8000);
    setTimeout(() => updatePlayerBaseStats(15, 'players_l15', period, 'Regular Season'), 12000); 
  }
};

export const updatePlayerBaseStatBuildsPlayoffs = async () => {
  updatePlayerBaseStats(0, 'players_playoffs', 0, 'Playoffs'); // 0 period = full game
  setTimeout(() => updatePlayerBaseStats(0, 'players_playoffs', 3, 'Playoffs'), 4000); 
  setTimeout(() => updatePlayerBaseStats(0, 'players_playoffs', 4, 'Playoffs'), 8000); 
};
