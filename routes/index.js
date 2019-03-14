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

const startPeriodSec = require('../modules/startPeriodSec');
const getGameSecs = require('../modules/getGameSecs');

// remove these after more testing
const buildGameStints = require("../modules/buildGameStints");
const webScrapeHelpers = require("../modules/webScrapeHelpers");

const gameSecsToGameTime = require("../modules/gameTimeFuncs").gameSecsToClockAndQuarter;

// let today = moment().utcOffset(420).format('YYYY-MM-DD');
let today = '2019-03-13';

let activeGames = [];
let completedGames = [];

// this function manages a day's active and completed games for the GambleCast
setInterval(async () => {
  const todayGames = await knex("schedule").where({gdte: today});
  const todayGids = todayGames.map(game => game.gid);
  let now = moment().utc();

  const finalBoxScores = await knex("box_scores_v2")
    .whereIn('gid', todayGids)
    .where({final: true})
    .pluck('gid');

  completedGames = finalBoxScores;

  todayGames.forEach(game => {
    let start = momentTz(game.etm).subtract(180, 'minutes').tz("America/Toronto").format();
    let mins = now.diff(start, 'minutes');

    if (mins >= 0 && activeGames.indexOf(game.gid) === -1 && completedGames.indexOf(game.gid) === -1) {
      activeGames.push(game.gid)
    };
  })

}, 5000)


// Delete this once confirmed process is working otherwise
// setTimeout(() => {
//   console.log('activeGames are ', activeGames);
//   console.log('pushing active game');
//   activeGames.push(21801017);
// }, 30000);
//
// setTimeout(() => {
//   console.log('completedGames are ', completedGames);
//   console.log('pushing completed game');
//   completedGames.push(21801017);
// }, 45000);

setTimeout(() => {
  // dbBuilders.buildGameStintsDb()
  // updateTeamStats.updateFullTeamBuilds()
}, 1000)

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


// TEST FUNCTION
setInterval(async () => {
  const boxScore = await axios.get(`https://data.nba.net/prod/v1/20190313/0021801019_boxscore.json`);
  const { period, clock, isGameActivated, startTimeUTC } = boxScore.data.basicGameData;

  let gameSecs = getGameSecs((parseInt(period.current)-1), clock);

  if (boxScore.data.stats) {
    let { hTeam, vTeam, activePlayers } = boxScore.data.stats;
    const poss = await boxScoreHelpers.calcGamePoss(hTeam.totals, vTeam.totals)
    const hFgPct = boxScoreHelpers.calcFgPct(hTeam.totals.fgm, hTeam.totals.fga);
    const vFgPct = boxScoreHelpers.calcFgPct(vTeam.totals.fgm, vTeam.totals.fga);

    const totalsObj = boxScoreHelpers.getTotalsObj(hTeam.totals, vTeam.totals, poss, period.current, gameSecs);

    console.log('totalsObj is ', totalsObj);
  }

}, 2000)

// setInterval(() => {
//   let todayInt = moment().format('YYYYMMDD');
//   activeGames.forEach(async (game) => {
//     const url = `https://data.nba.net/prod/v1/${todayInt}/00${gid}_boxscore.json`;
//     const boxScore = await axios.get(url);
//     const { period, clock, isGameActivated, startTimeUTC } = boxScore.data.basicGameData;
//
//     let gameSecs = getGameSecs((parseInt(period.current)-1), clock);
//
//     if (boxScore.data.stats) {
//       let { hTeam, vTeam, activePlayers } = boxScore.data.stats;
//       const poss = await boxScoreHelpers.calcGamePoss(hTeam.totals, vTeam.totals)
//       const hFgPct = boxScoreHelpers.calcFgPct(hTeam.totals.fgm, hTeam.totals.fga);
//       const vFgPct = boxScoreHelpers.calcFgPct(vTeam.totals.fgm, vTeam.totals.fga);
//
//       const totalsObj = {
//         h: {
//           pts: parseInt(hTeam.totals.points),
//           fgm: parseInt(hTeam.totals.fgm),
//           fga: parseInt(hTeam.totals.fga),
//           fgPct: boxScoreHelpers.calcFgPct(hTeam.totals.fgm, hTeam.totals.fga),
//           fta: parseInt(hTeam.totals.fta),
//           to: parseInt(hTeam.totals.turnovers),
//           offReb: parseInt(hTeam.totals.offReb),
//           fouls: parseInt(hTeam.totals.pFouls)
//         },
//         v: {
//           pts: parseInt(vTeam.totals.points),
//           fgm: parseInt(vTeam.totals.fgm),
//           fga: parseInt(vTeam.totals.fga),
//           fgPct: boxScoreHelpers.calcFgPct(vTeam.totals.fgm, vTeam.totals.fga),
//           fta: parseInt(vTeam.totals.fta),
//           to: parseInt(vTeam.totals.turnovers),
//           offReb: parseInt(vTeam.totals.offReb),
//           fouls: parseInt(vTeam.totals.pFouls)
//         },
//         t: {
//           pts: parseInt(hTeam.totals.points) + parseInt(vTeam.totals.points),
//           fgm: parseInt(hTeam.totals.fgm) + parseInt(vTeam.totals.fgm),
//           fga: parseInt(hTeam.totals.fga) + parseInt(vTeam.totals.fga),
//           fgPct: boxScoreHelpers.calcFgPct((parseInt(hTeam.totals.fgm) + parseInt(vTeam.totals.fgm)), (parseInt(hTeam.totals.fga) + parseInt(vTeam.totals.fga))),
//           fta: parseInt(hTeam.totals.fta) + parseInt(vTeam.totals.fta),
//           to: parseInt(hTeam.totals.turnovers) + parseInt(vTeam.totals.turnovers),
//           offReb: parseInt(hTeam.totals.offReb) + parseInt(vTeam.totals.offReb),
//           fouls: parseInt(hTeam.totals.pFouls) + parseInt(vTeam.totals.pFouls),
//           poss: poss,
//           pace: boxScoreHelpers.calcGamePace(poss, parseInt(period.current), gameSecs)
//         }
//       };
//
//
//     } else {
//       console.log('no stats yet for game ', game, ' game has not tipped off');
//     }
//
//   })
// }, 3000)


router.get("/fetchBoxScore/:date/:gid", async (req, res, next) => {
  const { gid, date } = req.params;

  if (completedGames.indexOf(parseInt(gid)) !== -1) {
    const finalScores = await knex("box_scores_v2").where({gid: gid});
    let ot = null;
    if (finalScores[0].ot != null) { ot = finalScores[0].ot[0] };
    res.send({
      gid: gid,
      q1: finalScores[0].q1[0],
      q2: finalScores[0].q2[0],
      q3: finalScores[0].q3[0],
      q4: finalScores[0].q4[0],
      ot: ot,
      totals: finalScores[0].totals[0],
      final: true
    })
    return;
  };

  const url = `https://data.nba.net/prod/v1/${date}/00${gid}_boxscore.json`;
  const boxScore = await axios.get(url);

  console.log('boxscore for ', gid, ' ')

  const momentNow = moment().format();

  const { period, clock, isGameActivated, startTimeUTC } = boxScore.data.basicGameData;


  const hTid = boxScore.data.basicGameData.hTeam.teamId;
  const vTid = boxScore.data.basicGameData.vTeam.teamId;
  const hAbb = boxScore.data.basicGameData.hTeam.triCode;
  const vAbb = boxScore.data.basicGameData.vTeam.triCode;
  let gameSecs = getGameSecs((parseInt(period.current)-1), clock);

  console.log('box score being fetched for ', gid, ' at ', momentNow);

  // const liveTotals = (hTotals, vTotals) => {
  //   return {
  //
  //   }
  // }

  // beg revised load process - ONLY WANT CALLED ON INITIAL LOAD!
  // Maybe add extra param to request to incl indicator whether its initial load?
  // Maybe only run if game is not already in state?
    // This will only work if games that are completed are in state as live_gid, but set to final, and including quarter data

  // if (moment(startTimeUTC).isBefore(nowUTC)) {
  //   // No stats means game has not started
  //   if (!boxScore.data.stats) {
  //     // FIX THIS!!!
  //     console.log(gid, ' has not started, sending back gid ref and active: false');
  //     res.send ({
  //       gid: gid,
  //       active: false
  //     })
  //     return;
  //   } else {
  //     // There are stats in nba.com box score, so game has begun
  //     const inDb = await knex("box_scores_v2").where({gid: gid});
  //     if (inDb.length > 0) {
  //       // Game is past Q1, since first DB insert occurs at end of Q1
  //       if (inDb[0].final == true) {
  //         // Game is final
  //         console.log('sending response for game ', gid, ' as final');
  //         res.send({
  //           gid: gid,
  //           final: true,
  //           totals: inDb[0].totals,
  //           q1: inDb[0].q1,
  //           q2: inDb[0].q2,
  //           q3: inDb[0].q3,
  //           q4: inDb[0].q4,
  //           ot: inDb[0].ot
  //         })
  //       } else {
  //         // Game is in progress
  //         const { hTeam, vTeam, activePlayers } = boxScore.data.stats;
  //         let thru_period = 1;
  //
  //         let q2 = null;
  //         let q3 = null;
  //         let q4 = null;
  //         let ot = null;
  //
  //         if (inDb[0].q2 != null) { q2 = inDb[0].q2; thru_period = 2 };
  //         if (inDb[0].q3 != null) { q3 = inDb[0].q3; thru_period = 3 };
  //         if (inDb[0].q4 != null) { q4 = inDb[0].q4; thru_period = 4 };
  //         if (inDb[0].ot != null) { ot = inDb[0].ot; thru_period = 4 };
  //
  //         const poss = boxScoreHelpers.calcPoss(
  //           (parseInt(hTeam.totals.fga) + parseInt(vTeam.totals.fga)),
  //           (parseInt(hTeam.totals.turnovers) + parseInt(vTeam.totals.turnovers)),
  //           (parseInt(hTeam.totals.fta) + parseInt(vTeam.totals.fta)),
  //           (parseInt(hTeam.totals.offReb) + parseInt(vTeam.totals.offReb)));
  //         const hFgPct = boxScoreHelpers.calcFgPct(hTeam.totals.fgm, hTeam.totals.fga);
  //         const vFgPct = boxScoreHelpers.calcFgPct(vTeam.totals.fgm, vTeam.totals.fga);
  //
  //         const hPlayers = activePlayers.filter(player => {
  //           return (player.teamId === hTid && player.isOnCourt)
  //         }).map(active => active.personId);
  //
  //         const vPlayers = activePlayers.filter(player => {
  //           return (player.teamId === hTid && player.isOnCourt)
  //         }).map(active => active.personId);
  //
  //         // rename this to liveTotals
  //         const totalsObj = {
  //           h: {
  //             pts: parseInt(hTeam.totals.points),
  //             fgm: parseInt(hTeam.totals.fgm),
  //             fga: parseInt(hTeam.totals.fga),
  //             fgPct: boxScoreHelpers.calcFgPct(hTeam.totals.fgm, hTeam.totals.fga),
  //             fta: parseInt(hTeam.totals.fta),
  //             to: parseInt(hTeam.totals.turnovers),
  //             offReb: parseInt(hTeam.totals.offReb),
  //             fouls: parseInt(hTeam.totals.pFouls)
  //           },
  //           v: {
  //             pts: parseInt(vTeam.totals.points),
  //             fgm: parseInt(vTeam.totals.fgm),
  //             fga: parseInt(vTeam.totals.fga),
  //             fgPct: boxScoreHelpers.calcFgPct(vTeam.totals.fgm, vTeam.totals.fga),
  //             fta: parseInt(vTeam.totals.fta),
  //             to: parseInt(vTeam.totals.turnovers),
  //             offReb: parseInt(vTeam.totals.offReb),
  //             fouls: parseInt(vTeam.totals.pFouls)
  //           },
  //           t: {
  //             pts: parseInt(hTeam.totals.points) + parseInt(vTeam.totals.points),
  //             fgm: parseInt(hTeam.totals.fgm) + parseInt(vTeam.totals.fgm),
  //             fga: parseInt(hTeam.totals.fga) + parseInt(vTeam.totals.fga),
  //             fgPct: boxScoreHelpers.calcFgPct((parseInt(hTeam.totals.fgm) + parseInt(vTeam.totals.fgm)), (parseInt(hTeam.totals.fga) + parseInt(vTeam.totals.fga))),
  //             fta: parseInt(hTeam.totals.fta) + parseInt(vTeam.totals.fta),
  //             to: parseInt(hTeam.totals.turnovers) + parseInt(vTeam.totals.turnovers),
  //             offReb: parseInt(hTeam.totals.offReb) + parseInt(vTeam.totals.offReb),
  //             fouls: parseInt(hTeam.totals.pFouls) + parseInt(vTeam.totals.pFouls),
  //             poss: poss,
  //             pace: boxScoreHelpers.calcGamePace(poss, parseInt(period.current), gameSecs)
  //           }
  //         };
  //
  //         res.send({
  //           gid: gid,
  //           live: true,
  //           final: false,
  //           prevTotals: inDb[0].totals,
  //           totals: totalsObj,
  //           q1: inDb[0].q1,
  //           q2: q2,
  //           q3: q3,
  //           q4: q4,
  //           ot: ot,
  //           period: period.current
  //         })
  //       }
  //     } else {
  //       // Game has started, but there are no stats store in DB -- so still in 1Q
  //       console.log('game ', gid, ' has nothing in DB')
  //     }
  //   }
  // }

  // end revised load process


  // you NEED this if, or some conditional like it, otherwise an error gets spit out when trying to destructure hTeam, vTeam, etc
  if (boxScore.data.stats) {
    let { hTeam, vTeam, activePlayers } = boxScore.data.stats;

    const poss = await boxScoreHelpers.calcGamePoss(hTeam.totals, vTeam.totals)

    const hFgPct = boxScoreHelpers.calcFgPct(hTeam.totals.fgm, hTeam.totals.fga);
    const vFgPct = boxScoreHelpers.calcFgPct(vTeam.totals.fgm, vTeam.totals.fga);

    const hPlayers = activePlayers.filter(player => {
      return (player.teamId === hTid && player.isOnCourt)
    }).map(active => active.personId);

    const vPlayers = activePlayers.filter(player => {
      return (player.teamId === hTid && player.isOnCourt)
    }).map(active => active.personId);

    const totalsObj = {
      h: {
        pts: parseInt(hTeam.totals.points),
        fgm: parseInt(hTeam.totals.fgm),
        fga: parseInt(hTeam.totals.fga),
        fgPct: boxScoreHelpers.calcFgPct(hTeam.totals.fgm, hTeam.totals.fga),
        fta: parseInt(hTeam.totals.fta),
        to: parseInt(hTeam.totals.turnovers),
        offReb: parseInt(hTeam.totals.offReb),
        fouls: parseInt(hTeam.totals.pFouls)
      },
      v: {
        pts: parseInt(vTeam.totals.points),
        fgm: parseInt(vTeam.totals.fgm),
        fga: parseInt(vTeam.totals.fga),
        fgPct: boxScoreHelpers.calcFgPct(vTeam.totals.fgm, vTeam.totals.fga),
        fta: parseInt(vTeam.totals.fta),
        to: parseInt(vTeam.totals.turnovers),
        offReb: parseInt(vTeam.totals.offReb),
        fouls: parseInt(vTeam.totals.pFouls)
      },
      t: {
        pts: parseInt(hTeam.totals.points) + parseInt(vTeam.totals.points),
        fgm: parseInt(hTeam.totals.fgm) + parseInt(vTeam.totals.fgm),
        fga: parseInt(hTeam.totals.fga) + parseInt(vTeam.totals.fga),
        fgPct: boxScoreHelpers.calcFgPct((parseInt(hTeam.totals.fgm) + parseInt(vTeam.totals.fgm)), (parseInt(hTeam.totals.fga) + parseInt(vTeam.totals.fga))),
        fta: parseInt(hTeam.totals.fta) + parseInt(vTeam.totals.fta),
        to: parseInt(hTeam.totals.turnovers) + parseInt(vTeam.totals.turnovers),
        offReb: parseInt(hTeam.totals.offReb) + parseInt(vTeam.totals.offReb),
        fouls: parseInt(hTeam.totals.pFouls) + parseInt(vTeam.totals.pFouls),
        poss: poss,
        pace: boxScoreHelpers.calcGamePace(poss, parseInt(period.current), gameSecs)
      }
    };

    // this object calculates the stats for each quarter, using the previous totals from earlier Qs
    const quarterObj = async (prevTotals) => {
      const quarterPoss = boxScoreHelpers.calcQuarterPoss(hTeam.totals, vTeam.totals, prevTotals[0].t);

      // NOTE: ONCE YOU HAVE CONFIRMED PREVTOTALS ARE NOT GOING IN AS INTEGERS, YOU CAN REMOVE PARSEINTS
      return {
        h: {
          pts: parseInt(hTeam.totals.points) - parseInt(prevTotals[0].h.pts),
          fgm: parseInt(hTeam.totals.fgm) - parseInt(prevTotals[0].h.fgm),
          fga: parseInt(hTeam.totals.fga) - parseInt(prevTotals[0].h.fga),
          fgPct: boxScoreHelpers.calcFgPct((parseInt(hTeam.totals.fgm)-prevTotals[0].h.fgm), (parseInt(hTeam.totals.fga) - prevTotals[0].h.fga)),
          fta: parseInt(hTeam.totals.fta) - parseInt(prevTotals[0].h.fta),
          to: parseInt(hTeam.totals.turnovers) - parseInt(prevTotals[0].h.to),
          offReb: parseInt(hTeam.totals.offReb) - parseInt(prevTotals[0].h.offReb),
          fouls: parseInt(hTeam.totals.pFouls) - parseInt(prevTotals[0].h.fouls)
        },
        v: {
          pts: parseInt(vTeam.totals.points) - parseInt(prevTotals[0].v.pts),
          fgm: parseInt(vTeam.totals.fgm) - parseInt(prevTotals[0].v.fgm),
          fga: parseInt(vTeam.totals.fga) - parseInt(prevTotals[0].v.fga),
          fgPct: boxScoreHelpers.calcFgPct((parseInt(vTeam.totals.fgm)-prevTotals[0].v.fgm), (parseInt(vTeam.totals.fga) - prevTotals[0].v.fga)),
          fta: parseInt(vTeam.totals.fta) - parseInt(prevTotals[0].v.fta),
          to: parseInt(vTeam.totals.turnovers) - parseInt(prevTotals[0].v.to),
          offReb: parseInt(vTeam.totals.offReb) - parseInt(prevTotals[0].v.offReb),
          fouls: parseInt(vTeam.totals.pFouls) - parseInt(prevTotals[0].v.fouls)
        },
        t: {
          pts: (parseInt(hTeam.totals.points) + parseInt(vTeam.totals.points)) - parseInt(prevTotals[0].t.pts),
          fgm: (parseInt(hTeam.totals.fgm) + parseInt(vTeam.totals.fgm)) - parseInt(prevTotals[0].t.fgm),
          fga: (parseInt(hTeam.totals.fga) + parseInt(vTeam.totals.fga)) - parseInt(prevTotals[0].t.fga),
          fgPct: boxScoreHelpers.calcFgPct(
            ((parseInt(hTeam.totals.fgm) + parseInt(vTeam.totals.fgm)) - parseInt(prevTotals[0].t.fgm)),
            ((parseInt(hTeam.totals.fga) + parseInt(vTeam.totals.fga)) - parseInt(prevTotals[0].t.fga))
          ),
          fta: (parseInt(hTeam.totals.fta) + parseInt(vTeam.totals.fta)) - parseInt(prevTotals[0].t.fta),
          to: (parseInt(hTeam.totals.turnovers) + parseInt(vTeam.totals.turnovers)) - parseInt(prevTotals[0].t.to),
          offReb: (parseInt(hTeam.totals.offReb) + parseInt(vTeam.totals.offReb)) - parseInt(prevTotals[0].t.offReb),
          fouls: (parseInt(hTeam.totals.pFouls) + parseInt(vTeam.totals.pFouls)) - parseInt(prevTotals[0].t.fouls),
          poss: quarterPoss,
          pace: boxScoreHelpers.calcEndOfQuarterPace(quarterPoss, period.current, gameSecs)
        }
      }
    }

    // this is the function that combines the two above
    // making this a try / catch does not return anything!! need to use finally ????
    const quarterUpdFn = async () => {
      // try {
        let prevTotalsPull = await knex("box_scores_v2").where({gid: gid}).select('totals');
        let quarterTotals = await quarterObj(prevTotalsPull[0].totals);
        return {
          currentQuarter: quarterTotals,
          prevQuarters: prevTotalsPull[0].totals[0]
        }
      // } catch (e) {
      //   console.log('error spit out in quarterUpd for ', gid)
      // }
    }

    // gameOver fn returns true if game has started but no longer activated
    const gameOver = () => {
      return (period.current >= 4 && !isGameActivated)
    };

      // if End of Period is true or Game is over
      if (period.isEndOfPeriod || gameOver()) {
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
              }).then(inserted => {
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
                }, '*').then(inserted => {
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
        console.log('isGameActivated is ', isGameActivated);
        if (!isGameActivated) {
          // THIS IS BEING REACHED IN FIRST PREGAME CHECK
          console.log('server has reached unrefined game inactive fn for gid ', gid);
          res.send({
            quarterEnd: false,
            // live: false,
            clock: boxScoreHelpers.clockReturner(clock, period.current, gameSecs),
            gameSecs: gameSecs,
            period: period,
            thru_period: period.current,
            poss: poss,
            pace: boxScoreHelpers.calcGamePace(poss, period.current, gameSecs),
            totals: totalsObj
            // final: true
          })
        } else {
          let prevTotalsPull = await knex("box_scores_v2").where({gid: gid}).select('totals');
          // console.log('prevTotals for ', gid, ' are ', prevTotalsPull);
          // console.log('prevTotals[0] for ', gid, ' are ', prevTotalsPull[0]);
          // period.current === 1 just for testing prevTotalsPull; remove once corrected
          if (period.current === 1) {
            console.log('first per response being sent for ', gid);
            res.send({
              quarterEnd: false,
              live: true,
              clock: boxScoreHelpers.clockReturner(clock, period.current, gameSecs),
              gameSecs: gameSecs,
              period: period,
              thru_period: period.current - 1,
              poss: poss,
              pace: boxScoreHelpers.calcGamePace(poss, period.current, gameSecs),
              totals: totalsObj
            })
          } else {
            console.log('later per response being sent for ', gid);
            res.send({
              quarterEnd: false,
              live: true,
              clock: boxScoreHelpers.clockReturner(clock, period.current, gameSecs),
              gameSecs: gameSecs,
              period: period,
              thru_period: period.current - 1,
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

const timedDbUpdaters = schedule.scheduleJob("04 13 * * *", () => {
  setTimeout(()=>{updateTeamStats.updateFullTeamBuilds()}, 1000);
  setTimeout(()=>{updateTeamStats.updateStarterBuilds()}, 60000);
  setTimeout(()=>{updateTeamStats.updateBenchBuilds()}, 120000);
  setTimeout(()=>{updateTeamStats.updateQ1Builds()}, 180000);
  setTimeout(()=>{updateTeamStats.updateQ2Builds()}, 240000);
  setTimeout(()=>{updateTeamStats.updateQ3Builds()}, 300000);
  setTimeout(()=>{updateTeamStats.updateQ4Builds()}, 360000);
  setTimeout(()=>{updatePlayerStats.updatePlayerStatBuilds()}, 420000);
  setTimeout(()=>{dbBuilders.updateSchedule()}, 480000);
  setTimeout(()=>{dbBuilders.addGameStints()}, 540000);
  setTimeout(()=>{dbMappers.mapTeamNetRatings()}, 540000);
  setTimeout(()=>{dbMappers.mapTeamPace()}, 600000);
  setTimeout(()=>{dbMappers.mapFullPlayerData()}, 660000);
  setTimeout(()=>{dbMappers.mapSegmentedPlayerData()}, 720000);
})

module.exports = router;
