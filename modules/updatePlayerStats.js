const knex = require('../db/knex');
const axios = require('axios');
const advancedPlayerStats = 'https://stats.nba.com/stats/leaguedashplayerstats';
const boxScoreStats = 'https://stats.nba.com/stats/boxscoretraditionalv3';
const dbBuilders = require("../modules/dbBuilders");
const mapPlayerStatistics = require("../utils/boxScores/mapPlayerStatistics");
const { formApiCallParams } = require("../utils/nbaApi/formApiCallParams");
const { requestHeaders } = require("../utils/nbaApi/requestHeaders");

const updatePlayerBoxScoresByPeriod = async (gdte) => {
  const yesterdayGames = await knex('schedule').where({gdte}).pluck('gid');
  for (const gid of yesterdayGames) {
    await Promise.all([1, 2, 3, 4].map(async (period) => {
      const periodChecker = await knex('player_boxscores_by_q').where({gid, period});

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
        })
    
        const { boxScoreTraditional } = boxScorePeriod.data;
        const { homeTeam, homeTeamId: hTid, awayTeam, awayTeamId: vTid} = boxScoreTraditional;
        const gameCompleted = true;
        const hPlayerStats = mapPlayerStatistics(homeTeam.players, hTid, homeTeam.teamTricode, gameCompleted);
        const vPlayerStats = mapPlayerStatistics(awayTeam.players, vTid, awayTeam.teamTricode, gameCompleted);
    
        await dbBuilders.insertPlayerBoxScoresByPeriod(gid, period, hPlayerStats, homeTeam.teamTricode);
        await dbBuilders.insertPlayerBoxScoresByPeriod(gid, period, vPlayerStats, awayTeam.teamTricode);  
      } else {
        console.log('stats found for game ', gid, ' and period ', period, ' so not fetching');
      }
    }));
  }
}

const updatePlayerAdvancedStats = (games, db) => {
  axios.get(advancedPlayerStats, {
    params: formApiCallParams(games, 0, "Regular Season", "Advanced"),
    headers: requestHeaders()
  })
    .then(response => {
      const { resultSets } = response.data
      const headers = resultSets[0].headers;
      const playerData = resultSets[0].rowSet;
      dbBuilders.updatePlayerDbAdvancedStats(db, playerData, headers);
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
      dbBuilders.updatePlayerDbBaseStats(db, playerData, headers, period, seasonType);
    });
};

module.exports = {
  updatePlayerBoxScoresByPeriod,
  updatePlayerAdvancedStatBuilds: () => {
    updatePlayerAdvancedStats(0, 'players_full');
    updatePlayerAdvancedStats(5, 'players_l5');
    updatePlayerAdvancedStats(10, 'players_l10');
    updatePlayerAdvancedStats(5, 'players_l15');
  },
  updatePlayerBaseStatBuilds: (period) => {
    updatePlayerBaseStats(0, 'players_full', period, 'Regular Season');
    setTimeout(() => updatePlayerBaseStats(5, 'players_l5', period, 'Regular Season'), 4000); 
    if (period === 0) {
      setTimeout(() => updatePlayerBaseStats(10, 'players_l10', period, 'Regular Season'), 8000);
      setTimeout(() => updatePlayerBaseStats(15, 'players_l15', period, 'Regular Season'), 12000); 
    }
  },
  updatePlayerBaseStatBuildsPlayoffs: async () => {
    updatePlayerBaseStats(0, 'players_playoffs', 0, 'Playoffs'); // 0 period = full game
    setTimeout(() => updatePlayerBaseStats(0, 'players_playoffs', 3, 'Playoffs'), 4000); 
    setTimeout(() => updatePlayerBaseStats(0, 'players_playoffs', 4, 'Playoffs'), 8000); 
  }
}
