import axios from 'axios';
import moment from 'moment-timezone';
import _ from 'lodash';
import { getGameSecs } from '../modules/gameTimeFuncs';
import { calcFgPct, calcPoss, calcQuarterPace } from '../utils/boxScoreHelpers';

// let today = moment().subtract(8, 'hours').format('YYYY-MM-DD');
let today = moment().tz("America/Los_Angeles").format('YYYY-MM-DD');

export const fetchNetRatings = () => async dispatch => {
  let response = await fetch('/api/getNetRatings');
  let data = await response.json();

  dispatch({ type: 'FETCH_NET_RATINGS', payload: data});
}

export const fetchWeek = (date = today) => async (dispatch, getState) => {
  // let digitDate = moment(date).format('YYYYMMDD'); // UPDATE
  let digitDate = moment(date).format('20240427');
  let response = await fetch(`/api/fetchWeek/${digitDate}`);
  let data = await response.json();

  console.log('data in fetchWeek is ', data);

  let updated = {...data, today};

  let todaysGames = data.weekGames.filter(game => {
    // return game.gdte === today;
    return game.gdte === '2024-04-27'; // UPDATE
  });

  dispatch({ type: 'TODAY_GAMES', payload: todaysGames });
  dispatch({ type: 'FETCH_WEEK', payload: updated });
}

export const fetchPlayerProps = () => async (dispatch) => {
  const response = await axios.get('/api/fetchPlayerProps');
  const data = response.data;
  dispatch({ type: 'FETCH_PLAYER_PROPS', payload: { 
    data,
    fetchedAt: moment().format('YYYY-MM-DD HH:mm:ss')
  }});
}

export const checkActiveGames = () => async (dispatch, getState) => {
  const response = await axios.get('/todayGameStatus');
  // console.log('checkActiveGames response is ', response)
  const serverActive = response.data.activeGames;
  const serverCompleted = response.data.completedGames;
  const clientActive = getState().activeGames;
  const clientCompleted = getState().completedGames;

  if (!_.isEqual(_.sortBy(clientActive), _.sortBy(serverActive))) {
    console.log('modifying active games');
    dispatch({ type: 'SET_ACTIVE_GAMES', payload: serverActive });
  }

  if (!_.isEqual(_.sortBy(clientCompleted), _.sortBy(serverCompleted))) {
    console.log('modifying completed games');
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

export const fetchGame = ({gid}) => async dispatch => {
  let response = await fetch(`/api/fetchGame/${gid}`);
  let data = await response.json();
  // both Obj and Arr data types ideal for custom component injection
  console.log('data in response is ', data);

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

export const setActiveDay = date => async dispatch => {
  const dayGamePull = await fetch(`/api/fetchGames/${date}`);
  const dayGameData = await dayGamePull.json();

  dispatch ({ type: 'SET_ACTIVE_DAY', payload: date });
  dispatch ({ type: 'SET_SCHED_DAY_GAMES', payload: dayGameData.dayGames });
}

export const changeSchedWeek = (week, dir) => async (dispatch, getState) => {
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

  const dayGamePull = await fetch(`/api/fetchGames/${urlDate}`);
  const dayGameData = await dayGamePull.json();

  dispatch({ type: 'FETCH_WEEK', payload: baseWeekData });
  dispatch({ type: 'SET_ACTIVE_DAY', payload: urlDate });
  dispatch({ type: 'SET_SCHED_DAY_GAMES', payload: dayGameData.dayGames });
}

export const fetchActiveBoxScores = () => async (dispatch, getState) => {
  const activeGames = getState().activeGames;
  console.log('active games in fetchActiveBoxScores are ', activeGames);
  // const activeBoxScores = await axios.get('/api/fetchActiveBoxScores');
  // activeBoxScores.data.forEach(game => {
  //   if (game.final) {
  //     dispatch({ type: 'SET_FINAL_BOX_SCORE', payload: game });
  //   }

  //   if (game.init) {
  //     dispatch({ type: 'INITIALIZE_BOX_SCORE', payload: game });
  //   }

  //   if (game.live) {
  //     const { totals, period, clock, poss, pace, playerStats, gameSecs, thru_period } = game;

  //     const liveData = {
  //       gid: game.gid,
  //       active: true,
  //       period,
  //       endOfPeriod: false,
  //       gameSecs,
  //       clock,
  //       poss,
  //       pace,
  //       totals,
  //       playerStats
  //     };

  //     if (game.quarterEnd) {
  //       let perToUpdate = thru_period;
  //       let endOfQuarterData = game.quarter;
  //       let prevQuarters = game.prevQuarters;
  
  //       if (getState().gambleCast[`live_${game.gid}`]) {
  //         const perToUpdPts = endOfQuarterData.t.pts;
  //         if (perToUpdPts !== 0) {
  //           // REMEMBER TO ACCOUNT FOR OT HERE! NOT SURE WHAT THAT READS, as far as perToUpdate goes
  //           let snapshot = { ...liveData, totals, perToUpdate, endOfQuarterData, prevQuarters};
  //           dispatch ({ type: 'ADD_SNAPSHOT', payload: snapshot})
  //         }
  //       }
  //     } else {

  //     }
  //   }
  // });
  // console.log('activeBoxScores are ', activeBoxScores);
}

export const fetchBoxScore = (gid, init, vAbb, hAbb) => async (dispatch, getState) => {
  // For testing
  // let todayInt = '20190314';
  let todayInt = moment().tz("America/Los_Angeles").format('YYYYMMDD');
  const game = await axios.get(`/fetchBoxScore/${todayInt}/${gid}/${init}/${vAbb}/${hAbb}`);
  const response = game.data;

  if (response.final) {
    dispatch ({ type: 'SET_FINAL_BOX_SCORE', payload: response });
    return;
  }

  if (response.init) {
    dispatch ({ type: 'INITIALIZE_BOX_SCORE', payload: response });
    return;
  }

  // console.log('response in fetchBoxScore is ', response);

  // are things not showing up because it's not live in response?
  if (response.live) {
    const { totals, period, clock, poss, pace, playerStats, gameSecs, thru_period } = response;
    
    let liveData = {
      gid: gid,
      active: true,
      period,
      endOfPeriod: false,
      gameSecs,
      clock,
      poss,
      pace,
      totals,
      playerStats
    };

    if (response.quarterEnd) { // at end of quarter
      let perToUpdate = thru_period;
      let endOfQuarterData = response.quarter;
      let prevQuarters = response.prevQuarters;

      if (getState().gambleCast[`live_${gid}`]) {
        const perToUpdPts = endOfQuarterData.t.pts;
        if (perToUpdPts !== 0) {
          // REMEMBER TO ACCOUNT FOR OT HERE! NOT SURE WHAT THAT READS, as far as perToUpdate goes
          let snapshot = { ...liveData, gid, totals, perToUpdate, endOfQuarterData, prevQuarters};
          dispatch ({ type: 'ADD_SNAPSHOT', payload: snapshot})
        }
      }
    } else { // quarter in progress
      let perToUpdate = period;
      let inQuarter = {};

      if (period === 1) {
        inQuarter = {
          ...liveData,
          perToUpdate,
          clock,
          quarterData: totals,
          q1: totals
        };
        dispatch ({ type: 'UPDATE_LIVE_SCORE', payload: inQuarter})

      } else {

        let prevQuarters = response.prevQuarters;
        let perToUpdate = period;

        const quarterPoss = calcPoss(
          ( (parseInt(totals?.h.fga) + parseInt(totals?.v.fga))
              - parseInt(prevQuarters?.t.fga)),
          ( (parseInt(totals?.h.to) + parseInt(totals?.v.to))
              - parseInt(prevQuarters?.t.to)),
          ( (parseInt(totals?.h.fta) + parseInt(totals?.v.fta))
              - parseInt(prevQuarters?.t.fta)),
          ( (parseInt(totals?.h.offReb) + parseInt(totals?.v.offReb))
              - parseInt(prevQuarters?.t.offReb))
        );

        let currentQuarter = {
            h: {
              pts: parseInt(totals?.h.pts) - parseInt(prevQuarters?.h.pts),
              fgm: parseInt(totals?.h.fgm) - parseInt(prevQuarters?.h.fgm),
              fga: parseInt(totals?.h.fga) - parseInt(prevQuarters?.h.fga),
              fgPct: calcFgPct((parseInt(totals?.h.fgm)-prevQuarters?.h.fgm), (parseInt(totals?.h.fga) - parseInt(prevQuarters?.h.fga))),
              fta: parseInt(totals?.h.fta) - parseInt(prevQuarters?.h.fta),
              to: parseInt(totals?.h.to) - parseInt(prevQuarters?.h.to),
              offReb: parseInt(totals?.h.offReb) - parseInt(prevQuarters?.h.offReb),
              fouls: parseInt(totals?.h.fouls) - parseInt(prevQuarters?.h.fouls)
            },
            v: {
              pts: parseInt(totals?.v.pts) - parseInt(prevQuarters?.v.pts),
              fgm: parseInt(totals?.v.fgm) - parseInt(prevQuarters?.v.fgm),
              fga: parseInt(totals?.v.fga) - parseInt(prevQuarters?.v.fga),
              fgPct: calcFgPct(
                (parseInt(totals?.v.fgm) - parseInt(prevQuarters?.v.fgm)),
                (parseInt(totals?.v.fga) - parseInt(prevQuarters?.v.fga))
              ),
              fta: parseInt(totals?.v.fta) - parseInt(prevQuarters?.v.fta),
              to: parseInt(totals?.v.to) - parseInt(prevQuarters?.v.to),
              offReb: parseInt(totals?.v.offReb) - parseInt(prevQuarters?.v.offReb),
              fouls: parseInt(totals?.v.fouls) - parseInt(prevQuarters?.v.fouls)
            },
            t: {
              pts: (parseInt(totals?.h.pts) + parseInt(totals?.v.pts)) - parseInt(prevQuarters?.t.pts),
              fgm: (parseInt(totals?.h.fgm) + parseInt(totals?.v.fgm)) - parseInt(prevQuarters?.t.fgm),
              fga: (parseInt(totals?.h.fga) + parseInt(totals?.v.fga)) - parseInt(prevQuarters?.t.fga),
              fgPct: calcFgPct(
                ((parseInt(totals?.h.fgm) + parseInt(totals?.v.fgm)) - parseInt(prevQuarters?.t.fgm)),
                ((parseInt(totals?.h.fga) + parseInt(totals?.v.fga)) - parseInt(prevQuarters?.t.fga))
              ),
              fta: (parseInt(totals?.h.fta) + parseInt(totals?.v.fta)) - parseInt(prevQuarters?.t.fta),
              to: (parseInt(totals?.h.to) + parseInt(totals?.v.to)) - parseInt(prevQuarters?.t.to),
              offReb: (parseInt(totals?.h.offReb) + parseInt(totals?.v.offReb)) - parseInt(prevQuarters?.t.offReb),
              fouls: (parseInt(totals?.h.fouls) + parseInt(totals?.v.fouls)) - parseInt(prevQuarters?.t.fouls),
              poss: quarterPoss,
              pace: calcQuarterPace(quarterPoss, period, gameSecs)
            }
        }

        inQuarter = {
          ...liveData,
          perToUpdate,
          [`q${currentQuarter}`]: currentQuarter,
          quarterData: currentQuarter
        }

        dispatch ({ type: 'UPDATE_LIVE_SCORE', payload: inQuarter})
      };

    };
  }
}
