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
    return (((fgm/fga)*100).toFixed(1));
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
  calcPoss: (fga, to, fta, oreb) => {
    return (0.96*((fga+to+(0.44*fta)-oreb)));
  },
  clockReturner: (clock) => {
    if (clock.length < 1) {
      if (period.current > 1) {
        clock = '0:00';
      } else {
        clock = '12:00';
      }
    };

    return clock;
  }
}

// Delete these below once confirmed fns above are working

// const calcPoss = (fga, to, fta, oreb) => {
//   return (0.96*((fga+to+(0.44*fta)-oreb)));
// };

// const calcGamePace = (poss, per, gameSecs) => {
//   let pace = 0;
//   if (per < 5) {
//     pace = (((2880/gameSecs)*poss)/2)
//   } else {
//     pace = (((2880 + (300*(per-4)))*poss)/2)
//   };
//   if (pace == null) {
//     return 0
//   } else {
//     return pace
//   };
// }

// const calcEndOfQuarterPace = (quarterPoss, per, gameSecs) => {
//   let pace = 0;
//   if (per < 5) {
//     pace = ((quarterPoss*4)/2)
//   } else {
//     pace = (((quarterPoss*(720/300))*4)/2)
//   };
//   if (pace == null) {
//     return 0
//   } else {
//     return pace
//   };
// }

// const calcFgPct = (fgm, fga) => {
//   return (((fgm/fga)*100).toFixed(1));
// }
