// import _ from 'lodash';
// import axios from 'axios';
import moment from 'moment';

let today = moment().format('YYYY-MM-DD');

export const fetchNetRatings = () => async dispatch => {
  let response = await fetch('/api/getNetRatings');
  let data = await response.json();

  dispatch({ type: 'FETCH_NET_RATINGS', payload: data});
}

export const fetchWeek = (date = today) => async dispatch => {
  let digitDate = moment(date).format('YYYYMMDD');
  let response = await fetch(`/api/fetchWeek/${digitDate}`);
  let data = await response.json();

  let updated = {...data, today};

  let todayGames = data.weekGames.filter(game => {
    return game.gdte === today;
  });

  dispatch({ type: 'TODAY_GAMES', payload: todayGames});
  dispatch({ type: 'FETCH_WEEK', payload: updated});
}

export const fetchGame = ({gid}) => async dispatch => {
  let response = await fetch(`/api/fetchGame/${gid}`);
  let data = await response.json();
  // both Obj and Arr data types ideal for custom component injection

  console.log('data is ', data);

  let conv = {
    info: data.info,
    netRatingsArr: [data.visNetRtg, data.homeNetRtg],
    paceArr: [data.visPace, data.homePace],
    homeObj: {},
    visObj: {}
  };

  conv.homeObj.netRatings = data.homeNetRtg;
  conv.homeObj.pace = data.homePace;
  conv.homeObj.info = data.homeInfo;
  conv.visObj.netRatings = data.visNetRtg;
  conv.visObj.pace = data.visPace;
  conv.visObj.info = data.visInfo;


  dispatch({ type: 'FETCH_GAME', payload: conv});
}

export const changeTeamColor = () => async dispatch => {
  // let payload = [l, color];

  dispatch({ type: 'CHANGE_VIS_COLOR', payload: '#F79F31'});
}

export const getTodaysGames = () => async dispatch => {
  dispatch ({type: 'DAILY_GAMES', payload: null});
}

export const setActiveDay = (date) => async dispatch => {
  dispatch ({type: 'SET_ACTIVE_DAY', payload: date});
}
