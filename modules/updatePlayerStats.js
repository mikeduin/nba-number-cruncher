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

const updatePlayerAdvancedStats = (games, db) => {
  axios.get(advancedPlayerStats, {
    params: dbBuilders.fetchAdvancedPlayerParams(games),
    headers: headers
  })
    .then(response => {
      const { resultSets } = response.data
      const headers = resultSets[0].headers;
      const playerData = resultSets[0].rowSet;
      dbBuilders.updatePlayerDbAdvancedStats(db, playerData, headers);
    });
};

const updatePlayerBaseStats = (games, db) => {
  axios.get(advancedPlayerStats, {
    params: dbBuilders.fetchBasePlayerParams(games),
    headers: headers
  })
    .then(response => {
      const { resultSets } = response.data
      const headers = resultSets[0].headers;
      const playerData = resultSets[0].rowSet;
      dbBuilders.updatePlayerDbBaseStats(db, playerData, headers);
    });
};

const updatePlayerBaseStatsThirdQ = (games, db) => {
  const period = 3;
  axios.get(advancedPlayerStats, {
    params: dbBuilders.fetchBasePlayerParams(games, period),
    headers: headers
  })
    .then(response => {
      const { resultSets } = response.data
      const headers = resultSets[0].headers;
      const playerData = resultSets[0].rowSet;
      dbBuilders.updatePlayerDbBaseStatsThirdQ(db, playerData, headers);
    });
};

const updatePlayerBaseStatsFourthQ = (games, db) => {
  const period = 4;
  axios.get(advancedPlayerStats, {
    params: dbBuilders.fetchBasePlayerParams(games, period),
    headers: headers
  })
    .then(response => {
      const { resultSets } = response.data
      const headers = resultSets[0].headers;
      const playerData = resultSets[0].rowSet;
      dbBuilders.updatePlayerDbBaseStatsFourthQ(db, playerData, headers);
    });
};

module.exports = {
  updatePlayerAdvancedStatBuilds: () => {
    updatePlayerAdvancedStats(0, 'players_full');
    updatePlayerAdvancedStats(5, 'players_l5');
    updatePlayerAdvancedStats(10, 'players_l10');
    updatePlayerAdvancedStats(5, 'players_l15');
  },
  updatePlayerBaseStatBuilds: () => {
    updatePlayerBaseStats(0, 'players_full');
    updatePlayerBaseStats(5, 'players_l5');
    updatePlayerBaseStats(10, 'players_l10');
    updatePlayerBaseStats(15, 'players_l15');
  },
  updatePlayerBaseStatBuildsThirdQ: () => {
    updatePlayerBaseStatsThirdQ(0, 'players_full');
    updatePlayerBaseStatsThirdQ(5, 'players_l5');
  },
  updatePlayerBaseStatBuildsFourthQ: () => {
    updatePlayerBaseStatsFourthQ(0, 'players_full');
    updatePlayerBaseStatsFourthQ(5, 'players_l5');
  }
}
