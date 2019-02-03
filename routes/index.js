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

const updateRawDataTables = schedule.scheduleJob("29 3 * * *", () => {
  updateTeamStats.updateAllFullTeamBuilds();
  updateTeamStats.updateAllLineupBuilds();
  dbBuilders.updateSchedule();
  console.log("raw data tables + schedule updated at 3:29 AM");
});

const mapRawData = schedule.scheduleJob("54 3 * * *", () => {
  dbMappers.mapNetRatings();
  console.log("raw data mapped at 3:54 AM");
});

/* GET home page. */
router.get("/", (req, res, next) => {
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

router.get("/api/getNetRatings", (req, res, next) => {
  knex("team_net_ratings").then(netRatings => {
    res.send(netRatings);
  });
});

router.get("/api/todaysGames", (req, res, next) => {
  knex("schedule");
});

router.get("/api/fetchWeek/:date", (req, res, next) => {
  let week = dateFilters.fetchGmWk(req.params.date);
  let weekArray = dateFilters.fetchGmWkArrays(week);
  let weekGames = [];
  knex("schedule")
    .where({ gweek: week })
    .orderBy('etm')
    .then(games => {
      weekGames = games;
      res.send({
        week: week,
        weekArray: weekArray,
        weekGames: weekGames
      })
    });
});

module.exports = router;
