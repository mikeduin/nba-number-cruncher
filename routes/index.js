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

let now = Date.now();

const cheerio = require('cheerio');
const sportsbook = {
  full: 'https://www.sportsbook.ag/sbk/sportsbook4/nba-betting/getevents/200.sbk?&_='+now
}

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

  // axios.get('https://dev.to/aurelkurtula')
  //   .then(res => {
  //     if (res.status === 200) {
  //       const html = res.data;
  //       const $ = cheerio.load(html);
  //       $('.single-article').each((i, elem) => {
  //         console.log($(this));
  //       })
  //     } else {
  //       console.log('fail no 200');
  //     }
  //
  //   })
  //   .catch(err => {
  //     console.log(err);
  //   });

  axios.get(sportsbook.full)
    .then((response) => {
        if(response.status === 200) {
            const html = response.data;
            const $ = cheerio.load(html);
            let line = [];
            $('.eventbox').each(function(i, elem) {
                line[i] = {
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
            console.log(line);
            // const devtoListTrimmed = devtoList.filter(n => n != undefined )
            // fs.writeFile('devtoList.json',
            //               JSON.stringify(devtoListTrimmed, null, 4),
            //               (err)=> console.log('File successfully written!'))
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
