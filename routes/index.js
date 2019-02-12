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

setInterval(()=>{
  oddsLoaders.sportsbookFull();
  oddsLoaders.sportsbookFirstH();
  oddsLoaders.sportsbookFirstQ();
}, 120000);
setInterval(()=>{oddsLoaders.sportsbookThirdQ()}, 30000);
setInterval(()=>{oddsLoaders.sportsbookSecondH()}, 30000);


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
      let h = game[0].h[0].tid;
      let v = game[0].v[0].tid;
      let hAbb = game[0].h[0].ta;
      let vAbb = game[0].v[0].ta;

      let sevenAgo = moment().subtract(6, 'days').format('YYYY-MM-DD');
      let threeAhead = moment().add(3, 'days').format('YYYY-MM-DD');

      knex("schedule")
      .where('gcode', 'like', `%${hAbb}%`)
      .whereBetween('gdte', [sevenAgo, threeAhead])
      .orderBy('gdte')
      .then(hSched => {
        knex("schedule")
        .where('gcode', 'like', `%${vAbb}%`)
        .whereBetween('gdte', [sevenAgo, threeAhead])
        .orderBy('gdte')
        .then(vSched => {
          knex("team_net_ratings").where({team_id: h}).then(hNetRtg => {
            knex("team_net_ratings").where({team_id: v}).then(vNetRtg => {
              knex("team_pace").where({team_id: h}).then(hPace => {
                knex("team_pace").where({team_id: v}).then(vPace => {
                  knex("teams").where({tid: h}).then(hInfo => {
                    knex("teams").where({tid: v}).then(vInfo => {
                      knex("schedule")
                      .where('gcode', 'like', `%${hAbb}${vAbb}%`)
                      .orWhere('gcode', 'like', `%${vAbb}${hAbb}%`)
                      .then(matchups => {
                        knex("player_data").where({team_id: h}).then(hPlayers => {
                          knex("player_data").where({team_id: v}).then(vPlayers => {
                            res.send({
                              info: game[0],
                              odds: odds[0],
                              hTen: hSched,
                              vTen: vSched,
                              matchups: matchups,
                              hNetRtg: hNetRtg[0],
                              vNetRtg: vNetRtg[0],
                              hPace: hPace[0],
                              vPace: vPace[0],
                              hInfo: hInfo[0],
                              vInfo: vInfo[0],
                              hPlayers: hPlayers,
                              vPlayers: vPlayers
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
    })
  })
})



const updateFullTeamBuilds = schedule.scheduleJob("13 6 * * *", () => {
  updateTeamStats.updateFullTeamBuilds();
})

const updateStarterBuilds = schedule.scheduleJob("14 6 * * *", () => {
  updateTeamStats.updateStarterBuilds();
})

const updateBenchBuilds = schedule.scheduleJob("15 6 * * *", () => {
  updateTeamStats.updateBenchBuilds();
})

const updateQ1Builds = schedule.scheduleJob("16 6 * * *", () => {
  updateTeamStats.updateQ1Builds();
})

const updateQ2Builds = schedule.scheduleJob("17 6 * * *", () => {
  updateTeamStats.updateQ2Builds();
})

const updateQ3Builds = schedule.scheduleJob("18 6 * * *", () => {
  updateTeamStats.updateQ3Builds();
})

const updateQ4Builds = schedule.scheduleJob("19 6 * * *", () => {
  updateTeamStats.updateQ4Builds();
})

const updateFullPlayersBuild = schedule.scheduleJob("20 6 * * *", () => {
  updatePlayerStats.updatePlayerStatBuilds();
})

const updateSchedule = schedule.scheduleJob("21 6 * * *", () => {
  dbBuilders.updateSchedule();
})

const mapTeamNetRatings = schedule.scheduleJob("22 6 * * *", () => {
  dbMappers.mapTeamNetRatings();
})

const mapTeamPace = schedule.scheduleJob("23 6 * * *", () => {
  dbMappers.mapTeamPace();
})

const mapFullPlayerData = schedule.scheduleJob("24 6 * * *", () => {
  dbMappers.mapFullPlayerData();
})

const mapSegmentedPlayerData = schedule.scheduleJob("25 6 * * *", () => {
  dbMappers.mapSegmentedPlayerData();
})

module.exports = router;
