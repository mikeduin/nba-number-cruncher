import { calcGamePace } from './calculateRateStats';
import { clockReturner } from './gameTimeAndClock';

export const endOfQuarterResponse = (gid, isEndOfPeriod, clock, period, gameSecs, thru_period, poss, totalsObj, q1, q2, q3, q4, ot, qTotals = null, playerStats) => {
  return {
    clock: clockReturner(clock, period, gameSecs),
    currentQuarter: thru_period === 1 ? totalsObj : qTotals.currentQuarter,
    gameSecs,
    gid,
    live: true,
    pace: calcGamePace(poss, period, gameSecs),
    period,
    prevQuarters: thru_period === 1 ? totalsObj : qTotals.prevQuarters,
    playerStats,
    quarterEnd: isEndOfPeriod,
    thru_period,
    totals: totalsObj,
    q1,
    q2,
    q3,
    q4,
    ot,
  };
};

export const initialBoxScoreResponse = (gid, isEndOfPeriod, clock, period, gameSecs, thru_period, poss, totalsObj, q1, q2, q3, q4, ot, qTotals, playerStats) => {
  return {
    clock: clockReturner(clock, period, gameSecs),
    currentQuarter: thru_period === 1 ? totalsObj : qTotals.currentQuarter,
    gameSecs,
    gid,
    init: true,
    live: true,
    pace: calcGamePace(poss, period, gameSecs),
    period,
    playerStats,
    prevQuarters: thru_period === 1 ? totalsObj : qTotals.prevQuarters,
    quarterEnd: isEndOfPeriod,
    thru_period,
    totals: totalsObj,
    q1,
    q2,
    q3,
    q4,
    ot,
  }
}

export const quarterInProgressResponse = (gid, isEndOfPeriod, clock, period, gameSecs, thru_period, poss, totalsObj, q1, q2, q3, q4, ot, qTotals, playerStats, inactives) => {
  // console.log('currentQuarter is ', qTotals.currentQuarter)
  return {
    clock: clockReturner(clock, period, gameSecs),
    currentQuarter: qTotals.currentQuarter,
    gameSecs,
    gid,
    inactives: JSON.parse(inactives),
    live: true,
    pace: calcGamePace(poss, period, gameSecs),
    period,
    playerStats,
    prevQuarters: period === 1 ? null : qTotals.prevQuarters,
    quarterEnd: isEndOfPeriod,
    thru_period,
    totals: totalsObj,
    q1,
    q2,
    q3,
    q4,
    ot,
  }
}
