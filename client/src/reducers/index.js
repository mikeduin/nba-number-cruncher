import { combineReducers } from 'redux';
import netRatingsReducer from './netRatingsReducer';
import gameWeekReducer from './gameWeekReducer';
import gameReducer from './gameReducer';

export default combineReducers ({
  netRatings: netRatingsReducer,
  week: gameWeekReducer,
  game: gameReducer
})
