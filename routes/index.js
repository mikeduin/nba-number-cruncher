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

// remove these after more testing
const buildGameStints = require("../modules/buildGameStints");
const webScrapeHelpers = require("../modules/webScrapeHelpers");

const gameSecsToGameTime = require("../modules/gameTimeFuncs").gameSecsToClockAndQuarter;

let now = moment().format('YYYY-MM-DD');

// setInterval(() => {
//   // dbBuilders.buildGameStintsDb()
// }, 10000)

setInterval(()=>{
  oddsLoaders.sportsbookFull();
  oddsLoaders.sportsbookFirstH();
  oddsLoaders.sportsbookFirstQ();
}, 200000);

setInterval(()=>{
  const hour = new Date().getHours();
  if (hour >= 9 && hour <= 24) {
    oddsLoaders.sportsbookSecondH();
    oddsLoaders.sportsbookThirdQ();
  }
}, 60000);


// setTimeout(async ()=>{
//   const gameStintsA = await knex("player_game_stints")
//     .where("gdte", ">", "2019-01-15")
//     .andWhere((builder)=> {
//       builder.whereIn('team_id', [1610612740, 1610612754]).whereIn('player_id', impPlayerIds)
//     });
//
//   console.log(gameStintsA);
// }, 2000)

/* GET home page. */
router.get("/", (req, res, next) => {
  console.log('hello');

  res.send({ Hi: "there" });
});

router.get("/api/fetchPlayerData/:pid", async (req, res, next) => {
  const pid = req.params.pid;

  const mappedData = await knex("player_data as pd")
    .innerJoin("teams as t", "pd.team_id", "=", "t.tid")
    .where({player_id: pid})
    .select("t.color", "t.color_2", "pd.*");

  const gameStints = await knex("player_game_stints as pgs")
    .innerJoin("schedule as s", "pgs.gid", "=", "s.gid")
    .where('pgs.player_id', pid)
    .orderBy('s.gid', 'desc')
    .select('s.*', "pgs.game_stints");

  res.send({
    gameStints: gameStints,
    mappedData: mappedData[0]
  });
})

// What if you first check game status on load ...
// Then if it's final, you don't go to check box score route ... you just load stats, set to completed game, and you're done ...
// If it's not final, then you move on to fetch current box score

// router.get("/initDataLoad/:date/:gid", async (req, res, next) => {
//   const { gid, date } = req.params;
//   const url = `https://data.nba.net/prod/v1/${date}/00${gid}_boxscore.json`;
//   const boxScore = await axios.get(url);
//   const { startTimeUTC } = boxScore.data.basicGameData;
//   const nowUTC = moment().utc();
//
//   if (moment(startTimeUTC).isBefore(nowUTC)) {
//     const inDb = await knex("box_scores_v2").where({gid: gid});
//     if (inDb.length > 0) {
//         // send response back that clarifies game is final, includes stats to complete box score
//         res.send({
//           gid: gid,
//           // don't think I need this setToFinal? keep in case
//           // setToFinal: true,
//           final: inDb[0].final,
//           prevTotals: inDb[0].totals,
//           // currTotals:
//           q1: inDb[0].q1,
//           q2: inDb[0].q2,
//           q3: inDb[0].q3,
//           q4: inDb[0].q4,
//           ot: inDb[0].ot
//         })
//     } else {
//       console.log('game ', gid, ' has nothing in DB')
//     }
//   }
//
// })

router.get("/fetchBoxScore/:date/:gid", async (req, res, next) => {
  const { gid, date } = req.params;

  const url = `https://data.nba.net/prod/v1/${date}/00${gid}_boxscore.json`;
  const boxScore = await axios.get(url);

  let { period, clock, isGameActivated, startTimeUTC } = boxScore.data.basicGameData;
  const hTid = boxScore.data.basicGameData.hTeam.teamId;
  const vTid = boxScore.data.basicGameData.vTeam.teamId;

  // If game has not started -- this is as far as the function should get
  if (!boxScore.data.stats) {
    console.log(gid, ' has not started, sending back gid ref and active: false');
    res.send ({
      gid: gid,
      active: false
    })
    return;
  }

  console.log('response gets past stats conditional');

  // if game is over and last period state have been updated, kill function and add to finished games in state

  let dbCheck = await knex("box_scores_v2").where({gid: gid}).pluck('final');
  if (dbCheck[0]) {
    res.send({final: true});
    return;
  }

  if (clock.length < 1) {
    if (period.current > 1) {
      clock = '0:00';
    } else {
      clock = '12:00';
    }
  };

  let gameSecs = getGameSecs((parseInt(period.current)-1), clock);

  const calcPoss = (fga, to, fta, oreb) => {
    return (0.96*((fga+to+(0.44*fta)-oreb)));
  };

  const calcGamePace = (poss, per, gameSecs) => {
    let pace = 0;
    if (per < 5) {
      pace = (((2880/gameSecs)*poss)/2)
    } else {
      pace = (((2880 + (300*(per-4)))*poss)/2)
    };
    if (pace == null) {
      return 0
    } else {
      return pace
    };
  }

  const calcEndOfQuarterPace = (quarterPoss, per, gameSecs) => {
    let pace = 0;
    if (per < 5) {
      pace = ((quarterPoss*4)/2)
    } else {
      pace = (((quarterPoss*(720/300))*4)/2)
    };
    if (pace == null) {
      return 0
    } else {
      return pace
    };
  }

  const calcFgPct = (fgm, fga) => {
    return (((fgm/fga)*100).toFixed(1));
  }

  const { hTeam, vTeam, activePlayers } = boxScore.data.stats;

  let poss = calcPoss(
    (parseInt(hTeam.totals.fga) + parseInt(vTeam.totals.fga)),
    (parseInt(hTeam.totals.turnovers) + parseInt(vTeam.totals.turnovers)),
    (parseInt(hTeam.totals.fta) + parseInt(vTeam.totals.fta)),
    (parseInt(hTeam.totals.offReb) + parseInt(vTeam.totals.offReb)));
  let hFgPct = calcFgPct(parseInt(hTeam.totals.fgm), parseInt(hTeam.totals.fga));
  let vFgPct = calcFgPct(parseInt(vTeam.totals.fgm), parseInt(vTeam.totals.fga));

  const hPlayers = activePlayers.filter(player => {
    return (player.teamId === hTid && player.isOnCourt)
  }).map(active => active.personId);

  const vPlayers = activePlayers.filter(player => {
    return (player.teamId === hTid && player.isOnCourt)
  }).map(active => active.personId);

  // this is the obj that sends back the current totals every 5 seconds when the req is sent
  let totalsObj = {
    h: {
      pts: parseInt(hTeam.totals.points),
      fgm: parseInt(hTeam.totals.fgm),
      fga: parseInt(hTeam.totals.fga),
      fgPct: calcFgPct(parseInt(hTeam.totals.fgm), parseInt(hTeam.totals.fga)),
      fta: parseInt(hTeam.totals.fta),
      to: parseInt(hTeam.totals.turnovers),
      offReb: parseInt(hTeam.totals.offReb),
      fouls: parseInt(hTeam.totals.pFouls)
    },
    v: {
      pts: parseInt(vTeam.totals.points),
      fgm: parseInt(vTeam.totals.fgm),
      fga: parseInt(vTeam.totals.fga),
      fgPct: calcFgPct(parseInt(vTeam.totals.fgm), parseInt(vTeam.totals.fga)),
      fta: parseInt(vTeam.totals.fta),
      to: parseInt(vTeam.totals.turnovers),
      offReb: parseInt(vTeam.totals.offReb),
      fouls: parseInt(vTeam.totals.pFouls)
    },
    t: {
      pts: parseInt(hTeam.totals.points) + parseInt(vTeam.totals.points),
      fgm: parseInt(hTeam.totals.fgm) + parseInt(vTeam.totals.fgm),
      fga: parseInt(hTeam.totals.fga) + parseInt(vTeam.totals.fga),
      fgPct: calcFgPct((parseInt(hTeam.totals.fgm) + parseInt(vTeam.totals.fgm)), (parseInt(hTeam.totals.fga) + parseInt(vTeam.totals.fga))),
      fta: parseInt(hTeam.totals.fta) + parseInt(vTeam.totals.fta),
      to: parseInt(hTeam.totals.turnovers) + parseInt(vTeam.totals.turnovers),
      offReb: parseInt(hTeam.totals.offReb) + parseInt(vTeam.totals.offReb),
      fouls: parseInt(hTeam.totals.pFouls) + parseInt(vTeam.totals.pFouls),
      poss: poss,
      pace: calcGamePace(poss, parseInt(period.current), gameSecs)
    }
  };

  // this object calculates the stats for each quarter, using the previous totals from earlier Qs
  const quarterObj = async (prevTotals) => {
    const quarterPoss = calcPoss(
      ( (parseInt(hTeam.totals.fga) + parseInt(vTeam.totals.fga))
          - prevTotals[0].t.fga),
      ( (parseInt(hTeam.totals.turnovers) + parseInt(vTeam.totals.turnovers))
          - prevTotals[0].t.to),
      ( (parseInt(hTeam.totals.fta) + parseInt(vTeam.totals.fta))
          - prevTotals[0].t.fta),
      ( (parseInt(hTeam.totals.offReb) + parseInt(vTeam.totals.offReb))
          - prevTotals[0].t.offReb)
        );

    // NOTE: ONCE YOU HAVE CONFIRMED PREVTOTALS ARE NOT GOING IN AS INTEGERS, YOU CAN REMOVE PARSEINTS
    return {
      h: {
        pts: parseInt(hTeam.totals.points) - parseInt(prevTotals[0].h.pts),
        fgm: parseInt(hTeam.totals.fgm) - parseInt(prevTotals[0].h.fgm),
        fga: parseInt(hTeam.totals.fga) - parseInt(prevTotals[0].h.fga),
        fgPct: calcFgPct((parseInt(hTeam.totals.fgm)-prevTotals[0].h.fgm), (parseInt(hTeam.totals.fga) - prevTotals[0].h.fga)),
        fta: parseInt(hTeam.totals.fta) - parseInt(prevTotals[0].h.fta),
        to: parseInt(hTeam.totals.turnovers) - parseInt(prevTotals[0].h.to),
        offReb: parseInt(hTeam.totals.offReb) - parseInt(prevTotals[0].h.offReb),
        fouls: parseInt(hTeam.totals.pFouls) - parseInt(prevTotals[0].h.fouls)
      },
      v: {
        pts: parseInt(vTeam.totals.points) - parseInt(prevTotals[0].v.pts),
        fgm: parseInt(vTeam.totals.fgm) - parseInt(prevTotals[0].v.fgm),
        fga: parseInt(vTeam.totals.fga) - parseInt(prevTotals[0].v.fga),
        fgPct: calcFgPct((parseInt(vTeam.totals.fgm)-prevTotals[0].v.fgm), (parseInt(vTeam.totals.fga) - prevTotals[0].v.fga)),
        fta: parseInt(vTeam.totals.fta) - parseInt(prevTotals[0].v.fta),
        to: parseInt(vTeam.totals.turnovers) - parseInt(prevTotals[0].v.to),
        offReb: parseInt(vTeam.totals.offReb) - parseInt(prevTotals[0].v.offReb),
        fouls: parseInt(vTeam.totals.pFouls) - parseInt(prevTotals[0].v.fouls)
      },
      t: {
        pts: (parseInt(hTeam.totals.points) + parseInt(vTeam.totals.points)) - parseInt(prevTotals[0].t.pts),
        fgm: (parseInt(hTeam.totals.fgm) + parseInt(vTeam.totals.fgm)) - parseInt(prevTotals[0].t.fgm),
        fga: (parseInt(hTeam.totals.fga) + parseInt(vTeam.totals.fga)) - parseInt(prevTotals[0].t.fga),
        fgPct: calcFgPct(
          ((parseInt(hTeam.totals.fgm) + parseInt(vTeam.totals.fgm)) - parseInt(prevTotals[0].t.fgm)),
          ((parseInt(hTeam.totals.fga) + parseInt(vTeam.totals.fga)) - parseInt(prevTotals[0].t.fga))
        ),
        fta: (parseInt(hTeam.totals.fta) + parseInt(vTeam.totals.fta)) - parseInt(prevTotals[0].t.fta),
        to: (parseInt(hTeam.totals.turnovers) + parseInt(vTeam.totals.turnovers)) - parseInt(prevTotals[0].t.to),
        offReb: (parseInt(hTeam.totals.offReb) + parseInt(vTeam.totals.offReb)) - parseInt(prevTotals[0].t.offReb),
        fouls: (parseInt(hTeam.totals.pFouls) + parseInt(vTeam.totals.pFouls)) - parseInt(prevTotals[0].t.fouls),
        poss: quarterPoss,
        pace: calcEndOfQuarterPace(quarterPoss, period.current, gameSecs)
      }
    }
  }

  // this is the function that combines the two above
  const quarterUpdFn = async () => {
    try {
      let prevTotalsPull = await knex("box_scores_v2").where({gid: gid}).select('totals');
      let quarterTotals = await quarterObj(prevTotalsPull[0].totals);
      return {
        currentQuarter: quarterTotals,
        prevQuarters: prevTotalsPull[0].totals[0]
      }
    } catch (e) {
      console.log('error spit out in quarterUpd for ', gid)
    }
  }

  // gameOver fn returns true if game has started but no longer activated
  const gameOver = () => {
    return (moment().utc().isAfter(startTimeUTC) && period.current >= 4 && !isGameActivated)
  };

    // if End of Period is true or Game is over
    if (period.isEndOfPeriod || gameOver()) {
      if (period.current === 1) {
        let q1 = totalsObj;
        gameSecs = getGameSecs((period.current-1), clock);
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
                quarterEnd: true,
                live: true,
                clock: clock,
                gameSecs: gameSecs,
                period: period,
                thru_period: 1,
                poss: poss,
                pace: calcGamePace(poss, period.current, gameSecs),
                totals: totalsObj,
                prevQuarters: totalsObj,
                quarter: q1
              })
            })
          } else {
            console.log('first period already entered in gid ', gid);
          }
        })
      } else if (period.current === 2) {
        knex("box_scores_v2").where({gid: gid}).pluck('q2').then(qTest => {
          if (qTest[0] == null) {
            quarterUpdFn().then(qTotals => {
              console.log('quarterUpdFn for q2 reached, prevQuarters are ', qTotals.prevQuarters);
              gameSecs = getGameSecs(period.current-1, clock);
              knex("box_scores_v2").where({gid: gid}).update({
                period_updated: 2,
                clock_last_updated: gameSecs,
                totals: [totalsObj],
                q2: [qTotals.currentQuarter],
                updated_at: new Date()
              }, '*').then(inserted => {
                console.log('inserted is ', inserted);
                res.send({
                  quarterEnd: true,
                  live: true,
                  clock: clock,
                  gameSecs: gameSecs,
                  period: period,
                  thru_period: 2,
                  poss: poss,
                  pace: calcGamePace(poss, period.current, gameSecs),
                  totals: totalsObj,
                  prevQuarters: qTotals.prevQuarters,
                  quarter: qTotals.currentQuarter
                })
              })
            })
          } else {
            console.log('second period already entered in gid ', gid);
          }
        })
      } else if (period.current === 3) {
        knex("box_scores_v2").where({gid: gid}).pluck('q3').then(qTest => {
          if (qTest[0] == null) {
            quarterUpdFn().then(qTotals => {
              console.log('quarterUpdFn for q3 reached, prevQuarters are ', qTotals.prevQuarters);
              gameSecs = getGameSecs(period.current-1, clock);
              knex("box_scores_v2").where({gid: gid}).update({
                period_updated: 3,
                clock_last_updated: gameSecs,
                totals: [totalsObj],
                q3: [qTotals.currentQuarter],
                updated_at: new Date()
              }, '*').then(inserted => {
                res.send({
                  quarterEnd: true,
                  live: true,
                  clock: clock,
                  gameSecs: gameSecs,
                  period: period,
                  thru_period: 3,
                  poss: poss,
                  pace: calcGamePace(poss, period.current, gameSecs),
                  totals: totalsObj,
                  prevQuarters: qTotals.prevQuarters,
                  quarter: qTotals.currentQuarter
                })
              })
            })
          } else {
            console.log('third period already entered in gid ', gid);
          }
        })
      } else if (period.current === 4 ) {
        knex("box_scores_v2").where({gid: gid}).pluck('q4').then(qTest => {
          if (qTest[0] == null) {
            quarterUpdFn().then(qTotals => {
              gameSecs = getGameSecs(period.current-1, clock);
              knex("box_scores_v2").where({gid: gid}).update({
                period_updated: 4,
                clock_last_updated: gameSecs,
                totals: [totalsObj],
                q4: [qTotals.currentQuarter],
                updated_at: new Date()
              }, '*').then(inserted => {
                res.send({
                  quarterEnd: true,
                  live: true,
                  clock: clock,
                  gameSecs: gameSecs,
                  period: period,
                  thru_period: 4,
                  poss: poss,
                  pace: calcGamePace(poss, period.current, gameSecs),
                  totals: totalsObj,
                  prevQuarters: qTotals.prevQuarters,
                  quarter: qTotals.currentQuarter
                })
              })
            })
          } else {
            if (!isGameActivated) {
              console.log('4Q data already entered, and game is over');
              knex("box_scores_v2").where({gid: gid}).update({
                final: true
              }).then(() => {
                console.log("game has been set to final in DB")
              })
            } else {
              console.log('4Q data already entered and game is still ongoing!')
            }
          }
        })
      } else {
        knex("box_scores_v2").where({gid: gid}).pluck('ot').then(qTest => {
          // NEED TO FIX THIS IN EVENT OF MULTIPLE OTs!!!
          if (qTest[0] == null) {
            quarterUpdFn().then(qTotals => {
              gameSecs = getGameSecs(period.current-1, clock);
              knex("box_scores_v2").where({gid: gid}).update({
                period_updated: period.current,
                clock_last_updated: gameSecs,
                totals: [totalsObj],
                ot: [qTotals.currentQuarter],
                updated_at: new Date()
              }, '*').then(inserted => {
                res.send({
                  quarterEnd: true,
                  live: true,
                  clock: clock,
                  gameSecs: gameSecs,
                  period: period,
                  thru_period: period.current,
                  poss: poss,
                  pace: calcGamePace(poss, period.current, gameSecs),
                  totals: totalsObj,
                  prevQuarters: qTotals.prevQuarters,
                  quarter: qTotals.currentQuarter
                })
              })
            })
          } else {
            if (!isGameActivated) {
              console.log('OT data already entered, and game is over');
              knex("box_scores_v2").where({gid: gid}).update({
                final: true
              }).then(() => {
                console.log("game has been set to final (in OT) in DB")
              })
            } else {
              console.log('OT data already entered and game is still ongoing!')
            }
          }
        })
      }
    } else {
      // if endOfPeriod is false && game is not activated ... does it get here if game has started?
      // THIS NEEDS WORK, HAVE NOT REFINED
      if (!isGameActivated) {
        // THIS IS BEING REACHED IN FIRST PREGAME CHECK
        console.log('server has reached unrefined game inactive fn');
        res.send({
          quarterEnd: false,
          live: false,
          clock: clock,
          gameSecs: gameSecs,
          period: period,
          thru_period: period.current,
          poss: poss,
          pace: calcGamePace(poss, period.current, gameSecs),
          totals: totalsObj
          // final: true
        })
      } else {
        console.log('this is the live, ongoing, in-quarter game response');
        let prevTotalsPull = await knex("box_scores_v2").where({gid: gid}).select('totals');
        console.log('prevTotals are ', prevTotalsPull);
        // period.current === 1 just for testing prevTotalsPull; remove once corrected
        if (period.current === 1) {
          res.send({
            quarterEnd: false,
            live: true,
            clock: clock,
            gameSecs: gameSecs,
            period: period,
            thru_period: period.current - 1,
            poss: poss,
            pace: calcGamePace(poss, period.current, gameSecs),
            totals: totalsObj
          })
        } else {
          res.send({
            quarterEnd: false,
            live: true,
            clock: clock,
            gameSecs: gameSecs,
            period: period,
            thru_period: period.current - 1,
            poss: poss,
            pace: calcGamePace(poss, period.current, gameSecs),
            totals: totalsObj,
            prevQuarters: prevTotalsPull[0].totals[0]
          })
        }
      }
    }
})

// how best to use this?
// router.get("/fetchStarters", (req, res, next) => {
//   axios.get('https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2018/scores/gamedetail/0021800848_gamedetail.json').then(game => {
//     const h = game.data.g.hls;
//     const v = game.data.g.vls;
//     const home = {
//       tid: h.tid,
//       starters: h.pstsg.slice(0,5).map(player => player.pid),
//       bench: h.pstsg.slice(5, h.pstsg.length).map(player => player.pid)
//     };
//
//     const vis = {
//       tid: v.tid,
//       starters: v.pstsg.slice(0,5).map(player => player.pid),
//       bench: v.pstsg.slice(5, v.pstsg.length).map(player => player.pid)
//     };
//
//     const rosters = {
//       h: home,
//       v: vis
//     };
//
//     console.log(rosters)
//   })
// })

router.get("/api/getPlayerMetadata", async (req, res, next) => {
  let players = await knex("player_data")
    .orderBy('min_full', 'desc')
    .select('player_id', 'player_name', 'team_abbreviation', 'min_full', 'net_rtg_full');

  res.send({players});
})

router.get("/api/getNetRatings", (req, res, next) => {
  knex("team_net_ratings").then(netRatings => {
    res.send(netRatings);
  });
});

router.get("/api/fetchWeek/:date", (req, res, next) => {
  const week = dateFilters.fetchGmWk(req.params.date);
  const weekArray = dateFilters.fetchGmWkArrays(week);
  knex("schedule as s")
    .leftJoin("odds_sportsbook as odds", "s.gcode", '=', "odds.gcode")
    .where('s.gweek', week)
    .select('odds.*', 's.id', 's.gid', 's.gcode', 's.gdte', 's.etm', 's.gweek', 's.h', 's.v', 's.stt')
    .orderBy('s.etm')
    .then(games => {
      res.send({
        week: week,
        weekArray: weekArray,
        weekGames: games
      })
    });
});

router.get("/api/fetchGame/:gid", async (req, res, next) => {
  const gid = req.params.gid;
  const game = await knex("schedule").where({gid: gid});
  const odds = await knex("odds_sportsbook").where({gcode: game[0].gcode});
  const h = game[0].h[0].tid;
  const v = game[0].v[0].tid;
  const hAbb = game[0].h[0].ta;
  const vAbb = game[0].v[0].ta;
  const nineAgo = moment().subtract(8, 'days').format('YYYY-MM-DD');
  const oneAhead = moment().add(1, 'days').format('YYYY-MM-DD');

  const hSched = await knex("schedule")
    .where('gcode', 'like', `%${hAbb}%`)
    .whereBetween('gdte', [nineAgo, oneAhead])
    .orderBy('gdte');
  const vSched = await knex("schedule")
    .where('gcode', 'like', `%${vAbb}%`)
    .whereBetween('gdte', [nineAgo, oneAhead])
    .orderBy('gdte');
  const hNetRtg = await knex("team_net_ratings").where({team_id: h});
  const vNetRtg = await knex("team_net_ratings").where({team_id: v});
  const hPace = await knex("team_pace").where({team_id: h});
  const vPace = await knex("team_pace").where({team_id: v});
  const hInfo = await knex("teams").where({tid: h});
  const vInfo = await knex("teams").where({tid: v});
  const matchups = await knex("schedule")
    .where('gcode', 'like', `%${hAbb}${vAbb}%`)
    .orWhere('gcode', 'like', `%${vAbb}${hAbb}%`);
  const hPlayers = await knex("player_data as pd")
    .leftJoin("players_on_off as po", "pd.player_id", "=", "po.player_id")
    .where("po.team_id", "=", h)
    .orderBy("pd.min_full")
    .select('pd.player_id as id', 'pd.player_name as name', 'mp_pct', 'min_l15', 'net_rtg_full', 'off_rtg_full', 'def_rtg_full', 'pace_full', 'team_offRtg_delta', 'opp_offRtg_delta', 'netRtg_delta', 'diff_pace_delta', 'team_abb');
  const vPlayers = await knex("player_data as pd")
    .leftJoin("players_on_off as po", "pd.player_id", "=", "po.player_id")
    .where("po.team_id", "=", v)
    .orderBy("pd.min_full")
    .select('pd.player_id as id', 'pd.player_name as name', 'mp_pct', 'min_l15', 'net_rtg_full', 'off_rtg_full', 'def_rtg_full', 'pace_full', 'team_offRtg_delta', 'opp_offRtg_delta', 'netRtg_delta', 'diff_pace_delta', 'team_abb');

  // use this fn to sort by on/off court net rtg differential, which is 9th index
  const doubleArraySort = (a, b) => {
    if (a[9] < b[9]) {return 1};
    if (b[9] < a[9]) {return -1};
    return 0;
  }

  // default numerical sort for use with Array.sort
  const defSort = (a, b) => {
    return a - b;
  }

  const impactPlayers = hPlayers.concat(vPlayers)
  .filter(player => player.mp_pct > 0.2);

  const impPlayerIds = impactPlayers.map(player => player.id);
  const monthPlusAgo = moment().subtract(45, 'days').format('YYYY-MM-DD');

  const gameStints = await knex("player_game_stints")
    .where("gdte", ">", monthPlusAgo)
    .andWhere(buildOne => {
      buildOne.whereIn('team_id', [h, v])
    })
    .andWhere(buildTwo => {
      buildTwo.whereIn('player_id', impPlayerIds)
    })
    .orderBy('gdte', 'desc');

  // binary search fn to speed up sorting/median determ of significant substitution patterns
  const findInsertionPoint = (sortedArr, val, comparator) => {
    let low = 0, high = sortedArr.length;
    let mid = -1, c = 0;
    while (low < high) {
      mid = parseInt((low + high) / 2);
      c = comparator(sortedArr[mid], val);
      if (c < 0) {
        low = mid + 1;
      } else if (c > 0) {
        high = mid;
      } else {
        return mid;
      }
    }
    return low;
  }

  let fullPlayerData = impactPlayers.map(player => {
    const playerStints = gameStints.filter(stint => stint.player_id === player.id);
    const gameEntries = [];
    const gameExits = [];
    let games = 0;
    playerStints.forEach(game => {
      games++;
      game.game_stints.forEach((stretch, i) => {
        if (gameEntries[i]) {
          let idx = findInsertionPoint(gameEntries[i], parseInt(stretch[0]), defSort)
          gameEntries[i].splice(idx, 0, parseInt(stretch[0]));
        } else {
          gameEntries.push([parseInt(stretch[0])])
        };

        if (gameExits[i]) {
          let idx = findInsertionPoint(gameExits[i], parseInt(stretch[1]), defSort);
          gameExits[i].splice(idx, 0, parseInt(stretch[1]));
        } else {
          gameExits.push([parseInt(stretch[1])])
        };
      })
    })

    sigEntries = gameEntries
      .filter(set => {
        const median = Math.floor(set.length/2);
        return (
          (set.length > (games*0.4)) && (set[median] !== 0)
        )
      })
      .reduce((quarters, filtered) => {
        let median = filtered[Math.floor(filtered.length/2)];
        if (median < 719) {
          quarters[0].push(gameSecsToGameTime(median).slice(3))
        } else if (median < 1439) {
          quarters[1].push(gameSecsToGameTime(median).slice(3))
        } else if (median < 2159) {
          quarters[2].push(gameSecsToGameTime(median).slice(3))
        } else if (median < 2879) {
          quarters[3].push(gameSecsToGameTime(median).slice(3))
        };
        return quarters;
      }, [[], [], [], []]);

    sigExits = gameExits
      .filter(set => {
        const median = Math.floor(set.length/2);
        return (
          (set.length > (games*0.4)) && (set[median] !== 2880)
        )
      })
      .reduce((quarters, filtered) => {
        let median = filtered[Math.floor(filtered.length/2)];
        if (median < 721) {
          quarters[0].push(gameSecsToGameTime(median).slice(3))
        } else if (median < 1441) {
          quarters[1].push(gameSecsToGameTime(median).slice(3))
        } else if (median < 2161) {
          quarters[2].push(gameSecsToGameTime(median).slice(3))
        } else if (median < 2881) {
          quarters[3].push(gameSecsToGameTime(median).slice(3))
        };
        return quarters;
      }, [[], [], [], []]);

      return {...player, sigEntries, sigExits}
  })

  res.send({
    info: game[0],
    odds: odds[0],
    hTen: hSched,
    vTen: vSched,
    matchups,
    hNetRtg: hNetRtg[0],
    vNetRtg: vNetRtg[0],
    hPace: hPace[0],
    vPace: vPace[0],
    hInfo: hInfo[0],
    vInfo: vInfo[0],
    hPlayers,
    vPlayers,
    impPlayers: fullPlayerData
  });
})


const timedDbUpdaters = schedule.scheduleJob("15 03 * * *", () => {
  setTimeout(()=>{updateTeamStats.updateFullTeamBuilds()}, 1000);
  setTimeout(()=>{updateTeamStats.updateStarterBuilds()}, 60000);
  setTimeout(()=>{updateTeamStats.updateBenchBuilds()}, 120000);
  setTimeout(()=>{updateTeamStats.updateQ1Builds()}, 180000);
  setTimeout(()=>{updateTeamStats.updateQ2Builds()}, 240000);
  setTimeout(()=>{updateTeamStats.updateQ3Builds()}, 300000);
  setTimeout(()=>{updateTeamStats.updateQ4Builds()}, 360000);
  setTimeout(()=>{updatePlayerStats.updatePlayerStatBuilds()}, 420000);
  setTimeout(()=>{dbBuilders.updateSchedule()}, 480000);
  setTimeout(()=>{dbMappers.mapTeamNetRatings()}, 540000);
  setTimeout(()=>{dbMappers.mapTeamPace()}, 600000);
  setTimeout(()=>{dbMappers.mapFullPlayerData()}, 660000);
  setTimeout(()=>{dbMappers.mapSegmentedPlayerData()}, 720000);
  setTimeout(()=>{dbBuilders.addGameStints()}, 780000);
})

module.exports = router;
