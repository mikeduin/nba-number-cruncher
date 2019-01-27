const knex = require('../db/knex');
const axios = require('axios');
const dbBuilders = require('./dbBuilders');
const advancedTeamStats = 'https://stats.nba.com/stats/leaguedashteamstats';

const advancedParams = (games) => {
  return {
    MeasureType: 'Advanced',
    PerMode: 'PerGame',
    PlusMinus: 'N',
    PaceAdjust: 'N',
    Rank: 'N',
    Season: '2018-19',
    SeasonType: 'Regular Season',
    Outcome: '',
    SeasonSegment: '',
    DateFrom: '',
    DateTo: '',
    OpponentTeamID: 0,
    VsConference: '',
    VsDivision: '',
    LastNGames: games,
    Location: '',
    Period: 0,
    GameSegment: '',
    Month: 0
  }
}

const updateFullTeamBuild = (games, db) => {
  axios.get(advancedTeamStats, {params: advancedParams(games)})
    .then(response => {
      let teamData = response.data.resultSets[0].rowSet;
      dbBuilders.updateTeamDb(db, teamData);
    });
};

module.exports = {
  updateAllFullTeamBuilds: function () {
    updateFullTeamBuild(0, 'teams_full');
    updateFullTeamBuild(5, 'teams_full_l5');
    updateFullTeamBuild(10, 'teams_full_l10');
    updateFullTeamBuild(15, 'teams_full_l15');
    updateFullTeamBuild(20, 'teams_full_l20');
  }
}
