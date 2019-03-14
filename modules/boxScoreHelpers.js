module.exports = {
  calcEndOfQuarterPace: (quarterPoss, per, gameSecs) => {
    // period is nba-based (1st period = 1), not index-based (1st period = 0)
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
  },
  calcFgPct: (fgm, fga) => {
    return (((parseInt(fgm)/parseInt(fga))*100).toFixed(1));
  },
  calcGamePace: (poss, per, gameSecs) => {
    // period is nba-based (1st period = 1), not index-based (1st period = 0)
    let pace = 0;
    if (per < 5) {
      pace = (((2880/gameSecs)*poss)/2)
    } else {
      pace = ( ( ((2880 + (300*(per-4)))/gameSecs) * poss)/2)
    };

    if (pace == null) {
      return 0
    } else {
      return pace
    };
  },
  calcGamePoss: (hTotals, vTotals) => {
    const fga = parseInt(hTotals.fga) + parseInt(vTotals.fga);
    const to = parseInt(hTotals.turnovers) + parseInt(vTotals.turnovers);
    const fta = parseInt(hTotals.fta) + parseInt(vTotals.fta);
    const offReb = parseInt(hTotals.offReb) + parseInt(vTotals.offReb);

    return (0.96*((fga+to+(0.44*fta)-offReb)));
  },
  calcQuarterPoss: (hTotals, vTotals, prevTotals) => {
    const fga = ((parseInt(hTotals.fga) + parseInt(vTotals.fga)) - prevTotals.fga);
    const to = ((parseInt(hTotals.turnovers) + parseInt(vTotals.turnovers)) - prevTotals.to);
    const fta = ((parseInt(hTotals.fta) + parseInt(vTotals.fta)) - prevTotals.fta);
    const offReb = ((parseInt(hTotals.offReb) + parseInt(vTotals.offReb)) - prevTotals.offReb);

    return (0.96*((fga+to+(0.44*fta)-offReb)));
  },
  clockReturner: (clock, period, gameSecs) => {
    if (clock.length < 1) {
      if (gameSecs > 0) {
        return `END Q${period}`;
      } else {
        return 'Q1 12:00';
      }
    } else {
      return clock;
    }
  },
  compileGameStats: (hTotals, vTotals, poss, period, gameSecs) => {
    return {
      h: {
        pts: parseInt(hTotals.points),
        fgm: parseInt(hTotals.fgm),
        fga: parseInt(hTotals.fga),
        fgPct: module.exports.calcFgPct(hTotals.fgm, hTotals.fga),
        fta: parseInt(hTotals.fta),
        to: parseInt(hTotals.turnovers),
        offReb: parseInt(hTotals.offReb),
        fouls: parseInt(hTotals.pFouls)
      },
      v: {
        pts: parseInt(vTotals.points),
        fgm: parseInt(vTotals.fgm),
        fga: parseInt(vTotals.fga),
        fgPct: module.exports.calcFgPct(vTotals.fgm, vTotals.fga),
        fta: parseInt(vTotals.fta),
        to: parseInt(vTotals.turnovers),
        offReb: parseInt(vTotals.offReb),
        fouls: parseInt(vTotals.pFouls)
      },
      t: {
        pts: parseInt(hTotals.points) + parseInt(vTotals.points),
        fgm: parseInt(hTotals.fgm) + parseInt(vTotals.fgm),
        fga: parseInt(hTotals.fga) + parseInt(vTotals.fga),
        fgPct: module.exports.calcFgPct((parseInt(hTotals.fgm) + parseInt(vTotals.fgm)), (parseInt(hTotals.fga) + parseInt(vTotals.fga))),
        fta: parseInt(hTotals.fta) + parseInt(vTotals.fta),
        to: parseInt(hTotals.turnovers) + parseInt(vTotals.turnovers),
        offReb: parseInt(hTotals.offReb) + parseInt(vTotals.offReb),
        fouls: parseInt(hTotals.pFouls) + parseInt(vTotals.pFouls),
        poss: poss,
        pace: module.exports.calcGamePace(poss, parseInt(period), gameSecs)
        // pace: boxScoreHelpers.calcGamePace(poss, parseInt(period.current), gameSecs)
      }
    }
  },
  compileQuarterStats: (hTotals, vTotals, prevTotals, period, gameSecs) => {
    const quarterPoss = module.exports.calcQuarterPoss(hTotals, vTotals, prevTotals.t)

    // NOTE: ONCE YOU HAVE CONFIRMED PREVTOTALS ARE NOT GOING IN AS INTEGERS, YOU CAN REMOVE PARSEINTS
    return {
      h: {
        pts: parseInt(hTotals.points) - parseInt(prevTotals.h.pts),
        fgm: parseInt(hTotals.fgm) - parseInt(prevTotals.h.fgm),
        fga: parseInt(hTotals.fga) - parseInt(prevTotals.h.fga),
        fgPct: module.exports.calcFgPct((parseInt(hTotals.fgm)-prevTotals.h.fgm), (parseInt(hTotals.fga) - prevTotals.h.fga)),
        fta: parseInt(hTotals.fta) - parseInt(prevTotals.h.fta),
        to: parseInt(hTotals.turnovers) - parseInt(prevTotals.h.to),
        offReb: parseInt(hTotals.offReb) - parseInt(prevTotals.h.offReb),
        fouls: parseInt(hTotals.pFouls) - parseInt(prevTotals.h.fouls)
      },
      v: {
        pts: parseInt(vTotals.points) - parseInt(prevTotals.v.pts),
        fgm: parseInt(vTotals.fgm) - parseInt(prevTotals.v.fgm),
        fga: parseInt(vTotals.fga) - parseInt(prevTotals.v.fga),
        fgPct: module.exports.calcFgPct((parseInt(vTotals.fgm)-prevTotals.v.fgm), (parseInt(vTotals.fga) - prevTotals.v.fga)),
        fta: parseInt(vTotals.fta) - parseInt(prevTotals.v.fta),
        to: parseInt(vTotals.turnovers) - parseInt(prevTotals.v.to),
        offReb: parseInt(vTotals.offReb) - parseInt(prevTotals.v.offReb),
        fouls: parseInt(vTotals.pFouls) - parseInt(prevTotals.v.fouls)
      },
      t: {
        pts: (parseInt(hTotals.points) + parseInt(vTotals.points)) - parseInt(prevTotals.t.pts),
        fgm: (parseInt(hTotals.fgm) + parseInt(vTotals.fgm)) - parseInt(prevTotals.t.fgm),
        fga: (parseInt(hTotals.fga) + parseInt(vTotals.fga)) - parseInt(prevTotals.t.fga),
        fgPct: module.exports.calcFgPct(
          ((parseInt(hTotals.fgm) + parseInt(vTotals.fgm)) - parseInt(prevTotals.t.fgm)),
          ((parseInt(hTotals.fga) + parseInt(vTotals.fga)) - parseInt(prevTotals.t.fga))
        ),
        fta: (parseInt(hTotals.fta) + parseInt(vTotals.fta)) - parseInt(prevTotals.t.fta),
        to: (parseInt(hTotals.turnovers) + parseInt(vTotals.turnovers)) - parseInt(prevTotals.t.to),
        offReb: (parseInt(hTotals.offReb) + parseInt(vTotals.offReb)) - parseInt(prevTotals.t.offReb),
        fouls: (parseInt(hTotals.pFouls) + parseInt(vTotals.pFouls)) - parseInt(prevTotals.t.fouls),
        poss: quarterPoss,
        pace: module.exports.calcEndOfQuarterPace(quarterPoss, period, gameSecs)
      }
    }
  }
}

// BELOW IS OLD QUARTER COMPILER - JUST STORING FOR REFERENCE

// const quarterPoss = boxScoreHelpers.calcQuarterPoss(hTeam.totals, vTeam.totals, prevTotals[0].t);

// return {
//   h: {
//     pts: parseInt(hTeam.totals.points) - parseInt(prevTotals[0].h.pts),
//     fgm: parseInt(hTeam.totals.fgm) - parseInt(prevTotals[0].h.fgm),
//     fga: parseInt(hTeam.totals.fga) - parseInt(prevTotals[0].h.fga),
//     fgPct: boxScoreHelpers.calcFgPct((parseInt(hTeam.totals.fgm)-prevTotals[0].h.fgm), (parseInt(hTeam.totals.fga) - prevTotals[0].h.fga)),
//     fta: parseInt(hTeam.totals.fta) - parseInt(prevTotals[0].h.fta),
//     to: parseInt(hTeam.totals.turnovers) - parseInt(prevTotals[0].h.to),
//     offReb: parseInt(hTeam.totals.offReb) - parseInt(prevTotals[0].h.offReb),
//     fouls: parseInt(hTeam.totals.pFouls) - parseInt(prevTotals[0].h.fouls)
//   },
//   v: {
//     pts: parseInt(vTeam.totals.points) - parseInt(prevTotals[0].v.pts),
//     fgm: parseInt(vTeam.totals.fgm) - parseInt(prevTotals[0].v.fgm),
//     fga: parseInt(vTeam.totals.fga) - parseInt(prevTotals[0].v.fga),
//     fgPct: boxScoreHelpers.calcFgPct((parseInt(vTeam.totals.fgm)-prevTotals[0].v.fgm), (parseInt(vTeam.totals.fga) - prevTotals[0].v.fga)),
//     fta: parseInt(vTeam.totals.fta) - parseInt(prevTotals[0].v.fta),
//     to: parseInt(vTeam.totals.turnovers) - parseInt(prevTotals[0].v.to),
//     offReb: parseInt(vTeam.totals.offReb) - parseInt(prevTotals[0].v.offReb),
//     fouls: parseInt(vTeam.totals.pFouls) - parseInt(prevTotals[0].v.fouls)
//   },
//   t: {
//     pts: (parseInt(hTeam.totals.points) + parseInt(vTeam.totals.points)) - parseInt(prevTotals[0].t.pts),
//     fgm: (parseInt(hTeam.totals.fgm) + parseInt(vTeam.totals.fgm)) - parseInt(prevTotals[0].t.fgm),
//     fga: (parseInt(hTeam.totals.fga) + parseInt(vTeam.totals.fga)) - parseInt(prevTotals[0].t.fga),
//     fgPct: boxScoreHelpers.calcFgPct(
//       ((parseInt(hTeam.totals.fgm) + parseInt(vTeam.totals.fgm)) - parseInt(prevTotals[0].t.fgm)),
//       ((parseInt(hTeam.totals.fga) + parseInt(vTeam.totals.fga)) - parseInt(prevTotals[0].t.fga))
//     ),
//     fta: (parseInt(hTeam.totals.fta) + parseInt(vTeam.totals.fta)) - parseInt(prevTotals[0].t.fta),
//     to: (parseInt(hTeam.totals.turnovers) + parseInt(vTeam.totals.turnovers)) - parseInt(prevTotals[0].t.to),
//     offReb: (parseInt(hTeam.totals.offReb) + parseInt(vTeam.totals.offReb)) - parseInt(prevTotals[0].t.offReb),
//     fouls: (parseInt(hTeam.totals.pFouls) + parseInt(vTeam.totals.pFouls)) - parseInt(prevTotals[0].t.fouls),
//     poss: quarterPoss,
//     pace: boxScoreHelpers.calcEndOfQuarterPace(quarterPoss, period.current, gameSecs)
//   }
// }
