// import _ from 'lodash';
// import axios from 'axios';
import moment from 'moment';

export const fetchNetRatings = () => async dispatch => {
  // const response = await axios.get('/api/getNetRatings');
  // const response = await fetch('/api/getNetRatings');
  // console.log(response);
  let response = await fetch('/api/getNetRatings');
  let data = await response.json();

  dispatch({ type: 'FETCH_NET_RATINGS', payload: data})

  // console.log(body)
  // .then(res=>{
  //   console.log(res.data);
  // })
}

export const fetchWeek = () => async dispatch => {
  let digitDate = moment().format('YYYYMMDD');
  let response = await fetch(`/api/fetchWeek/${digitDate}`);
  let data = await response.json();

  console.log('data sent to action is ', data);

  dispatch({ type: 'FETCH_WEEK', payload: data})
}
