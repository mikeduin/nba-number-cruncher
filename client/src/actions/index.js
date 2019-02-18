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

export const fetchBoxScore = (id) => async (dispatch, getState) => {
  let todayInt = moment().format('YYYYMMDD');
  let id = 31800001;
  let game = await axios.get(`/fetchBoxScore/${todayInt}/${id}`);
  let response = game.data;

  const calcFgPct = (fgm, fga) => {
    return (((fgm/fga)*100).toFixed(1));
  }

  let stateData = getState()[`live_${id}`];

  let liveData = {
    gid: id,
    period: response.period.current,
    endOfPeriod: false,
    thru: response.thru_period,
    gameSecs: response.gameSecs,
    clock: response.clock,
    poss: response.poss,
    pace: response.pace
    // liveTotals: response.totals
    // q1: {},
    // q2: {},
    // q3: {},
    // q4: {},
    // ot: {},
    // prevQuarters: {}
  }

  let currentQuarter = {
    h: {
      pts: parseInt(response.totals.h.pts) - stateData.prevQuarters.h.pts,
      fgm: parseInt(response.totals.h.fgm) - stateData.prevQuarters.h.fgm,
      fga: parseInt(response.totals.h.fga) - stateData.prevQuarters.h.fga,
      fgPct: calcFgPct((parseInt(response.totals.h.fgm)-stateData.prevQuarters.h.fgm), (parseInt(response.totals.h.fga) - stateData.prevQuarters.h.fga)),
      fta: parseInt(response.totals.h.fta) - stateData.prevQuarters.h.fta,
      to: parseInt(response.totals.h.turnovers) - stateData.prevQuarters.h.to,
      offReb: parseInt(response.totals.h.offReb) - stateData.prevQuarters.h.offReb,
      fouls: parseInt(response.totals.h.pFouls) - stateData.prevQuarters.h.fouls
    },
    v: {
      pts: parseInt(response.totals.v.pts) - stateData.prevQuarters.v.pts,
      fgm: parseInt(response.totals.v.fgm) - stateData.prevQuarters.v.fgm,
      fga: parseInt(response.totals.v.fga) - stateData.prevQuarters.v.fga,
      fgPct: calcFgPct((parseInt(response.totals.v.fgm)-stateData.prevQuarters.v.fgm), (parseInt(response.totals.v.fga) - stateData.prevQuarters.v.fga)),
      fta: parseInt(response.totals.v.fta) - stateData.prevQuarters.v.fta,
      to: parseInt(response.totals.v.turnovers) - stateData.prevQuarters.v.to,
      offReb: parseInt(response.totals.v.offReb) - stateData.prevQuarters.v.offReb,
      fouls: parseInt(response.totals.v.pFouls) - stateData.prevQuarters.v.fouls
    },
    t: {
      pts: (response.totals.h.pts + response.totals.v.pts) - stateData.prevQuarters.t.pts,
      fgm: (response.totals.h.fgm + response.totals.v.fgm) - stateData.prevQuarters.t.fgm,
      fga: (response.totals.h.fga + response.totals.v.fga) - stateData.prevQuarters.t.fga,
      fgPct: calcFgPct(
        ((response.totals.h.fgm + response.totals.v.fgm) - stateData.prevQuarters.t.fgm),
        ((response.totals.h.fga + response.totals.v.fga) - stateData.prevQuarters.t.fga)
      ),
      fta: (response.totals.h.fta + response.totals.v.fta) - stateData.prevQuarters.t.fta,
      to: (response.totals.h.turnovers + response.totals.v.turnovers) - stateData.prevQuarters.t.to,
      offReb: (response.totals.h.offReb + response.totals.v.offReb) - stateData.prevQuarters.t.offReb,
      fouls: (response.totals.h.pFouls + response.totals.v.pFouls) - stateData.prevQuarters.t.fouls,
      poss: poss - stateData.prevQuarters.poss,
      // FIX PACE, THIS IS NOT ACCURATE
      pace: ( ( (poss - stateData.prevQuarters.poss) * 4) / 2)
    }
  }

  let endOfQuarterData = response.quarter;

  if (response.period.endOfPeriod) {
    liveData.endOfPeriod = true
  };

  console.log('live data is ', liveData);

  // NEED TO ADD FUNCTION TO CALCULATE PREV QUARTERS AFTER EACH QUARTER

  if (response.period.endOfPeriod) {
    console.log('end of period in action, current period is ', response.period.current);
    perToUpdate = response.period.current;
    let snapshot = {...endOfQuarterData, q: perToUpdate};

    dispatch ({ type: 'ADD_SNAPSHOT', payload: snapshot})
  } else {
    console.log('period ongoing, current period is ', response.period.current);
    perToUpdate = response.period.current;
    let inQuarter = {...liveData, ...currentQuarter, q: perToUpdate}

    dispatch ({ type: 'UPDATE_LIVE_SCORE', payload: inQuarter})
  }



  if (liveData.period === 1) {
    if (liveData.endOfPeriod) {
      let q1 = {
        gid: id,
        q: 1,
        poss: response.poss,
        pace: response.pace,
        h_pts: response.totals.h.pts,
        h_fgPct: response.totals.h.fgPct,
        h_fouls: response.totals.h.fouls,
        v_pts: response.totals.v.pts,
        v_fgPct: response.totals.v.fgPct,
        v_fouls: response.totals.v.fouls,
        t_pts: response.totals.t.pts,
        t_fgPct: response.totals.t.fgPct,
        t_fouls: response.totals.t.fouls
      };

      dispatch ({ type: 'ADD_SNAPSHOT', payload: q1})
    } else {
      liveData.q1 = {
        gid: id,
        poss: response.poss,
        pace: response.pace,
        h_pts: response.totals.h.pts,
        h_fgPct: response.totals.h.fgPct,
        h_fouls: response.totals.h.fouls,
        v_pts: response.totals.v.pts,
        v_fgPct: response.totals.v.fgPct,
        v_fouls: response.totals.v.fouls,
        t_pts: response.totals.t.pts,
        t_fgPct: response.totals.t.fgPct,
        t_fouls: response.totals.t.fouls
      };

      dispatch ({type: 'UPDATE_LIVE_SCORE', payload: liveData})
    }
  } else if (liveData.period === 2) {
    if (liveData.endOfPeriod) {
      console.log(
        'end of period in reducer'
      );
      let q2 = {
        gid: id,
        q: 2,
        poss: response.poss,
        pace: response.pace,
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
      dispatch ({ type: 'ADD_SNAPSHOT', payload: q2})
    } else {
      console.log('mid period in reducer');
      liveData.q3 = {
        gid: id,
        poss: response.poss,
        pace: response.pace,
        h_pts: response.totals.h.pts,
        h_fgPct: response.totals.h.fgPct,
        h_fouls: response.totals.h.fouls,
        v_pts: response.totals.v.pts,
        v_fgPct: response.totals.v.fgPct,
        v_fouls: response.totals.v.fouls,
        t_pts: response.totals.t.pts,
        t_fgPct: response.totals.t.fgPct,
        t_fouls: response.totals.t.fouls
      }

      dispatch ({type: 'UPDATE_LIVE_SCORE', payload: liveData})
    }
  } else if (liveData.period === 3) {
    if (liveData.endOfPeriod) {
      console.log(
        'end of period in reducer'
      );

      let q3 = {
        gid: id,
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
      dispatch ({ type: 'ADD_SNAPSHOT', payload: q3})
    } else {
      console.log('mid period in reducer');
      liveData.q3 = {
        poss: response.poss,
        h_pts: response.hStats.points - liveData.totals.h_total_pts,
        h_fgPct: response.hStats.fgPct,
        h_fouls: response.hStats.fouls - liveData.totals.h_total_fouls,
        v_pts: response.vStats.points - liveData.totals.v_total_fouls,
        v_fgPct: response.vStats.fgPct,
        v_fouls: response.vStats.fouls - liveData.totals.v_total_fouls,
        t_pts: parseInt(response.hStats.points) + parseInt(response.vStats.points),
        t_fgPct: calcFgPct((parseInt(response.hStats.fgm) + parseInt(response.vStats.fgm)), (parseInt(response.hStats.fga) + parseInt(response.vStats.fga))),
        t_fouls: parseInt(response.hStats.fouls) + parseInt(response.vStats.fouls)
      }

      dispatch ({type: 'UPDATE_LIVE_SCORE', payload: liveData})
    }
  } else if (liveData.period === 4) {
    if (liveData.endOfPeriod) {
      console.log(
        'end of period in reducer'
      );
      liveData.q4 = {
        gid: id,
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
      dispatch ({ type: 'ADD_SNAPSHOT', payload: liveData})
    } else {
      console.log('mid period in reducer');
      liveData.q4 = {
        poss: response.poss,
        h_pts: response.hStats.points - liveData.totals.h_total_pts,
        h_fgPct: response.hStats.fgPct,
        h_fouls: response.hStats.fouls - liveData.totals.h_total_fouls,
        v_pts: response.vStats.points - liveData.totals.v_total_pts,
        v_fgPct: response.vStats.fgPct,
        v_fouls: response.vStats.fouls - liveData.totals.v_total_fouls,
        t_pts: parseInt(response.hStats.points - liveData.totals.h_total_pts) + parseInt(response.vStats.points - liveData.totals.v_total_pts),
        t_fgPct: calcFgPct((parseInt(response.hStats.fgm - liveData.totals.h_total_fgm) + parseInt(response.vStats.fgm - liveData.totals.v_total_fgm)), (parseInt(response.hStats.fga - liveData.totals.h_total_fga) + parseInt(response.vStats.fga - liveData.totals.v_total_fga))),
        t_fouls: parseInt(response.hStats.fouls - liveData.totals.h_total_fouls) + parseInt(response.vStats.fouls - liveData.totals.v_total_fouls)
      }

      dispatch ({type: 'UPDATE_LIVE_SCORE', payload: liveData})
    }
  }



}
