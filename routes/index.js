var express = require('express');
var router = express.Router();
const axios = require('axios');
const knex = require('../db/knex');
const dbBuilders = require('../modules/dbBuilders');
const updateFullTeams = require('../modules/updateFullTeamBuilds');

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

/* GET home page. */
router.get('/', function(req, res, next) {
  // axios.get(advancedTeamStats, {
  //     params: advancedParams(5)
  //   })
    updateFullTeams.updateAllFullTeamBuilds();
    // .then((response)=> {
    //   // let teamData = response.data.resultSets[0].rowSet;
    //   // dbBuilders.buildTeamDb('teams_full_l5', teamData);
    // })
    // .catch((err)=>{
    //   console.log(err);
    // });

  res.render('index', { title: 'Express' });
});

module.exports = router;
