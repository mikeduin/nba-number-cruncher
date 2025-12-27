/**
 * Test FanDuel scraping using a cURL command
 * 
 * Usage: node test-fanduel-curl.mjs "<curl_command>"
 * 
 * Steps to get the cURL:
 * 1. Go to FanDuel game page
 * 2. Click "Same Game Parlay" tab
 * 3. Open DevTools → Network
 * 4. Find request to api.sportsbook.fanduel.com/sbapi/event-page
 * 5. Right-click → Copy → Copy as cURL (bash)
 * 6. Paste as argument to this script
 */

import axios from 'axios';
import { parseCurl, validateParsedCurl } from './utils/parseCurl.ts';
import { filterFullGameProps } from './utils/props/transformFanDuelProps.ts';

const curlCommand = process.argv[2];

if (!curlCommand) {
  console.log('\n❌ Missing cURL command\n');
  console.log('Usage: node test-fanduel-curl.mjs "<curl_command>"\n');
  console.log('Steps:');
  console.log('  1. Go to FanDuel game page');
  console.log('  2. Click "Same Game Parlay" tab');
  console.log('  3. Open DevTools → Network');
  console.log('  4. Find request to api.sportsbook.fanduel.com/sbapi/event-page');
  console.log('  5. Right-click → Copy → Copy as cURL (bash)');
  console.log('  6. Run: node test-fanduel-curl.mjs "<paste_curl_here>"\n');
  process.exit(1);
}

try {
  console.log('\n🔍 Parsing cURL command...\n');
  
  const parsed = parseCurl(curlCommand);
  validateParsedCurl(parsed);
  
  console.log('✅ Parsed successfully:');
  console.log(`  Event ID: ${parsed.eventId}`);
  console.log(`  Region: ${parsed.region || 'NJ (default)'}`);
  console.log(`  PX Context: ${parsed.pxContext.substring(0, 50)}...`);
  console.log(`  Headers: ${Object.keys(parsed.headers).length} found\n`);
  
  console.log('📡 Fetching FanDuel data...\n');
  
  // Make request with all headers from cURL
  const response = await axios.get(parsed.url, {
    headers: parsed.headers
  });
  
  const data = response.data;
  
  if (!data.attachments?.markets) {
    throw new Error('No markets found in response');
  }
  
  console.log(`✅ Response received: ${data.attachments.markets.length} total markets\n`);
  
  // Filter to player props
  const allPlayerProps = Object.values(data.attachments.markets)
    .filter(market => market.marketType && market.marketType.includes('PLAYER'))
    .map(market => ({
      marketId: market.marketId,
      marketName: market.marketName,
      marketType: market.marketType,
      runners: market.runners
    }));
  
  console.log(`🎯 Found ${allPlayerProps.length} player prop markets\n`);
  
  // Filter to full-game props only
  const fullGameProps = filterFullGameProps(allPlayerProps);
  
  console.log(`✅ After filtering quarters/halves: ${fullGameProps.length} full-game props\n`);
  
  // Group by prop type
  const propTypes = {};
  fullGameProps.forEach(prop => {
    const type = prop.marketType || 'unknown';
    propTypes[type] = (propTypes[type] || 0) + 1;
  });
  
  console.log('📊 Prop breakdown:');
  Object.entries(propTypes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
  
  console.log('\n📝 Sample props:\n');
  fullGameProps.slice(0, 5).forEach(prop => {
    console.log(`  ${prop.marketName}`);
    if (prop.runners?.length >= 2) {
      const over = prop.runners.find(r => r.result?.type === 'OVER');
      const under = prop.runners.find(r => r.result?.type === 'UNDER');
      if (over && under) {
        console.log(`    Line: ${over.handicap || 'N/A'}`);
        console.log(`    Over: ${over.winRunnerOdds?.americanDisplayOdds?.americanOdds || 'N/A'}`);
        console.log(`    Under: ${under.winRunnerOdds?.americanDisplayOdds?.americanOdds || 'N/A'}`);
      }
    }
    console.log('');
  });
  
  console.log('✅ Test complete! Data looks good.\n');
  console.log('Next steps:');
  console.log('  1. Find the gid for this game in your database');
  console.log('  2. Run: node set-fanduel-event-id.mjs <gid> ' + parsed.eventId);
  console.log('  3. Run: node test-fanduel-integration-curl.mjs <gid> "<curl_command>"\n');
  
} catch (error) {
  console.error('\n❌ Error:', error.message);
  if (error.response?.status === 403) {
    console.error('\n💡 The PerimeterX token may have expired.');
    console.error('Get a fresh cURL command from DevTools and try again.\n');
  }
  process.exit(1);
}
