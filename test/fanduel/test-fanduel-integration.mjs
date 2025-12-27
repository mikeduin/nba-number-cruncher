/**
 * End-to-end test: Fetch FanDuel props and save to database
 * 
 * Usage: node test-fanduel-integration.mjs <gid> <px_token>
 * 
 * Steps:
 * 1. Fetches game from schedule
 * 2. Scrapes FanDuel props
 * 3. Transforms to wide format
 * 4. Saves to player_props table with sportsbook='FanDuel'
 */

import { updateSingleGameProps } from './controllers/Props.Controller.js';
import { SportsbookName } from './types/index.js';
import knex from './db/knex.js';

const gid = process.argv[2];
const pxToken = process.argv[3];

if (!gid || !pxToken) {
  console.log('\n❌ Missing arguments\n');
  console.log('Usage: node test-fanduel-integration.mjs <gid> <px_token>\n');
  console.log('Example:');
  console.log('  node test-fanduel-integration.mjs 0022400453 "your-px-token-here"\n');
  console.log('Get px_token from browser DevTools:');
  console.log('  1. Visit FanDuel in browser');
  console.log('  2. Open DevTools → Network');
  console.log('  3. Find request to api.sportsbook.fanduel.com');
  console.log('  4. Copy x-px-context header value\n');
  process.exit(1);
}

try {
  console.log(`\n🎯 Testing FanDuel integration for game ${gid}\n`);
  
  // Check if game exists and has FanDuel event ID
  const game = await knex('schedule')
    .where({ gid })
    .select('gid', 'gdte', 'v', 'h', 'fanduel_event_id')
    .first();
  
  if (!game) {
    console.error(`❌ Game ${gid} not found in schedule table`);
    process.exit(1);
  }
  
  if (!game.fanduel_event_id) {
    console.error(`❌ Game ${gid} does not have a fanduel_event_id`);
    console.error('Set it with: node set-fanduel-event-id.mjs <gid> <fanduel_event_id>');
    process.exit(1);
  }
  
  console.log('Game info:');
  console.log(`  Date: ${game.gdte}`);
  console.log(`  Teams: ${game.v[0].tn} @ ${game.h[0].tn}`);
  console.log(`  FanDuel Event ID: ${game.fanduel_event_id}\n`);
  
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
  
  // Fetch and save FanDuel props
  console.log('📡 Fetching FanDuel props...\n');
  
  await updateSingleGameProps(gid, SportsbookName.FanDuel, pxToken);
  
  // Check results
  const newFanDuelProps = await knex('player_props')
    .where({ gid, sportsbook: 'FanDuel' })
    .select('player_name', 'pts', 'pts_over', 'pts_under', 'reb', 'ast')
    .orderBy('player_name');
  
  console.log(`\n✅ Success! Saved ${newFanDuelProps.length} FanDuel prop entries\n`);
  
  if (newFanDuelProps.length > 0) {
    console.log('Sample props:');
    newFanDuelProps.slice(0, 5).forEach(prop => {
      console.log(`\n  ${prop.player_name}:`);
      if (prop.pts) console.log(`    Points: ${prop.pts} (${prop.pts_over}/${prop.pts_under})`);
      if (prop.reb) console.log(`    Rebounds: ${prop.reb}`);
      if (prop.ast) console.log(`    Assists: ${prop.ast}`);
    });
  }
  
  console.log('\n🎯 Test complete!\n');
  console.log('Next: Check your frontend to see FanDuel props alongside Betsson\n');
  
} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error(error);
  process.exit(1);
} finally {
  await knex.destroy();
}
