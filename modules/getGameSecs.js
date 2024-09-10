import startPeriodSec from './startPeriodSec.js';

const getGameSecs = (i, clock) => {
  // Note that i is ARRAY BASED, so the fourth quarter will be i = 3
  let secs = 0;
  if (clock.length < 1) {
    clock = '0:00';
  }
  const colon = clock.indexOf(':');
  const period = clock.indexOf('.');

  if (colon === 2) {
    if (i < 4) {
      secs = startPeriodSec(i) + ((11 - parseInt(clock.slice(0, 2))) * 60) + (60 - parseInt(clock.slice(3, 5)));
    } else {
      secs = startPeriodSec(i) + ((4 - parseInt(clock.slice(0, 2))) * 60) + (60 - parseInt(clock.slice(3, 5)));
    }
  } else if (colon === 1) {
    if (i < 4) {
      secs = startPeriodSec(i) + ((11 - parseInt(clock.slice(0, 1))) * 60) + (60 - parseInt(clock.slice(2, 4)));
    } else {
      secs = startPeriodSec(i) + ((4 - parseInt(clock.slice(0, 1))) * 60) + (60 - parseInt(clock.slice(2, 4)));
    }
  } else if (colon === -1) {
    if (period === 2) {
      if (i < 4) {
        secs = startPeriodSec(i) + (11 * 60) + (60 - parseInt(clock.slice(0, 2)));
      } else {
        secs = startPeriodSec(i) + (4 * 60) + (60 - parseInt(clock.slice(0, 2)));
      }
    } else if (period === 1) {
      if (i < 4) {
        secs = startPeriodSec(i) + (11 * 60) + (60 - parseInt(clock.slice(0, 1)));
      } else {
        secs = startPeriodSec(i) + (4 * 60) + (60 - parseInt(clock.slice(0, 1)));
      }
    }
  }

  // console.log('in getGameSecs period is ', i, ' clock is ', clock, ' secs are ', secs);

  return secs;
};

export default getGameSecs;