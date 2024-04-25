const moment = require('moment-timezone');
const Db = require('./Db.Controller');

exports.getCurrentNbaSeason = () => {
  if (moment().isBefore('2024-10-01')) {
    return '2023-24';
  } 
  // else if (moment().isBefore(`2025-10-01`)) {
  //   return '2024-25';
  // } else if (moment().isBefore(`2026-10-01`)) {
  //   return '2025-26';
  // } else if (moment().isBefore(`2027-10-01`)) {
  //   return '2026-27';
  // } else if (moment().isBefore(`2028-10-01`)) {
  //   return '2027-28';
  // }
  throw new Error('No season found');
}

exports.getTodaysGames = async (today) => {
  const games = await Db.Schedule().where({gdte: today});
  return games;
}
