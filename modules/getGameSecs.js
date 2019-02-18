const startPeriodSec = require('./startPeriodSec');

const getGameSecs = (i, clock) => {
  // Note that i is ARRAY BASED, so the fourth quarter will be i = 3
  let secs = 0;
  if (i < 4) {
    secs = ( startPeriodSec(i) + ((11-parseInt(clock.slice(0, 2)))*60) + (60-parseInt(clock.slice(3, 5))));
  } else {
    secs = ( startPeriodSec(i) + ((4-parseInt(clock.slice(0, 2)))*60) + (60-parseInt(clock.slice(3, 5))) )
  };
  return secs;
}

module.exports = getGameSecs;
