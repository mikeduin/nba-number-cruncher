/**
 * Test script to verify FanDuel integration
 */

import knex from '../../db/knex.js';
import axios from 'axios';

console.log('🧪 FanDuel Integration Test\n');

// Check games with FanDuel event IDs
console.log('1️⃣ Checking games with saved FanDuel event IDs...');
const games = await knex('schedule')
  .whereNotNull('fanduel_event_id')
  .select('gid', 'gdte', 'fanduel_event_id', 'h', 'v')
  .limit(5);

if (games.length === 0) {
  console.log('   ⚠️  No games found with FanDuel event IDs');
  console.log('   You can test by:');
  console.log('   1. Go to http://localhost:3000/gamblecast/2025-12-26');
  console.log('   2. Paste a FanDuel cURL command');
  console.log('   3. Click "Save Event ID"\n');
} else {
  console.log(`   ✅ Found ${games.length} games with FanDuel event IDs:\n`);
  games.forEach(g => {
    console.log(`   ${g.gid}: ${g.v[0].tn} @ ${g.h[0].tn} (${g.gdte})`);
    console.log(`   Event ID: ${g.fanduel_event_id}\n`);
  });
}

// Check if any FanDuel props exist
console.log('2️⃣ Checking for existing FanDuel props...');
const fdProps = await knex('player_props')
  .where({ sportsbook: 'FanDuel' })
  .select('gid', 'player_name', 'team', 'pts', 'reb', 'ast')
  .limit(5);

if (fdProps.length === 0) {
  console.log('   ⚠️  No FanDuel props found in database yet\n');
} else {
  console.log(`   ✅ Found ${fdProps.length} FanDuel prop entries:\n`);
  fdProps.forEach(p => {
    console.log(`   ${p.player_name} (${p.team}) - gid: ${p.gid}`);
    if (p.pts) console.log(`      Points: ${p.pts}`);
    if (p.reb) console.log(`      Rebounds: ${p.reb}`);
    if (p.ast) console.log(`      Assists: ${p.ast}`);
    console.log('');
  });
}

// Test the API endpoints
console.log('3️⃣ Testing API endpoints...');

try {
  // Test 1: Save Event ID endpoint
  console.log('   Testing /api/updateFanDuelEventId...');
  const testCurl = `curl 'https://api.sportsbook.fanduel.com/sbapi/event-page?eventId=35085635'`;
  const saveResponse = await axios.post('http://localhost:5000/api/updateFanDuelEventId', {
    gid: '0022400648',
    curlCommand: testCurl
  });
  
  if (saveResponse.data.message === 'success') {
    console.log(`   ✅ Save Event ID endpoint works! Event ID: ${saveResponse.data.eventId}\n`);
  } else {
    console.log(`   ⚠️  Unexpected response: ${JSON.stringify(saveResponse.data)}\n`);
  }
} catch (error) {
  if (error.code === 'ECONNREFUSED') {
    console.log('   ❌ Server is not running on port 5000');
    console.log('   Run: export PATH="/Users/michaelduin/.nvm/versions/node/v16.20.2/bin:$PATH" && yarn dev\n');
  } else {
    console.log(`   ⚠️  API test failed: ${error.message}\n`);
  }
}

console.log('📋 Manual Testing Steps:');
console.log('─────────────────────────────────────────────────────────');
console.log('1. Make sure your server is running (yarn dev)');
console.log('2. Open http://localhost:3000/gamblecast/2025-12-26');
console.log('3. Click on a game to see the player props section');
console.log('4. Go to FanDuel.com and open a game');
console.log('5. Open DevTools → Network tab');
console.log('6. Click on "Same Game Parlay" tab');
console.log('7. Find the event-page request → Right click → Copy as cURL');
console.log('8. Paste into the "FANDUEL cURL:" textarea');
console.log('9. Click "Save Event ID" (should see success toast)');
console.log('10. Click "Update Props [FD]" (should see success toast)');
console.log('11. Check if FanDuel props appear in the table\n');

await knex.destroy();
