const knex = require('../db/knex');
const axios = require('axios');
const dbBuilders = require('./dbBuilders');
const advancedTeamStats = 'https://stats.nba.com/stats/leaguedashteamstats';

const updateFullTeamBuild = (games, db) => {
  axios.get(advancedTeamStats, {params: dbBuilders.fetchAdvancedParams(games)})
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
}

module.exports = {
  updateAllFullTeamBuilds: function () {
    updateFullTeamBuild(0, 'teams_full');
    updateFullTeamBuild(5, 'teams_full_l5');
    updateFullTeamBuild(10, 'teams_full_l10');
    updateFullTeamBuild(15, 'teams_full_l15');
    updateFullTeamBuild(20, 'teams_full_l20');
  },
  updateAllLineupBuilds: function() {
    updatePartialTeamBuild(0, 'teams_starters', 'Starters');
    updatePartialTeamBuild(5, 'teams_starters_l5', 'Starters');
    updatePartialTeamBuild(10, 'teams_starters_l10', 'Starters');
    updatePartialTeamBuild(15, 'teams_starters_l15', 'Starters');
    updatePartialTeamBuild(20, 'teams_starters_l20', 'Starters');
    updatePartialTeamBuild(0, 'teams_bench', 'Bench');
    updatePartialTeamBuild(5, 'teams_bench_l5', 'Bench');
    updatePartialTeamBuild(10, 'teams_bench_l10', 'Bench');
    updatePartialTeamBuild(15, 'teams_bench_l15', 'Bench');
    updatePartialTeamBuild(20, 'teams_bench_l20', 'Bench');
  }
}
