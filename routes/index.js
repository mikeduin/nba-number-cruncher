var express = require('express');
var router = express.Router();
const axios = require('axios');
const knex = require('../db/knex');

const dbBuilders = require('../modules/dbBuilders');
const updateTeamStats = require('../modules/updateTeamStats');
const advancedTeamStats = 'https://stats.nba.com/stats/leaguedashteamstats';

/* GET home page. */
router.get('/', function(req, res, next) {
  // updateTeamStats.updateAllFullTeamBuilds();
  // updateTeamStats.updateAllLineupBuilds();

  // axios.get(advancedTeamStats, {
  //     params: dbBuilders.fetchLineupParams(20, 'Bench')
  //   })
  //   .then((response)=> {
  //     let teamData = response.data.resultSets[0].rowSet;
  //     dbBuilders.buildTeamDb('teams_bench_l20', teamData);
  //   })
  //   .catch((err)=>{
  //     console.log(err);
  //   });

  res.send({ Hi: 'there'});
});

module.exports = router;
