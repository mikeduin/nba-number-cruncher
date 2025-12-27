/**
 * Test script to verify FanDuel API endpoints
 * 
 * This script will help you identify the correct FanDuel endpoints by:
 * 1. Fetching the event payload (player names, market definitions)
 * 2. Fetching the odds data
 * 3. Joining them together to create readable prop data
 * 
 * Usage:
 * 1. Open DevTools on a FanDuel game page
 * 2. Go to Network → Fetch/XHR
 * 3. Look for large JSON responses containing "attachments"
 * 4. Copy the URL and paste it as EVENT_URL below
 * 5. Run: node test-fanduel-endpoints.js
 */

import axios from 'axios';
import fs from 'fs';

// STEP 1: Replace this with the actual FanDuel event URL you find in DevTools
// Look for something like: https://sbapi.nj.sportsbook.fanduel.com/api/event-page?...
const EVENT_URL = 'PASTE_YOUR_EVENT_URL_HERE';

// Configure axios to mimic a real browser
const client = axios.create({
  headers: {
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'accept': 'application/json',
    'accept-language': 'en-US,en;q=0.9',
    'referer': 'https://nj.sportsbook.fanduel.com/',
    'origin': 'https://nj.sportsbook.fanduel.com',
    'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site'
  },
  timeout: 30000
});

async function testFanDuelEndpoint() {
  console.log('🔍 Testing FanDuel API endpoint...\n');
  
  if (EVENT_URL === 'PASTE_YOUR_EVENT_URL_HERE') {
    console.log('❌ ERROR: You need to set the EVENT_URL first!');
    console.log('\nHow to find the correct URL:');
    console.log('1. Open: https://nj.sportsbook.fanduel.com/basketball/nba/[any-game]?tab=player-points');
    console.log('2. Open DevTools (F12) → Network tab → Filter by "Fetch/XHR"');
    console.log('3. Reload the page');
    console.log('4. Look for a large JSON response (100+ KB)');
    console.log('5. Common patterns to look for:');
    console.log('   - URL contains "event-page" or "content-managed-page"');
    console.log('   - Response has "attachments" object with "players", "markets", "selections"');
    console.log('   - Response has "events" or "eventId"');
    console.log('6. Right-click the request → Copy → Copy URL');
    console.log('7. Paste it as EVENT_URL in this file\n');
    return;
  }

  try {
    console.log(`📡 Fetching: ${EVENT_URL}\n`);
    const response = await client.get(EVENT_URL);
    
    console.log('✅ Response received!\n');
    console.log('📊 Response structure analysis:\n');
    
    const data = response.data;
    
    // Analyze the structure
    console.log('Top-level keys:', Object.keys(data).join(', '));
    console.log('');
    
    // Look for attachments (the key data structure)
    if (data.attachments) {
      console.log('✅ Found attachments object!');
      console.log('Attachments keys:', Object.keys(data.attachments).join(', '));
      
      if (data.attachments.players) {
        const playerIds = Object.keys(data.attachments.players);
        console.log(`\n👥 Players found: ${playerIds.length}`);
        console.log('Sample player:', JSON.stringify(data.attachments.players[playerIds[0]], null, 2));
      }
      
      if (data.attachments.markets) {
        const marketIds = Object.keys(data.attachments.markets);
        console.log(`\n📈 Markets found: ${marketIds.length}`);
        console.log('Sample market:', JSON.stringify(data.attachments.markets[marketIds[0]], null, 2));
      }
      
      if (data.attachments.selections) {
        const selectionIds = Object.keys(data.attachments.selections);
        console.log(`\n🎯 Selections found: ${selectionIds.length}`);
        console.log('Sample selection:', JSON.stringify(data.attachments.selections[selectionIds[0]], null, 2));
      }
    } else {
      console.log('⚠️  No "attachments" object found. Looking for alternative structures...\n');
      
      // Look for alternative data structures
      if (data.events) {
        console.log('Found "events" array/object');
      }
      if (data.markets) {
        console.log('Found "markets" array/object');
      }
      if (data.runners || data.runnerDetails) {
        console.log('Found runner/selection data');
      }
    }
    
    // Save full response for inspection
    const filename = `fanduel-response-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`\n💾 Full response saved to: ${filename}`);
    console.log('\nNext steps:');
    console.log('1. Open the saved JSON file');
    console.log('2. Look for player names, market names, and odds data');
    console.log('3. Identify the structure for joining market IDs to player info');
    
  } catch (error) {
    console.error('❌ Error fetching data:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Headers:', error.response.headers);
      
      if (error.response.status === 403) {
        console.log('\n⚠️  Got 403 Forbidden. This could mean:');
        console.log('- You need to be in a legal betting state (NJ, PA, etc.)');
        console.log('- FanDuel detected automation');
        console.log('- Additional cookies/auth required');
        console.log('\nTry:');
        console.log('1. Make sure you can access the page in a regular browser');
        console.log('2. Copy the full cURL command from DevTools (including cookies)');
        console.log('3. We may need to add session cookies to the request');
      }
    } else if (error.request) {
      console.error('No response received');
      console.error('Request config:', error.config);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Example of what we're looking for (from ChatGPT conversation)
function exampleExpectedStructure() {
  console.log('\n📚 Expected FanDuel data structure (reference):\n');
  console.log('EVENT PAYLOAD (metadata):');
  console.log(`{
  "attachments": {
    "players": {
      "85219": {
        "id": "85219",
        "name": "Luka Doncic"
      }
    },
    "markets": {
      "734.151282289": {
        "id": "734.151282289",
        "name": "Player Points",
        "playerId": "85219"
      }
    },
    "selections": {
      "43025877": { "id": "43025877", "name": "Over" },
      "43025876": { "id": "43025876", "name": "Under" }
    }
  }
}`);

  console.log('\n\nODDS PAYLOAD (what you already captured):');
  console.log(`{
  "marketId": "734.151282289",
  "runnerDetails": [
    {
      "selectionId": 43025877,
      "handicap": 28.5,
      "americanDisplayOdds": { "americanOddsInt": -154 }
    },
    {
      "selectionId": 43025876,
      "handicap": 28.5,
      "americanDisplayOdds": { "americanOddsInt": 116 }
    }
  ]
}`);

  console.log('\n\nJOINED RESULT:');
  console.log(`{
  "player": "Luka Doncic",
  "market": "Player Points",
  "line": 28.5,
  "side": "Over",
  "odds": -154
}`);
}

// Run the test
testFanDuelEndpoint();

// Show expected structure as reference
// exampleExpectedStructure();
