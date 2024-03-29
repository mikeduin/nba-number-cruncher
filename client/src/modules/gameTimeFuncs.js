export const gameSecsToClockAndQuarter = secs => {
  if (secs < 2881) {
    let q = Math.floor(secs/720) + 1;

    let min = (
      Math.floor(
        (secs - (720*(q-1)))/60
      )
    );

    if (secs % 720 === 0) {
      return (`Q${q} 12:00`);
    } else {
      let remSecs = (60 - (secs - ((q-1)*720) - (min*60))).toFixed(0);

      if (remSecs < 10) {
        remSecs = `0${remSecs}`;
      }

      if (remSecs === 0 || remSecs == 60) {
        return (`Q${q} ${12-min}:00`);
      } else {
        return (`Q${q} ${11-min}:${remSecs}`);
      }
    }
  } else {
    if ((secs-2880) % 300 === 0) {

      let q = Math.floor((secs-2880)/300);
      let min = (
        Math.floor(
          ((secs-2880) - (300*(q-1)))/60
        )
      );

      return (`OT${q} 0:00`);
    } else {
      let q = Math.floor((secs-2880)/300) + 1;
      let min = (
        Math.floor(
          ((secs-2880) - (300*(q-1)))/60
        )
      );
      let remSecs = (60 - ((secs-2880) - ((q-1)*300) - (min*60))).toFixed(0);

      if (remSecs < 10) {
        remSecs = `0${remSecs}`;
      }

      if (remSecs === 0) {
        return (`OT${q} ${5-min}:00`);
      } else {
        return (`OT${q} ${4-min}:${remSecs}`);
      }
    }
  }
}

export const getGameSecs = (i, clock) => {
  // Note that i is ARRAY BASED, so the fourth quarter will be i = 3
  let secs = 0;
  if (clock.length < 1 ) { clock = '0:00'};
  const colon = clock.indexOf(':');
  const period = clock.indexOf('.');

  if (colon === 2) {
    if (i < 4) {
      secs = ( startPeriodSec(i) + ((11-parseInt(clock.slice(0, 2)))*60) + (60-parseInt(clock.slice(3, 5))));
    } else {
      secs = ( startPeriodSec(i) + ((4-parseInt(clock.slice(0, 2)))*60) + (60-parseInt(clock.slice(3, 5))) )
    };
  } else if (colon === 1){
    if (i < 4) {
      secs = ( startPeriodSec(i) + ((11-parseInt(clock.slice(0, 1)))*60) + (60-parseInt(clock.slice(2, 4))));
    } else {
      secs = ( startPeriodSec(i) + ((4-parseInt(clock.slice(0, 1)))*60) + (60-parseInt(clock.slice(2, 4))) )
    };
  } else if (colon === -1) {
    if (period === 2) {
      if (i < 4) {
        secs = ( startPeriodSec(i) + (11*60) + (60-parseInt(clock.slice(0, 2))));
      } else {
        secs = ( startPeriodSec(i) + (4*60) + (60-parseInt(clock.slice(0, 2))));
      }
    } else if (period === 1) {
      if (i < 4) {
        secs = ( startPeriodSec(i) + (11*60) + (60-parseInt(clock.slice(0, 1))));
      } else {
        secs = ( startPeriodSec(i) + (4*60) + (60-parseInt(clock.slice(0, 1))));
      }
    }
  }

  return secs;
}

export const startPeriodSec = (per) => {
  // per here is array based
  if (per < 4) {
    return (per*720);
  } else {
    return (2880 + ((per-4)*300));
  };
}

export const gameTimeToMinutes = (timeString) => {
  if (timeString && timeString.includes(':')) {
    const [minutes, seconds] = timeString.split(':').map(Number);
    return minutes + seconds / 60;
  } else {
    return 0;
  }
}

export const minutesToGameTime = (minutes) => {
  const wholeMinutes = Math.floor(minutes);
  const seconds = Math.round((minutes - wholeMinutes) * 60);
  return `${wholeMinutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}