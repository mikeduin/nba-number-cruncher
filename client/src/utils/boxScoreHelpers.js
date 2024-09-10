export const calcFgPct= (fgm, fga) => {
  return (((parseInt(fgm)/parseInt(fga))*100).toFixed(1));
};

export const calcPoss = (fga, to, fta, offReb) => {
  return ((fga+to+(0.44*fta)-offReb));
};

export const calcQuarterPace = (quarterPoss, per, gameSecs) => {
  let pace = 0;
  if (per < 5) {
    let quarterSecs = (parseInt(gameSecs) - (720*parseInt(per-1)));
    pace = ((((720/quarterSecs)*quarterPoss)*4)/2);
  } else {
    let quarterSecs = (parseInt(gameSecs) - 2880 - (300*parseInt(per-4)));
    pace = ((((300/quarterSecs)*quarterPoss)*4)/2)
  };

  if (pace == null) {
    return 0
  } else {
    return pace
  };
};