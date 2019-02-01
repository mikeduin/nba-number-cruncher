import { combineReducers } from 'redux';
import netRatingsReducer from './netRatingsReducer';

export default combineReducers ({
  netRatings: netRatingsReducer
})
