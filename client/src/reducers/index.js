import { combineReducers } from 'redux';
import netRatingsReducer from './netRatingsReducer';
import gameWeekReducer from './gameWeekReducer';

export default combineReducers ({
  netRatings: netRatingsReducer,
  week: gameWeekReducer
})
