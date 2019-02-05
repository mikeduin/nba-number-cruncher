const knex = require('../db/knex');
const axios = require('axios');
const advancedTeamStats = 'https://stats.nba.com/stats/leaguedashteamstats';
const dbBuilders = require("../modules/dbBuilders");

const updateFullTeamBuild = (games, db, period) => {
  axios.get(advancedTeamStats, {params: dbBuilders.fetchAdvancedParams(games, period)})
    .then(response => {
      let teamData = response.data.resultSets[0].rowSet;
      dbBuilders.updateTeamDb(db, teamData);
    });
};

const updatePartialTeamBuild = (games, db, lineup) => {
  axios.get(advancedTeamStats, {params: dbBuilders.fetchLineupParams(games, lineup)})
    .then(response => {
      let teamData = response.data.resultSets[0].rowSet;
      dbBuilders.updateTeamDb(db, teamData);
    })
};

module.exports = {
  updateFullTeamBuilds: () => {
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
