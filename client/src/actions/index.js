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

  let { totals, period, clock, poss, pace, gameSecs, thru_period } = response;

  const calcFgPct = (fgm, fga) => {
    return (((fgm/fga)*100).toFixed(1));
  };

  const calcQuarterPace = (poss, per, clock) => {
    let secs = 0;
    if (per < 4) {
      secs = (((11-parseInt(clock.slice(0, 2)))*60) + (60-parseInt(clock.slice(3, 5))) );
      return (((720/secs) * poss)/2)
    } else {
      secs = (((4-parseInt(clock.slice(0, 2)))*60) + (60-parseInt(clock.slice(3, 5))) )
      return (((300/secs) * poss)/2)
    };
  };

  let stateData = getState()[`live_${id}`];
  let { prevQuarters } = stateData;

  let liveData = {
    gid: id,
    period: period.current,
    endOfPeriod: false,
    thru: thru_period,
    gameSecs,
    clock,
    poss,
    pace,
    totals
  };

  let currentQuarter = {
    h: {
      pts: parseInt(totals.h.pts) - prevQuarters.h.pts,
      fgm: parseInt(totals.h.fgm) - prevQuarters.h.fgm,
      fga: parseInt(totals.h.fga) - prevQuarters.h.fga,
      fgPct: calcFgPct((parseInt(totals.h.fgm)-prevQuarters.h.fgm), (parseInt(totals.h.fga) - prevQuarters.h.fga)),
      fta: parseInt(totals.h.fta) - prevQuarters.h.fta,
      to: parseInt(totals.h.turnovers) - prevQuarters.h.to,
      offReb: parseInt(totals.h.offReb) - prevQuarters.h.offReb,
      fouls: parseInt(totals.h.pFouls) - prevQuarters.h.fouls
    },
    v: {
      pts: parseInt(totals.v.pts) - prevQuarters.v.pts,
      fgm: parseInt(totals.v.fgm) - prevQuarters.v.fgm,
      fga: parseInt(totals.v.fga) - prevQuarters.v.fga,
      fgPct: calcFgPct(
        (parseInt(totals.v.fgm) - prevQuarters.v.fgm),
        (parseInt(totals.v.fga) - prevQuarters.v.fga)
      ),
      fta: parseInt(totals.v.fta) - prevQuarters.v.fta,
      to: parseInt(totals.v.turnovers) - prevQuarters.v.to,
      offReb: parseInt(totals.v.offReb) - prevQuarters.v.offReb,
      fouls: parseInt(totals.v.pFouls) - prevQuarters.v.fouls
    },
    t: {
      pts: (totals.h.pts + totals.v.pts) - prevQuarters.t.pts,
      fgm: (totals.h.fgm + totals.v.fgm) - prevQuarters.t.fgm,
      fga: (totals.h.fga + totals.v.fga) - prevQuarters.t.fga,
      fgPct: calcFgPct(
        ((totals.h.fgm + totals.v.fgm) - prevQuarters.t.fgm),
        ((totals.h.fga + totals.v.fga) - prevQuarters.t.fga)
      ),
      fta: (totals.h.fta + totals.v.fta) - prevQuarters.t.fta,
      to: (totals.h.turnovers + totals.v.turnovers) - prevQuarters.t.to,
      offReb: (totals.h.offReb + totals.v.offReb) - prevQuarters.t.offReb,
      fouls: (totals.h.pFouls + totals.v.pFouls) - prevQuarters.t.fouls,
      poss: poss - prevQuarters.poss,
      pace: calcQuarterPace(poss, period.current, clock)
    }
  };

  let endOfQuarterData = response.quarter;

  if (period.endOfPeriod) {
    console.log('end of period in action, current period is ', period.current);
    let perToUpdate = period.current;

    let snapshot = {
      quarterData: endOfQuarterData,
      prevQuarters: totals,
      q: perToUpdate
    };

    dispatch ({ type: 'ADD_SNAPSHOT', payload: snapshot})
  } else {
    console.log('period ongoing, current period is ', period.current);
    let perToUpdate = period.current;

    let inQuarter = {
      ...liveData,
      currentQuarter: currentQuarter,
      q: perToUpdate
    }

    dispatch ({ type: 'UPDATE_LIVE_SCORE', payload: inQuarter})
  };
}
