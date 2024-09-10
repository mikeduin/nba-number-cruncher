export const calcFgPct = (fgm, fga) => {
  return (((parseInt(fgm)/parseInt(fga))*100).toFixed(1));
};

export const calcQuarterPace = (quarterPoss, period, gameSecs) => {
  let pace = 0;
  if (period < 5) {
    let quarterSecs = (parseInt(gameSecs) - (720*parseInt(period-1)));
    pace = ((((720/quarterSecs)*quarterPoss)*4)/2);
  } else {
    let quarterSecs = (parseInt(gameSecs) - 2880 - (300*parseInt(period-4)));
    pace = ((((300/quarterSecs)*quarterPoss)*4)/2)
  };

  return pace;
};

export const calcEndOfQuarterPace = (quarterPoss, period) => {
  // period is nba-based (1st period = 1), not index-based (1st period = 0)
  let pace = 0;
  if (period < 5) {
    pace = ((quarterPoss*4)/2)
  } else {
    pace = (((quarterPoss*(720/300))*4)/2)
  };
  return pace;
};

export const calcGamePace = (poss, per, gameSecs) => {
  // period is nba-based (1st period = 1), not index-based (1st period = 0)
  let pace = 0;
  if (per < 5) {
    pace = (((2880/gameSecs)*poss)/2)
  } else {
    pace = ( ( ((2880 + (300*(per-4)))/gameSecs) * poss)/2)
  };

  return pace;
};

const calcPoss = (fga, to, fta, offReb) => {
  return ((fga+to+(0.44*fta)-offReb));
};

export const calcGamePoss = (hTotals, vTotals) => {
  const fga = parseInt(hTotals.fieldGoalsAttempted) + parseInt(vTotals.fieldGoalsAttempted);
  const to = parseInt(hTotals.turnovers) + parseInt(vTotals.turnovers);
  const fta = parseInt(hTotals.freeThrowsAttempted) + parseInt(vTotals.freeThrowsAttempted);
  const offReb = parseInt(hTotals.reboundsOffensive) + parseInt(vTotals.reboundsOffensive);

  return calcPoss(fga, to, fta, offReb);
};