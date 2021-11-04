const boxScoreHelpers = require("../boxScoreHelpers");

module.exports = (clock, period, thru_period, gameSecs, poss, totalsObj, qTotals = null) => {
  return {
    quarterEnd: true,
    live: true,
    clock: boxScoreHelpers.clockReturner(clock, period.current, gameSecs),
    gameSecs,
    period,
    thru_period,
    poss,
    pace: boxScoreHelpers.calcGamePace(poss, period.current, gameSecs),
    totals: totalsObj,
    prevQuarters: thru_period === 1 ? totalsObj : qTotals.prevQuarters,
    quarter: thru_period === 1 ? totalsObj : qTotals.currentQuarter
  }
}