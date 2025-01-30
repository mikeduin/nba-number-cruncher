import moment from 'moment-timezone';
import { getPlayerPropsMap, getCurrentSeasonStartYearInt } from '../utils';
import { scrapeBetsson, scrapeBovada } from './Scraper.Controller.js';
import { Players, PlayerProps, Schedule } from './Db.Controller.js';
import { SportsbookName } from '../types';

export const playerNameMismatches = {
  Bovada: {
    // Bovada name : DB name
    'Bogdan Bogdanovic': 'Bogdan Bogdanović',
    'Bruce Brown Jr.': 'Bruce Brown',
    'Bub Carringon': 'Carlton Carrington',
    'Cameron Reddish': 'Cam Reddish',
    'Cam Johnson': 'Cameron Johnson',
    'DeAndre Ayton': 'Deandre Ayton',
    'De’Anthony Melton': "De'Anthony Melton",
    'Dennis Schroder': 'Dennis Schröder',
    'Dennis Smith Jr': 'Dennis Smith Jr.',
    'Gregory Jackson': 'GG Jackson',
    'Jabari Smith': 'Jabari Smith Jr.',
    'Jabari Smith Jr': 'Jabari Smith Jr.',
    'Kelly Oubre Jr': 'Kelly Oubre Jr.',
    'Kevin Knox': 'Kevin Knox II',
    'Kristaps Porzingis': 'Kristaps Porziņģis',
    'Lonnie Walker': 'Lonnie Walker IV',
    'Marcus Morris': 'Marcus Morris Sr.',
    'Marvin Bagley': 'Marvin Bagley III',
    'Mohamed Bamba': 'Mo Bamba',
    'Moussa Diabete': 'Moussa Diabaté',
    'Nicolas Claxton': 'Nic Claxton',
    'Nikola Jokic': 'Nikola Jokić',
    'Nikola Jovic': 'Nikola Jović',
    'Nikola Vucevic': 'Nikola Vučević',
    'PJ Washington': 'P.J. Washington',
    'Tim Hardaway Jr': 'Tim Hardaway Jr.',
    'TJ McConnell': 'T.J. McConnell',
    'Trey Murphy': 'Trey Murphy III',
    'Vit Krejci': 'Vít Krejčí',
    'Wendell Carter Jr': 'Wendell Carter Jr.',
  },
  Betsson: {
    'Andre Jackson': 'Andre Jackson Jr.',
    'Bogdan Bogdanovic': 'Bogdan Bogdanović',
    'Cameron Thomas': 'Cam Thomas',
    'Dennis Schroder': 'Dennis Schröder',
    'KJ Martin Jr.': 'KJ Martin',
    'Kristaps Porzingis': 'Kristaps Porziņģis',
    'Lauri Markkanen': 'Lauri Markkanen',
    'Luka Doncic': 'Luka Dončić',
    'Nicolas Claxton': 'Nic Claxton',
    'Nikola Jovic': 'Nikola Jović',
    'Nikola Jokic': 'Nikola Jokić',
    'Nikola Vucevic': 'Nikola Vučević',
    'Jabari Smith': 'Jabari Smith Jr.',
    'Jonas Valanciunas': 'Jonas Valančiūnas',
    'Jusuf Nurkic': 'Jusuf Nurkić',
    'Moussa Diabate': 'Moussa Diabaté',
    'PJ Washington': 'P.J. Washington',
    'Tidjane Salaun': 'Tidjane Salaün',
    'Vasilije Micic': 'Vasilije Micić',
    'Vit Krejci': 'Vít Krejčí',
  }
}

export const updateSingleGameProps = async (gid: string, sportsbook: SportsbookName) => {
  // const sportsbookUrl = sportsbook === SportsbookName.Bovada ? 'bovada_url' : 'betsson_url';
  const season = getCurrentSeasonStartYearInt();
  const today = moment().format('YYYY-MM-DD');

  const game = await Schedule()
    .where({gid})
    .whereNot({stt: 'Final'})
    .select('gid', 'etm', 'h', 'v', 'bovada_url', 'betsson_url');

  const dailyProps = await PlayerProps().where({gid});
  const dailyPlayers = await Players()
    .where({ season })
    .whereIn('team_id', [game[0].h[0].tid, game[0].v[0].tid])
    .select('player_id', 'player_name', 'team_id', 'team_abbreviation');

  const gamesPropsOnBovada = sportsbook === SportsbookName.Bovada ? await scrapeBovada(game[0].bovada_url) : await scrapeBetsson(game[0].betsson_url);
  const gamePropPlayersInDb = dailyProps
    .filter(prop => prop.gid === gid)
    .map(prop => prop.player_name);

  const playerPropsMap = await getPlayerPropsMap(gamesPropsOnBovada, gamePropPlayersInDb, dailyPlayers, sportsbook);
  
  for (let [player, props] of playerPropsMap) {
    if (Object.keys(playerNameMismatches[sportsbook]).includes(player)) {
      player = playerNameMismatches[sportsbook][player];
    }
    
    const playerPropsExists = dailyProps.filter(prop => prop.player_name.trim() === player.trim()).length;

    if (playerPropsExists) {
      // update the entry
      try {
        await PlayerProps().where({player_name: player, gid}).update({
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
          player_id: dailyPlayers.filter(p => p.player_name === player.trim())[0].player_id,
          gid,
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
}

export const fetchDailyGameProps = async (sportsbook: SportsbookName) => {
  console.log('fetching daily game props for ', sportsbook);
  const today = moment().format('YYYY-MM-DD');
  const season = getCurrentSeasonStartYearInt();
  const sportsbookUrl = sportsbook === SportsbookName.Bovada ? 'bovada_url' : 'betsson_url';

  const dailyGames = await Schedule()
    .where({gdte: today, fetchProps: true})
    .whereNot({stt: 'Final'})
    .select('gid', 'etm', 'h', 'v', sportsbookUrl);
  const dailyProps = await PlayerProps().where({gdte: today});
  // fetch the players who have teams that are found as either h[0].tid or v[0].tid in the dailyGames array
  const dailyPlayers = await Players()
    .where({ season })
    .whereIn('team_id', dailyGames.map(game => game.h[0].tid).concat(dailyGames.map(game => game.v[0].tid)))
    .select('player_id', 'player_name', 'team_id', 'team_abbreviation');

  dailyGames.forEach(async game => { 
    const gamesPropsOnBovada = sportsbook === SportsbookName.Bovada ? await scrapeBovada(game.bovada_url) : await scrapeBetsson(game.betsson_url);
    const gamePropPlayersInDb = dailyProps
      .filter(prop => prop.gid === game.gid)
      .map(prop => prop.player_name);

    const playerPropsMap = await getPlayerPropsMap(gamesPropsOnBovada, gamePropPlayersInDb, dailyPlayers, sportsbook);
    
    for (let [player, props] of playerPropsMap) {
      if (Object.keys(playerNameMismatches[sportsbook]).includes(player)) {
        player = playerNameMismatches[sportsbook][player];
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

export const deleteDuplicateProps = async (gid) => {
  const gameProps = await PlayerProps()
    .where({gid});

  const groupedByDuplicateProps: any[] = gameProps.reduce((acc, curr) => {
    const key = `${curr.player_name}`; // Define your own key based on what you consider a duplicate
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(curr);
    return acc;
  }, {});

  const duplicateIds = Object.values(groupedByDuplicateProps)
    .filter(group => group.length > 1)
    .map(group => group.slice(1).map(item => item.id)) // Exclude the first item of each group
    .flat();

  // Delete the props with the duplicate IDs
  for (const id of duplicateIds) {
    await PlayerProps().where({ id }).del();
  }
}