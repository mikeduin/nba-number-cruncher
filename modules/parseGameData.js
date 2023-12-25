const knex = require("../db/knex");
const getGameSecs = require('./getGameSecs');
const boxScoreHelpers = require('./boxScoreHelpers');
// const boxScoreMock = require('../utils/mocks/boxScoreMock.json');
const mapPlayerStatistics = require("../utils/boxScores/mapPlayerStatistics");

module.exports = async (boxScore) => {
  // const boxScore = boxScoreMock.props.pageProps.game;
  const { period, gameClock, gameStatus, gameStatusText, homeTeam, homeTeamId: hTid, awayTeam, awayTeamId: vTid, gameId} = boxScore;
  const gid = parseInt(gameId.slice(2));
  const isGameActivated = gameStatus > 1;
  const clock = `${gameClock.slice(2, 4)}:${gameClock.slice(5, 7)}`; // e.g., 01:02
  const fullClock = `${gameClock.slice(2, 4)}:${gameClock.slice(5, 7)}:${gameClock.slice(8, 10)}`; // e.g., 01:02:00
  const qVariable = `q${period}`;
  const gameSecs = getGameSecs((parseInt(period)-1), clock);

  const gameOver = gameStatusText === 'Final' || gameStatus === 3;
  const isEndOfPeriod = fullClock === '00:00:00';

  // if (gid == 22300245) {
  //   console.log('gameStatusText is ', gameStatusText, ' and gameStatus is ', gameStatus, ' and fullClock is ', fullClock, ' and period is ', period);
  // }

  // console.log('gameStatusText is ', gameStatusText, ' and gameStatus is ', gameStatus, ' and fullClock is ', fullClock, ' and period is ', period);
  // console.log('isEndOfPeriod is ', isEndOfPeriod, ' and isGameActivated is ', isGameActivated, ' and gameOver is ', gameOver);

  if ((isEndOfPeriod && isGameActivated) || gameOver) {
    const hTeam = homeTeam.statistics;
    const vTeam = awayTeam.statistics;
    const poss = boxScoreHelpers.calcGamePoss(hTeam, vTeam);
    const totalsObj = boxScoreHelpers.compileGameStats(hTeam, vTeam, poss, period, gameSecs);

    const hPlayerStats = mapPlayerStatistics(homeTeam.players, hTid, homeTeam.teamTricode);
    const vPlayerStats = mapPlayerStatistics(awayTeam.players, vTid, awayTeam.teamTricode);
    const playerStats = [ ...hPlayerStats, ...vPlayerStats];

    const quarterObj = prevTotals => {
      return boxScoreHelpers.compileQuarterStats(hTeam, vTeam, prevTotals[0], period, gameSecs);
    }

    const quarterUpdFn = async () => {
      try {
        let prevTotalsPull = await knex("box_scores_v2").where({gid}).select('totals');
        let quarterTotals = quarterObj(prevTotalsPull[0].totals);
        // console.log('prevTotalsPull in quarterUpdFn for gid ', game.gid, ' is ', prevTotalsPull);
        // console.log('quarterTotals in quarterUpdFn for gid ', game.gid, ' is ', quarterTotals);
        return {
          currentQuarter: quarterTotals,
          prevQuarters: prevTotalsPull[0].totals[0]
        }
      } catch (e) {
        console.log('error in quarterUpdFn is ', e, ' for gid ', gid)
      }
    }

    if (gid === 22300399) {
      console.log('hPlayerStats are ', hPlayerStats);
    }

    // console.log('playerStats are ', playerStats);

    if (period === 1) {
      try {
        const entry = await knex("box_scores_v2").where({gid});
        if (!entry[0]) {
          await knex("box_scores_v2").insert({
            gid: gid,
            h_tid: hTid,
            v_tid: vTid,
            period_updated: 1,
            clock_last_updated: gameSecs,
            totals: [totalsObj],
            q1: [totalsObj],
            player_stats: JSON.stringify(playerStats),
            updated_at: new Date()
          });
          console.log('Q1 stats inserted for ', gid);
        } else {
          console.log('first period already entered in gid ', gid);
        }
      } catch (e) {
        console.log(`${qVariable} insert failed for ${gid} error is ${e}`);
      }
    } else if (period === 2 || period === 3 || period === 4) {
      // console.log(`about to pluck for ${qVariable} when period.isEndOfPeriod and current period is ${qVariable}`);
      try {
        const qTest = await knex("box_scores_v2").where({gid}).pluck(`${qVariable}`);
        if (qTest[0] == null) {
          const qTotals = await quarterUpdFn();
          await knex("box_scores_v2").where({gid}).update({
            period_updated: period,
            clock_last_updated: gameSecs,
            totals: [totalsObj],
            [qVariable]: [qTotals.currentQuarter],
            player_stats: JSON.stringify(playerStats),
            updated_at: new Date()
          });
          console.log(`${qVariable} stats inserted for ${gid}`);
        } else if (period === 4 && gameOver) { 
          await knex("box_scores_v2").where({gid: gid}).update({
            final: true
          }); 
          await knex("schedule").where({gid: gid}).update({
            stt: "Final"
          }); 
          console.log(`game ${gid} has been set to final in DB`)
        } else {
          console.log(`qTest for ${qVariable} does not equal null, and/or ${qVariable} already entered in gid ${gid} -- just updating player stats`);
          await knex("box_scores_v2").where({gid}).update({
            player_stats: JSON.stringify(playerStats),
          });
        }
      } catch (e) {
        console.log(`${qVariable} insert failed for ${gid} error is ${e}`);
      }
    } else {
      // const qTest = await knex("box_scores_v2").where({gid: gid}).pluck('ot');
      // <-- If No OT in DB and Game is Over --> //
      // if (qTest[0] == null && !isGameActivated) {
      if (gameOver) {
        try {
          const qTotals = await quarterUpdFn();
          await knex("box_scores_v2").where({gid: gid}).update({
            period_updated: period,
            clock_last_updated: gameSecs,
            totals: [totalsObj],
            ot: [qTotals.currentQuarter],
            player_stats: JSON.stringify(playerStats),
            final: true,
            updated_at: new Date()
          });
          await knex("schedule").where({gid: gid}).update({
            stt: "Final"
          }); 
          console.log('OT stats inserted for ', gid);
        } catch (e) {
          console.log('error updating ot totals is ', e);
        }
      } else {
        // <-- If OT but Not Over, Keep Rolling Stats Over (OT stats not differentiated in DB) --> //
        console.log('Game still activated or ongoing!')
      }
    }
  }
}