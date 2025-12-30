import moment from 'moment-timezone';
import { getPlayerPropsMap, getCurrentSeasonStartYearInt } from '../utils';
import { scrapeBetsson, scrapeBovada, scrapeFanDuel, scrapeDraftKings } from './Scraper.Controller.js';
import { Players, PlayerProps, Schedule } from './Db.Controller.js';
import { SportsbookName } from '../types';

// Unified player name mismatches across all sportsbooks
// Maps: Sportsbook name -> DB name
export const playerNameMismatches = {
  'Airious Bailey': 'Ace Bailey',
  'Alexandre Sarr': 'Alex Sarr',
  'Andre Jackson': 'Andre Jackson Jr.',
  'Bogdan Bogdanovic': 'Bogdan Bogdanović',
  'Bruce Brown Jr.': 'Bruce Brown',
  'Bub Carringon': 'Bub Carrington',
  'Carlton Carrington': 'Bub Carrington',
  'Cam Johnson': 'Cameron Johnson',
  'Cameron Thomas': 'Cam Thomas',
  'Cameron Reddish': 'Cam Reddish',
  'C.J. McCollum': 'CJ McCollum',
  'Dante Exum': 'Danté Exum',
  'DeAndre Ayton': 'Deandre Ayton',
  'Dennis Schroder': 'Dennis Schröder',
  'Dennis Smith Jr': 'Dennis Smith Jr.',
  'Egor Demin': 'Egor Dëmin',
  'GG Jackson II': 'GG Jackson',
  'Gregory Jackson': 'GG Jackson',
  'Jabari Smith': 'Jabari Smith Jr.',
  'Jabari Smith Jr': 'Jabari Smith Jr.',
  'Jimmy Butler': 'Jimmy Butler III',
  'Jonas Valanciunas': 'Jonas Valančiūnas',
  'Jusuf Nurkic': 'Jusuf Nurkić',
  'Kelly Oubre Jr': 'Kelly Oubre Jr.',
  'Kevin Knox': 'Kevin Knox II',
  'Kevin Porter': 'Kevin Porter Jr.',
  'KJ Martin Jr.': 'KJ Martin',
  'Kristaps Porzingis': 'Kristaps Porziņģis',
  'Lauri Markkanen': 'Lauri Markkanen',
  'Lebron James': 'LeBron James',
  'Lonnie Walker': 'Lonnie Walker IV',
  'Luka Doncic': 'Luka Dončić',
  'Marcus Morris': 'Marcus Morris Sr.',
  'Marvin Bagley': 'Marvin Bagley III',
  'Mohamed Bamba': 'Mo Bamba',
  'Moussa Diabate': 'Moussa Diabaté',
  'Nic Claxton': 'Nicolas Claxton',
  'Nicolas Claxton': 'Nic Claxton',
  'Nikola Jokic': 'Nikola Jokić',
  'Nikola Jovic': 'Nikola Jović',
  'Nikola Vucevic': 'Nikola Vučević',
  'PJ Washington': 'P.J. Washington',
  'P.J. Washington Jr.': 'P.J. Washington',
  'Ron Holland II': 'Ronald Holland II',
  'S Gilgeous-Alexander': 'Shai Gilgeous-Alexander',
  'Tidjane Salaun': 'Tidjane Salaün',
  'Tim Hardaway Jr': 'Tim Hardaway Jr.',
  'TJ McConnell': 'T.J. McConnell',
  'Trey Murphy': 'Trey Murphy III',
  'Vasilije Micic': 'Vasilije Micić',
  'Vit Krejci': 'Vít Krejčí',
  'Wendell Carter Jr': 'Wendell Carter Jr.',
}

export const updateSingleGameProps = async (gid: string, sportsbook: SportsbookName, pxContext?: string) => {
  const season = getCurrentSeasonStartYearInt();
  const today = moment().format('YYYY-MM-DD');
  let missingTeamsAll: string[] = [];

  const game = await Schedule()
    .where({gid})
    .whereNot({stt: 'Final'})
    .select('gid', 'etm', 'h', 'v', 'bovada_url', 'betsson_url', 'fanduel_event_id', 'fanduel_curl', 'draftkings_event_id', 'draftkings_url');

  // Get props for this specific sportsbook (for update/insert logic)
  const dailyPropsForSportsbook = await PlayerProps().where({gid, sportsbook});
  
  // Load ALL players for the season (sportsbooks may show props for players from any team)
  const dailyPlayers = await Players()
    .where({ season })
    .select('player_id', 'player_name', 'team_id', 'team_abbreviation');

  let playerPropsMap: Map<string, any>;

  if (sportsbook === SportsbookName.FanDuel) {
    // FanDuel requires event ID and PerimeterX context
    const fanDuelEventId = game[0].fanduel_event_id;
    
    if (!fanDuelEventId) {
      throw new Error(`FanDuel event ID not set for game ${gid}. Add it to the schedule table.`);
    }
    
    if (!pxContext) {
      throw new Error('FanDuel requires pxContext parameter. Get it from browser DevTools.');
    }
    
    console.log(`Fetching FanDuel props for event ${fanDuelEventId}...`);
    const scrapedProps = await scrapeFanDuel(fanDuelEventId, pxContext, 'NJ');
    
    console.log(`Scraped ${scrapedProps.length} total props, filtering to full-game only...`);
    
    // Filter to only full-game props (exclude quarters, halves, alt points, etc.)
    const fullGameProps = scrapedProps.filter(prop => {
      const displayLower = prop.propDisplay?.toLowerCase() || '';
      const marketLower = prop.marketName?.toLowerCase() || '';
      
      // Exclude patterns
      const excludePatterns = [
        /\b1st\s*(quarter|qtr|q)\b/i,
        /\b2nd\s*(quarter|qtr|q)\b/i,
        /\b3rd\s*(quarter|qtr|q)\b/i,
        /\b4th\s*(quarter|qtr|q)\b/i,
        /\bfirst\s*(quarter|qtr|q)\b/i,
        /\bsecond\s*(quarter|qtr|q)\b/i,
        /\bthird\s*(quarter|qtr|q)\b/i,
        /\bfourth\s*(quarter|qtr|q)\b/i,
        /\bfirst\s*half\b/i,
        /\bsecond\s*half\b/i,
        /\b1st\s*half\b/i,
        /\b2nd\s*half\b/i,
        /\balt\s+/i,  // Alt Points, Alt Rebounds, etc.
        /to score \d+\+/i,  // To Score 10+, To Score 25+, etc.
        /top.*scorer/i,
        /first.*basket/i,
        /double.*double/i,
        /triple.*double/i,
      ];
      
      const shouldExclude = excludePatterns.some(pattern => 
        pattern.test(displayLower) || pattern.test(marketLower)
      );
      
      if (shouldExclude) {
        console.log(`  ❌ Filtered out: ${prop.propDisplay} (${prop.marketName})`);
      }
      
      return !shouldExclude;
    });
    
    console.log(`Filtered to ${fullGameProps.length} full-game props`);
    
    // Log what prop types remain after filtering
    const remainingTypes = {};
    fullGameProps.forEach(p => {
      remainingTypes[p.propDisplay] = (remainingTypes[p.propDisplay] || 0) + 1;
    });
    console.log('📊 Remaining prop types:', remainingTypes);
    
    // Convert to format matching Betsson/Bovada for use with getPlayerPropsMap
    const formattedProps = fullGameProps.map(prop => ({
      player: prop.playerName,
      market: prop.propDisplay,
      line: prop.line,
      over: prop.overOdds,
      under: prop.underOdds,
      team: null // Will be resolved by getPlayerPropsMap
    }));
    
    const gamePropPlayersInDb = dailyPropsForSportsbook
      .filter(prop => prop.gid === gid)
      .map(prop => prop.player_name);
    
    const result = await getPlayerPropsMap(formattedProps, gamePropPlayersInDb, dailyPlayers, sportsbook);
    playerPropsMap = result.playerPropsMap;
    missingTeamsAll = result.missingTeams;
    
  } else if (sportsbook === SportsbookName.DraftKings) {
    // DraftKings requires event ID
    const draftKingsEventId = game[0].draftkings_event_id;
    
    if (!draftKingsEventId) {
      throw new Error(`DraftKings event ID not set for game ${gid}. Add it to the schedule table.`);
    }
    
    console.log(`Fetching DraftKings props for event ${draftKingsEventId}...`);
    const scrapedProps = await scrapeDraftKings(draftKingsEventId, 'NJ');
    
    console.log(`Scraped ${scrapedProps.length} props from DraftKings`);
    
    // Log what prop types we got
    const propTypes = {};
    scrapedProps.forEach(p => {
      propTypes[p.propType] = (propTypes[p.propType] || 0) + 1;
    });
    console.log('📊 DraftKings prop types:', propTypes);
    
    // Convert to format matching Betsson/Bovada for use with getPlayerPropsMap
    const formattedProps = scrapedProps.map(prop => ({
      player: prop.player,
      market: prop.propType,
      line: prop.line,
      over: prop.overOdds,
      under: prop.underOdds,
      team: null // Will be resolved by getPlayerPropsMap
    }));
    
    // Debug: Log first 3 formatted props to see what we're working with
    console.log('📋 Sample formatted props:', JSON.stringify(formattedProps.slice(0, 3), null, 2));
    
    const gamePropPlayersInDb = dailyPropsForSportsbook
      .filter(prop => prop.gid === gid)
      .map(prop => prop.player_name);
    
    const result = await getPlayerPropsMap(formattedProps, gamePropPlayersInDb, dailyPlayers, sportsbook);
    playerPropsMap = result.playerPropsMap;
    missingTeamsAll = result.missingTeams;
    
  } else {
    // Betsson or Bovada
    const gameUrl = sportsbook === SportsbookName.Bovada ? game[0].bovada_url : game[0].betsson_url;
    const gamesPropsOnSportsbook = sportsbook === SportsbookName.Bovada 
      ? await scrapeBovada(gameUrl) 
      : await scrapeBetsson(gameUrl);
    
    const gamePropPlayersInDb = dailyPropsForSportsbook
      .filter(prop => prop.gid === gid)
      .map(prop => prop.player_name);

    const result = await getPlayerPropsMap(gamesPropsOnSportsbook, gamePropPlayersInDb, dailyPlayers, sportsbook);
    playerPropsMap = result.playerPropsMap;
    missingTeamsAll = result.missingTeams;
  }
  
  for (let [player, props] of playerPropsMap) {
    if (playerNameMismatches[player]) {
      player = playerNameMismatches[player];
    }
    
    const playerPropsExists = dailyPropsForSportsbook.filter(prop => prop.player_name.trim() === player.trim()).length;

    if (playerPropsExists) {
      // update the entry
      try {
        await PlayerProps().where({player_name: player, gid, sportsbook}).update({
          ...props,
          updated_at: new Date()
        });
        console.log('updated player prop for ', player, ' on ', sportsbook);
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
          sportsbook,  // Track which sportsbook
          created_at: new Date(),
          updated_at: new Date()
        });
        console.log('inserted new player prop for ', player, ' on ', sportsbook);
      } catch (e) {
        console.log('error inserting new player prop for ', player, ' and error is ', e);
      }
    }
  }
  
  return { missingTeams: missingTeamsAll };
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

    const result = await getPlayerPropsMap(gamesPropsOnBovada, gamePropPlayersInDb, dailyPlayers, sportsbook);
    const playerPropsMap = result.playerPropsMap;
    // Note: missingTeams tracked but not returned in bulk update
    
    for (let [player, props] of playerPropsMap) {
      if (playerNameMismatches[player]) {
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