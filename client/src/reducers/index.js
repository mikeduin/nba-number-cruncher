import { combineReducers } from 'redux';
import netRatingsReducer from './netRatingsReducer';
import gameWeekReducer from './gameWeekReducer';
import gameReducer from './gameReducer';
import todaysGamesReducer from './todaysGamesReducer';

export default combineReducers ({
  netRatings: netRatingsReducer,
  week: gameWeekReducer,
  game: gameReducer,
  todaysGames: todaysGamesReducer
})
