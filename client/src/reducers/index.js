import { combineReducers } from 'redux';
import activeDay from './activeDayReducer';
import activeGames from './activeGamesReducer';
import completedGames from './completedGamesReducer';
import game from './gameReducer';
import gambleCast from './gambleCastReducer';
import hColors from './hColorReducer';
import hPlayers from './hPlayersReducer';
import netRatings from './netRatingsReducer';
import playerData from './playerDataReducer';
import playersMetadata from './playersReducer';
import playerProps from './playerPropsReducer';
import schedDayGames from './schedDayGameReducer';
import teamNotes from './teamNotesReducer';
import todaysGames from './todaysGamesReducer';
import vColors from './vColorReducer';
import vPlayers from './vPlayersReducer';
import week from './gameWeekReducer';

export default combineReducers ({
  activeDay,
  activeGames,
  completedGames,
  game,
  gambleCast,
  hColors,
  hPlayers,
  netRatings,
  playerData,
  playerProps,
  playersMetadata,
  schedDayGames,
  teamNotes,
  todaysGames,
  vColors,
  vPlayers,
  week,
})
