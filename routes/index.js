const express = require("express");
const router = express.Router();
const axios = require("axios");
const knex = require("../db/knex");
const schedule = require("node-schedule");
const moment = require("moment");

const updateTeamStats = require("../modules/updateTeamStats");
const dbBuilders = require("../modules/dbBuilders");
const dbMappers = require("../modules/dbMappers");
const dateFilters = require("../modules/dateFilters");

const advancedTeamStats = "https://stats.nba.com/stats/leaguedashteamstats";

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
  knex("schedule")
    .where({ gweek: week })
    .orderBy('etm')
    .then(games => {
      res.send({
        week: week,
        weekArray: weekArray,
        weekGames: games
      })
    });
});

router.get("/api/fetchGame/:gid", (req, res, next) => {
  let gid = req.params.gid;
  knex("schedule").where({gid: gid}).then(game => {
    let home = game[0].h[0].tid;
    let vis = game[0].v[0].tid;

    knex("team_net_ratings").where({team_id: home}).then(homeNetRtg => {
      knex("team_net_ratings").where({team_id: vis}).then(visNetRtg => {
        res.send({
          info: game[0],
          homeNetRtg: homeNetRtg[0],
          visNetRtg: visNetRtg[0]
        });
      })
    })
  })
})

const updateFullTeamBuilds = schedule.scheduleJob("33 5 * * *", () => {
  updateTeamStats.updateFullTeamBuilds();
})

const updateStarterBuilds = schedule.scheduleJob("36 5 * * *", () => {
  updateTeamStats.updateStarterBuilds();
})

const updateBenchBuilds = schedule.scheduleJob("39 5 * * *", () => {
  updateTeamStats.updateBenchBuilds();
})

const updateQ1Builds = schedule.scheduleJob("42 5 * * *", () => {
  updateTeamStats.updateQ1Builds();
})

const updateQ2Builds = schedule.scheduleJob("45 5 * * *", () => {
  updateTeamStats.updateQ2Builds();
})

const updateQ3Builds = schedule.scheduleJob("48 5 * * *", () => {
  updateTeamStats.updateQ3Builds();
})

const updateQ4Builds = schedule.scheduleJob("51 5 * * *", () => {
  updateTeamStats.updateQ4Builds();
})

const updateSchedule = schedule.scheduleJob("54 5 * * *", () => {
  dbBuilders.updateSchedule();
})

const mapNetRatings = schedule.scheduleJob("57 5 * * *", () => {
  dbMappers.mapNetRatings();
})

const mapPace = schedule.scheduleJob("2 6 * * *", () => {
  dbMappers.mapPace();
})

module.exports = router;
