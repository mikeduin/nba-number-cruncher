/**
 * End-to-end test: Fetch FanDuel props using cURL and save to database
 * 
 * Usage: node test-fanduel-integration-curl.mjs <gid> "<curl_command>"
 */

import knex from './db/knex.js';
import axios from 'axios';
import { parseCurl, validateParsedCurl } from './utils/parseCurl.ts';
import { scrapeFanDuel } from './controllers/Scraper.Controller.ts';
import { transformFanDuelPropsToWideFormat } from './utils/props/transformFanDuelProps.ts';

const gid = process.argv[2];
const curlCommand = process.argv[3];

if (!gid || !curlCommand) {
  console.log('\n❌ Missing arguments\n');
  console.log('Usage: node test-fanduel-integration-curl.mjs <gid> "<curl_command>"\n');
  console.log('Steps:');
  console.log('  1. Go to FanDuel game page');
  console.log('  2. Click "Same Game Parlay" tab');
  console.log('  3. Open DevTools → Network');
  console.log('  4. Find request to api.sportsbook.fanduel.com/sbapi/event-page');
  console.log('  5. Right-click → Copy → Copy as cURL (bash)');
  console.log('  6. Run: node test-fanduel-integration-curl.mjs <gid> "<paste_curl_here>"\n');
  process.exit(1);
}

try {
  console.log(`\n🎯 Testing FanDuel integration for game ${gid}\n`);
  
  // Parse cURL
  const parsed = parseCurl(curlCommand);
  validateParsedCurl(parsed);
  
  console.log('✅ Parsed cURL:');
  console.log(`  Event ID: ${parsed.eventId}\n`);
  
  // Check if game exists
  const game = await knex('schedule')
    .where({ gid })
    .select('gid', 'gdte', 'v', 'h', 'fanduel_event_id')
    .first();
  
  if (!game) {
    console.error(`❌ Game ${gid} not found in schedule table`);
    process.exit(1);
  }
  
  console.log('Game info:');
  console.log(`  Date: ${game.gdte}`);
  console.log(`  Teams: ${game.v[0].tn} @ ${game.h[0].tn}`);
  console.log(`  Stored FanDuel Event ID: ${game.fanduel_event_id || 'not set'}`);
  console.log(`  Current cURL Event ID: ${parsed.eventId}\n`);
  
  // Update event ID if different
  if (game.fanduel_event_id !== parsed.eventId) {
    console.log(`📝 Updating fanduel_event_id to ${parsed.eventId}...`);
    await knex('schedule')
      .where({ gid })
      .update({ fanduel_event_id: parsed.eventId });
    console.log('✅ Updated\n');
  }
  
  // Check existing props
  const existingBetssonProps = await knex('player_props')
    .where({ gid, sportsbook: 'Betsson' })
    .count('* as count')
    .first();
  
  const existingFanDuelProps = await knex('player_props')
    .where({ gid, sportsbook: 'FanDuel' })
    .count('* as count')
    .first();
  
  console.log('Existing props:');
  console.log(`  Betsson: ${existingBetssonProps.count} players`);
  console.log(`  FanDuel: ${existingFanDuelProps.count} players\n`);
  
  // Scrape FanDuel props using the full cURL headers
  console.log('📡 Fetching FanDuel props...\n');
  
  const response = await axios.get(parsed.url, {
    headers: parsed.headers
  });
  
  const data = response.data;
  
  if (!data.attachments?.markets) {
    throw new Error('No markets found in response');
  }
  
  // Filter and parse props (same logic as scrapeFanDuel)
  const allPlayerProps = Object.values(data.attachments.markets)
    .filter(market => market.marketType && market.marketType.includes('PLAYER'));
  
  console.log(`✅ Found ${allPlayerProps.length} player prop markets\n`);
  
  // Transform to wide format
  const wideFormatProps = transformFanDuelPropsToWideFormat(allPlayerProps);
  
  console.log(`📊 Transformed to ${wideFormatProps.length} player entries\n`);
  
  // Delete existing FanDuel props for this game
  await knex('player_props')
    .where({ gid, sportsbook: 'FanDuel' })
    .del();
  
  // Insert new props
  if (wideFormatProps.length > 0) {
    await knex('player_props').insert(
      wideFormatProps.map(prop => ({
        ...prop,
        gid,
        sportsbook: 'FanDuel'
      }))
    );
  }
  
  // Check results
  const newFanDuelProps = await knex('player_props')
    .where({ gid, sportsbook: 'FanDuel' })
    .select('player_name', 'pts', 'pts_over', 'pts_under', 'reb', 'ast', 'blk', 'stl')
    .orderBy('player_name');
  
  console.log(`✅ Success! Saved ${newFanDuelProps.length} FanDuel prop entries\n`);
  
  if (newFanDuelProps.length > 0) {
    console.log('Sample props:');
    newFanDuelProps.slice(0, 5).forEach(prop => {
      console.log(`\n  ${prop.player_name}:`);
      if (prop.pts) console.log(`    Points: ${prop.pts} (${prop.pts_over}/${prop.pts_under})`);
      if (prop.reb) console.log(`    Rebounds: ${prop.reb} (${prop.reb_over}/${prop.reb_under})`);
      if (prop.ast) console.log(`    Assists: ${prop.ast} (${prop.ast_over}/${prop.ast_under})`);
      if (prop.blk) console.log(`    Blocks: ${prop.blk}`);
      if (prop.stl) console.log(`    Steals: ${prop.stl}`);
    });
  }
  
  console.log('\n🎉 Test complete!\n');
  console.log('Your frontend should now show FanDuel props alongside Betsson.\n');
  
} catch (error) {
  console.error('\n❌ Error:', error.message);
  if (error.response?.status === 403) {
    console.error('\n💡 The PerimeterX token may have expired.');
    console.error('Get a fresh cURL command from DevTools and try again.\n');
  } else {
    console.error(error);
  }
  process.exit(1);
} finally {
  await knex.destroy();
}
