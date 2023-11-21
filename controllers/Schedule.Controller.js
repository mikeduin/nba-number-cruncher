const moment = require('moment-timezone');
const Db = require('./Db.Controller');

module.exports = {
  getTodaysGames: async (today) => {
    const games = await Db.Schedule().where({gdte: today});
    return games;
  }
}