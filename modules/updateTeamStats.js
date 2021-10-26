const knex = require('../db/knex');
const axios = require('axios');
const teamStatsUrl = 'https://stats.nba.com/stats/leaguedashteamstats';
const dbBuilders = require("../modules/dbBuilders");

const headers = {
  Accept: "application/json, text/plain, */*",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
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

const updateBaseTeamBuild = (games, db, period) => {
  // console.log('updating base team build for ', games, db, period);
  axios.get(teamStatsUrl, {
    params: dbBuilders.fetchBaseTeamParams(games, period),
    headers: headers
  })
    .then(response => {
      // console.log('response is ', response);
      let teamData = response.data.resultSets[0].rowSet;
      // Change this to .buildBaseTeamDb for initial builds
      // dbBuilders.buildBaseTeamDb(db, teamData);
      dbBuilders.updateBaseTeamDb(db, teamData);
    });
};


const updateFullTeamBuild = (games, db, period) => {
  // console.log('updating full team build for ', games, db, period);
  axios.get(teamStatsUrl, {
    params: dbBuilders.fetchAdvancedTeamParams(games, period),
    headers: headers
  })
    .then(response => {
      let teamData = response.data.resultSets[0].rowSet;
      // console.log('team date is ', teamData);
      // Change this to .buildTeabDb for initial builds
      // dbBuilders.buildAdvancedTeamDb(db, teamData);
      dbBuilders.updateAdvancedTeamDb(db, teamData);
    });
};

const updatePartialTeamBuild = (games, db, lineup) => {
  axios.get(teamStatsUrl, {
    params: dbBuilders.fetchLineupParams(games, lineup),
    headers: headers
  })
    .then(response => {
      let teamData = response.data.resultSets[0].rowSet;
      // Change this to .buildTeabDb for initial builds
      // dbBuilders.buildAdvancedTeamDb(db, teamData);
      dbBuilders.updateAdvancedTeamDb(db, teamData);
    })
};

module.exports = {
  updateFullTeamBuilds: () => {
    updateBaseTeamBuild(0, 'teams_full_base', 0);
    updateFullTeamBuild(0, 'teams_full', 0);
    updateFullTeamBuild(5, 'teams_full_l5', 0);
    updateFullTeamBuild(10, 'teams_full_l10', 0);
    updateFullTeamBuild(15, 'teams_full_l15', 0);
    updateFullTeamBuild(20, 'teams_full_l20', 0);
  },
  updateQ1Builds: () => {
    updateFullTeamBuild(0, 'teams_q1', 1);
    updateFullTeamBuild(5, 'teams_q1_l5', 1);
    updateFullTeamBuild(10, 'teams_q1_l10', 1);
    updateFullTeamBuild(15, 'teams_q1_l15', 1);
  },
  updateQ2Builds: () => {
    updateFullTeamBuild(0, 'teams_q2', 2);
    updateFullTeamBuild(5, 'teams_q2_l5', 2);
    updateFullTeamBuild(10, 'teams_q2_l10', 2);
    updateFullTeamBuild(15, 'teams_q2_l15', 2);
  },
  updateQ3Builds: () => {
    updateFullTeamBuild(0, 'teams_q3', 3);
    updateFullTeamBuild(5, 'teams_q3_l5', 3);
    updateFullTeamBuild(10, 'teams_q3_l10', 3);
    updateFullTeamBuild(15, 'teams_q3_l15', 3);
  },
  updateQ4Builds: () => {
    updateFullTeamBuild(0, 'teams_q4', 4);
    updateFullTeamBuild(5, 'teams_q4_l5', 4);
    updateFullTeamBuild(10, 'teams_q4_l10', 4);
    updateFullTeamBuild(15, 'teams_q4_l15', 4);
  },
  updateStarterBuilds: () => {
    updatePartialTeamBuild(0, 'teams_starters', 'Starters');
    updatePartialTeamBuild(5, 'teams_starters_l5', 'Starters');
    updatePartialTeamBuild(10, 'teams_starters_l10', 'Starters');
    updatePartialTeamBuild(15, 'teams_starters_l15', 'Starters');
    updatePartialTeamBuild(20, 'teams_starters_l20', 'Starters');
  },
  updateBenchBuilds: () => {
    updatePartialTeamBuild(0, 'teams_bench', 'Bench');
    updatePartialTeamBuild(5, 'teams_bench_l5', 'Bench');
    updatePartialTeamBuild(10, 'teams_bench_l10', 'Bench');
    updatePartialTeamBuild(15, 'teams_bench_l15', 'Bench');
    updatePartialTeamBuild(20, 'teams_bench_l20', 'Bench');
  },

}
