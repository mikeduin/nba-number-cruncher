const _ = require('lodash');
const fs = require('fs');
const path = require('path');

// Utility functions copied from utils/boxScores/gameTimeAndClock.ts
const startPeriodSec = (period) => {
  if (period < 4) {
    return (period*720);
  } else {
    return (2880 + ((period-4)*300));
  }
};

const getGameSecs = (i, clock) => {
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

const checkPeriodStart = (secs) => {
  if (secs < 720) return 0;
  if (secs < 1440) return 1;
  if (secs < 2160) return 2;
  if (secs < 2880) return 3;
  return Math.floor((secs - 2880) / 300) + 4;
};


// Load the 2025 stub data
const pbpData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'stubs/playByPlay_2025.json'), 'utf8')
);

console.log('\n=== TESTING GAME STINTS WITH 2025 DATA ===\n');

// Mock game data (you can adjust these based on the actual game)
const hTid = 1610612747; // LAL
const vTid = 1610612744; // GSW
const hAbb = 'LAL';
const vAbb = 'GSW';

// Mock starters - these are player IDs that started the game
// You can identify these from the stub data by looking at who played in the opening actions
const starters = [
  1629029, // L. Dončić (LAL)
  1630559, // A. Reaves (LAL)
  1629216, // G. Vincent (LAL)
  1629028, // D. Ayton (LAL - won jump ball)
  1627780, // (LAL)
  203110,  // D. Green (GSW - lost jump ball)
  1630228, // J. Kuminga (GSW)
  1641764, // B. Podziemski (GSW)
  202710,  // J. Butler III (GSW)
  201939   // S. Curry (GSW)
];

// Mock all players in the game
const allPlayers = [
  // LAL players
  1629029, 1630559, 1629216, 1629028, 1627780, 203935, 1642366, 1631222, 1642954,
  // GSW players  
  203110, 1630228, 1641764, 202710, 201939, 1627741, 1629020, 1627780
];

console.log('Starters:', starters);
console.log('Total players:', allPlayers.length);

// Initialize game stints for starters
const gameStints = {};
starters.forEach(player => {
  gameStints[`pid_${player}`] = [[0]];
});

console.log('\n=== INITIAL STINTS (Starters) ===');
console.log(JSON.stringify(gameStints, null, 2));

// Helper function to parse ISO 8601 duration format (PT7M3S) to MM:SS format
const parseIsoDuration = (isoDuration) => {
  if (!isoDuration || isoDuration === '') return '0:00';
  
  // Remove PT prefix
  let duration = isoDuration.replace('PT', '');
  
  // Extract minutes and seconds
  const minutesMatch = duration.match(/(\d+)M/);
  const secondsMatch = duration.match(/(\d+(?:\.\d+)?)S/);
  
  const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
  const seconds = secondsMatch ? Math.floor(parseFloat(secondsMatch[1])) : 0;
  
  // Format as MM:SS or M:SS
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Test the parser
console.log('\n=== TESTING ISO DURATION PARSER ===');
console.log('PT7M3S ->', parseIsoDuration('PT7M3S'));
console.log('PT12M00.00S ->', parseIsoDuration('PT12M00.00S'));
console.log('PT0M45.5S ->', parseIsoDuration('PT0M45.5S'));

// Need to compile active players for each Q in case player enters early, leaves outside of Q, and never comes back
const periodPlayers = [];

// Get all actions from the new flat structure
const actions = pbpData.game.actions;

console.log(`\n=== TOTAL ACTIONS IN GAME: ${actions.length} ===`);

// Find the maximum period number to determine number of periods
const periods = Math.max(...actions.map(action => action.period || 0));

console.log(`Number of periods: ${periods}`);

// Get substitution counts per period
console.log('\n=== SUBSTITUTIONS PER PERIOD ===');
for (let p = 1; p <= periods; p++) {
  const periodSubs = actions.filter(a => a.period === p && a.actionType === 'substitution');
  console.log(`Period ${p}: ${periodSubs.length} substitution events`);
}

// Process each period
for (let i = 0; i < periods; i++) {
  const periodNum = i + 1;
  
  console.log(`\n=== PROCESSING PERIOD ${periodNum} ===`);
  
  // Get all actions for this period
  const periodActions = actions.filter(action => action.period === periodNum);
  
  console.log(`Total actions in period ${periodNum}: ${periodActions.length}`);
  
  // collect all substitution events in period
  const subEvents = periodActions.filter(action => action.actionType === 'substitution');
  
  console.log(`Substitution events: ${subEvents.length}`);
  
  // collect all players who played in period
  const iPlayers = _.uniq(
    periodActions
      .filter(action => action.personId && allPlayers.includes(parseInt(action.personId)))
      .map(action => parseInt(action.personId))
  );

  periodPlayers.push(_.pull(iPlayers, hTid, vTid));
  
  console.log(`Players active in period ${periodNum}: ${periodPlayers[i].length}`);

  // Group substitutions by time to match enter/exit pairs
  const subsByTime = {};
  subEvents.forEach(event => {
    const timeKey = event.clock;
    if (!subsByTime[timeKey]) {
      subsByTime[timeKey] = { in: [], out: [] };
    }
    if (event.subType === 'in') {
      subsByTime[timeKey].in.push(event);
    } else if (event.subType === 'out') {
      subsByTime[timeKey].out.push(event);
    }
  });

  console.log(`Unique substitution times: ${Object.keys(subsByTime).length}`);

  // Process substitutions
  let subsProcessed = 0;
  Object.keys(subsByTime).forEach(timeKey => {
    const clock = parseIsoDuration(timeKey);
    const secs = getGameSecs(i, clock);
    const { in: entering, out: exiting } = subsByTime[timeKey];

    if (subsProcessed < 3) { // Show first 3 substitution groups
      console.log(`\n  Sub at ${timeKey} (${clock}) = ${secs} secs:`);
      console.log(`    Players IN: ${entering.map(e => e.personId).join(', ')}`);
      console.log(`    Players OUT: ${exiting.map(e => e.personId).join(', ')}`);
    }
    subsProcessed++;

    // HANDLE ENTERING PLAYERS
    entering.forEach(event => {
      const playerId = event.personId;
      
      // first check to see if player has entered game yet by seeing if they exist in gameStints
      if (Object.keys(gameStints).indexOf(`pid_${playerId}`) !== -1) {
        // then check to see if player has not been logged as exiting due to subbing between quarters
        // do this by checking to ensure last gameStint array has length of 2
        if (
          gameStints[`pid_${playerId}`][(gameStints[`pid_${playerId}`].length)-1].length === 1
        ) {
          // if length of 1, push value from beg of Q to complete last entry
          gameStints[`pid_${playerId}`][(gameStints[`pid_${playerId}`].length)-1].push(startPeriodSec(i));
          // then push current second value to new array to add new entry
          gameStints[`pid_${playerId}`].push([secs]);
        } else {
          // if player exists in gameStints and last exit has been logged, push new entry array
          gameStints[`pid_${playerId}`].push([secs]);
        }
      } else {
        // if player has not entered game, create key / push first entry array
        gameStints[`pid_${playerId}`] = [[secs]];
      }
    });

    // HANDLE EXITING PLAYERS
    exiting.forEach(event => {
      const playerId = event.personId;
      
      // first check to see if player exists in gameStints; if not, they entered in between quarters
      if (Object.keys(gameStints).indexOf(`pid_${playerId}`) !== -1) {
        if (gameStints
          [`pid_${playerId}`]
          [(gameStints[`pid_${playerId}`].length)-1].length === 1
        ) {
          gameStints
          [`pid_${playerId}`]
          [(gameStints[`pid_${playerId}`].length)-1].push(secs);
        } else {
          gameStints[`pid_${playerId}`].push([startPeriodSec(i), secs]);
        }
      } else {
        // player not yet in gameStints, add entry/exit for current period
        gameStints[`pid_${playerId}`] = [[startPeriodSec(i), secs]];
      }
    });
  });
}

console.log('\n=== AFTER SUBSTITUTION PROCESSING ===');

let tempPlayer;
// Compare players in last Q to ensure no one entered during pre-4Q/OT and never came out
try {
  periodPlayers[periodPlayers.length-1].forEach(player => {
    tempPlayer = player;
    // Tackle case of player entering for first time pre-last period and never leaving game
    if (Object.keys(gameStints).indexOf(`pid_${player}`) === -1) {
      // get second value for beginning of last period
      gameStints[`pid_${player}`] = [[startPeriodSec(periodPlayers.length-1)]];
    }
    const lastExitSecs = gameStints[`pid_${player}`][(gameStints[`pid_${player}`].length)-1][1];
    const lastExitPer = lastExitSecs ? Math.floor(lastExitSecs / 720) : 0;
    if (
      // If they have complete checkin/checkout array ...
      gameStints[`pid_${player}`][(gameStints[`pid_${player}`].length)-1].length === 2
      &&
      // And their last exit time is before the start of the last period ...
      lastExitSecs < startPeriodSec(periods-1)
    ) {
      // Set next entry time to next quarter they played in
      for (var i = lastExitPer + 1; i < periodPlayers.length; i++) {
        if (periodPlayers[i].indexOf(player) !== -1) {
          gameStints[`pid_${player}`].push([startPeriodSec(i)]);
          break;
        }
      }
    }
  });
} catch (e) {
  console.log('Error in last quarter processing:', e);
  console.log('Player causing error:', tempPlayer);
}

// Add final checkouts at end of game for players with open last arrays
allPlayers.forEach(player => {
  try {
    // First look for players whose last time array has no check-out
    if (gameStints[`pid_${player}`] && gameStints[`pid_${player}`][(gameStints[`pid_${player}`]?.length)-1].length == 1) {
      // Then, starting with the last period, and moving backwards through the game
      for (var i = periodPlayers.length-1; i > -1; i--) {
        // If that player's player ID is found in the last period
        if (periodPlayers[i].indexOf(player) !== -1) {
          // Push the start value of the next period in as their last exit time
          // Note that in the case of the last period of game, this value is equivalent to end of game
          gameStints[`pid_${player}`][(gameStints[`pid_${player}`].length)-1].push(startPeriodSec(i+1));
          break;
        }
      }
    }
  } catch (e) {
    console.log(`Error adding final checkouts for player ${player}:`, e);
  }
});

console.log('\n=== FINAL GAME STINTS ===\n');

// Calculate total minutes for each player
const playerMinutes = {};
Object.keys(gameStints).forEach(key => {
  const playerId = key.replace('pid_', '');
  const stints = gameStints[key];
  let totalSeconds = 0;
  
  stints.forEach(stint => {
    if (stint.length === 2) {
      totalSeconds += (stint[1] - stint[0]);
    }
  });
  
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  playerMinutes[playerId] = { totalSeconds, minutes, seconds, stints: stints.length };
});

// Sort by total seconds played
const sortedPlayers = Object.entries(playerMinutes).sort((a, b) => b[1].totalSeconds - a[1].totalSeconds);

console.log('PLAYER MINUTES SUMMARY:');
console.log('Player ID    | Minutes | Stints | Details');
console.log('-------------|---------|--------|------------------');
sortedPlayers.forEach(([playerId, data]) => {
  console.log(
    `${playerId.padEnd(12)} | ${String(data.minutes).padStart(2)}:${String(data.seconds).padStart(2, '0')}  | ${String(data.stints).padStart(6)} | ${JSON.stringify(gameStints[`pid_${playerId}`])}`
  );
});

console.log('\n=== DETAILED STINTS BY PLAYER ===\n');
console.log(JSON.stringify(gameStints, null, 2));

console.log('\n=== TEST COMPLETE ===\n');
