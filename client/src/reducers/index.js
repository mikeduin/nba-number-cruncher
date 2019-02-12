import { combineReducers } from 'redux';
import netRatingsReducer from './netRatingsReducer';
import gameWeekReducer from './gameWeekReducer';
import gameReducer from './gameReducer';
import todaysGamesReducer from './todaysGamesReducer';
import activeDayReducer from './activeDayReducer';
import homeColorReducer from './homeColorReducer';
import visColorReducer from './visColorReducer';

export default combineReducers ({
  netRatings: netRatingsReducer,
  week: gameWeekReducer,
  game: gameReducer,
  todaysGames: todaysGamesReducer,
  activeDay: activeDayReducer,
  homeColors: homeColorReducer,
  visColors: visColorReducer
})
