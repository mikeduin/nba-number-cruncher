const knex = require('../db/knex');
const axios = require('axios');
const advancedPlayerStats = 'https://stats.nba.com/stats/leaguedashplayerstats';
const dbBuilders = require("../modules/dbBuilders");

const updatePlayerStats = (games) => {
  axios.get(advancedPlayerStats, {params: dbBuilders.fetchAdvancedPlayerParams(games)})
    .then(response => {
      let playerData = response.data.resultSets[0].rowSet;
      console.log(playerData);
    });
};

module.exports = {
  updatePlayerStatBuilds: () => {
    console.log('player stat build fn reached');
    updatePlayerStats(0);
  }
}
