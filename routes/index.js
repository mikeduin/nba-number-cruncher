const express = require("express");
const router = express.Router();
const axios = require("axios");
const knex = require("../db/knex");
const schedule = require("node-schedule");
const moment = require("moment");
const cheerio = require('cheerio');
const _ = require('lodash');

const updateTeamStats = require("../modules/updateTeamStats");
const updatePlayerStats = require("../modules/updatePlayerStats");
const dbBuilders = require("../modules/dbBuilders");
const dbMappers = require("../modules/dbMappers");
const dateFilters = require("../modules/dateFilters");
const teamLookup = require("../modules/teamLookup");
const oddsLoaders = require("../modules/oddsLoaders");

const sampleBoxScoreQ1active = require('../modules/boxScoreResponse_q1_active.json');

// remove this after more testing
const buildGameStints = require("../modules/buildGameStints");

let now = moment().format('YYYY-MM-DD');

setInterval(()=>{
  oddsLoaders.sportsbookFull();
  oddsLoaders.sportsbookFirstH();
  oddsLoaders.sportsbookFirstQ();
}, 200000);
setInterval(()=>{oddsLoaders.sportsbookThirdQ()}, 30000);
setInterval(()=>{oddsLoaders.sportsbookSecondH()}, 30000);

// setTimeout(()=>{
//   dbBuilders.buildGameStintsDb();
// }, 3000)

// setTimeout(()=>{
//   buildGameStints.buildSubData(21800048);
// }, 1000)


// more bets: 'https://www.sportsbook.ag/sbk/sportsbook4/live-betting-betting/home.sbk#moreBetsX2200-1300-Laker-Pacer-020519'

/* GET home page. */
router.get("/", (req, res, next) => {
  console.log('hello');


  res.send({ Hi: "there" });
});

router.get("/gameWatcher", (req, res, next) => {
  knex("schedule").where({gdte: now}).then(todayGames => {
    // are these box scores active in-game? otherwise how can I get this data?
    // https://data.nba.net/prod/v1/20190212/0021800848_boxscore.json
    console.log('watching game');
  })
})

router.get("/fetchBoxScore/:date/:gid", async (req, res, next) => {
  // const { gid, date } = req.params;
  // const url = `https://data.nba.net/prod/v1/${date}/00${gid}_boxscore.json`;
  // const boxScore = await axios.get(url);
  let gid = 21800862;
  let boxScore = {
    data: sampleBoxScoreQ1active
  };

  let { period, clock } = boxScore.data.basicGameData;
  let hTid = boxScore.data.basicGameData.hTeam.teamId;
  let vTid = boxScore.data.basicGameData.vTeam.teamId;

  const calcPoss = (fga, to, fta, oreb) => {
    console.log('fga is ', fga, ' to is ', to, ' fta is ', fta, ' oreb is ', oreb);
    return (0.96*((fga+to+(0.44*fta)-oreb)));
  };

  const calcFgPct = (fgm, fga) => {
    return (((fgm/fga)*100).toFixed(1));
  }

  if (period.current === 0) {
    console.log(gid, ' has not started');
  } else {
    let { hTeam, vTeam, activePlayers } = boxScore.data.stats;

    // let hStats = { {fga, fgm, fta, offReb, pFouls, points, turnovers} = hTeam.totals }
    //
    // console.log(
    //   'hTeam.totals.fga are ', hTeam.totals.fga, ' and hTeam.totals.fta are ', hTeam.totals.fta, ' and hTeam.totals.turnovers are ', hTeam.totals.turnovers, ' and hTeam.totals.offReb are ', hTeam.totals.offReb
    // );

    let poss = calcPoss(
      (parseInt(hTeam.totals.fga) + parseInt(vTeam.totals.fga)),
      (parseInt(hTeam.totals.turnovers) + parseInt(vTeam.totals.turnovers)),
      (parseInt(hTeam.totals.fta) + parseInt(vTeam.totals.fta)),
      (parseInt(hTeam.totals.offReb) + parseInt(vTeam.totals.offReb)));
    let hFgPct = calcFgPct(hTeam.totals.fgm, hTeam.totals.fga);
    let vFgPct = calcFgPct(vTeam.totals.fgm, vTeam.totals.fga);

    let hPlayers = activePlayers.filter(player => {
      return (player.teamId === hTid && player.isOnCourt)
    }).map(active => active.personId);

    let vPlayers = activePlayers.filter(player => {
      return (player.teamId === hTid && player.isOnCourt)
    }).map(active => active.personId);

    let hStats = {
      fgPct: hFgPct,
      points: hTeam.totals.points,
      fouls: hTeam.totals.pFouls,
      activePlayers: hPlayers,
    };

    let vStats = {
      fgPct: vFgPct,
      points: vTeam.totals.points,
      fouls: vTeam.totals.pFouls,
      stats: vPlayers
    };

    if (period.current === 1) {
      if (!period.isEndOfPeriod) {
        res.send({
          info: 'Q1 ongoing',
          clock: clock,
          period: period,
          thru_period: 0,
          poss: poss,
          hStats: hStats,
          vStats: vStats
        })
      } else {
        knex("box_scores").where({gid: gid}).then(entry => {
          if (!entry[0]) {
            knex("box_scores").insert({
              gid: gid,
              h_pts_1q: hTeam.totals.points,
              h_fga_1q: hTeam.totals.fga,
              h_fgm_1q: hTeam.totals.fgm,
              h_fg_pct_1q: hFgPct,
              h_fta_1q: hTeam.totals.fta,
              h_to_1q: hTeam.totals.turnovers,
              h_off_reb_1q: hTeam.totals.offReb,
              h_fouls_1q: hTeam.totals.pFouls,
              v_pts_1q: vTeam.totals.points,
              v_fga_1q: vTeam.totals.fga,
              v_fgm_1q: vTeam.totals.fgm,
              v_fg_pct_1q: vFgPct,
              v_fta_1q: vTeam.totals.fta,
              v_to_1q: vTeam.totals.turnovers,
              v_off_reb_1q: vTeam.totals.offReb,
              v_fouls_1q: vTeam.totals.pFouls,
              period_updated: 1,
              updated_at: new Date()
            }, '*').then(inserted => {
              res.send({
                info: 'Q1 ongoing',
                clock: clock,
                period: period,
                poss: poss,
                stats: inserted
              })
            })
          } else {
            console.log('1Q period has already been entered');
            return;
          }
        })
      }
    }

    // let info = { clock, period, poss, hStats, vStats };

    // res.send({stats: info});
    // res.send(boxScore.data);
  };
})



router.get("/fetchStarters", (req, res, next) => {
  axios.get('https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2018/scores/gamedetail/0021800848_gamedetail.json').then(game => {
    let h = game.data.g.hls;
    let v = game.data.g.vls;
    let home = {
      tid: h.tid,
      starters: h.pstsg.slice(0,5).map(player => player.pid),
      bench: h.pstsg.slice(5, h.pstsg.length).map(player => player.pid)
    };

    let vis = {
      tid: v.tid,
      starters: v.pstsg.slice(0,5).map(player => player.pid),
      bench: v.pstsg.slice(5, v.pstsg.length).map(player => player.pid)
    };

    let rosters = {
      h: home,
      v: vis
    };

    console.log(rosters)
  })
})



router.get("/api/getNetRatings", (req, res, next) => {
  knex("team_net_ratings").then(netRatings => {
    res.send(netRatings);
  });
});

router.get("/api/fetchWeek/:date", (req, res, next) => {
  let week = dateFilters.fetchGmWk(req.params.date);
  let weekArray = dateFilters.fetchGmWkArrays(week);
  knex("schedule as s").innerJoin("odds_sportsbook as odds", "s.gcode", '=', "odds.gcode")
    .where('s.gweek', week)
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

      let nineAgo = moment().subtract(8, 'days').format('YYYY-MM-DD');
      let oneAhead = moment().add(1, 'days').format('YYYY-MM-DD');

      knex("schedule")
      .where('gcode', 'like', `%${hAbb}%`)
      .whereBetween('gdte', [nineAgo, oneAhead])
      .orderBy('gdte')
      .then(hSched => {
        knex("schedule")
        .where('gcode', 'like', `%${vAbb}%`)
        .whereBetween('gdte', [nineAgo, oneAhead])
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



const updateFullTeamBuilds = schedule.scheduleJob("16 14 * * *", () => {
  updateTeamStats.updateFullTeamBuilds();
})

const updateStarterBuilds = schedule.scheduleJob("17 14 * * *", () => {
  updateTeamStats.updateStarterBuilds();
})

const updateBenchBuilds = schedule.scheduleJob("18 14 * * *", () => {
  updateTeamStats.updateBenchBuilds();
})

const updateQ1Builds = schedule.scheduleJob("19 14 * * *", () => {
  updateTeamStats.updateQ1Builds();
})

const updateQ2Builds = schedule.scheduleJob("20 14 * * *", () => {
  updateTeamStats.updateQ2Builds();
})

const updateQ3Builds = schedule.scheduleJob("21 14 * * *", () => {
  updateTeamStats.updateQ3Builds();
})

const updateQ4Builds = schedule.scheduleJob("22 14 * * *", () => {
  updateTeamStats.updateQ4Builds();
})

const updateFullPlayersBuild = schedule.scheduleJob("23 14 * * *", () => {
  updatePlayerStats.updatePlayerStatBuilds();
})

const updateSchedule = schedule.scheduleJob("24 14 * * *", () => {
  dbBuilders.updateSchedule();
})

const mapTeamNetRatings = schedule.scheduleJob("25 4 * * *", () => {
  dbMappers.mapTeamNetRatings();
})

const mapTeamPace = schedule.scheduleJob("26 14 * * *", () => {
  dbMappers.mapTeamPace();
})

const mapFullPlayerData = schedule.scheduleJob("27 14 * * *", () => {
  dbMappers.mapFullPlayerData();
})

const mapSegmentedPlayerData = schedule.scheduleJob("28 14 * * *", () => {
  dbMappers.mapSegmentedPlayerData();
})

module.exports = router;
