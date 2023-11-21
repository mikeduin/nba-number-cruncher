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

const fetchDailyGameProps = async () => {
  // const today = moment().tz('America/New_York').format('YYYY-MM-DD');
  const today = moment().format('YYYY-MM-DD');

  // const dailyGames = await getTodaysGames(today);

  const dailyGames = await Schedule()
    .where({gdte: today})
    .whereNot({stt: 'Final'})
    .select('gid', 'etm', 'h', 'v');
  const dailyProps = await PlayerProps().where({gdte: today});
  // fetch the players who have teams that are found as either h[0].tid or v[0].tid in the dailyGames array
  const dailyPlayers = await Players()
    .whereIn('team_id', dailyGames.map(game => game.h[0].tid).concat(dailyGames.map(game => game.v[0].tid)))
    .select('player_id', 'player_name', 'team_id');

  console.log('dailyGames are ', dailyGames);

  // console.log('dailyPlayers are ', dailyPlayers);

  // const nowUTC = moment().utc();
  dailyGames.forEach(async game => { 

    // console.log('game is ', game);

    const timeDiff = moment(game.etm).diff(moment(), 'minutes');
    const gameStarted = timeDiff < 0;

    // TODO: If timeDiff is < 2 mins, log closing prices




    // console.log('timeDiff is ', timeDiff, ' and gameStarted is ', gameStarted);

    const bovadaUrl = formBovadaUrl(game);
    // console.log('bovadaUrl is ', bovadaUrl);
    
    const gamesPropsOnBovada = await scrapeBovada(bovadaUrl);
    const gamePropPlayersInDb = dailyProps
      .filter(prop => prop.gid === game.gid)
      .map(prop => prop.player_name);

    const playerPropsMap = await getPlayerPropsMap(gamesPropsOnBovada, gamePropPlayersInDb);
    // for (const [player, props] of Object.entries(playerPropsMap)) {
    //   // do something with player and props
    // }
    // console.log('gameProps are ', gamesPropsOnBovada);

    // console.log('playerPropsMap is ', playerPropsMap);
    
    for (const [player, props] of playerPropsMap) {
      const playerPropsExists = dailyProps.filter(prop => prop.player_name === player).length;

      if (playerPropsExists) {
        // update the entry
        try {
          await PlayerProps().where({player_name: player}).update({
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