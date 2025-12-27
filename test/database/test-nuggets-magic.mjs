/**
 * Test FanDuel integration with Nuggets @ Magic game
 */

import knex from '../../db/knex.js';
import axios from 'axios';

const curlCommand = `curl 'https://api.sportsbook.fanduel.com/sbapi/event-page?_ak=FhMFpcPWXMeyZxOx&eventId=35085636&tab=same-game-parlay-&useCombinedTouchdownsVirtualMarket=true&usePulse=true&useQuickBets=true&useQuickBetsMLB=true' -H 'X-Sportsbook-Region: NJ' -H 'sec-ch-ua-platform: "macOS"' -H 'Referer: https://nj.sportsbook.fanduel.com/' -H 'sec-ch-ua: "Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"' -H 'sec-ch-ua-mobile: ?0' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36' -H 'Accept: application/json' -H 'DNT: 1' -H 'x-px-context: _px3=398de490e4089ef8bb1ee3ff81cdbc248217098240058b4b6af786c9c10198ba:zGh6IaPayFIGEBDd8A7jKEEndGqLYr3uqRVyYfsfwJD2m7nG9z0zyvrP4kEKV57ErdR+vDemUZBWFjFFhmWRzg==:1000:nPvEpOQqH2iuxoNEhBnHgeluu08UPUwBPDjdHek2SFphrfeU2p/PsWRvsHDAXees/KA8zZKxvsRlnlUi+waFVonOII3A70vyDOAWLJLmssLr8BvKCt35ixE/V3HMd8dYf259WpRFcalmuJkn6a5oV5rqQLYvbFCIdwBXF2Y2bHlopfTr6RvUIWLOmUPG/38JUW9xblNqjD0+hosCkTf7vhvJfRmfr6dIm4qdTRy969r8qY965z+MWvDqmThnQdiBv0GNQ7jrOjWd3emY94Z+4kAUKYuvcD8zxY73SvYXzWJTchruYPzkDNhYMXxAKtMw26qhFlE2ri0ZL3kjGDWGaQ==;_pxvid=843fb5c3-dd1a-11f0-a072-a881202bd65a;pxcts=843fc028-dd1a-11f0-a072-af1f9d103e49;'`;

console.log('🧪 Testing FanDuel with Nuggets @ Magic\n');

// Step 1: Find the game
console.log('1️⃣ Finding Nuggets @ Magic game...');
const today = '2025-12-27'; // Today's date
const games = await knex('schedule')
  .where('gdte', today)
  .select('gid', 'gdte', 'h', 'v', 'fanduel_event_id');

const nuggetsGame = games.find(g => 
  (g.h[0].tn === 'Nuggets' || g.v[0].tn === 'Nuggets') &&
  (g.h[0].tn === 'Magic' || g.v[0].tn === 'Magic')
);

if (!nuggetsGame) {
  console.log(`❌ Could not find Nuggets @ Magic game on ${today}`);
  console.log('Available games on that date:');
  games.forEach(g => console.log(`  ${g.v[0].tn} @ ${g.h[0].tn}`));
  await knex.destroy();
  process.exit(1);
}

console.log(`✅ Found game: ${nuggetsGame.v[0].tn} @ ${nuggetsGame.h[0].tn}`);
console.log(`   GID: ${nuggetsGame.gid}`);
console.log(`   Current FanDuel Event ID: ${nuggetsGame.fanduel_event_id || 'Not set'}\n`);

const gid = nuggetsGame.gid;

// Step 2: Save Event ID via API
console.log('2️⃣ Testing Save Event ID API...');
try {
  const saveResponse = await axios.post('http://localhost:5000/api/updateFanDuelEventId', {
    gid,
    curlCommand
  });
  
  if (saveResponse.data.message === 'success') {
    console.log(`✅ Event ID saved: ${saveResponse.data.eventId}\n`);
  } else {
    console.log(`⚠️  Unexpected response: ${JSON.stringify(saveResponse.data)}\n`);
  }
} catch (error) {
  console.log(`❌ Failed to save event ID: ${error.message}`);
  if (error.code === 'ECONNREFUSED') {
    console.log('   Server is not running. Start with: yarn dev\n');
  }
  await knex.destroy();
  process.exit(1);
}

// Step 3: Update Props via API
console.log('3️⃣ Testing Update Props API...');
try {
  // Extract px-context
  const pxMatch = curlCommand.match(/x-px-context[:'"\s]*([^'";\s]+)/);
  const pxContext = pxMatch ? pxMatch[1] : null;
  
  if (!pxContext) {
    console.log('❌ Could not extract px-context from cURL\n');
    await knex.destroy();
    process.exit(1);
  }
  
  console.log(`   Using px-context: ${pxContext.substring(0, 50)}...`);
  
  const propsResponse = await axios.post('http://localhost:5000/api/updateProps', {
    gid,
    sportsbook: 'FanDuel',
    pxContext
  });
  
  if (propsResponse.data.message === 'success') {
    console.log(`✅ Props updated successfully!\n`);
  } else {
    console.log(`⚠️  Unexpected response: ${JSON.stringify(propsResponse.data)}\n`);
  }
} catch (error) {
  console.log(`❌ Failed to update props: ${error.message}`);
  if (error.response?.data) {
    console.log(`   Server error: ${JSON.stringify(error.response.data)}`);
  }
  await knex.destroy();
  process.exit(1);
}

// Step 4: Verify props were saved
console.log('4️⃣ Verifying saved props...');
const savedProps = await knex('player_props')
  .where({ gid, sportsbook: 'FanDuel' })
  .select('player_name', 'team', 'pts', 'pts_over', 'pts_under', 'reb', 'ast');

console.log(`✅ Found ${savedProps.length} FanDuel props for this game:\n`);
savedProps.slice(0, 5).forEach(p => {
  console.log(`   ${p.player_name} (${p.team})`);
  if (p.pts) console.log(`      Points: ${p.pts} (O:${p.pts_over} U:${p.pts_under})`);
  if (p.reb) console.log(`      Rebounds: ${p.reb}`);
  if (p.ast) console.log(`      Assists: ${p.ast}`);
  console.log('');
});

if (savedProps.length > 5) {
  console.log(`   ... and ${savedProps.length - 5} more players\n`);
}

console.log('✅ FanDuel integration test completed successfully!');

await knex.destroy();
