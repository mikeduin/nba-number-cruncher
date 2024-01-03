const express = require('express');
const moment = require('moment-timezone');
const formBovadaUrl = require('../utils/props/formBovadaUrl');
const getPlayerPropsMap = require('../utils/props/getPlayerPropMap');
const app = express();

const ScraperController = require('./Scraper.Controller');
const ScheduleController = require('./Schedule.Controller');
const DbController = require('./Db.Controller');

const { Players, PlayerProps, Schedule } = DbController;
const { scrapeBovada } = ScraperController;
const { getTodaysGames } = ScheduleController;

const playerNameMismatches = {
  // Bovada name : DB name
  'Bruce Brown Jr.': 'Bruce Brown',
  'Cameron Reddish': 'Cam Reddish',
  'Cam Johnson': 'Cameron Johnson',
  'DeAndre Ayton': 'Deandre Ayton',
  'De’Anthony Melton': "De'Anthony Melton",
  'Dennis Smith Jr': 'Dennis Smith Jr.',
  'Jabari Smith': 'Jabari Smith Jr.',
  'Jabari Smith Jr': 'Jabari Smith Jr.',
  'Kelly Oubre Jr': 'Kelly Oubre Jr.',
  'Kevin Knox': 'Kevin Knox II',
  'Lonnie Walker': 'Lonnie Walker IV',
  'Marcus Morris': 'Marcus Morris Sr.',
  'Mohamed Bamba': 'Mo Bamba',
  'Nicolas Claxton': 'Nic Claxton',
  'PJ Washington': 'P.J. Washington',
  'Tim Hardaway Jr': 'Tim Hardaway Jr.',
  'TJ McConnell': 'T.J. McConnell',
  'Trey Murphy': 'Trey Murphy III',
  'Wendell Carter Jr': 'Wendell Carter Jr.',
}

const fetchDailyGameProps = async () => {
  const today = moment().format('YYYY-MM-DD');

  const dailyGames = await Schedule()
    .where({gdte: today})
    .whereNot({stt: 'Final'})
    .select('gid', 'etm', 'h', 'v', 'bovada_url');
  const dailyProps = await PlayerProps().where({gdte: today});
  // fetch the players who have teams that are found as either h[0].tid or v[0].tid in the dailyGames array
  const dailyPlayers = await Players()
    .whereIn('team_id', dailyGames.map(game => game.h[0].tid).concat(dailyGames.map(game => game.v[0].tid)))
    .select('player_id', 'player_name', 'team_id');

  dailyGames.forEach(async game => { 
    // const bovadaUrl = formBovadaUrl(game);
    const gamesPropsOnBovada = await scrapeBovada(game.bovada_url);
    const gamePropPlayersInDb = dailyProps
      .filter(prop => prop.gid === game.gid)
      .map(prop => prop.player_name);

    // console.log('gamePropPlayersInDb are ', gamePropPlayersInDb);

    const playerPropsMap = await getPlayerPropsMap(gamesPropsOnBovada, gamePropPlayersInDb);
    
    for (let [player, props] of playerPropsMap) {
      if (Object.keys(playerNameMismatches).includes(player)) {
        player = playerNameMismatches[player];
      }
      
      const playerPropsExists = dailyProps.filter(prop => prop.player_name === player).length;

      if (playerPropsExists) {
        // update the entry
        try {
          await PlayerProps().where({player_name: player, gid: game.gid}).update({
            ...props,
            updated_at: new Date()
          });
          console.log('updated player prop for ', player);
        } catch (e) {
          console.log('error updating player prop for ', player, ' and error is ', e, ' and props are ', props);
        }

      } else {
        // create a new entry
        try {
          await PlayerProps().insert({
            ...props,
            player_name: player,
            player_id: dailyPlayers.filter(p => p.player_name === player)[0].player_id,
            gid: game.gid,
            gdte: today,
            created_at: new Date(),
            updated_at: new Date()
          });
          console.log('inserted new player prop for ', player);
        } catch (e) {
          console.log('error inserting new player prop for ', player, ' and error is ', e);
        }
      }
    }
  })
}

module.exports = { fetchDailyGameProps };