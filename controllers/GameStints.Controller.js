import axios from 'axios';
import _ from 'lodash';
import { getCurrentSeasonStartYearInt, checkPeriodStart, getGameSecs, startPeriodSec } from '../utils';
import { GAME_DETAIL_URL, PLAY_BY_PLAY_URL, PLAY_BY_PLAY_2025_URL } from '../constants';
import { fetchBoxScore } from './BoxScore.Controller';
import {
  getBoxScoreFromDb,
  getCompletedGamesWithNoGameStints,
  getFinalPlayerBoxScoresForGame,
  getScheduleGame,
  insertPlayerGameStint,
  setGameStintsUpdated
} from '../repositories';

export const addGameStints = async () => {
  const season = getCurrentSeasonStartYearInt();
  const games = await getCompletedGamesWithNoGameStints(season)
  console.log('games are ', games); 

  for (const game of games) {
    try {
      await buildGameStints(game);
      console.log(`Successfully processed game ${game}`);
    } catch (error) {
      console.error(`Error processing game ${game}:`, error.message);
    }
  }
  
  console.log(`Finished processing ${games.length} games`);
};

export const buildGameStints = async (gid) => {
  const season = getCurrentSeasonStartYearInt();

  // const gDetail = await axios.get(GAME_DETAIL_URL(season, gid));
  // const gcode = gDetail.data.g.gcode;
  // const gdte = gDetail.data.g.gdte;

  const gameInDb = await getScheduleGame(gid);
  let boxScoreInDb = await getBoxScoreFromDb(gid);

  const { gcode, gdte, h, v  } = gameInDb;
  const hAbb = h[0].ta;
  const vAbb = v[0].ta;

  // If box score doesn't exist in DB, fetch it from NBA API
  if (!boxScoreInDb) {
    console.log(`Box score not found for game ${gid}, fetching from NBA API...`);
    const boxScoreResponse = await fetchBoxScore(vAbb, hAbb, gid);
    
    if (!boxScoreResponse) {
      throw new Error(`Failed to fetch box score from NBA API for game ${gid}`);
    }
    
    const boxScore = boxScoreResponse.props.pageProps.game;
    const { homeTeam, awayTeam } = boxScore;
    
    // Import the necessary functions from BoxScore.Controller
    const { mapPlayerStatistics } = await import('../utils/index.js');
    const { BoxScores } = await import('./Db.Controller.js');
    
    const hTid = h[0].tid;
    const vTid = v[0].tid;
    
    const hPlayerStats = mapPlayerStatistics(homeTeam.players, hTid, homeTeam.teamTricode, homeTeam.statistics);
    const vPlayerStats = mapPlayerStatistics(awayTeam.players, vTid, awayTeam.teamTricode, awayTeam.statistics);
    const playerStats = [...hPlayerStats, ...vPlayerStats];
    
    // Insert box score into database
    await BoxScores().insert({
      gid: gid,
      h_tid: hTid,
      v_tid: vTid,
      player_stats: JSON.stringify(playerStats),
      final: true,
      updated_at: new Date()
    });
    
    console.log(`Box score saved to DB for game ${gid}`);
    
    // Refetch the box score from DB
    boxScoreInDb = await getBoxScoreFromDb(gid);
  }

  const { player_stats } = boxScoreInDb;
  const playerStats = JSON.parse(player_stats);

  // console.log('gameInDb is ', gameInDb);

  const finalPlayerBoxScores = await getFinalPlayerBoxScoresForGame(gid);

  const starters = playerStats
    .filter((player) => player.starter === '1' || player.starter === 1 || player.starter === true)
    .map((player) => player.player_id);

  const hTid = h[0].tid;
  const vTid = v[0].tid;

  // const boxScoreResponse = await fetchBoxScore(vAbb, hAbb, gid); // pull live NBA.com data, convert to JSON
  // const boxScore = boxScoreResponse.props.pageProps.game;
  // const { homeTeam, awayTeam } = boxScore;

  // const hPlayers = gDetail.data.g.hls.pstsg.filter(player => player.totsec > 0).map(player => player.pid);
  // const vPlayers = gDetail.data.g.vls.pstsg.filter(player => player.totsec > 0).map(player => player.pid);

  // console.log('homeTeam is ', homeTeam);

  const hPlayers = finalPlayerBoxScores
    .filter(player => player.team === hAbb)
    .map(player => player.player_id);

  const vPlayers = finalPlayerBoxScores
    .filter(player => player.team === vAbb)
    .map(player => player.player_id);

  console.log('starters are ', starters);

  const allPlayers = [...hPlayers, ...vPlayers];

  const gameStints = {};
  starters.forEach(player => {
    gameStints[`pid_${player}`] = [[0]];
  });

  console.log('starters are ', starters);

  // const pbp = await axios.get(PLAY_BY_PLAY_URL(season, gid));
  const pbp = await axios.get(PLAY_BY_PLAY_2025_URL(gid));

  // console.log('2025 pbp actions is ', pbp.data.game.actions);

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

  // Need to compile active players for each Q in case player enters early, leaves outside of Q, and never comes back
  const periodPlayers = [];
  
  // Get all actions from the new flat structure
  const actions = pbp.data.game.actions;
  
  // Find the maximum period number to determine number of periods
  const periods = Math.max(...actions.map(action => action.period || 0));
  
  // Process each period
  for (let i = 0; i < periods; i++) {
    const periodNum = i + 1;
    
    // Get all actions for this period
    const periodActions = actions.filter(action => action.period === periodNum);
    
    // collect all substitution events in period
    const subEvents = periodActions.filter(action => action.actionType === 'substitution');
    
    // collect all players who played in period
    const iPlayers = _.uniq(
      periodActions
        .filter(action => action.personId && allPlayers.includes(parseInt(action.personId)))
        .map(action => parseInt(action.personId))
    );

    periodPlayers.push(_.pull(iPlayers, hTid, vTid));

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

    // Process substitutions
    Object.keys(subsByTime).forEach(timeKey => {
      const clock = parseIsoDuration(timeKey);
      const secs = getGameSecs(i, clock);
      const { in: entering, out: exiting } = subsByTime[timeKey];

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
    console.log('pid ', player, ' game stints updated for gid ', gid);
  });

  vPlayers.forEach(async (player, i) => {
    const stints = gameStints[`pid_${player}`];
    await insertPlayerGameStint(player, vTid, gid, gcode, gdte, stints, season);
    console.log('pid ', player, ' game stints updated for gid ', gid);
  })

  await setGameStintsUpdated(gid);
  console.log('game stints have been updated for gid ', gid);
}
