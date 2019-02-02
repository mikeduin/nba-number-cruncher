import _ from 'lodash';
import axios from 'axios';

export const fetchNetRatings = () => async dispatch => {
  // const response = await axios.get('/api/getNetRatings');
  // const response = await fetch('/api/getNetRatings');
  // console.log(response);
  const response = await fetch('/api/getNetRatings');
  const body = await response.json();

  console.log(body)
  // .then(res=>{
  //   console.log(res.data);
  // })
};
