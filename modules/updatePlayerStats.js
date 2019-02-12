const knex = require('../db/knex');
const axios = require('axios');
const advancedPlayerStats = 'https://stats.nba.com/stats/leaguedashplayerstats';
const dbBuilders = require("../modules/dbBuilders");

const updatePlayerStats = (games, db) => {
  axios.get(advancedPlayerStats, {params: dbBuilders.fetchAdvancedPlayerParams(games)})
    .then(response => {
      let playerData = response.data.resultSets[0].rowSet;
      dbBuilders.updatePlayerDb(db, playerData);
    });
};

module.exports = {
  updatePlayerStatBuilds: () => {
    updatePlayerStats(0, 'players_full');
  }
}
