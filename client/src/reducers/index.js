import { combineReducers } from 'redux';
import netRatings from './netRatingsReducer';
import week from './gameWeekReducer';
import game from './gameReducer';
import todaysGames from './todaysGamesReducer';
import activeDay from './activeDayReducer';
import hColors from './hColorReducer';
import vColors from './vColorReducer';
import hPlayers from './hPlayersReducer';
import vPlayers from './vPlayersReducer';
import gambleCast from './gambleCastReducer';
import playersMetadata from './playersReducer';
import playerData from './playerDataReducer';
import activeGames from './activeGamesReducer';
import completedGames from './completedGamesReducer';
import schedDayGames from './schedDayGameReducer';

export default combineReducers ({
  netRatings,
  week,
  game,
  todaysGames,
  activeGames,
  completedGames,
  activeDay,
  hColors,
  vColors,
  hPlayers,
  vPlayers,
  gambleCast,
  playersMetadata,
  playerData,
  schedDayGames
})
