import axios from 'axios';
import moment from 'moment';
import { getGameSecs } from '../modules/gameTimeFuncs';

let today = moment().format('YYYY-MM-DD');

export const fetchNetRatings = () => async dispatch => {
  let response = await fetch('/api/getNetRatings');
  let data = await response.json();

  dispatch({ type: 'FETCH_NET_RATINGS', payload: data});
}

export const fetchWeek = (date = today) => async (dispatch, getState) => {
  let digitDate = moment(date).format('YYYYMMDD');
  let response = await fetch(`/api/fetchWeek/${digitDate}`);
  let data = await response.json();

  let updated = {...data, today};

  let todaysGames = data.weekGames.filter(game => {
    // For testing
    // return game.gdte === '2019-02-25';
    return game.gdte === today;
  });

  let activeGames = getState().activeGames;
  let completedGames = getState().completedGames;
  console.log('activeGames in fetchWeek are ', activeGames);

  todaysGames.forEach(game => {
    // if the game is within 10 minutes from now, set it to active
    let tenMinsAhead = moment().add(10, 'm');
    let threeHourMinsAhead = tenMinsAhead.add(3, 'h');
    let gametime = moment(game.etm);
    if (gametime.isBefore(threeHourMinsAhead) && completedGames.indexOf(game.gid) === -1) {
      activeGames.push(game.gid);
    };
  });

  dispatch({ type: 'TODAY_GAMES', payload: todaysGames });
  dispatch({ type: 'FETCH_WEEK', payload: updated });
  dispatch({ type: 'SET_ACTIVE_GAMES', payload: activeGames });
}

export const checkActiveGames = () => async (dispatch, getState) => {

  let todaysGames = getState().todaysGames;
  let activeGames = getState().activeGames;
  let completedGames = getState().completedGames;

  todaysGames.forEach(game => {
    let tenMinsAhead = moment().add(20, 'm');
    let threeHourTenMinsAhead = tenMinsAhead.add(3, 'h');
    let gametime = moment(game.etm);

    let jsonGametime = JSON.stringify(moment(gametime));
    let jsonNow = JSON.stringify(moment());

    // jsonNow == 8 hours ahead, UTC Time
    // jsonGametime == 11 hours ahead, eastern UTC time

    if (gametime.isBefore(threeHourTenMinsAhead) && activeGames.indexOf(game.gid) === -1 && completedGames.indexOf(game.gid) === -1) {
      console.log('game is ', game.gid, ' being set to live from checkActiveGames function');
      dispatch({ type: 'SET_TO_LIVE', payload: game.gid });
    };
  })

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
  let conv = {
    info: data.info,
    odds: data.odds || {},
    matchups: data.matchups,
    netRatingsArr: [data.vNetRtg, data.hNetRtg],
    paceArr: [data.vPace, data.hPace],
    hObj: {},
    vObj: {}
  };

  const hPlayers = data.rotPlayers.filter(player => player.team_abb === data.info.h[0].ta);
  const vPlayers = data.rotPlayers.filter(player => player.team_abb === data.info.v[0].ta);

  const hImpact = hPlayers.slice(0, 3).concat(hPlayers.slice(-3));
  const vImpact = vPlayers.slice(0, 3).concat(hPlayers.slice(-3));

  conv.hObj.netRatings = data.hNetRtg;
  conv.hObj.pace = data.hPace;
  conv.hObj.info = data.hInfo;
  conv.hObj.sched = data.hTen;
  conv.vObj.netRatings = data.vNetRtg;
  conv.vObj.pace = data.vPace;
  conv.vObj.info = data.vInfo;
  conv.vObj.sched = data.vTen;
  conv.rotPlayers = data.rotPlayers;
  conv.hImpact = hImpact;
  conv.vImpact = vImpact;

  // even using this anymore?
  // let hPlayers = data.hPlayers;
  // let vPlayers = data.vPlayers;

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

export const setActiveDay = date => async dispatch => {
  dispatch ({type: 'SET_ACTIVE_DAY', payload: date});
}

export const fetchBoxScore = (gid) => async (dispatch, getState) => {
  // For testing
  // let todayInt = '20190225';
  let todayInt = moment().format('YYYYMMDD');

  let gameFinal = false;

  // if (!getState().gambleCast[`live_${gid}`]) {
  //   console.log('game is not in state! Loading initial data');
  //   const initLoad = await axios.get(`/initDataLoad/${todayInt}/${gid}`);
  //   const initData = initLoad.data;
  //   console.log('initData is ', initData);
  //
  //   const q1 = initData.q1 == null ? null : initData.q1[0];
  //   const q2 = initData.q2 == null ? null : initData.q2[0];
  //   const q3 = initData.q3 == null ? null : initData.q3[0];
  //   const q4 = initData.q4 == null ? null : initData.q4[0];
  //   const ot = initData.ot == null ? null : initData.ot[0];
  //   gameFinal = initData.final == null ? null : initData.final[0];
  //
  //   const initDataLoad = {
  //     gid: gid,
  //     prevTotals: initData.prevTotals,
  //     q1: q1,
  //     q2: q2,
  //     q3: q3,
  //     q4: q4,
  //     ot: ot,
  //     final: gameFinal,
  //     active: true,
  //     poss: initData.totals.t.poss
  //   };
  //
  //   dispatch({ type: 'INIT_DATA_LOAD', payload: initDataLoad });
  // }

  // if (gameFinal) {
  //   // build something in here that, when a game is final, adds to completed games in state
  //   // to do this, I need a measure for if a game is completed in index
  //   // game is over AND last period stats have been updated
  //
  //   let activeGames = getState().activeGames;
  //   let completedGames = getState().completedGames;
  //   if (activeGames.indexOf(gid) !== -1 && completedGames.indexOf(gid) !== -1) {
  //     // remove active game
  //     dispatch({ type: 'SET_TO_FINAL', payload: gid });
  //     // add completed game
  //     dispatch({ type: 'SET_COMPLETED_GAME', payload: gid });
  //
  //   }
  //   return;
  // }

  const game = await axios.get(`/fetchBoxScore/${todayInt}/${gid}`);
  const response = game.data;

  console.log('response for ', gid, ' is ', response);

  // are things not showing up because it's not live in response?
  if (response.live) {
    let { totals, period, clock, poss, pace, gameSecs, thru_period } = response;

    const calcFgPct = (fgm, fga) => {
      return (((fgm/fga)*100).toFixed(1));
    };

    const calcPoss = (fga, to, fta, oreb) => {
      // console.log('in calcPoss, fga are ', fga, ' and to are ', to, ' and fta are ', fta, ' and oreb are ', oreb);
      return (0.96*((fga+to+(0.44*fta)-oreb)));
    };

    const calcQuarterPace = (quarterPoss, per, gameSecs) => {
      // console.log('quarterPoss in quarter pace are ', quarterPoss);
      let pace = 0;
      if (per < 5) {
        let quarterSecs = (parseInt(gameSecs) - (720*parseInt(per-1)));
        // console.log('gameSecs are ', gameSecs, ' and quarterSecs are ', quarterSecs);
        pace = ((((720/quarterSecs)*quarterPoss)*4)/2);
      } else {
        let quarterSecs = (parseInt(gameSecs) - 2880 - (300*parseInt(per-4)));
        // console.log('gameSecs are ', gameSecs, ' and quarterSecs are ', quarterSecs);
        pace = ((((300/quarterSecs)*quarterPoss)*4)/2)
      };

      // console.log('pace in calcQuarterPace is ', pace);
      if (pace == null) {
        return 0
      } else {
        return pace
      };
    }

    const calcGamePace = (poss, per, gameSecs) => {
      // console.log('possInput in game pace are ', poss);
      let pace = 0;
      if (per < 5) {
        pace = (((2880/gameSecs)*poss)/2)
      } else {
        pace = ((2880+((300*(per-4))/gameSecs)*poss)/2)
      };
      if (pace == null) {
        return 0
      } else {
        return pace
      };
    }

    let liveData = {
      gid: gid,
      active: true,
      period: period.current,
      endOfPeriod: false,
      thru: thru_period,
      gameSecs,
      clock,
      poss,
      pace,
      totals
    };

    if (response.quarterEnd) {
      let perToUpdate = response.thru_period;
      let endOfQuarterData = response.quarter;
      let prevQuarters = response.prevQuarters;

      // REMEMBER TO ACCOUNT FOR OT HERE! NOT SURE WHAT THAT READS, as far as perToUpdate goes

      let snapshot = { gid, totals, perToUpdate, endOfQuarterData, prevQuarters};

      dispatch ({ type: 'ADD_SNAPSHOT', payload: snapshot})
    } else {
      // console.log('period ongoing, current period is ', period.current);
      let perToUpdate = period.current;
      let inQuarter = {};

      // console.log('calcGamePace is ', calcGamePace(poss, period.current, gameSecs));

      if (period.current === 1) {
        inQuarter = {
          ...liveData,
          perToUpdate,
          clock,
          quarterData: totals
        };
        dispatch ({ type: 'UPDATE_LIVE_SCORE', payload: inQuarter})

      } else {

        let prevQuarters = response.prevQuarters;
        // let prevQuarters = getState().prevQuarters;
        let perToUpdate = period.current;

        const quarterPoss = calcPoss(
          ( (parseInt(totals.h.fga) + parseInt(totals.v.fga))
              - parseInt(prevQuarters.t.fga)),
          ( (parseInt(totals.h.to) + parseInt(totals.v.to))
              - parseInt(prevQuarters.t.to)),
          ( (parseInt(totals.h.fta) + parseInt(totals.v.fta))
              - parseInt(prevQuarters.t.fta)),
          ( (parseInt(totals.h.offReb) + parseInt(totals.v.offReb))
              - parseInt(prevQuarters.t.offReb))
            );

        let perFgs = ( (parseInt(totals.h.fga) + parseInt(totals.v.fga))
            - parseInt(prevQuarters.t.fga));
        let perTO = ( (parseInt(totals.h.to) + parseInt(totals.v.to))
            - parseInt(prevQuarters.t.to));
        let perFta = ( (parseInt(totals.h.fta) + parseInt(totals.v.fta))
            - parseInt(prevQuarters.t.fta));
        let perOffReb = ( (parseInt(totals.h.offReb) + parseInt(totals.v.offReb))
            - parseInt(prevQuarters.t.offReb));

        // console.log('perFgs are ', perFgs, ' and perTO are ', perTO, ' and perFta are ', perFta, ' and perOffReb are ', perOffReb);

        let currentQuarter = {
            h: {
              pts: parseInt(totals.h.pts) - parseInt(prevQuarters.h.pts),
              fgm: parseInt(totals.h.fgm) - parseInt(prevQuarters.h.fgm),
              fga: parseInt(totals.h.fga) - parseInt(prevQuarters.h.fga),
              fgPct: calcFgPct((parseInt(totals.h.fgm)-prevQuarters.h.fgm), (parseInt(totals.h.fga) - parseInt(prevQuarters.h.fga))),
              fta: parseInt(totals.h.fta) - parseInt(prevQuarters.h.fta),
              to: parseInt(totals.h.to) - parseInt(prevQuarters.h.to),
              offReb: parseInt(totals.h.offReb) - parseInt(prevQuarters.h.offReb),
              fouls: parseInt(totals.h.fouls) - parseInt(prevQuarters.h.fouls)
            },
            v: {
              pts: parseInt(totals.v.pts) - parseInt(prevQuarters.v.pts),
              fgm: parseInt(totals.v.fgm) - parseInt(prevQuarters.v.fgm),
              fga: parseInt(totals.v.fga) - parseInt(prevQuarters.v.fga),
              fgPct: calcFgPct(
                (parseInt(totals.v.fgm) - parseInt(prevQuarters.v.fgm)),
                (parseInt(totals.v.fga) - parseInt(prevQuarters.v.fga))
              ),
              fta: parseInt(totals.v.fta) - parseInt(prevQuarters.v.fta),
              to: parseInt(totals.v.to) - parseInt(prevQuarters.v.to),
              offReb: parseInt(totals.v.offReb) - parseInt(prevQuarters.v.offReb),
              fouls: parseInt(totals.v.fouls) - parseInt(prevQuarters.v.fouls)
            },
            t: {
              pts: (parseInt(totals.h.pts) + parseInt(totals.v.pts)) - parseInt(prevQuarters.t.pts),
              fgm: (parseInt(totals.h.fgm) + parseInt(totals.v.fgm)) - parseInt(prevQuarters.t.fgm),
              fga: (parseInt(totals.h.fga) + parseInt(totals.v.fga)) - parseInt(prevQuarters.t.fga),
              fgPct: calcFgPct(
                ((parseInt(totals.h.fgm) + parseInt(totals.v.fgm)) - parseInt(prevQuarters.t.fgm)),
                ((parseInt(totals.h.fga) + parseInt(totals.v.fga)) - parseInt(prevQuarters.t.fga))
              ),
              fta: (parseInt(totals.h.fta) + parseInt(totals.v.fta)) - parseInt(prevQuarters.t.fta),
              to: (parseInt(totals.h.to) + parseInt(totals.v.to)) - parseInt(prevQuarters.t.to),
              offReb: (parseInt(totals.h.offReb) + parseInt(totals.v.offReb)) - parseInt(prevQuarters.t.offReb),
              fouls: (parseInt(totals.h.fouls) + parseInt(totals.v.fouls)) - parseInt(prevQuarters.t.fouls),
              poss: quarterPoss,
              pace: calcQuarterPace(quarterPoss, period.current, gameSecs)
            }
        }

        inQuarter = {
          ...liveData,
          perToUpdate,
          quarterData: currentQuarter
        }

        dispatch ({ type: 'UPDATE_LIVE_SCORE', payload: inQuarter})
      };

    };
  }
}
