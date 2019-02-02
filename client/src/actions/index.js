import _ from 'lodash';
import axios from 'axios';

export const fetchNetRatings = () => async dispatch => {
  // const response = await axios.get('/api/getNetRatings');
  // const response = await fetch('/api/getNetRatings');
  // console.log(response);
  const response = await fetch('/api/getNetRatings');
  const data = await response.json();

  dispatch({ type: 'FETCH_NET_RATINGS', payload: data})

  // console.log(body)
  // .then(res=>{
  //   console.log(res.data);
  // })
};