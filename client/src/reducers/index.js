import { combineReducers } from 'redux';
import netRatingsReducer from './netRatingsReducer';
import gameWeekReducer from './gameWeekReducer';
import gameReducer from './gameReducer';
import todaysGamesReducer from './todaysGamesReducer';
import activeDayReducer from './activeDayReducer';
import hColorReducer from './hColorReducer';
import vColorReducer from './vColorReducer';
import hPlayersReducer from './hPlayersReducer';
import vPlayersReducer from './vPlayersReducer';

export default combineReducers ({
  netRatings: netRatingsReducer,
  week: gameWeekReducer,
  game: gameReducer,
  todaysGames: todaysGamesReducer,
  activeDay: activeDayReducer,
  hColors: hColorReducer,
  vColors: vColorReducer,
  hPlayers: hPlayersReducer,
  vPlayers: vPlayersReducer
})
