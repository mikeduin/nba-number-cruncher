/**
 * Test using actual Props.Controller to verify all fields are properly set
 */

import { updateSingleGameProps } from './controllers/Props.Controller.ts';
import { SportsbookName } from './types/index.ts';
import knex from './db/knex.js';

function parseCurl(curlCommand) {
  const urlMatch = curlCommand.match(/curl '([^']+)'/);
  if (!urlMatch) throw new Error('Could not find URL in cURL command');
  
  const fullUrl = urlMatch[1];
  const headers = {};
  const headerMatches = curlCommand.matchAll(/-H '([^:]+):\s*([^']+)'/g);
  for (const match of headerMatches) {
    headers[match[1].trim()] = match[2].trim();
  }
  
  return { pxContext: headers['x-px-context'] };
}

const gid = process.argv[2];
const curlCommand = process.argv[3];

if (!gid || !curlCommand) {
  console.log('\nUsage: node test-props-controller.mjs <gid> "<curl_command>"\n');
  process.exit(1);
}

try {
  const { pxContext } = parseCurl(curlCommand);
  
  console.log(`\n🎯 Testing Props.Controller.updateSingleGameProps for game ${gid}\n`);
  
  // Delete existing FanDuel props to test clean insert
  await knex('player_props').where({ gid, sportsbook: 'FanDuel' }).del();
  console.log('✅ Cleared existing FanDuel props\n');
  
  // Use the actual controller
  await updateSingleGameProps(gid, SportsbookName.FanDuel, pxContext);
  
  console.log('\n✅ Props updated via Props.Controller\n');
  
  // Check results with ALL fields
  const props = await knex('player_props')
    .where({ gid, sportsbook: 'FanDuel' })
    .select('*')
    .orderBy('player_name')
    .limit(3);
  
  console.log('📊 Sample props (first 3 players):\n');
  props.forEach(p => {
    console.log(`${p.player_name}:`);
    console.log(`  player_id: ${p.player_id}`);
    console.log(`  team: ${p.team}`);
    console.log(`  gdte: ${p.gdte}`);
    console.log(`  created_at: ${p.created_at}`);
    console.log(`  updated_at: ${p.updated_at}`);
    if (p.pts) console.log(`  pts: ${p.pts} (over:${p.pts_over} under:${p.pts_under}) active:${p.pts_active}`);
    if (p.reb) console.log(`  reb: ${p.reb} (over:${p.reb_over} under:${p.reb_under}) active:${p.reb_active}`);
    if (p.ast) console.log(`  ast: ${p.ast} (over:${p.ast_over} under:${p.ast_under}) active:${p.ast_active}`);
    console.log('');
  });
  
  console.log('🎉 Integration test complete!\n');
  
} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error(error);
  process.exit(1);
} finally {
  await knex.destroy();
}
