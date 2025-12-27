/**
 * End-to-end integration test using cURL (pure JS version)
 * 
 * Usage: node test-fanduel-integration-simple.mjs <gid> "<curl_command>"
 */

import knex from './db/knex.js';
import axios from 'axios';

const gid = process.argv[2];
const curlCommand = process.argv[3];

if (!gid || !curlCommand) {
  console.log('\n❌ Missing arguments\n');
  console.log('Usage: node test-fanduel-integration-simple.mjs <gid> "<curl_command>"\n');
  process.exit(1);
}

function parseCurl(curlCommand) {
  const urlMatch = curlCommand.match(/curl '([^']+)'/);
  if (!urlMatch) throw new Error('Could not find URL in cURL command');
  
  const fullUrl = urlMatch[1];
  const [baseUrl, queryString] = fullUrl.split('?');
  const queryParams = {};
  
  if (queryString) {
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      queryParams[key] = decodeURIComponent(value || '');
    });
  }
  
  const headers = {};
  const headerMatches = curlCommand.matchAll(/-H '([^:]+):\s*([^']+)'/g);
  for (const match of headerMatches) {
    headers[match[1].trim()] = match[2].trim();
  }
  
  return { url: fullUrl, headers, eventId: queryParams.eventId };
}

function filterFullGameProps(props) {
  const quarterHalfRegex = /\b(1st|2nd|3rd|4th|First|Second|Third|Fourth)\s+(Quarter|Half|Qtr|Q)\b/i;
  return props.filter(prop => !quarterHalfRegex.test(prop.marketName));
}

function parseFanDuelMarketName(marketName) {
  const dashIndex = marketName.indexOf(' - ');
  if (dashIndex === -1) return { playerName: null, propDisplay: marketName };
  return {
    playerName: marketName.substring(0, dashIndex).trim(),
    propDisplay: marketName.substring(dashIndex + 3).trim()
  };
}

function mapFanDuelPropType(marketType, marketName) {
  const typeMap = {
    'PLAYER_.*_TOTAL_POINTS$': 'pts',
    'PLAYER_.*_TOTAL_REBOUNDS$': 'reb',
    'PLAYER_.*_TOTAL_ASSISTS$': 'ast',
    'PLAYER_.*_TOTAL_STEALS$': 'stl',
    'PLAYER_.*_TOTAL_BLOCKS$': 'blk',
    'PLAYER_.*_TOTAL_TURNOVERS$': 'tov',
    'PLAYER_.*_TOTAL_MADE_3_POINT': 'fg3m',
    'PLAYER_.*_TOTAL_POINTS_\\+_REB_\\+_AST': 'pts+reb+ast',
    'PLAYER_.*_TOTAL_POINTS_\\+_REBOUNDS': 'pts+reb',
    'PLAYER_.*_TOTAL_POINTS_\\+_ASSISTS': 'pts+ast',
    'PLAYER_.*_TOTAL_REBOUNDS_\\+_ASSISTS': 'reb+ast'
  };
  
  for (const [pattern, propType] of Object.entries(typeMap)) {
    if (new RegExp(pattern).test(marketType)) return propType;
  }
  return null;
}

function transformToWideFormat(props) {
  const playerMap = new Map();
  
  props.forEach(prop => {
    const { playerName } = parseFanDuelMarketName(prop.marketName);
    if (!playerName) return;
    
    const propType = mapFanDuelPropType(prop.marketType, prop.marketName);
    if (!propType) return;
    
    if (!playerMap.has(playerName)) {
      playerMap.set(playerName, { player_name: playerName });
    }
    
    const playerRow = playerMap.get(playerName);
    
    if (prop.runners?.length >= 2) {
      const over = prop.runners.find(r => r.result?.type === 'OVER');
      const under = prop.runners.find(r => r.result?.type === 'UNDER');
      
      if (over && under) {
        playerRow[propType] = parseFloat(over.handicap);
        playerRow[`${propType}_over`] = over.winRunnerOdds?.americanDisplayOdds?.americanOdds || null;
        playerRow[`${propType}_under`] = under.winRunnerOdds?.americanDisplayOdds?.americanOdds || null;
      }
    }
  });
  
  return Array.from(playerMap.values());
}

try {
  console.log(`\n🎯 Testing FanDuel integration for game ${gid}\n`);
  
  const parsed = parseCurl(curlCommand);
  console.log(`✅ Extracted event ID: ${parsed.eventId}\n`);
  
  // Check game
  const game = await knex('schedule')
    .where({ gid })
    .select('gid', 'gdte', 'v', 'h', 'fanduel_event_id')
    .first();
  
  if (!game) {
    console.error(`❌ Game ${gid} not found`);
    process.exit(1);
  }
  
  console.log('Game info:');
  console.log(`  ${game.v[0].tn} @ ${game.h[0].tn} on ${game.gdte}\n`);
  
  // Update event ID if needed
  if (game.fanduel_event_id !== parsed.eventId) {
    console.log(`📝 Updating fanduel_event_id...`);
    await knex('schedule').where({ gid }).update({ fanduel_event_id: parsed.eventId });
    console.log('✅ Updated\n');
  }
  
  // Get players for the two teams (needed for player_id and team lookup)
  const season = 2024; // Current season
  const dailyPlayers = await knex('players')
    .where({ season })
    .whereIn('team_id', [game.v[0].tid, game.h[0].tid])
    .select('player_id', 'player_name', 'team_id', 'team_abbreviation');
  
  console.log(`📋 Loaded ${dailyPlayers.length} players from both teams\n`);
  
  // Check existing props
  const existingCounts = await knex('player_props')
    .where({ gid })
    .select('sportsbook')
    .count('* as count')
    .groupBy('sportsbook');
  
  console.log('Existing props:');
  existingCounts.forEach(row => console.log(`  ${row.sportsbook}: ${row.count}`));
  console.log('');
  
  // Fetch data
  console.log('📡 Fetching FanDuel props...\n');
  const response = await axios.get(parsed.url, { headers: parsed.headers });
  
  if (!response.data.attachments?.markets) {
    throw new Error('No markets found');
  }
  
  const allPlayerProps = Object.values(response.data.attachments.markets)
    .filter(m => m.marketType && m.marketType.includes('PLAYER'));
  
  console.log(`✅ Found ${allPlayerProps.length} player markets`);
  
  const fullGameProps = filterFullGameProps(allPlayerProps);
  console.log(`✅ Filtered to ${fullGameProps.length} full-game props\n`);
  
  const wideFormatProps = transformToWideFormat(fullGameProps);
  console.log(`📊 Transformed to ${wideFormatProps.length} players\n`);
  
  // Name mismatch mapping
  const nameMismatches = {
    'Bogdan Bogdanovic': 'Bogdan Bogdanović',
    'Cam Thomas': 'Cameron Thomas',
    'Dennis Schroder': 'Dennis Schröder',
    'Luka Doncic': 'Luka Dončić',
    'Nikola Jokic': 'Nikola Jokić',
    'Nikola Jovic': 'Nikola Jović',
    'Nikola Vucevic': 'Nikola Vučević',
    'Nic Claxton': 'Nicolas Claxton',
  };
  
  // Enrich props with player_id, team, gdte, active flags, timestamps
  const enrichedProps = wideFormatProps.map(prop => {
    let playerName = prop.player_name;
    
    // Apply name mismatch mapping
    if (nameMismatches[playerName]) {
      playerName = nameMismatches[playerName];
    }
    
    // Find player in database
    const player = dailyPlayers.find(p => p.player_name === playerName);
    
    if (!player) {
      console.warn(`⚠️  Player not found in DB: ${prop.player_name}`);
    }
    
    // Set active flags for all prop types
    const activeFlags = {};
    const propTypes = ['pts', 'reb', 'ast', 'stl', 'blk', 'tov', 'fg3m', 
                       'pts+reb', 'pts+ast', 'pts+reb+ast', 'reb+ast'];
    propTypes.forEach(propType => {
      activeFlags[`${propType}_active`] = prop[propType] !== undefined && prop[propType] !== null;
    });
    
    return {
      ...prop,
      player_name: playerName, // Use corrected name
      player_id: player ? player.player_id : null,
      team: player ? player.team_abbreviation : null,
      gid,
      gdte: game.gdte,
      sportsbook: 'FanDuel',
      created_at: new Date(),
      updated_at: new Date(),
      ...activeFlags
    };
  });
  
  // Delete and insert
  await knex('player_props').where({ gid, sportsbook: 'FanDuel' }).del();
  
  if (enrichedProps.length > 0) {
    await knex('player_props').insert(enrichedPropsnst wideFormatProps = transformToWideFormat(fullGameProps);
  console.log(`📊 Transformed to ${wideFormatProps.length} players\n`);
  
  // Delete and insert
  await knex('player_props').where({ gid, sportsbook: 'FanDuel' }).del();
  
  if (wideFormatProps.length > 0) {
    await knex('player_props').insert(
      wideFormatProps.map(prop => ({ ...prop, gid, sportsbook: 'FanDuel' }))
    );
  }
  
  // Show results
  const saved = await knex('player_props')
    .where({ gid, sportsbook: 'FanDuel' })
    .select('player_name', 'player_id', 'team', 'gdte', 'created_at', 'updated_at',
            'pts', 'pts_over', 'pts_under', 'pts_active',
            'reb', 'reb_over', 'reb_under', 'reb_active',
            'ast', 'ast_over', 'ast_under', 'ast_active')
    .orderBy('player_name');
  
  console.log(`✅ Saved ${saved.length} FanDuel entries!\n`);
  
  console.log('Sample props (showing ALL fields):');
  saved.slice(0, 3).forEach(p => {
    console.log(`\n  ${p.player_name}:`);
    console.log(`    ✅ player_id: ${p.player_id}`);
    console.log(`    ✅ team: ${p.team}`);
    console.log(`    ✅ gdte: ${p.gdte}`);
    console.log(`    ✅ created_at: ${p.created_at}`);
    console.log(`    ✅ updated_at: ${p.updated_at}`);
    if (p.pts) {
      console.log(`    ✅ pts: ${p.pts} (O:${p.pts_over} U:${p.pts_under}) active:${p.pts_active}`);
    }
    if (p.reb) {
      console.log(`    ✅ reb: ${p.reb} (O:${p.reb_over} U:${p.reb_under}) active:${p.reb_active}`);
    }
    if (p.ast) {
      console.log(`    ✅ ast: ${p.ast} (O:${p.ast_over} U:${p.ast_under}) active:${p.ast_active}`);
    }
  });
  
  console.log('\n🎉 Integration test complete!\n');
  
} catch (error) {
  console.error('\n❌ Error:', error.message);
  if (error.response?.status === 403) {
    console.error('Token expired - get fresh cURL from DevTools');
  }
  process.exit(1);
} finally {
  await knex.destroy();
}
