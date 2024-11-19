
/**
 * Calculates the starting time in seconds for a given period.
 *
 * @param period - The period number (1-based index).
 * @returns The starting time in seconds for the specified period.
 * 
 * - For periods 1 through 4, each period is 720 seconds (12 minutes).
 * - For periods beyond the 4th (overtime), each period is 300 seconds (5 minutes).
 */
export const startPeriodSec = (period: number) => {
  if (period < 4) {
    return (period*720);
  } else {
    return (2880 + ((period-4)*300));
  };
};

/**
 * Calculates the total game seconds elapsed based on the period index and the game clock.
 *
 * @param {number} i - The period index (0-based). For example, the fourth quarter will have i = 3.
 * @param {string} clock - The game clock in the format "MM:SS" or "M:SS". If the clock is empty, it defaults to "0:00".
 * @returns {number} The total game seconds elapsed.
 */
export const getGameSecs = (i: number, clock: string) => {
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

  return secs;
};

/**
 * Converts game seconds to a formatted string representing the game clock and quarter/overtime period.
 *
 * @param {number} secs - The number of seconds elapsed in the game.
 * @returns {string} A string representing the current quarter/overtime period and the game clock in the format "Qx mm:ss" or "OTx mm:ss".
 *
 * @example
 * // Returns "Q1 12:00"
 * gameSecsToClockAndQuarter(0);
 *
 * @example
 * // Returns "Q2 11:30"
 * gameSecsToClockAndQuarter(750);
 *
 * @example
 * // Returns "OT1 4:30"
 * gameSecsToClockAndQuarter(3000);
 */
export const gameSecsToClockAndQuarter = (secs) => {
  if (secs < 2881) {
    const q = Math.floor(secs / 720) + 1;
    const min = Math.floor((secs - (720 * (q - 1))) / 60);

    if (secs % 720 === 0) {
      return `Q${q} 12:00`;
    } else {
      let remSecs = (60 - (secs - ((q - 1) * 720) - (min * 60))).toFixed(0);

      if (Number(remSecs) < 10) {
        remSecs = `0${remSecs}`;
      }

      if (Number(remSecs) == 0 || Number(remSecs) == 60) {
        return `Q${q} ${12 - min}:00`;
      } else {
        return `Q${q} ${11 - min}:${remSecs}`;
      }
    }
  } else {
    if ((secs - 2880) % 300 === 0) {
      const q = Math.floor((secs - 2880) / 300);
      const min = Math.floor(((secs - 2880) - (300 * (q - 1))) / 60);

      return `OT${q} 0:00`;
    } else {
      const q = Math.floor((secs - 2880) / 300) + 1;
      const min = Math.floor(((secs - 2880) - (300 * (q - 1))) / 60);
      let remSecs = (60 - ((secs - 2880) - ((q - 1) * 300) - (min * 60))).toFixed(0);

      if (Number(remSecs) < 10) {
        remSecs = `0${remSecs}`;
      }

      if (Number(remSecs) == 0) {
        return `OT${q} ${5 - min}:00`;
      } else {
        return `OT${q} ${4 - min}:${remSecs}`;
      }
    }
  }
};

/**
 * Returns the game clock in scoreboard format
 *
 * @param clock - The current game clock as a string.
 * @param period - The current period of the game.
 * @param gameSecs - The number of seconds elapsed in the game.
 * @returns The game clock if it is not empty, otherwise a message indicating the end of the period or the start of the game.
 */
export const clockReturner = (clock: string, period: number, gameSecs: number) => {
  if (clock.length < 1) {
    if (gameSecs > 0) {
      return `END Q${period}`;
    } else {
      return 'Q1 12:00';
    }
  } else {
    return clock;
  }
};

export const getClocks = (gameClock) => {
  const clock = `${gameClock.slice(2, 4)}:${gameClock.slice(5, 7)}`; // e.g., 01:02
  const fullClock = `${gameClock.slice(2, 4)}:${gameClock.slice(5, 7)}:${gameClock.slice(8, 10)}`; // e.g., 01:02:00
  return {clock, fullClock}
}

/**
 * Converts a time string in the format "PTMMMxSS.SS" to "MM:SS".
 * @param timeStr - The time string to convert.
 * @returns The formatted time string in "MM:SS".
 */
export const convertPlayingTime = (timeStr: string): string => {
  // Extract minutes and seconds using a regular expression
  const match = timeStr.match(/PT(\d+)M(\d+\.\d+)S/);
  if (!match) {
    // throw new Error('Invalid time format');
    // console.log('invalid time format is ', timeStr);
    return '0:00';
  }

  const minutes = parseInt(match[1], 10);
  const seconds = Math.floor(parseFloat(match[2]));

  // Format the seconds to always be two digits
  const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

  return `${minutes}:${formattedSeconds}`;
};

/**
 * Formats the player's minutes from a given string.
 *
 * The function expects a string in one of the following formats:
 * - "PT{minutes}M" (e.g., "PT30M")
 * - "{minutes}:{seconds}" (e.g., "30:45")
 *
 * If the string starts with "PT", it extracts the minutes using a regular expression.
 * Otherwise, it splits the string by ":" and parses the first part as minutes.
 *
 * @param min - The string representing the player's minutes.
 * @returns The number of minutes as an integer.
 */
export const getPlayerBoxScoreMinutes = (min: string) => {
  const regex = /PT(\d+)M/;
  if (min.slice(0, 2) === 'PT') {
    return parseInt(min.match(regex)[1]);
  } else {
    return parseInt(min.split(':')[0]);
  }
}


/**
 * Converts a time string in the format "MM:SS" to a decimal representation of minutes.
 * @param timeStr - The time string to convert.
 * @returns The decimal representation of minutes.
 * 
 * @example
 * // Returns 18.5
 * gameSecsToClockAndQuarter("18:30");
 */
export const convertMinutesToDecimal = (timeStr: string): number => {
  const [minutes, seconds] = timeStr.split(':').map(Number);
  return minutes + (seconds / 60);
};

/**
 * Determines the period of a basketball game based on the elapsed seconds.
 *
 * @param secs - The number of seconds elapsed since the start of the game.
 * @returns The period of the game. Periods 0-3 correspond to the first four quarters,
 * and periods 4 and above correspond to overtime periods.
 */
export const checkPeriodStart = (secs: number) => {
  if (secs < 2880) {
    return (Math.floor(secs/720));
  } else {
    return (4 + Math.floor((secs-2880) / 300));
  };
}
