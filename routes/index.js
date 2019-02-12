const express = require("express");
const router = express.Router();
const axios = require("axios");
const knex = require("../db/knex");
const schedule = require("node-schedule");
const moment = require("moment");
const cheerio = require('cheerio');

const updateTeamStats = require("../modules/updateTeamStats");
const updatePlayerStats = require("../modules/updatePlayerStats");
const dbBuilders = require("../modules/dbBuilders");
const dbMappers = require("../modules/dbMappers");
const dateFilters = require("../modules/dateFilters");
const teamLookup = require("../modules/teamLookup");
const oddsLoaders = require("../modules/oddsLoaders");

let now = moment().format('YYYY-MM-DD');

// setInterval(()=>{
//   oddsLoaders.sportsbookFull();
//   oddsLoaders.sportsbookFirstH();
//   oddsLoaders.sportsbookFirstQ();
// }, 120000);
// setInterval(()=>{oddsLoaders.sportsbookThirdQ()}, 30000);
// setInterval(()=>{oddsLoaders.sportsbookSecondH()}, 30000);

setTimeout(()=>{
  updatePlayerStats.updatePlayerStatBuilds()}, 5000)

// updatePlayerStats.updatePlayerStatBuilds();

// more bets: 'https://www.sportsbook.ag/sbk/sportsbook4/live-betting-betting/home.sbk#moreBetsX2200-1300-Laker-Pacer-020519'

/* GET home page. */
router.get("/", (req, res, next) => {
  console.log('hello');


  res.send({ Hi: "there" });
});

router.get("/api/getNetRatings", (req, res, next) => {
  knex("team_net_ratings").then(netRatings => {
    res.send(netRatings);
  });
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
    knex("odds_sportsbook").where({gcode: game[0].gcode}).then(odds => {
      console.log('odds are ', odds);

      let home = game[0].h[0].tid;
      let vis = game[0].v[0].tid;
      let hAbb = game[0].h[0].ta;
      let vAbb = game[0].v[0].ta;

      let sevenAgo = moment().subtract(6, 'days').format('YYYY-MM-DD');
      let threeAhead = moment().add(3, 'days').format('YYYY-MM-DD');

      knex("schedule")
      .where('gcode', 'like', `%${hAbb}%`)
      .whereBetween('gdte', [sevenAgo, threeAhead])
      .orderBy('gdte')
      .then(homeSched => {
        knex("schedule")
        .where('gcode', 'like', `%${vAbb}%`)
        .whereBetween('gdte', [sevenAgo, threeAhead])
        .orderBy('gdte')
        .then(visSched => {
          knex("team_net_ratings").where({team_id: home}).then(homeNetRtg => {
            knex("team_net_ratings").where({team_id: vis}).then(visNetRtg => {
              knex("team_pace").where({team_id: home}).then(homePace => {
                knex("team_pace").where({team_id: vis}).then(visPace => {
                  knex("teams").where({tid: home}).then(homeInfo => {
                    knex("teams").where({tid: vis}).then(visInfo => {
                      res.send({
                        info: game[0],
                        odds: odds[0],
                        homeTen: homeSched,
                        visTen: visSched,
                        homeNetRtg: homeNetRtg[0],
                        visNetRtg: visNetRtg[0],
                        homePace: homePace[0],
                        visPace: visPace[0],
                        homeInfo: homeInfo[0],
                        visInfo: visInfo[0]
                      });
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })
})



const updateFullTeamBuilds = schedule.scheduleJob("3 14 * * *", () => {
  updateTeamStats.updateFullTeamBuilds();
})

const updateStarterBuilds = schedule.scheduleJob("4 14 * * *", () => {
  updateTeamStats.updateStarterBuilds();
})

const updateBenchBuilds = schedule.scheduleJob("5 14 * * *", () => {
  updateTeamStats.updateBenchBuilds();
})

const updateQ1Builds = schedule.scheduleJob("6 14 * * *", () => {
  updateTeamStats.updateQ1Builds();
})

const updateQ2Builds = schedule.scheduleJob("7 14 * * *", () => {
  updateTeamStats.updateQ2Builds();
})

const updateQ3Builds = schedule.scheduleJob("8 14 * * *", () => {
  updateTeamStats.updateQ3Builds();
})

const updateQ4Builds = schedule.scheduleJob("9 14 * * *", () => {
  updateTeamStats.updateQ4Builds();
})

const updateSchedule = schedule.scheduleJob("10 14 * * *", () => {
  dbBuilders.updateSchedule();
})

const mapNetRatings = schedule.scheduleJob("11 14 * * *", () => {
  dbMappers.mapNetRatings();
})

const mapPace = schedule.scheduleJob("12 14 * * *", () => {
  dbMappers.mapPace();
})

module.exports = router;
