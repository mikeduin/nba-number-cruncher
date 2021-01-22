const knex = require('../db/knex');
const axios = require('axios');
const advancedPlayerStats = 'https://stats.nba.com/stats/leaguedashplayerstats';
const dbBuilders = require("../modules/dbBuilders");

const headers = {
  Accept: "application/json, text/plain, */*",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-US,en;q=0.9",
  // "Cache-Control": "no-cache",
  Connection: "keep-alive",
  DNT: 1,
  Host: "stats.nba.com",
  Referer: "https://www.nba.com/",
  "sec-ch-ua": '"Google Chrome";v="87", "\"Not;A\\Brand";v="99", "Chromium";v="87"',
  "sec-ch-ua-mobile": "?1",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-site",
  "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Mobile Safari/537.36",
  "x-nba-stats-origin": "stats",
  "x-nba-stats-token": true
}

// NOTE - WHEN THIS WAS NOT WORKING AT BEGINNING OF 2020-21 SEASON, HAD TO GO UPDATE dbBuilders.fetchAdvancedPlayerParams TO INCLUDE ADDITIONAL QUERY PARAMETERS THAT WERE BEING SENT ALONG WITH NEW REQUEST (things like "Height" and "Weight" had been added since last year)

const updatePlayerStats = (games, db) => {
  axios.get(advancedPlayerStats, {
    params: dbBuilders.fetchAdvancedPlayerParams(games),
    headers: headers
  })
    .then(response => {
      let playerData = response.data.resultSets[0].rowSet;
      dbBuilders.updatePlayerDb(db, playerData);
    });
};

module.exports = {
  updatePlayerStatBuilds: () => {
    updatePlayerStats(0, 'players_full');
    updatePlayerStats(5, 'players_l5');
    updatePlayerStats(10, 'players_l10');
    updatePlayerStats(5, 'players_l15');
  }
}
