import { calcGamePace } from './calculateRateStats';
import { clockReturner } from './gameTimeAndClock';

export const endQuarterResObj = (clock, period, thru_period, gameSecs, poss, totalsObj, qTotals = null, playerStats) => {
  return {
    quarterEnd: true,
    live: true,
    clock: clockReturner(clock, period.current, gameSecs),
    gameSecs,
    period,
    thru_period,
    poss,
    pace: calcGamePace(poss, period.current, gameSecs),
    totals: totalsObj,
    prevQuarters: thru_period === 1 ? totalsObj : qTotals.prevQuarters,
    quarter: thru_period === 1 ? totalsObj : qTotals.currentQuarter,
    playerStats
  };
};
