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
  }
}
