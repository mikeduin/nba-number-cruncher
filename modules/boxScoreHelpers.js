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
    const fga = parseInt(hTotals.fieldGoalsAttempted) + parseInt(vTotals.fieldGoalsAttempted);
    const to = parseInt(hTotals.turnovers) + parseInt(vTotals.turnovers);
    const fta = parseInt(hTotals.freeThrowsAttempted) + parseInt(vTotals.freeThrowsAttempted);
    const offReb = parseInt(hTotals.reboundsOffensive) + parseInt(vTotals.reboundsOffensive);

    return ((fga+to+(0.44*fta)-offReb));
  },
  calcQuarterPoss: (hTotals, vTotals, prevTotals) => {
    const fga = ((parseInt(hTotals.fieldGoalsAttempted) + parseInt(vTotals.fieldGoalsAttempted)) - prevTotals.t.fga);
    const to = ((parseInt(hTotals.turnovers) + parseInt(vTotals.turnovers)) - prevTotals.t.to);
    const fta = ((parseInt(hTotals.freeThrowsAttempted) + parseInt(vTotals.freeThrowsAttempted)) - prevTotals.t.fta);
    const offReb = ((parseInt(hTotals.reboundsOffensive) + parseInt(vTotals.reboundsOffensive)) - prevTotals.t.offReb);

    return ((fga+to+(0.44*fta)-offReb));
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
        fgm: parseInt(hTotals.fieldGoalsMade),
        fga: parseInt(hTotals.fieldGoalsAttempted),
        fgPct: module.exports.calcFgPct(hTotals.fieldGoalsMade, hTotals.fieldGoalsAttempted),
        fta: parseInt(hTotals.freeThrowsAttempted),
        to: parseInt(hTotals.turnovers),
        offReb: parseInt(hTotals.reboundsOffensive),
        fouls: parseInt(hTotals.foulsPersonal)
      },
      v: {
        pts: parseInt(vTotals.points),
        fgm: parseInt(vTotals.fieldGoalsMade),
        fga: parseInt(vTotals.fieldGoalsAttempted),
        fgPct: module.exports.calcFgPct(vTotals.fieldGoalsMade, vTotals.fieldGoalsAttempted),
        fta: parseInt(vTotals.freeThrowsAttempted),
        to: parseInt(vTotals.turnovers),
        offReb: parseInt(vTotals.reboundsOffensive),
        fouls: parseInt(vTotals.foulsPersonal)
      },
      t: {
        pts: parseInt(hTotals.points) + parseInt(vTotals.points),
        fgm: parseInt(hTotals.fieldGoalsMade) + parseInt(vTotals.fieldGoalsMade),
        fga: parseInt(hTotals.fieldGoalsAttempted) + parseInt(vTotals.fieldGoalsAttempted),
        fgPct: module.exports.calcFgPct((parseInt(hTotals.fieldGoalsMade) + parseInt(vTotals.fieldGoalsMade)), (parseInt(hTotals.fieldGoalsAttempted) + parseInt(vTotals.fieldGoalsAttempted))),
        fta: parseInt(hTotals.freeThrowsAttempted) + parseInt(vTotals.freeThrowsAttempted),
        to: parseInt(hTotals.turnovers) + parseInt(vTotals.turnovers),
        offReb: parseInt(hTotals.reboundsOffensive) + parseInt(vTotals.reboundsOffensive),
        fouls: parseInt(hTotals.foulsPersonal) + parseInt(vTotals.foulsPersonal),
        poss: poss,
        pace: module.exports.calcGamePace(poss, parseInt(period), gameSecs)
      }
    }
  },
  compileQuarterStats: (hTotals, vTotals, prevTotals, period, gameSecs) => {
    const quarterPoss = module.exports.calcQuarterPoss(hTotals, vTotals, prevTotals)

    // NOTE: ONCE YOU HAVE CONFIRMED PREVTOTALS ARE NOT GOING IN AS INTEGERS, YOU CAN REMOVE PARSEINTS
    return {
      h: {
        pts: parseInt(hTotals.points) - parseInt(prevTotals.h.pts),
        fgm: parseInt(hTotals.fieldGoalsMade) - parseInt(prevTotals.h.fgm),
        fga: parseInt(hTotals.fieldGoalsAttempted) - parseInt(prevTotals.h.fga),
        fgPct: module.exports.calcFgPct((parseInt(hTotals.fieldGoalsMade)-prevTotals.h.fgm), (parseInt(hTotals.fieldGoalsAttempted) - prevTotals.h.fga)),
        fta: parseInt(hTotals.freeThrowsAttempted) - parseInt(prevTotals.h.fta),
        to: parseInt(hTotals.turnovers) - parseInt(prevTotals.h.to),
        offReb: parseInt(hTotals.reboundsOffensive) - parseInt(prevTotals.h.offReb),
        fouls: parseInt(hTotals.foulsPersonal) - parseInt(prevTotals.h.fouls)
      },
      v: {
        pts: parseInt(vTotals.points) - parseInt(prevTotals.v.pts),
        fgm: parseInt(vTotals.fieldGoalsMade) - parseInt(prevTotals.v.fieldGoalsMade),
        fga: parseInt(vTotals.fieldGoalsAttempted) - parseInt(prevTotals.v.fga),
        fgPct: module.exports.calcFgPct((parseInt(vTotals.fieldGoalsMade)-prevTotals.v.fgm), (parseInt(vTotals.fieldGoalsAttempted) - prevTotals.v.fga)),
        fta: parseInt(vTotals.freeThrowsAttempted) - parseInt(prevTotals.v.fta),
        to: parseInt(vTotals.turnovers) - parseInt(prevTotals.v.to),
        offReb: parseInt(vTotals.reboundsOffensive) - parseInt(prevTotals.v.offReb),
        fouls: parseInt(vTotals.foulsPersonal) - parseInt(prevTotals.v.fouls)
      },
      t: {
        pts: (parseInt(hTotals.points) + parseInt(vTotals.points)) - parseInt(prevTotals.t.pts),
        fgm: (parseInt(hTotals.fieldGoalsMade) + parseInt(vTotals.fieldGoalsMade)) - parseInt(prevTotals.t.fgm),
        fga: (parseInt(hTotals.fieldGoalsAttempted) + parseInt(vTotals.fieldGoalsAttempted)) - parseInt(prevTotals.t.fga),
        fgPct: module.exports.calcFgPct(
          ((parseInt(hTotals.fieldGoalsMade) + parseInt(vTotals.fieldGoalsMade)) - parseInt(prevTotals.t.fgm)),
          ((parseInt(hTotals.fieldGoalsAttempted) + parseInt(vTotals.fieldGoalsAttempted)) - parseInt(prevTotals.t.fga))
        ),
        fta: (parseInt(hTotals.freeThrowsAttempted) + parseInt(vTotals.freeThrowsAttempted)) - parseInt(prevTotals.t.fta),
        to: (parseInt(hTotals.turnovers) + parseInt(vTotals.turnovers)) - parseInt(prevTotals.t.to),
        offReb: (parseInt(hTotals.reboundsOffensive) + parseInt(vTotals.reboundsOffensive)) - parseInt(prevTotals.t.offReb),
        fouls: (parseInt(hTotals.foulsPersonal) + parseInt(vTotals.foulsPersonal)) - parseInt(prevTotals.t.fouls),
        poss: quarterPoss,
        pace: module.exports.calcEndOfQuarterPace(quarterPoss, period, gameSecs)
      }
    }
  }
}
