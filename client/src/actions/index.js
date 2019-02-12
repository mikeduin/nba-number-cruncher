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
  let conv = {
    info: data.info,
    odds: data.odds,
    netRatingsArr: [data.visNetRtg, data.homeNetRtg],
    paceArr: [data.visPace, data.homePace],
    hObj: {},
    vObj: {}
  };

  conv.hObj.netRatings = data.homeNetRtg;
  conv.hObj.pace = data.homePace;
  conv.hObj.info = data.homeInfo;
  conv.hObj.sched = data.homeTen;
  conv.vObj.netRatings = data.visNetRtg;
  conv.vObj.pace = data.visPace;
  conv.vObj.info = data.visInfo;
  conv.vObj.sched = data.visTen;

  let hColors = {
    color_one: data.homeInfo.color,
    color_two: data.homeInfo.color_2,
    active: data.homeInfo.color,
    secondary: data.homeInfo.color_2
  };

  let vColors = {
    color_one: data.visInfo.color,
    color_two: data.visInfo.color_2,
    active: data.visInfo.color,
    secondary: data.visInfo.color_2
  };

  dispatch({ type: 'FETCH_GAME', payload: conv});
  dispatch({ type: 'SET_H_COLOR', payload: hColors });
  dispatch({ type: 'SET_V_COLOR', payload: vColors });
}

export const changeTeamColor = (hv, colorObj) => async dispatch => {
  let upper = hv.toUpperCase();
  dispatch({ type: `CHANGE_${upper}_COLOR`, payload: colorObj});
}

export const getTodaysGames = () => async dispatch => {
  dispatch ({type: 'DAILY_GAMES', payload: null});
}

export const setActiveDay = (date) => async dispatch => {
  dispatch ({type: 'SET_ACTIVE_DAY', payload: date});
}
