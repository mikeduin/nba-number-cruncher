var express = require('express');
var router = express.Router();
const axios = require('axios');
const knex = require('../db/knex');
const dbBuilders = require('../modules/dbBuilders');
const updateFullTeams = require('../modules/updateFullTeamBuilds');

const advancedTeamStats = 'https://stats.nba.com/stats/leaguedashteamstats';
// const advancedParams = (games) => {
//   return {
//     MeasureType: 'Advanced',
//     PerMode: 'PerGame',
//     PlusMinus: 'N',
//     PaceAdjust: 'N',
//     Rank: 'N',
//     Season: '2018-19',
//     SeasonType: 'Regular Season',
//     Outcome: '',
//     SeasonSegment: '',
//     DateFrom: '',
//     DateTo: '',
//     OpponentTeamID: 0,
//     VsConference: '',
//     VsDivision: '',
//     LastNGames: games,
//     Location: '',
//     Period: 0,
//     GameSegment: '',
//     Month: 0
//   }
// }

/* GET home page. */
router.get('/', function(req, res, next) {
  // updateFullTeams.updateAllFullTeamBuilds();

  axios.get(advancedTeamStats, {
      params: dbBuilders.fetchLineupParams(20, 'Bench')
    })
    .then((response)=> {
      let teamData = response.data.resultSets[0].rowSet;
      dbBuilders.buildTeamDb('teams_bench_l20', teamData);
    })
    .catch((err)=>{
      console.log(err);
    });

  res.render('index', { title: 'Express' });
});

module.exports = router;
