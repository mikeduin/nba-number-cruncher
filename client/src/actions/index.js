import _ from 'lodash';
import axios from 'axios';

export const fetchNetRatings = () => async dispatch => {
  const response = await axios.get('http://localhost:5000/api/getNetRatings');
  console.log(response.data);
};
