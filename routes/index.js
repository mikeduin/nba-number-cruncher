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

const advancedTeamStats = "https://stats.nba.com/stats/leaguedashteamstats";

let now = Date.now();

const sportsbook = {
  full: 'https://www.sportsbook.ag/sbk/sportsbook4/nba-betting/getevents/200.sbk?&_='+now,
  firstH: 'https://www.sportsbook.ag/sbk/sportsbook4/nba-betting/getevents/3003.sbk?&_='+now,
  secondH: 'https://www.sportsbook.ag/sbk/sportsbook4/nba-betting/nba-game-lines-2nd-half-lines.sbk?fromMenu=true&_='+now,
  firstQ: 'https://www.sportsbook.ag/sbk/sportsbook4/nba-betting/getevents/3005.sbk?&_='+now,
  thirdQ: 'https://www.sportsbook.ag/sbk/sportsbook4/nba-betting/nba-game-lines-3rd-quarter-lines.sbk?fromMenu=true&_='+now,
  live: 'https://www.sportsbook.ag/sbk/sportsbook4/live-betting-betting/nba-live-betting-all-nba-live.sbk?fromMenu=true&_='+now
}

// more bets: 'https://www.sportsbook.ag/sbk/sportsbook4/live-betting-betting/home.sbk#moreBetsX2200-1300-Laker-Pacer-020519'

const bol = {
  full: 'https://mobile.betonline.ag/sports/offerings?s=Basketball&l=NBA&p=0&wt=&tsr=',
  firstH: 'https://mobile.betonline.ag/sports/offerings?s=Basketball&l=NBA&p=1&wt=&tsr=',
  secondH: 'https://mobile.betonline.ag/sports/offerings?s=Basketball&l=NBA&p=2&wt=s&tsr=',
  firstQ: 'https://mobile.betonline.ag/sports/offerings?s=Basketball&l=NBA&p=3&wt=s&tsr=',
  secondQ: 'https://mobile.betonline.ag/sports/offerings?s=Basketball&l=NBA&p=4&wt=&tsr=',
  thirdQ: 'https://mobile.betonline.ag/sports/offerings?s=Basketball&l=NBA&p=5&wt=s&tsr=',
  fourthQ: 'https://mobile.betonline.ag/sports/offerings?s=Basketball&l=NBA&p=6&wt=&tsr='
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

  axios.get(sportsbook.full)
    .then((response) => {
        if(response.status === 200) {
            const html = response.data;
            const $ = cheerio.load(html);
            let lines = [];
            // must leave cheerio fn in old ES syntax
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
              };
            });

            // console.log(lines);
            lines.forEach(line => {
              let year = line.id.slice(-2);
              let date = line.id.slice(-6, -2);
              let hSplit = line.homeTeam.split(' ');
              let hAbb = teamLookup.findTeam(hSplit[hSplit.length-1]).a;
              let aSplit = line.awayTeam.split(' ');
              let aAbb = teamLookup.findTeam(aSplit[aSplit.length-1]).a;

              let gcode = `20${year}${date}/${aAbb}${hAbb}`;
              console.log(gcode);

              knex('odds_sportsbook').where({sb_id: line.id}).then(res => {
                if (!res[0]) {
                  knex('odds_sportsbook').insert({
                    sb_id: line.id,
                    
                  })
                } else {
                  console.log('found');
                }
              })
            })


            // const devtoListTrimmed = devtoList.filter(n => n != undefined )
            // fs.writeFile('devtoList.json',
            //               JSON.stringify(devtoListTrimmed, null, 4),
            //               (err)=> console.log('File successfully written!'))
        }
    }, (error) => console.log(err) );

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
              // console.log(lines);
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
