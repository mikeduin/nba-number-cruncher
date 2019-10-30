const express = require("express");
const router = express.Router();
const axios = require("axios");
const knex = require("../db/knex");
const schedule = require("node-schedule");
const moment = require("moment");
const momentTz = require("moment-timezone");
const cheerio = require('cheerio');
const _ = require('lodash');

const updateTeamStats = require("../modules/updateTeamStats");
const updatePlayerStats = require("../modules/updatePlayerStats");
const dbBuilders = require("../modules/dbBuilders");
const dbMappers = require("../modules/dbMappers");
const dateFilters = require("../modules/dateFilters");
const teamLookup = require("../modules/teamLookup");
const oddsLoaders = require("../modules/oddsLoaders");
const boxScoreHelpers = require("../modules/boxScoreHelpers");

const sampleBoxScoreQ1active = require('../modules/boxScoreResponse_q1_active.json');
const getGameSecs = require('../modules/getGameSecs');
const gameSecsToGameTime = require("../modules/gameTimeFuncs").gameSecsToClockAndQuarter;

let today = moment().format('YYYY-MM-DD');

let activeGames = [];
let completedGames = [];
let todayGids = [];

const timedDbUpdaters = schedule.scheduleJob("36 14 * * *", () => {
  // setTimeout(()=>{updateTeamStats.updateFullTeamBuilds()}, 1000);
  // setTimeout(()=>{updateTeamStats.updateStarterBuilds()}, 60000);
  // setTimeout(()=>{updateTeamStats.updateBenchBuilds()}, 120000);
  // setTimeout(()=>{updateTeamStats.updateQ1Builds()}, 180000);
  // setTimeout(()=>{updateTeamStats.updateQ2Builds()}, 240000);
  // setTimeout(()=>{updateTeamStats.updateQ3Builds()}, 300000);
  // setTimeout(()=>{updateTeamStats.updateQ4Builds()}, 360000);
  // setTimeout(()=>{updatePlayerStats.updatePlayerStatBuilds()}, 420000); <-- ALL SET!
  // setTimeout(()=>{dbBuilders.updateSchedule()}, 480000);
  // setTimeout(()=>{dbBuilders.addGameStints()}, 540000);
  // setTimeout(()=>{dbMappers.mapTeamNetRatings()}, 540000);
  // setTimeout(()=>{dbMappers.mapTeamPace()}, 600000);
  // setTimeout(()=>{dbMappers.mapFullPlayerData()}, 660000);
  // setTimeout(()=>{dbMappers.mapSegmentedPlayerData()}, 720000);
})

setTimeout(async () => {
  // const today = await axios.get('https://data.nba.net/10s/prod/v3/today.json');
  // const data = today.data;
  // const seasonYear = data.teamSitesOnly.seasonYear;
  // const statsStage = data.teamSitesOnly.statsStage;
  // console.log(seasonYear)
  updateTeamStats.updateFullTeamBuilds()
}, 2000)

// this function manages a day's active and completed games for the GambleCast
// setInterval(async () => {
//   const todayGames = await knex("schedule").where({gdte: today});
//   todayGids = todayGames.map(game => game.gid);
//
//   // FIX THIS EVENTUALLY TO BE UTC TIME, NOT MANUALLY ADJUSTED WEST COAST TIME
//   let nowET = moment().add(180, 'minutes');
//   const finalBoxScores = await knex("box_scores_v2")
//     .whereIn('gid', todayGids)
//     .where({final: true})
//     .pluck('gid');
//
//   completedGames = finalBoxScores;
//   todayGames.forEach(game => {
//     let mins = nowET.diff(moment(game.etm), 'minutes');
//     // console.log(game.etm, ' starts in ', mins, ' mins');
//
//     if (mins >= 0 && activeGames.indexOf(game.gid) === -1 && completedGames.indexOf(game.gid) === -1) {
//       console.log('pushing ', game.gid, ' to activeGames');
//       activeGames.push(game.gid)
//     };
//   })
// }, 10000)

// This function pulls in odds
setInterval(()=>{
  // oddsLoaders.sportsbookFull();
  // oddsLoaders.sportsbookFirstH();
  // oddsLoaders.sportsbookFirstQ();
}, 30000);

// This function attempts to retrieve 2H/3Q odds between 9am and midnight
setInterval(()=>{
  const hour = new Date().getHours();
  if (hour >= 9 && hour <= 24) {
    oddsLoaders.sportsbookSecondH();
    oddsLoaders.sportsbookThirdQ();
  }
}, 60000);

/* GET home page. */
router.get("/", (req, res, next) => {

  res.send({ Hi: "there" });
});

router.get("/todayGameStatus", (req, res, next) => {
  res.send({
    activeGames: activeGames,
    completedGames: completedGames
  })
})

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

setInterval(() => {
  let todayInt = moment().format('YYYYMMDD');
  activeGames.forEach(async (gid) => {
    const url = `https://data.nba.net/prod/v1/${todayInt}/00${gid}_boxscore.json`;
    const boxScore = await axios.get(url);
    const { period, clock, isGameActivated, startTimeUTC } = boxScore.data.basicGameData;
    const hTid = boxScore.data.basicGameData.hTeam.teamId;
    const vTid = boxScore.data.basicGameData.vTeam.teamId;
    const hAbb = boxScore.data.basicGameData.hTeam.triCode;
    const vAbb = boxScore.data.basicGameData.vTeam.triCode;

    let gameSecs = getGameSecs((parseInt(period.current)-1), clock);

    // gameOver fn returns true if game has started but no longer activated
    const gameOver = () => {
      return (period.current >= 4 && !isGameActivated)
    };

    if (period.isEndOfPeriod || gameOver()) {
      let { hTeam, vTeam } = boxScore.data.stats;
      const poss = await boxScoreHelpers.calcGamePoss(hTeam.totals, vTeam.totals)
      const hFgPct = boxScoreHelpers.calcFgPct(hTeam.totals.fgm, hTeam.totals.fga);
      const vFgPct = boxScoreHelpers.calcFgPct(vTeam.totals.fgm, vTeam.totals.fga);

      const totalsObj = boxScoreHelpers.compileGameStats(hTeam.totals, vTeam.totals, poss, period.current, gameSecs);

      const quarterObj = prevTotals => {
        return boxScoreHelpers.compileQuarterStats(hTeam.totals, vTeam.totals, prevTotals[0], period.current, gameSecs);
      }

      const quarterUpdFn = async () => {
        let prevTotalsPull = await knex("box_scores_v2").where({gid: gid}).select('totals');
        let quarterTotals = await quarterObj(prevTotalsPull[0].totals);
        return {
          currentQuarter: quarterTotals,
          prevQuarters: prevTotalsPull[0].totals[0]
        }
      }

      if (period.current === 1) {
        knex("box_scores_v2").where({gid: gid}).then(entry => {
          if (!entry[0]) {
            knex("box_scores_v2").insert({
              gid: gid,
              h_tid: hTid,
              v_tid: vTid,
              period_updated: 1,
              clock_last_updated: gameSecs,
              totals: [totalsObj],
              q1: [totalsObj],
              updated_at: new Date()
            }).then(() => {
              console.log('Q1 stats inserted for ', gid);
            })
          } else {
            console.log('first period already entered in gid ', gid);
          }
        })
      } else if (period.current === 2) {
        knex("box_scores_v2").where({gid: gid}).pluck('q2').then(qTest => {
          if (qTest[0] == null) {
            quarterUpdFn().then(qTotals => {
              knex("box_scores_v2").where({gid: gid}).update({
                period_updated: 2,
                clock_last_updated: gameSecs,
                totals: [totalsObj],
                q2: [qTotals.currentQuarter],
                updated_at: new Date()
              }).then(() => {
                console.log('Q2 stats inserted for ', gid);
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
              knex("box_scores_v2").where({gid: gid}).update({
                period_updated: 3,
                clock_last_updated: gameSecs,
                totals: [totalsObj],
                q3: [qTotals.currentQuarter],
                updated_at: new Date()
              }).then(() => {
                console.log('Q3 stats inserted for ', gid);
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
              knex("box_scores_v2").where({gid: gid}).update({
                period_updated: 4,
                clock_last_updated: gameSecs,
                totals: [totalsObj],
                q4: [qTotals.currentQuarter],
                updated_at: new Date()
              }).then(() => {
                console.log('Q4 stats inserted for ', gid);
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
          // <-- If No OT in DB and Game is Over --> //
          if (qTest[0] == null && !isGameActivated) {
            quarterUpdFn().then(qTotals => {
              knex("box_scores_v2").where({gid: gid}).update({
                period_updated: period.current,
                clock_last_updated: gameSecs,
                totals: [totalsObj],
                ot: [qTotals.currentQuarter],
                final: true,
                updated_at: new Date()
              }).then(() => {
                console.log('OT stats inserted for ', gid);
              })
            })
          } else {
            // <-- If OT but Not Over, Keep Rolling Stats Over (OT stats not differentiated in DB) --> //
            console.log('Game still activated or ongoing!')
          }
        })
      }
    } else {
      console.log(gid, ' is active in-period, no DB insertion necessary');
    }
  })
}, 3000)

router.get("/fetchBoxScore/:date/:gid/:init", async (req, res, next) => {
  const { gid, date, init } = req.params;

  // <-- If Game Is Final --> //
  if (completedGames.indexOf(parseInt(gid)) !== -1) {
    let inDb = await knex("box_scores_v2").where({gid: gid});
    let ot = null;
    if (inDb[0].ot != null) { ot = inDb[0].ot[0] };

    res.send({
      gid: gid,
      q1: inDb[0].q1[0],
      q2: inDb[0].q2[0],
      q3: inDb[0].q3[0],
      q4: inDb[0].q4[0],
      ot: ot,
      totals: inDb[0].totals[0],
      final: true
    })
    return;
  };

  let q1 = null;
  let q2 = null;
  let q3 = null;
  let q4 = null;
  let ot = null;
  let thru_period = 0;

  const url = `https://data.nba.net/prod/v1/${date}/00${gid}_boxscore.json`;
  const boxScore = await axios.get(url);
  const { period, clock, isGameActivated, startTimeUTC } = boxScore.data.basicGameData;

  const hTid = boxScore.data.basicGameData.hTeam.teamId;
  const vTid = boxScore.data.basicGameData.vTeam.teamId;
  const hAbb = boxScore.data.basicGameData.hTeam.triCode;
  const vAbb = boxScore.data.basicGameData.vTeam.triCode;
  let gameSecs = getGameSecs((parseInt(period.current)-1), clock);

  // <-- If Game Has Begun --> //
  if (boxScore.data.stats) {
    const { hTeam, vTeam, activePlayers } = boxScore.data.stats;
    const poss = await boxScoreHelpers.calcGamePoss(hTeam.totals, vTeam.totals)
    const hFgPct = boxScoreHelpers.calcFgPct(hTeam.totals.fgm, hTeam.totals.fga);
    const vFgPct = boxScoreHelpers.calcFgPct(vTeam.totals.fgm, vTeam.totals.fga);

    const hPlayers = activePlayers.filter(player => {
      return (player.teamId === hTid && player.isOnCourt)
    }).map(active => active.personId);

    const vPlayers = activePlayers.filter(player => {
      return (player.teamId === hTid && player.isOnCourt)
    }).map(active => active.personId);

    const totalsObj = boxScoreHelpers.compileGameStats(hTeam.totals, vTeam.totals, poss, period.current, gameSecs);

    // this object calculates the stats for each quarter, using the previous totals from earlier Qs
    const quarterObj = prevTotals => {
      return boxScoreHelpers.compileQuarterStats(hTeam.totals, vTeam.totals, prevTotals[0], period.current, gameSecs);
    }

    // this is the function that combines the two above
    const quarterUpdFn = async () => {
      const prevTotalsPull = await knex("box_scores_v2").where({gid: gid}).select('totals');
      const quarterTotals = await quarterObj(prevTotalsPull[0].totals);
      return {
        currentQuarter: quarterTotals,
        prevQuarters: prevTotalsPull[0].totals[0]
      }
    }

    // gameOver returns true if game has started but is no longer in progress
    const gameOver = () => {
      return (period.current >= 4 && !isGameActivated)
    };

    // <-- If Initial Box Score Load --> //
    if (init == 'true' && period.current !== 1) {
      let inDb = await knex("box_scores_v2").where({gid: gid});

      // <-- If Game Is Found in DB (e.g., Q1 or later) --> //
      q1 = inDb[0].q1[0];
      thru_period = inDb[0].period_updated;
      if (inDb[0].q2 != null) { q2 = inDb[0].q2[0] };
      if (inDb[0].q3 != null) { q3 = inDb[0].q3[0] };
      if (inDb[0].q4 != null) { q4 = inDb[0].q4[0] };
      if (inDb[0].ot != null) { ot = inDb[0].ot[0] };

      quarterUpdFn().then(qTotals => {
        if (period.current == 2) q2 = qTotals.currentQuarter;
        if (period.current == 3) q3 = qTotals.currentQuarter;
        if (period.current == 4) q4 = qTotals.currentQuarter;
        if (period.current > 4) ot = qTotals.currentQuarter;

        res.send({
          gid: gid,
          init: true,
          quarterEnd: period.isEndOfPeriod,
          live: true,
          clock: boxScoreHelpers.clockReturner(clock, period.current, gameSecs),
          gameSecs: gameSecs,
          period: period.current,
          thru_period: thru_period,
          poss: poss,
          pace: boxScoreHelpers.calcGamePace(poss, period.current, gameSecs),
          totals: totalsObj,
          q1: q1,
          q2: q2,
          q3: q3,
          q4: q4,
          ot: ot,
          prevQuarters: qTotals.prevQuarters
        })
      })
      return;
    }

    // <-- If at End of Period, or if Game is Over --> //
    if (period.isEndOfPeriod || gameOver()) {
      if (period.current === 1) {
        res.send({
          quarterEnd: true,
          live: true,
          clock: boxScoreHelpers.clockReturner(clock, period.current, gameSecs),
          gameSecs: gameSecs,
          period: period,
          thru_period: 1,
          poss: poss,
          pace: boxScoreHelpers.calcGamePace(poss, period.current, gameSecs),
          totals: totalsObj,
          prevQuarters: totalsObj,
          quarter: totalsObj
        })
      } else if (period.current === 2) {
        quarterUpdFn().then(qTotals => {
          res.send({
            quarterEnd: true,
            live: true,
            clock: boxScoreHelpers.clockReturner(clock, period.current, gameSecs),
            gameSecs: gameSecs,
            period: period,
            thru_period: 2,
            poss: poss,
            pace: boxScoreHelpers.calcGamePace(poss, period.current, gameSecs),
            totals: totalsObj,
            prevQuarters: qTotals.prevQuarters,
            quarter: qTotals.currentQuarter
          })
        })
      } else if (period.current === 3) {
        quarterUpdFn().then(qTotals => {
          res.send({
            quarterEnd: true,
            live: true,
            clock: boxScoreHelpers.clockReturner(clock, period.current, gameSecs),
            gameSecs: gameSecs,
            period: period,
            thru_period: 3,
            poss: poss,
            pace: boxScoreHelpers.calcGamePace(poss, period.current, gameSecs),
            totals: totalsObj,
            prevQuarters: qTotals.prevQuarters,
            quarter: qTotals.currentQuarter
          })
        })
      } else if (period.current === 4 ) {
        quarterUpdFn().then(qTotals => {
          res.send({
            quarterEnd: true,
            live: true,
            clock: boxScoreHelpers.clockReturner(clock, period.current, gameSecs),
            gameSecs: gameSecs,
            period: period,
            thru_period: 4,
            poss: poss,
            pace: boxScoreHelpers.calcGamePace(poss, period.current, gameSecs),
            totals: totalsObj,
            prevQuarters: qTotals.prevQuarters,
            quarter: qTotals.currentQuarter
          })
        })
      } else {
        // I don't think this needs any addl adjusting for mult OTs ... does it?
        quarterUpdFn().then(qTotals => {
          res.send({
            quarterEnd: true,
            live: true,
            clock: boxScoreHelpers.clockReturner(clock, period.current, gameSecs),
            gameSecs: gameSecs,
            period: period,
            thru_period: period.current,
            poss: poss,
            pace: boxScoreHelpers.calcGamePace(poss, period.current, gameSecs),
            totals: totalsObj,
            prevQuarters: qTotals.prevQuarters,
            quarter: qTotals.currentQuarter
          })
        })
      }
    } else {
      // if endOfPeriod is false && game is not activated ... does it get here if game has started?
      // CONFIRM THIS WORKS IN EVENT OF OT
      if (!isGameActivated) {
        console.log(gid, ' has not started or has finished and gameOver fn not reached');
        res.send({
          quarterEnd: false,
          clock: boxScoreHelpers.clockReturner(clock, period.current, gameSecs),
          gameSecs: gameSecs,
          period: period,
          poss: poss,
          pace: boxScoreHelpers.calcGamePace(poss, period.current, gameSecs),
          totals: totalsObj
        })
      } else {
        let prevTotalsPull = await knex("box_scores_v2").where({gid: gid}).select('totals');
        if (period.current === 1) {
          res.send({
            quarterEnd: false,
            live: true,
            clock: boxScoreHelpers.clockReturner(clock, period.current, gameSecs),
            gameSecs: gameSecs,
            period: period,
            poss: poss,
            pace: boxScoreHelpers.calcGamePace(poss, period.current, gameSecs),
            totals: totalsObj,
            thru_period: 0
          })
        } else {
          res.send({
            quarterEnd: false,
            live: true,
            clock: boxScoreHelpers.clockReturner(clock, period.current, gameSecs),
            gameSecs: gameSecs,
            period: period,
            poss: poss,
            pace: boxScoreHelpers.calcGamePace(poss, period.current, gameSecs),
            totals: totalsObj,
            prevQuarters: prevTotalsPull[0].totals[0]
          })
        }
      }
    }
  } else {
    console.log(gid, ' has not started, sending back gid ref and active: false');
    res.send({
      gid: gid,
      active: false
    })
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

router.get("/api/fetchWeek/:date", async (req, res, next) => {
  const todayInfo = await axios.get('https://data.nba.net/10s/prod/v3/today.json');
  const seasonYear = todayInfo.data.seasonScheduleYear;
  const seasonName = dateFilters.fetchSeasonName(req.params.date);
  const week = dateFilters.fetchGmWk(req.params.date, seasonYear, seasonName);
  const weekArray = dateFilters.fetchGmWkArrays(week, seasonYear, seasonName, req.params.date);

  knex("schedule as s")
    .leftJoin("odds_sportsbook as odds", "s.gcode", '=', "odds.gcode")
    .where('s.gweek', week)
    .where('s.season_year', seasonYear)
    .where('s.season_name', seasonName)
    .select('odds.*', 's.id', 's.gid', 's.gcode', 's.gdte', 's.etm', 's.gweek', 's.h', 's.v', 's.stt')
    .orderBy('s.etm')
    .then(async (games) => {
      const teamStats = await knex("teams_full_base");
      res.send({
        week: week,
        weekArray: weekArray,
        weekGames: games,
        teamStats
      })
    });
});

router.get("/api/fetchGames/:day", async (req, res, next) => {
  knex("schedule as s")
    .leftJoin("odds_sportsbook as odds", "s.gcode", '=', "odds.gcode")
    .where('s.gdte', req.params.day)
    .select('odds.*', 's.id', 's.gid', 's.gcode', 's.gdte', 's.etm', 's.gweek', 's.h', 's.v', 's.stt')
    .orderBy('s.etm')
    .then(async (games) => {
      res.send({
        dayGames: games
      })
    });
})

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
  const hTradStats = await knex("teams_full_base").where({team_id: h});
  const vTradStats = await knex("teams_full_base").where({team_id: v});
  const hInfo = await knex("teams").where({tid: h});
  const vInfo = await knex("teams").where({tid: v});
  const matchups = await knex("schedule")
    .where('gcode', 'like', `%${hAbb}${vAbb}%`)
    .orWhere('gcode', 'like', `%${vAbb}${hAbb}%`);
  const hPlayers = await knex("player_data as pd")
    .leftJoin("players_on_off as po", "pd.player_id", "=", "po.player_id")
    .where("po.team_id", "=", h)
    .orderBy("po.netRtg_delta", "desc")
    .select('pd.player_id as id', 'pd.player_name as name', 'mp_pct', 'min_l15', 'net_rtg_full', 'off_rtg_full', 'def_rtg_full', 'pace_full', 'team_offRtg_delta', 'opp_offRtg_delta', 'netRtg_delta', 'diff_pace_delta', 'team_abb', 'total_rating');
  const vPlayers = await knex("player_data as pd")
    .leftJoin("players_on_off as po", "pd.player_id", "=", "po.player_id")
    .where("po.team_id", "=", v)
    .orderBy("po.netRtg_delta", "desc")
    .select('pd.player_id as id', 'pd.player_name as name', 'mp_pct', 'min_l15', 'net_rtg_full', 'off_rtg_full', 'def_rtg_full', 'pace_full', 'team_offRtg_delta', 'opp_offRtg_delta', 'netRtg_delta', 'diff_pace_delta', 'team_abb', 'total_rating');

  // default numerical sort for use with Array.sort
  const defSort = (a, b) => {
    return a - b;
  }

  const rotationPlayers = hPlayers.concat(vPlayers)
  .filter(player => player.mp_pct > 0.2);

  // Do not modify this sort w/o also modifying impactPlayers pull on client side
  const sortedRotPlayers = _.orderBy(rotationPlayers, ['netRtg_delta'], ['desc']);

  const rotPlayerIds = sortedRotPlayers.map(player => player.id);
  const monthPlusAgo = moment().subtract(45, 'days').format('YYYY-MM-DD');

  const gameStints = await knex("player_game_stints")
    .where("gdte", ">", monthPlusAgo)
    .andWhere(buildOne => {
      buildOne.whereIn('team_id', [h, v])
    })
    .andWhere(buildTwo => {
      buildTwo.whereIn('player_id', rotPlayerIds)
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

  let fullPlayerData = sortedRotPlayers.map(player => {
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
    hTradStats: hTradStats[0],
    vTradStats: vTradStats[0],
    hPace: hPace[0],
    vPace: vPace[0],
    hInfo: hInfo[0],
    vInfo: vInfo[0],
    rotPlayers: fullPlayerData
  });
})

module.exports = router;
