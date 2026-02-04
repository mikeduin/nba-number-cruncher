import axios from 'axios';
import moment from 'moment-timezone';
import _ from 'lodash';

let today = moment().tz("America/Los_Angeles").format('YYYY-MM-DD');

export const fetchNetRatings = () => async dispatch => {
  let response = await fetch('/api/getNetRatings');
  let data = await response.json();

  dispatch({ type: 'FETCH_NET_RATINGS', payload: data});
}

export const fetchWeek = (date = today) => async (dispatch, getState) => {
  const digitDate = moment(date).format('YYYYMMDD');
  const response = await fetch(`/api/fetchWeek/${digitDate}`);
  const data = await response.json();

  const updated = {...data, today};

  const todaysGames = data.weekGames.filter(game => {
    return game.gdte === date;
  });

  dispatch({ type: 'TODAY_GAMES', payload: todaysGames });
  dispatch({ type: 'FETCH_WEEK', payload: updated });
}

export const fetchPlayerProps = () => async (dispatch, getState) => {
  const activeDay = getState().activeDay;
  const response = await axios.get(`/api/fetchPlayerProps/${activeDay}`);
  const data = response.data;
  dispatch({ type: 'FETCH_PLAYER_PROPS', payload: { 
    data,
    fetchedAt: moment().format('YYYY-MM-DD HH:mm:ss')
  }});
}

export const checkActiveGames = () => async (dispatch, getState) => {
  const activeDay = getState().activeDay ?? moment().tz("America/Los_Angeles").format('YYYY-MM-DD');
  dispatch({ type: 'SET_ACTIVE_DAY', payload: activeDay });
  const response = await axios.get(`/todayGameStatus/${activeDay}`);
  const serverActive = response.data.activeGames;
  const serverCompleted = response.data.completedGames;
  const clientActive = getState().activeGames;
  const clientCompleted = getState().completedGames;

  if (!_.isEqual(_.sortBy(clientActive), _.sortBy(serverActive))) {
    dispatch({ type: 'SET_ACTIVE_GAMES', payload: serverActive });
  }

  if (!_.isEqual(_.sortBy(clientCompleted), _.sortBy(serverCompleted))) {
    dispatch({ type: 'SET_COMPLETED_GAMES', payload: serverCompleted });
  }
}

export const fetchPlayerData = (pid) => async dispatch => {
  let playerData = await axios.get(`/api/fetchPlayerData/${pid}`);
  dispatch({ type: 'FETCH_PLAYER_DATA', payload: playerData.data })
}

export const getPlayerMetadata = () => async dispatch => {
  let players = await axios.get('/api/getPlayerMetadata');
  dispatch({ type: 'LOAD_PLAYER_METADATA', payload: players.data.players })
}

export const getTeamNotes = () => async dispatch => {
  const teamNotesFetch = await axios.get('/api/getTeamNotes');
  dispatch({ type: 'SET_TEAM_NOTES', payload: teamNotesFetch.data })
}

export const fetchGame = ({gid}) => async dispatch => {
  let response = await fetch(`/api/fetchGame/${gid}`);
  let data = await response.json();

  let conv = {
    info: data.info,
    odds: data.odds || {},
    matchups: data.matchups,
    netRatingsArr: [data.vNetRtg, data.hNetRtg],
    paceArr: [data.vPace, data.hPace],
    hObj: {},
    vObj: {}
  };

  // These are already ordered by netRtg, from the serverside pull
  const hPlayers = data.rotPlayers.filter(player => player.team_abb === data.info.h[0].ta);
  const vPlayers = data.rotPlayers.filter(player => player.team_abb === data.info.v[0].ta);

  const hBetOn = hPlayers.slice(0, 3);
  const hBetOff = hPlayers.slice(-3);
  const vBetOn = vPlayers.slice(0, 3);
  const vBetOff = vPlayers.slice(-3);
  const hBetOver = _.orderBy(hPlayers, ['total_rating'], ['desc']).slice(0, 3);
  const hBetUnder = _.orderBy(hPlayers, ['total_rating'], ['desc']).slice(-3);
  const vBetOver = _.orderBy(vPlayers, ['total_rating'], ['desc']).slice(0, 3);
  const vBetUnder = _.orderBy(vPlayers, ['total_rating'], ['desc']).slice(-3);

  conv.hObj.netRatings = data.hNetRtg;
  conv.hObj.pace = data.hPace;
  conv.hObj.info = data.hInfo;
  conv.hObj.sched = data.hTen;
  conv.vObj.netRatings = data.vNetRtg;
  conv.vObj.pace = data.vPace;
  conv.vObj.info = data.vInfo;
  conv.vObj.sched = data.vTen;
  conv.rotPlayers = data.rotPlayers;
  conv.hTradStats = data.hTradStats;
  conv.vTradStats = data.vTradStats;
  conv.hBetOn = hBetOn;
  conv.hBetOff = hBetOff;
  conv.vBetOn = vBetOn;
  conv.vBetOff = vBetOff;
  conv.hBetOver = hBetOver;
  conv.hBetUnder = hBetUnder;
  conv.vBetOver = vBetOver;
  conv.vBetUnder = vBetUnder;

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
  const upper = hv.toUpperCase();
  dispatch({ type: `CHANGE_${upper}_COLOR`, payload: colorObj});
}

export const setActiveDay = date => async (dispatch, getState) => {
  const dayGames = getState().week.weekGames.filter(game => game.gdte === date);

  dispatch ({ type: 'SET_ACTIVE_DAY', payload: date });
  dispatch ({ type: 'SET_SCHED_DAY_GAMES', payload: dayGames });
}

export const changeSchedWeek = (week, dir) => async (dispatch) => {
  const url = window.location.href;
  const urlDateMatch = url.match(/\/schedule\/(\d{4}-\d{2}-\d{2})/);
  let urlDate;

  if (urlDateMatch && urlDateMatch[1]) {
    urlDate = urlDateMatch[1];
  } else {
    // If no date is present, create a new date using Moment.js
    urlDate = moment().format("YYYY-MM-DD");
  }
  let baseDay = week.weekArray[0];
  if (dir == "inc") {
    baseDay = moment(baseDay, 'YYYYMMDD').add(7, 'days').format('YYYYMMDD');
  } else if (dir == "dec") {
    baseDay = moment(baseDay, 'YYYYMMDD').subtract(7, 'days').format('YYYYMMDD');
  };

  let baseDayWeek = await fetch(`/api/fetchWeek/${baseDay}`);
  let baseWeekData = await baseDayWeek.json();

  dispatch({ type: 'FETCH_WEEK', payload: baseWeekData });
  dispatch({ type: 'SET_ACTIVE_DAY', payload: urlDate });
}

const updateGamblecast = (game) => async (dispatch) => {
  dispatch ({ type: 'UPDATE_LIVE_SCORE', payload: game})
}

export const fetchDailyBoxScores = () => async (dispatch, getState) => {
  const activeDay = getState().activeDay;
  const dailyBoxScores = await axios.get(`/api/fetchDailyBoxScores/${activeDay}`);
  console.log('dailyBoxScores.data ', dailyBoxScores.data);
  dailyBoxScores.data.forEach(game => {
    dispatch(updateGamblecast(game));
  });
}
 
export const fetchActiveBoxScores = () => async (dispatch, getState) => {
  const activeDay = getState().activeDay;
  console.log('calling fetchActiveBoxScores for activeDay ', activeDay);
  const activeBoxScores = await axios.get(`/api/fetchActiveBoxScores/${activeDay}`);
  console.log('activeBoxScores.data ', activeBoxScores.data);
  activeBoxScores.data.forEach(game => {
    dispatch(updateGamblecast(game));
  });
}
