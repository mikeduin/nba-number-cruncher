/**
 * FanDuel endpoint test with authenticated session
 * 
 * This script uses your browser session to fetch FanDuel data
 * Status: READY TO RUN (cURL data already extracted)
 */

import axios from 'axios';
import fs from 'fs';

// ========================================
// Configuration (from your cURL command)
// ========================================

const EVENT_METADATA_URL = 'https://api.sportsbook.fanduel.com/sbapi/event-page?_ak=FhMFpcPWXMeyZxOx&eventId=35085635&tab=player-points&useCombinedTouchdownsVirtualMarket=true&usePulse=true&useQuickBets=true&useQuickBetsMLB=true';

// FanDuel uses PerimeterX anti-bot protection (extracted from your session)
const X_PX_CONTEXT = '_px3=f4d6d6e829599d8d296d806bc2ee91888009f75933ce8a220803917fc52770c2:FGl1MiwjVJ1oBYgyhy3YNGrXge4CFMo3iLy17FPREguJAxYtUxrhe1OqofRrY57w6PZA8tZ/hYiWf/tcl9qjzw==:1000:kSz7SVgZPXe0t+PqBpCeLY+CKiwolizek0jOBzZfqgUCLzsrOjEwiPdF4D1LzZsE2/MX4HRAzT75sWxNBVDDzgoWHVv8NtbdybRQ3zjta2xMFupn5Op3cT4Qn1yBex97NDsFb1JE07MMxp9zyraFZO1oHzSxuwKqXQrkmp6S3AkBNPqhZKBOlXnoxoTjjZYnIkc8YQj1hBqtKXXj6XNdUOCs/U83HpCAkONNxKKvUeNw7rfX3DYNhlGTmIE9DmPKbAFJhj/FaIeYTwTCUI3jiLVdXgexd9Q/J6PAAqDw408MSyFt1YJT+Ha8DtWDlmKhjSFNXXL1FAZDuunjhd9+mwmhrONsQ8XBUXEwxp/54n4=;_pxvid=843fb5c3-dd1a-11f0-a072-a881202bd65a;pxcts=843fc028-dd1a-11f0-a072-af1f9d103e49;';

const SPORTSBOOK_REGION = 'NJ';

// ========================================
// HTTP Client Configuration
// ========================================

const client = axios.create({
  headers: {
    'accept': 'application/json',
    'accept-language': 'en-US,en;q=0.9',
    'dnt': '1',
    'origin': 'https://nj.sportsbook.fanduel.com',
    'priority': 'u=1, i',
    'referer': 'https://nj.sportsbook.fanduel.com/',
    'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
    'x-px-context': X_PX_CONTEXT,
    'x-sportsbook-region': SPORTSBOOK_REGION
  },
  timeout: 30000
});

// ========================================
// Main Test Function
// ========================================

async function testFanDuelAPI() {
  console.log('🔍 Testing FanDuel API with your authenticated session...\n');
  console.log('📝 FanDuel uses TWO requests that must be JOINED:');
  console.log('   1️⃣  Event Metadata (player names, market definitions)');
  console.log('   2️⃣  Odds Data (marketId, selectionId, odds, handicap)\n');
  console.log('🔑 Using PerimeterX token from your session');
  console.log('🌍 Region: ' + SPORTSBOOK_REGION + '\n');

  try {
    // ========================================
    // Fetch Event Metadata
    // ========================================
    console.log('📡 Fetching event metadata...\n');
    
    const response = await client.get(EVENT_METADATA_URL);
    console.log('✅ Response received!\n');
    console.log('Status:', response.status, response.statusText);
    console.log('Response size:', JSON.stringify(response.data).length, 'bytes\n');
    
    const data = response.data;
    
    // ========================================
    // Analyze Structure
    // ========================================
    console.log('📊 Analyzing response structure...\n');
    console.log('Top-level keys:', Object.keys(data).join(', '));
    console.log('');
    
    let players = {};
    let markets = {};
    let selections = {};
    let oddsData = [];
    
    // Check for attachments (expected structure from ChatGPT conversation)
    if (data.attachments) {
      console.log('✅ Found "attachments" object - this is the expected structure!\n');
      
      players = data.attachments.players || {};
      markets = data.attachments.markets || {};
      selections = data.attachments.selections || {};
      
      console.log(`👥 Players found: ${Object.keys(players).length}`);
      console.log(`📈 Markets found: ${Object.keys(markets).length}`);
      console.log(`🎯 Selections found: ${Object.keys(selections).length}\n`);
      
      // Show sample player
      const samplePlayerId = Object.keys(players)[0];
      if (samplePlayerId) {
        console.log('Sample Player:');
        console.log(JSON.stringify(players[samplePlayerId], null, 2));
        console.log('');
      }
      
      // Show sample market
      const sampleMarketId = Object.keys(markets)[0];
      if (sampleMarketId) {
        console.log('Sample Market:');
        console.log(JSON.stringify(markets[sampleMarketId], null, 2));
        console.log('');
      }
      
      // Show sample selection
      const sampleSelectionId = Object.keys(selections)[0];
      if (sampleSelectionId) {
        console.log('Sample Selection:');
        console.log(JSON.stringify(selections[sampleSelectionId], null, 2));
        console.log('');
      }
    } else {
      console.log('⚠️  No "attachments" object found');
      console.log('Checking for alternative data structures...\n');
    }
    
    // Check for markets/odds data
    if (data.markets && Array.isArray(data.markets)) {
      console.log('✅ Found markets array with odds data');
      oddsData = data.markets;
      console.log(`📊 ${oddsData.length} markets with odds\n`);
    } else if (data.eventMarketGroups) {
      console.log('✅ Found eventMarketGroups');
    }
    
    // ========================================
    // Demonstrate JOIN operation
    // ========================================
    console.log('🔗 STEP 3: Demonstrating JOIN operation...\n');
    
    if (oddsData.length > 0 && Object.keys(markets).length > 0) {
      const sampleMarket = oddsData[0];
      console.log('Sample odds market data:');
      console.log(JSON.stringify(sampleMarket, null, 2));
      console.log('');
      
      if (sampleMarket.marketId && markets[sampleMarket.marketId]) {
        const marketDef = markets[sampleMarket.marketId];
        console.log('✅ Successfully joined market ID to definition!');
        console.log('Market Name:', marketDef.marketName || marketDef.name);
        
        if (marketDef.playerId && players[marketDef.playerId]) {
          console.log('Player Name:', players[marketDef.playerId].name);
        }
        
        if (sampleMarket.runnerDetails) {
          console.log('\nRunner Details (Over/Under):');
          sampleMarket.runnerDetails.forEach(runner => {
            const selectionName = selections[runner.selectionId]?.name || 'Unknown';
            const odds = runner.winRunnerOdds?.americanDisplayOdds?.americanOddsInt || 
                        runner.americanDisplayOdds?.americanOddsInt || 'N/A';
            console.log(`  ${selectionName}: Line ${runner.handicap}, Odds ${odds}`);
          });
        }
        
        console.log('\n✅ JOIN SUCCESSFUL!');
        console.log('This is the data pattern we need to implement in the scraper.\n');
      }
    } else if (Object.keys(markets).length > 0) {
      console.log('Markets found, but odds data structure is different');
      console.log('Check the saved JSON to see where odds live\n');
    }
    
    // ========================================
    // Save Response
    // ========================================
    const filename = `fanduel-response-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`💾 Full response saved to: ${filename}`);
    
    console.log('\n✅ TEST COMPLETE!');
    console.log('\n📋 Summary:');
    console.log('   ✓ PerimeterX authentication works');
    console.log('   ✓ API endpoint identified');
    console.log(`   ✓ Found ${Object.keys(players).length} players`);
    console.log(`   ✓ Found ${Object.keys(markets).length} markets`);
    console.log(`   ✓ Found ${Object.keys(selections).length} selections`);
    console.log('\n🎯 Next Steps:');
    console.log('   1. Review the saved JSON file');
    console.log('   2. Confirm the JOIN logic works for all prop types');
    console.log('   3. Implement scrapeFanDuel() function in Scraper.Controller.ts');
    console.log('   4. Create database tables for FanDuel props');
    
  } catch (error) {
    console.error('\n❌ Error occurred:\n');
    
    if (error.response) {
      console.error('Status:', error.response.status, error.response.statusText);
      console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
      
      if (error.response.status === 403) {
        console.log('\n⚠️  403 Forbidden - Possible causes:');
        console.log('   - PerimeterX token has expired (tokens typically last 5-30 min)');
        console.log('   - Need to refresh the page and get a new x-px-context');
        console.log('   - FanDuel detected automated request');
        console.log('\n💡 Solution: Get a fresh cURL command from DevTools');
      } else if (error.response.status === 404) {
        console.log('\n⚠️  404 Not Found - Possible causes:');
        console.log('   - Event ID may have changed or game is over');
        console.log('   - Try a different active game');
      }
      
      if (error.response.data) {
        console.log('\nResponse body:');
        console.log(JSON.stringify(error.response.data, null, 2));
      }
    } else if (error.request) {
      console.error('No response received from server');
      console.error('Request:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testFanDuelAPI();
