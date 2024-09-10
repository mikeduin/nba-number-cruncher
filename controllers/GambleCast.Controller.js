import knex from '../db/knex.js';
import moment from 'moment-timezone';

export const getActiveGames = async (date) => {
  let testMoment = moment().set({
    'year': 2024,
    'month': 3,
    'date': 27,
    'hour': 19,
    'minute': 20,
    'second': 0,
    'timezone': 'America/Los_Angeles'
  }); // 7pm on 4/27/2024

  const todayGames = await knex('schedule')
    .where({
      gdte: date,
    })
    .whereNot({
      stt: 'Final'
    });

  // console.log('todayGames are ', todayGames);

  // return todayGames.filter(game => moment(game.etm).diff(moment()) <= 0);
  return todayGames.filter(game => moment(game.etm).diff(testMoment, 'minutes') <= 0);
};