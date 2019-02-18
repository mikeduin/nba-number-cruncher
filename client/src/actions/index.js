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

export const fetchBoxScore = (id) => async dispatch => {
  let todayInt = moment().format('YYYYMMDD');
  let id = 31800001;
  let game = await axios.get(`/fetchBoxScore/${todayInt}/${id}`);
  let response = game.data;
  console.log('response in action is ', response);

  const calcFgPct = (fgm, fga) => {
    return (((fgm/fga)*100).toFixed(1));
  }

  console.log('totals in action are ', response.totals);

  let liveInfo = {
    gid: id,
    period: response.period.current,
    endOfPeriod: false,
    thru: response.thru_period,
    clock: response.clock,
    poss: response.poss,
    hStats: response.hStats,
    vStats: response.vStats,
    totals: response.totals,
    q1: {
      poss: '',
      h_pts: '',
      h_fgPct: '',
      h_fouls: '',
      v_pts: '',
      v_fgPct: '',
      v_fouls: '',
      t_pts: '',
      t_fgPct: '',
      t_fouls: '',
    },
    q2: {},
    q3: {},
    q4: {}
  }

  if (response.period.endOfPeriod) {
    liveInfo.endOfPeriod = true;
  };

  console.log('live info is ', liveInfo);

  if (liveInfo.period === 1) {
    if (liveInfo.endOfPeriod) {
      let q1 = {
        gid: liveInfo.gid,
        q: 1,
        poss: response.poss,
        h_pts: response.hStats.points,
        h_fgPct: response.hStats.fgPct,
        h_fouls: response.hStats.fouls,
        v_pts: response.vStats.points,
        v_fgPct: response.vStats.fgPct,
        v_fouls: response.vStats.fouls,
        t_pts: parseInt(response.hStats.points) + parseInt(response.vStats.points),
        t_fgPct: calcFgPct((parseInt(response.hStats.fgm) + parseInt(response.vStats.fgm)), (parseInt(response.hStats.fga) + parseInt(response.vStats.fga))),
        t_fouls: parseInt(response.hStats.fouls) + parseInt(response.vStats.fouls)
      }
      dispatch ({ type: 'SEND_SNAPSHOT', payload: q1})
    } else {
      liveInfo.q1 = {
        poss: response.poss,
        h_pts: response.hStats.points,
        h_fgPct: response.hStats.fgPct,
        h_fouls: response.hStats.fouls,
        v_pts: response.vStats.points,
        v_fgPct: response.vStats.fgPct,
        v_fouls: response.vStats.fouls,
        t_pts: parseInt(response.hStats.points) + parseInt(response.vStats.points),
        t_fgPct: calcFgPct((parseInt(response.hStats.fgm) + parseInt(response.vStats.fgm)), (parseInt(response.hStats.fga) + parseInt(response.vStats.fga))),
        t_fouls: parseInt(response.hStats.fouls) + parseInt(response.vStats.fouls)
      }

      dispatch ({type: 'UPDATE_LIVE_SCORE', payload: liveInfo})
    }
  } else if (liveInfo.period === 2) {
    if (liveInfo.endOfPeriod) {
      console.log(
        'end of period in reducer'
      );
      let q2 = {
        gid: liveInfo.gid,
        q: 2,
        poss: response.poss,
        h_pts: response.hStats.points,
        h_fgPct: response.hStats.fgPct,
        h_fouls: response.hStats.fouls,
        v_pts: response.vStats.points,
        v_fgPct: response.vStats.fgPct,
        v_fouls: response.vStats.fouls,
        t_pts: parseInt(response.hStats.points) + parseInt(response.vStats.points),
        t_fgPct: calcFgPct((parseInt(response.hStats.fgm) + parseInt(response.vStats.fgm)), (parseInt(response.hStats.fga) + parseInt(response.vStats.fga))),
        t_fouls: parseInt(response.hStats.fouls) + parseInt(response.vStats.fouls)
      };
      dispatch ({ type: 'SEND_SNAPSHOT', payload: q2})
    } else {
      console.log('mid period in reducer');
      liveInfo.q2 = {
        poss: response.poss,
        h_pts: response.hStats.points,
        h_fgPct: response.hStats.fgPct,
        h_fouls: response.hStats.fouls,
        v_pts: response.vStats.points,
        v_fgPct: response.vStats.fgPct,
        v_fouls: response.vStats.fouls,
        t_pts: parseInt(response.hStats.points) + parseInt(response.vStats.points),
        t_fgPct: calcFgPct((parseInt(response.hStats.fgm) + parseInt(response.vStats.fgm)), (parseInt(response.hStats.fga) + parseInt(response.vStats.fga))),
        t_fouls: parseInt(response.hStats.fouls) + parseInt(response.vStats.fouls)
      }

      dispatch ({type: 'UPDATE_LIVE_SCORE', payload: liveInfo})
    }
  } else if (liveInfo.period === 3) {
    if (liveInfo.endOfPeriod) {
      console.log(
        'end of period in reducer'
      );

      console.log('thru2 stats are ', response.data.prevStats);
      let thruTwo = response.data.prevStats;

      // NEED TO FIX POSSESSSIONS

      let q3 = {
        gid: liveInfo.gid,
        q: 3,
        poss: response.poss,
        h_pts: response.hStats.points - thruTwo.h_total_pts,
        h_fgPct: calcFgPct((parseInt(response.hStats.fgm - thruTwo.h_total_fgm)), (parseInt(response.hStats.fga - thruTwo.h_total_fga))),
        h_fouls: response.hStats.fouls - thruTwo.h_total_fouls,
        v_pts: response.vStats.points - thruTwo.v_total_pts,
        v_fgPct: calcFgPct((parseInt(response.vStats.fgm - thruTwo.v_total_fgm)), (parseInt(response.vStats.fga - thruTwo.v_total_fga))),
        v_fouls: response.vStats.fouls - thruTwo.v_total_fouls,
        t_pts: parseInt(response.hStats.points - thruTwo.h_total_pts) + parseInt(response.vStats.points - thruTwo.v_total_pts),
        t_fgPct: calcFgPct((parseInt(response.hStats.fgm - thruTwo.h_total_fgm) + parseInt(response.vStats.fgm - thruTwo.v_total_fgm)), (parseInt(response.hStats.fga - thruTwo.h_total_fga) + parseInt(response.vStats.fga - thruTwo.v_total_fga))),
        t_fouls: parseInt(response.hStats.fouls - thruTwo.h_total_fouls) + parseInt(response.vStats.fouls - thruTwo.v_total_fouls)
      };
      dispatch ({ type: 'SEND_SNAPSHOT', payload: q3})
    } else {
      console.log('mid period in reducer');
      liveInfo.q3 = {
        poss: response.poss,
        h_pts: response.hStats.points - liveInfo.totals.h_total_pts,
        h_fgPct: response.hStats.fgPct,
        h_fouls: response.hStats.fouls - liveInfo.totals.h_total_fouls,
        v_pts: response.vStats.points - liveInfo.totals.v_total_fouls,
        v_fgPct: response.vStats.fgPct,
        v_fouls: response.vStats.fouls - liveInfo.totals.v_total_fouls,
        t_pts: parseInt(response.hStats.points) + parseInt(response.vStats.points),
        t_fgPct: calcFgPct((parseInt(response.hStats.fgm) + parseInt(response.vStats.fgm)), (parseInt(response.hStats.fga) + parseInt(response.vStats.fga))),
        t_fouls: parseInt(response.hStats.fouls) + parseInt(response.vStats.fouls)
      }

      dispatch ({type: 'UPDATE_LIVE_SCORE', payload: liveInfo})
    }
  } else if (liveInfo.period === 4) {
    if (liveInfo.endOfPeriod) {
      console.log(
        'end of period in reducer'
      );
      liveInfo.q4 = {
        gid: liveInfo.gid,
        q: 4,
        poss: response.poss,
        h_pts: response.hStats.points,
        h_fgPct: response.hStats.fgPct,
        h_fouls: response.hStats.fouls,
        v_pts: response.vStats.points,
        v_fgPct: response.vStats.fgPct,
        v_fouls: response.vStats.fouls,
        t_pts: parseInt(response.hStats.points) + parseInt(response.vStats.points),
        t_fgPct: calcFgPct((parseInt(response.hStats.fgm) + parseInt(response.vStats.fgm)), (parseInt(response.hStats.fga) + parseInt(response.vStats.fga))),
        t_fouls: parseInt(response.hStats.fouls) + parseInt(response.vStats.fouls)
      };
      dispatch ({ type: 'SEND_SNAPSHOT', payload: liveInfo})
    } else {
      console.log('mid period in reducer');
      liveInfo.q4 = {
        poss: response.poss,
        h_pts: response.hStats.points - liveInfo.totals.h_total_pts,
        h_fgPct: response.hStats.fgPct,
        h_fouls: response.hStats.fouls - liveInfo.totals.h_total_fouls,
        v_pts: response.vStats.points - liveInfo.totals.v_total_pts,
        v_fgPct: response.vStats.fgPct,
        v_fouls: response.vStats.fouls - liveInfo.totals.v_total_fouls,
        t_pts: parseInt(response.hStats.points - liveInfo.totals.h_total_pts) + parseInt(response.vStats.points - liveInfo.totals.v_total_pts),
        t_fgPct: calcFgPct((parseInt(response.hStats.fgm - liveInfo.totals.h_total_fgm) + parseInt(response.vStats.fgm - liveInfo.totals.v_total_fgm)), (parseInt(response.hStats.fga - liveInfo.totals.h_total_fga) + parseInt(response.vStats.fga - liveInfo.totals.v_total_fga))),
        t_fouls: parseInt(response.hStats.fouls - liveInfo.totals.h_total_fouls) + parseInt(response.vStats.fouls - liveInfo.totals.v_total_fouls)
      }

      dispatch ({type: 'UPDATE_LIVE_SCORE', payload: liveInfo})
    }
  }



}
