import axios from 'axios';
import _ from 'lodash';
import { getCurrentSeasonStartYearInt, checkPeriodStart, getGameSecs, startPeriodSec } from '../utils';
import { GAME_DETAIL_URL, PLAY_BY_PLAY_URL } from '../constants';
import {
  getCompletedGamesWithNoGameStints,
  getScheduleGame,
  insertPlayerGameStint,
  setGameStintsUpdated
} from '../repositories';

export const addGameStints = async () => {
  const season = getCurrentSeasonStartYearInt();
  const games = await getCompletedGamesWithNoGameStints(season)

  games.forEach(game => {
    buildGameStints(game);
  });
};

export const buildGameStints = async (gid) => {
  const season = getCurrentSeasonStartYearInt();

  const gDetail = await axios.get(GAME_DETAIL_URL(season, gid));
  const gcode = gDetail.data.g.gcode;
  const gdte = gDetail.data.g.gdte;

  const gameInDb = await getScheduleGame(gid);

  const hTid = gameInDb[0].h_tid;
  const vTid = gameInDb[0].a_tid;

  const hPlayers = gDetail.data.g.hls.pstsg.filter(player => player.totsec > 0).map(player => player.pid);
  const vPlayers = gDetail.data.g.vls.pstsg.filter(player => player.totsec > 0).map(player => player.pid);

  const allPlayers = hPlayers.concat(vPlayers);
  const starters = hPlayers.slice(0, 5).concat(vPlayers.slice(0, 5));
  const gameStints = {};
  starters.forEach(player => {
    gameStints[`pid_${player}`] = [[0]];
  });

  const pbp = await axios.get(PLAY_BY_PLAY_URL(season, gid));

  // Need to compile active players for each Q in case player enters early, leaves outside of Q, and never comes back
  const periodPlayers = [];
  const periods = pbp.data.g.pd.length;
  pbp.data.g.pd.forEach((period, i) => {
    const subEvents = period.pla.filter(play => play.etype === 8);

    const iPlayers = _.uniq(period.pla
      .filter(play => allPlayers.includes(parseInt(play.epid)) || allPlayers.includes(parseInt(play.pid))))
      .reduce((players, filteredPlays) => {
        players.push(parseInt(filteredPlays.pid));
        players.push(parseInt(filteredPlays.epid));
        return _.uniq(players).filter(player => !isNaN(player));
      }, []);

    periodPlayers.push(_.pull(iPlayers, hTid, vTid));

    subEvents.forEach(event => {
      const secs = getGameSecs(i, event.cl)

      // SUBSTITUTION REFERENCE IN PLAY-BY-PLAY LOGS:
      // player entering = event.epid
      // player exiting = event.pid

      // HANDLE ENTERING PLAYER
      // first check to see if player has entered game yet by seeing if they exist in gameStints
      if (Object.keys(gameStints).indexOf(`pid_${event.epid}`) !== -1) {
        // then check to see if player has not been logged as exiting due to subbing between quarters
        // do this by checking to ensure last gameStint array has length of 2
        if (
          gameStints[`pid_${event.epid}`][(gameStints[`pid_${event.epid}`].length)-1].length === 1
        ) {
          // if length of 1, push value from beg of Q to complete last entry weekArray
          // CHANGE THIS TO END OF LAST Q FOR WHICH THEY'D ENTERED
          gameStints[`pid_${event.epid}`][(gameStints[`pid_${event.epid}`].length)-1].push(startPeriodSec(i));
          // then push current second value to new array to add new entry
          gameStints[`pid_${event.epid}`].push([secs]);
        } else {
          // if player exists in gameStints and last exit has been logged, push new entry array
          gameStints[`pid_${event.epid}`].push([secs]);
        }
      } else {
        // if player has not entered game, create key / push first entry array
        gameStints[`pid_${event.epid}`] = [[secs]];
      };

      // HANDLE EXITING PLAYER
      // first check to see if player exists in gameStints; if not, they entered in between quarters
      if (Object.keys(gameStints).indexOf(`pid_${event.pid}`) !== -1) {
        if (gameStints
          [`pid_${event.pid}`]
          [(gameStints[`pid_${event.pid}`].length)-1].length === 1
        ) {
          gameStints
          [`pid_${event.pid}`]
          [(gameStints[`pid_${event.pid}`].length)-1].push(secs);
        } else {
          gameStints[`pid_${event.pid}`].push([startPeriodSec(i), secs]);
        }
      } else {
        // player not yet in gameStints, add entry/exit for current period
        gameStints[`pid_${event.pid}`] = [[startPeriodSec(i), secs]];
      };
    })
  })

  let tempPlayer;
  // Compare players in last Q to ensure no one entered during pre-4Q/OT and never came out
  try {
    periodPlayers[periodPlayers.length-1].forEach(player => {
      tempPlayer = player;
      // Tackle case of player entering for first time pre-last period and never leaving game
      if (Object.keys(gameStints).indexOf(`pid_${player}`) === -1) {
        // get second value for beginning of last period
        gameStints[`pid_${player}`] = [[startPeriodSec(periodPlayers.length-1)]];
      };
      const lastExitSecs = gameStints[`pid_${player}`][(gameStints[`pid_${player}`].length)-1][1];
      const lastExitPer = checkPeriodStart(lastExitSecs);
      if (
        // If they have complete checkin/checkout array ...
        gameStints[`pid_${player}`][(gameStints[`pid_${player}`].length)-1].length === 2
        &&
        // And their last exit time is before the start of the last period ...
        lastExitSecs < startPeriodSec(periods-1)
      ) {
        // Set next entry time to next quarter they played in
        for (var i = lastExitPer + 1; i < periodPlayers.length; i++) {
          if (periodPlayers[i].indexOf(player)) {
            gameStints[`pid_${player}`].push([startPeriodSec(i)]);
            break;
          }
        };
      };
    })
  } catch (e) {
    console.log(e);
    console.log('game ID is ', gid, ' player causing error is ', tempPlayer);
  };

  // Add final checkouts at end of game for players with open last arrays
    allPlayers.forEach(player => {
      try {
        // First look for players whose last time array has no check-out
        if (gameStints[`pid_${player}`][(gameStints[`pid_${player}`]?.length)-1].length == 1) {
          // Then, starting with the last period, and moving backwards through the game
          for (var i = periodPlayers.length-1; i > -1; i--) {
            // If that player's player ID is found in the last period
            if (periodPlayers[i].indexOf(player) !== -1) {
              // Push the start value of the next period in as their last exit time
              // Note that in the case of the last period of game, this value is equivalent to end of game
              gameStints[`pid_${player}`][(gameStints[`pid_${player}`].length)-1].push(startPeriodSec(i+1));
              break;
            };
          }
        }
      } catch (e) {
        console.log('error adding final checkouts for player ', player, ' in game ', gid, ' is ', e);
      }
    });

  hPlayers.forEach(async player => {
    const stints = gameStints[`pid_${player}`];
    await insertPlayerGameStint(player, hTid, gid, gcode, gdte, stints, season);
    console.log('pid ', player.player_id, ' game stints updated for gid ', gid);
  });

  vPlayers.forEach(async (player, i) => {
    const stints = gameStints[`pid_${player}`];
    await insertPlayerGameStint(player, vTid, gid, gcode, gdte, stints, season);
    console.log('pid ', player.player_id, ' game stints updated for gid ', gid);
  })

  await setGameStintsUpdated(gid);
  console.log('game stints have been updated for gid ', gid);
}
