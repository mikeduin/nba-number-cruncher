const express = require("express");
const router = express.Router();
const axios = require("axios");
const knex = require("../db/knex");
const schedule = require("node-schedule");
const moment = require("moment");
const cheerio = require('cheerio');

const updateTeamStats = require("../modules/updateTeamStats");
const dbBuilders = require("../modules/dbBuilders");
const dbMappers = require("../modules/dbMappers");
const dateFilters = require("../modules/dateFilters");
const teamLookup = require("../modules/teamLookup");
const oddsLoaders = require("../modules/oddsLoaders");

const advancedTeamStats = "https://stats.nba.com/stats/leaguedashteamstats";

let now = Date.now();

// more bets: 'https://www.sportsbook.ag/sbk/sportsbook4/live-betting-betting/home.sbk#moreBetsX2200-1300-Laker-Pacer-020519'

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

  oddsLoaders.sportsbookFull();

    axios.get(sportsbook.thirdQ)
      .then((response) => {
          if(response.status === 200) {
              const html = response.data;
              const $ = cheerio.load(html);
              let lines = [];
              $('.eventbox').each(function(i, elem) {
                  lines[i] = {
                      id: $(this).attr('id'),
                      time: $(this).find('.hour').text(),
                      awayTeam: $(this).find('.team-title').eq(0).text(),
                      over: $(this).find('.money').eq(0).find('.market').text(),
                      awaySpread: $(this).find('.spread').eq(0).find('.market').text(),
                      awayMoney: $(this).find('.total').eq(0).find('.market').text(),
                      homeTeam: $(this).find('.team-title').eq(1).text(),
                      under: $(this).find('.money').eq(1).find('.market').text(),
                      homeSpread: $(this).find('.spread').eq(1).find('.market').text(),
                      homeMoney: $(this).find('.total').eq(1).find('.market').text()
                  }
              });
          }
      }, (error) => console.log(err) );

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
        knex("team_pace").where({team_id: home}).then(homePace => {
          knex("team_pace").where({team_id: vis}).then(visPace => {
            res.send({
              info: game[0],
              homeNetRtg: homeNetRtg[0],
              visNetRtg: visNetRtg[0],
              homePace: homePace[0],
              visPace: visPace[0]
            });
          })
        })
      })
    })
  })
})

const updateFullTeamBuilds = schedule.scheduleJob("49 13 * * *", () => {
  updateTeamStats.updateFullTeamBuilds();
})

const updateStarterBuilds = schedule.scheduleJob("51 13 * * *", () => {
  updateTeamStats.updateStarterBuilds();
})

const updateBenchBuilds = schedule.scheduleJob("53 13 * * *", () => {
  updateTeamStats.updateBenchBuilds();
})

const updateQ1Builds = schedule.scheduleJob("26 13 * * *", () => {
  updateTeamStats.updateQ1Builds();
})

const updateQ2Builds = schedule.scheduleJob("28 13 * * *", () => {
  updateTeamStats.updateQ2Builds();
})

const updateQ3Builds = schedule.scheduleJob("30 13 * * *", () => {
  updateTeamStats.updateQ3Builds();
})

const updateQ4Builds = schedule.scheduleJob("32 13 * * *", () => {
  updateTeamStats.updateQ4Builds();
})

const updateSchedule = schedule.scheduleJob("34 13 * * *", () => {
  dbBuilders.updateSchedule();
})

const mapNetRatings = schedule.scheduleJob("13 14 * * *", () => {
  dbMappers.mapNetRatings();
})

const mapPace = schedule.scheduleJob("14 14 * * *", () => {
  dbMappers.mapPace();
})

module.exports = router;
