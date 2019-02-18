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

const startPeriodSec = require('../modules/startPeriodSec');
const getGameSecs = require('../modules/getGameSecs');
const emptyTotalsObj = require('../modules/boxScoreHelpers/emptyTotalsObj');

// remove this after more testing
const buildGameStints = require("../modules/buildGameStints");

let now = moment().format('YYYY-MM-DD');

// setInterval(()=>{
//   oddsLoaders.sportsbookFull();
//   oddsLoaders.sportsbookFirstH();
//   oddsLoaders.sportsbookFirstQ();
// }, 200000);
// setInterval(()=>{oddsLoaders.sportsbookThirdQ()}, 30000);
// setInterval(()=>{oddsLoaders.sportsbookSecondH()}, 30000);

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
  const { gid, date } = req.params;
  const url = `https://data.nba.net/prod/v1/${date}/00${gid}_boxscore.json`;
  const boxScore = await axios.get(url);
  // let gid = 21800862;
  // let boxScore = {
  //   data: sampleBoxScoreQ1active
  // };

  let { period, clock } = boxScore.data.basicGameData;
  let hTid = boxScore.data.basicGameData.hTeam.teamId;
  let vTid = boxScore.data.basicGameData.vTeam.teamId;

  let gameSecs = getGameSecs(period-1, clock);

  const calcPoss = (fga, to, fta, oreb) => {
    return (0.96*((fga+to+(0.44*fta)-oreb)));
  };

  const calcGamePace = (poss, per, gameSecs) => {
    if (per < 5) {
      return (((2880/gameSecs)*poss)/2)
    } else {
      return (((2880 + (300*(per-4)))*poss)/2)
    }
  }

  const calcFgPct = (fgm, fga) => {
    return (((fgm/fga)*100).toFixed(1));
  }

  console.log('period is ', period);
  // period.isEndOfPeriod = true;

  // if (period.current === 0) {
  //   console.log(gid, ' has not started');
  // } else {
    let { hTeam, vTeam, activePlayers } = boxScore.data.stats;

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
      fgm: hTeam.totals.fgm,
      fga: hTeam.totals.fga,
      fgPct: hFgPct,
      points: hTeam.totals.points,
      fouls: hTeam.totals.pFouls,
      activePlayers: hPlayers,
    };

    let vStats = {
      fgm: vTeam.totals.fgm,
      fga: vTeam.totals.fga,
      fgPct: vFgPct,
      points: vTeam.totals.points,
      fouls: vTeam.totals.pFouls,
      activePlayers: vPlayers
    };

    let totalsObj = {
      h: {
        pts: hTeam.totals.points,
        fgm: hTeam.totals.fgm,
        fga: hTeam.totals.fga,
        fgPct: calcFgPct(hTeam.totals.fgm, hTeam.totals.fga),
        fta: hTeam.totals.fta,
        to: hTeam.totals.turnovers,
        offReb: hTeam.totals.offReb,
        fouls: hTeam.totals.pFouls
      },
      v: {
        pts: vTeam.totals.points,
        fgm: vTeam.totals.fgm,
        fga: vTeam.totals.fga,
        fgPct: calcFgPct(vTeam.totals.fgm, vTeam.totals.fga),
        fta: vTeam.totals.fta,
        to: vTeam.totals.turnovers,
        offReb: vTeam.totals.offReb,
        fouls: vTeam.totals.pFouls
      },
      t: {
        pts: hTeam.totals.points + vTeam.totals.points,
        fgm: hTeam.totals.fgm + vTeam.totals.fgm,
        fga: hTeam.totals.fga + vTeam.totals.fga,
        fgPct: calcFgPct((hTeam.totals.fgm + vTeam.totals.fgm), (hTeam.totals.fga + vTeam.totals.fga)),
        fta: hTeam.totals.fta + vTeam.totals.fta,
        to: hTeam.totals.turnovers + vTeam.totals.turnovers,
        offReb: hTeam.totals.offReb + vTeam.totals.offReb,
        fouls: hTeam.totals.pFouls + vTeam.totals.pFouls,
        poss: poss,
        pace: ((poss*4)/2)
      }
    };

    let quarterObj = async () => {
      prevTotals = await knex("box_scores_v2").where({gid: gid}).select('totals');

      return {
        h: {
          pts: parseInt(hTeam.totals.points) - prevTotals[0].h.pts,
          fgm: parseInt(hTeam.totals.fgm) - prevTotals[0].h.fgm,
          fga: parseInt(hTeam.totals.fga) - prevTotals[0].h.fga,
          fgPct: calcFgPct((parseInt(hTeam.totals.fgm)-prevTotals[0].h.fgm), (parseInt(hTeam.totals.fga) - prevTotals[0].h.fga)),
          fta: parseInt(hTeam.totals.fta) - prevTotals[0].h.fta,
          to: parseInt(hTeam.totals.turnovers) - prevTotals[0].h.to,
          offReb: parseInt(hTeam.totals.offReb) - prevTotals[0].h.offReb,
          fouls: parseInt(hTeam.totals.pFouls) - prevTotals[0].h.fouls
        },
        v: {
          pts: parseInt(vTeam.totals.points) - prevTotals[0].v.pts,
          fgm: parseInt(vTeam.totals.fgm) - prevTotals[0].v.fgm,
          fga: parseInt(vTeam.totals.fga) - prevTotals[0].v.fga,
          fgPct: calcFgPct((parseInt(vTeam.totals.fgm)-prevTotals[0].v.fgm), (parseInt(vTeam.totals.fga) - prevTotals[0].v.fga)),
          fta: parseInt(vTeam.totals.fta) - prevTotals[0].v.fta,
          to: parseInt(vTeam.totals.turnovers) - prevTotals[0].v.to,
          offReb: parseInt(vTeam.totals.offReb) - prevTotals[0].v.offReb,
          fouls: parseInt(vTeam.totals.pFouls) - prevTotals[0].v.fouls
        },
        t: {
          pts: (hTeam.totals.points + vTeam.totals.points) - prevTotals[0].t.pts,
          fgm: (hTeam.totals.fgm + vTeam.totals.fgm) - prevTotals[0].t.fgm,
          fga: (hTeam.totals.fga + vTeam.totals.fga) - prevTotals[0].t.fga,
          fgPct: calcFgPct(
            ((hTeam.totals.fgm + vTeam.totals.fgm) - prevTotals[0].t.fgm),
            ((hTeam.totals.fga + vTeam.totals.fga) - prevTotals[0].t.fga)
          ),
          fta: (hTeam.totals.fta + vTeam.totals.fta) - prevTotals[0].t.fta,
          to: (hTeam.totals.turnovers + vTeam.totals.turnovers) - prevTotals[0].t.to,
          offReb: (hTeam.totals.offReb + vTeam.totals.offReb) - prevTotals[0].t.offReb,
          fouls: (hTeam.totals.pFouls + vTeam.totals.pFouls) - prevTotals[0].t.fouls,
          poss: poss - prevTotals[0].poss,
          pace: ( ( (poss - prevTotals[0].poss) * 4) / 2)
        }
      }
    }

    if (period.isEndOfPeriod) {
      console.log('end of period, current period is ', period.current);
      if (period.current === 1) {
        let q1 = totalsObj();
        gameSecs = getGameSecs(period-1, clock);
        knex("box_scores_v2").where({gid: gid}).then(entry => {
          if (!entry[0]) {
            knex("box_scores_v2").insert({
              gid: gid,
              h_tid: hTid,
              v_tid: vTid,
              period_updated: 1,
              clock_last_updated: gameSecs,
              totals: [q1],
              q1: [q1],
              updated_at: new Date()
            }).then(inserted => {
              res.send({
                msg: `Q1 end`,
                clock: clock,
                period: period,
                thru_period: 1,
                poss: poss,
                hStats: hStats,
                vStats: vStats,
                insertedStats: inserted
              })
            })
          } else {
            console.log('first period already entered in gid ', gid);
          }
        })
      } else if (period.current === 2) {
        // let q1Stats = await knex("box_scores").where({gid: gid});
        let q2 = quarterObj();
        gameSecs = getGameSecs(period-1, clock);
        knex("box_scores").where({gid: gid}).update({
          period_updated: 2,
          clock_last_updated: gameSecs,
          totals: [totalsObj],
          q2: [q2],
          updated_at: new Date()
        }, '*').then(inserted => {
          console.log('inserted is ', inserted);
          res.send({
            msg: `Q2 end`,
            clock: clock,
            period: period,
            thru_period: 2,
            poss: poss,
            hStats: hStats,
            vStats: vStats,
            insertedStats: inserted
          })
        })
      } else if (period.current === 3) {
        let q3 = quarterObj();
        gameSecs = getGameSecs(period-1, clock);
        knex("box_scores").where({gid: gid}).update({
          period_updated: 3,
          clock_last_updated: gameSecs,
          totals: [totalsObj],
          q3: [q3],
          updated_at: new Date()
        }, '*').then(inserted => {
          console.log('inserted is ', inserted);
          res.send({
            msg: `Q3 end`,
            clock: clock,
            period: period,
            thru_period: 3,
            poss: poss,
            hStats: hStats,
            vStats: vStats,
            insertedStats: inserted,
            prevStats: thruQ2[0]
          })
        })
      } else if (period.current === 4 ) {
        let q4 = quarterObj();
        gameSecs = getGameSecs(period-1, clock);
        knex("box_scores").where({gid: gid}).update({
          period_updated: 4,
          clock_last_updated: gameSecs,
          totals: [totalsObj],
          q3: [q4],
          updated_at: new Date()
        }, '*').then(inserted => {
          console.log('inserted is ', inserted);
          res.send({
            msg: `Q4 end`,
            clock: clock,
            period: period,
            thru_period: 4,
            poss: poss,
            hStats: hStats,
            vStats: vStats,
            insertedStats: inserted,
            prevStats: thruQ3[0]
          })
        })
      }
    } else {

      let totals = await knex("box_scores").where({gid: gid});

      res.send({
        msg: `Q${period.current} ongoing`,
        clock: clock,
        period: period,
        thru_period: 0,
        poss: poss,
        pace: calcGamePace(poss, period.current, gameSecs),
        hStats: hStats,
        vStats: vStats,
        totals: totals[0]
      })
    }

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
