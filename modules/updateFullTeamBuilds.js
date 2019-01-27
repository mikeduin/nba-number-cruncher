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
    .then((response)=> {
      let teamData = response.data.resultSets[0].rowSet;
      dbBuilders.updateTeamDb(db, teamData);
    });
};

// module.exports = {
//   updateAllFullTeamBuilds: function () {
//
//   }
// }
