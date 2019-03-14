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
  getTotalsObj: (hTotals, vTotals, poss, period, gameSecs) => {
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


  }
}
