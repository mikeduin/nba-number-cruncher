const express = require("express");
const router = express.Router();
const axios = require("axios");
const knex = require("../db/knex");
const schedule = require("node-schedule");
const moment = require("moment");

const dbBuilders = require("../modules/dbBuilders");
const dbMappers = require("../modules/dbMappers");
const dateFilters = require("../modules/dateFilters");
const updateTeamStats = require("../modules/updateTeamStats");
const advancedTeamStats = "https://stats.nba.com/stats/leaguedashteamstats";

const updateRawDataTables = schedule.scheduleJob("29 3 * * *", function() {
  updateTeamStats.updateAllFullTeamBuilds();
  updateTeamStats.updateAllLineupBuilds();
  dbBuilders.updateSchedule();
  console.log("raw data tables + schedule updated at 3:29 AM");
});

const mapRawData = schedule.scheduleJob("54 3 * * *", function() {
  dbMappers.mapNetRatings();
  console.log("raw data mapped at 3:54 AM");
});

/* GET home page. */
router.get("/", function(req, res, next) {

  // axios.get(advancedTeamStats, {
  //     params: dbBuilders.fetchAdvancedParams(15, 4)
  //   })
  //   .then((response)=> {
  //     let teamData = response.data.resultSets[0].rowSet;
  //     dbBuilders.buildTeamDb('teams_q4_l15', teamData);
  //   })
  //   .catch((err)=>{
  //     console.log(err);
  //   });

  res.send({ Hi: "there" });
});

router.get("/api/getNetRatings", function(req, res, next) {

  knex("team_net_ratings").then(netRatings => {
    res.send(netRatings);
  });

  let nbaNow = moment().format('YYYYMMDD');
});


module.exports = router;
