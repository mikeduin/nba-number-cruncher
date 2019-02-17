import axios from 'axios';
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
    odds: data.odds || {},
    matchups: data.matchups,
    netRatingsArr: [data.vNetRtg, data.hNetRtg],
    paceArr: [data.vPace, data.hPace],
    hObj: {},
    vObj: {}
  };

  conv.hObj.netRatings = data.hNetRtg;
  conv.hObj.pace = data.hPace;
  conv.hObj.info = data.hInfo;
  conv.hObj.sched = data.hTen;
  conv.vObj.netRatings = data.vNetRtg;
  conv.vObj.pace = data.vPace;
  conv.vObj.info = data.vInfo;
  conv.vObj.sched = data.vTen;

  let hPlayers = data.hPlayers;
  let vPlayers = data.vPlayers;

  let hColors = {
    color_one: data.hInfo.color,
    color_two: data.hInfo.color_2,
    active: data.hInfo.color,
    secondary: data.hInfo.color_2
  };

  let vColors = {
    color_one: data.vInfo.color,
    color_two: data.vInfo.color_2,
    active: data.vInfo.color,
    secondary: data.vInfo.color_2
  };

  dispatch({ type: 'FETCH_GAME', payload: conv});
  dispatch({ type: 'SET_H_COLOR', payload: hColors });
  dispatch({ type: 'SET_V_COLOR', payload: vColors });
  dispatch({ type: 'SET_H_PLAYERS', payload: hPlayers });
  dispatch({ type: 'SET_V_PLAYERS', payload: vPlayers });
}

export const changeTeamColor = (hv, colorObj) => async dispatch => {
  let upper = hv.toUpperCase();
  dispatch({ type: `CHANGE_${upper}_COLOR`, payload: colorObj});
}

export const getTodaysGames = () => async dispatch => {
  dispatch ({type: 'DAILY_GAMES', payload: null});
}

export const setActiveDay = date => async dispatch => {
  dispatch ({type: 'SET_ACTIVE_DAY', payload: date});
}

export const fetchBoxScore = (id, todayInt) => async dispatch => {
  let todayInt = moment().format('YYYYMMDD');
  let stats = await axios.get(`/fetchBoxScore/${todayInt}/${id}`);
  let response = stats.data;
  console.log(response);
  console.log('response.period is ', response.stats.period);

  let liveInfo = {
    gid: id,
    period: response.stats.period.current,
    clock: response.stats.clock,
    hStats: response.stats.hStats,
    vStats: response.stats.vStats,
  }

  dispatch ({type: 'UPDATE_LIVE_SCORE', payload: liveInfo})

}
