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

export default combineReducers ({
  netRatings,
  week,
  game,
  todaysGames,
  activeDay,
  hColors,
  vColors,
  hPlayers,
  vPlayers,
  gambleCast
})
