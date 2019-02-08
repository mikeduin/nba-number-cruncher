// import _ from 'lodash';
// import axios from 'axios';
import moment from 'moment';

export const fetchNetRatings = () => async dispatch => {
  let response = await fetch('/api/getNetRatings');
  let data = await response.json();

  dispatch({ type: 'FETCH_NET_RATINGS', payload: data});
}

export const fetchWeek = () => async dispatch => {
  let digitDate = moment().format('YYYYMMDD');
  let today = moment().format('YYYY-MM-DD');
  let response = await fetch(`/api/fetchWeek/${digitDate}`);
  let data = await response.json();

  let updated = {...data, today};

  dispatch({ type: 'FETCH_WEEK', payload: updated});
}

export const fetchGame = ({gid}) => async dispatch => {
  let response = await fetch(`/api/fetchGame/${gid}`);
  let data = await response.json();
  // both Obj and Arr data types ideal for custom component injection
  let conv = {
    info: data.info,
    netRatingsArr: [data.visNetRtg, data.homeNetRtg],
    paceArr: [data.visPace, data.homePace],
    homeObj: {},
    visObj: {}
  };

  // conv.netRatingsObj[data.info.h[0].ta] = data.homeNetRtg;
  // conv.netRatingsObj[data.info.v[0].ta] = data.visNetRtg;
  // conv.paceObj[data.info.h[0].ta] = data.homePace;
  // conv.paceObj[data.info.v[0].ta] = data.visPace;

  conv.homeObj.netRatings = data.homeNetRtg;
  conv.homeObj.pace = data.homePace;
  conv.homeObj.info = data.homeInfo;
  conv.visObj.netRatings = data.visNetRtg;
  conv.visObj.pace = data.visPace;
  conv.visObj.info = data.visInfo;

  dispatch({ type: 'FETCH_GAME', payload: conv});
}
