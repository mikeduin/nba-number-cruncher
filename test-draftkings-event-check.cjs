/**
 * Quick test to check if a DraftKings event has props available
 * Run: node test-draftkings-event-check.cjs
 */

const axios = require('axios');

const eventId = '33344371'; // Pistons @ Clippers

async function checkEvent() {
  console.log(`\n🔍 Checking DraftKings event ${eventId}...\n`);
  
  const client = axios.create({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Content-Type': 'application/json charset=utf-8',
      'DNT': '1',
      'Origin': 'https://sportsbook.draftkings.com',
      'Referer': 'https://sportsbook.draftkings.com/',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'x-client-feature': 'eventSubcategory',
      'x-client-name': 'web',
      'x-client-page': 'event',
      'x-client-version': '2551.1.1.9',
      'x-client-widget-name': 'cms',
      'x-client-widget-version': '1.7.0',
    },
    timeout: 30000
  });
  
  // Try to fetch general event info first
  try {
    const eventUrl = `https://sportsbook-nash.draftkings.com/sites/US-NJ-SB/api/sportscontent/dkussbcontent/v1/events/${eventId}?format=json`;
    console.log(`📡 Fetching event info: ${eventUrl}\n`);
    
    const eventResponse = await client.get(eventUrl);
    const event = eventResponse.data;
    
    console.log('📊 Event Details:');
    console.log(`  Name: ${event.name || 'N/A'}`);
    console.log(`  Status: ${event.eventStatus?.state || 'N/A'}`);
    console.log(`  Start: ${event.startDate || 'N/A'}`);
    console.log(`  Categories:`, event.categories?.map(c => c.name).join(', ') || 'N/A');
    console.log('');
    
    // Check if event is live/upcoming or finished
    if (event.eventStatus?.state === 'COMPLETE') {
      console.log('⚠️  This game has already finished - props are no longer available\n');
      return;
    }
    
  } catch (error) {
    console.log('❌ Could not fetch event info:', error.response?.status, error.message);
    console.log('   Trying subcategories anyway...\n');
  }
  
  // Try each subcategory - scan a range to find active IDs
  const subcategories = [
    { name: 'Points (old)', id: 16413 },
    { name: 'Assists (old)', id: 16414 },
    { name: 'Rebounds (old)', id: 16415 },
    { name: 'Threes (old)', id: 16416 },
    { name: 'Combos (old)', id: 16417 },
    { name: 'Defense (old)', id: 16419 },
    { name: 'From cURL', id: 16477 },
  ];
  
  console.log('🎯 Checking subcategories for props:\n');
  
  // Also scan a range around 16477 to find other active IDs
  console.log('🔍 Scanning range 16470-16485 to find active subcategories:\n');
  
  const foundSubcats = [];
  
  for (let id = 16470; id <= 16485; id++) {
    try {
      const url = `https://sportsbook-nash.draftkings.com/sites/US-NJ-SB/api/sportscontent/controldata/event/eventSubcategory/v1/markets?isBatchable=false&templateVars=${eventId}%2C${id}&marketsQuery=%24filter%3DeventId%20eq%20%27${eventId}%27%20AND%20clientMetadata%2FsubCategoryId%20eq%20%27${id}%27%20AND%20tags%2Fall%28t%3A%20t%20ne%20%27SportcastBetBuilder%27%29&entity=markets`;
      
      const response = await client.get(url);
      const { markets = [], selections = [] } = response.data;
      
      if (markets.length > 0) {
        console.log(`  ✅ ID ${id}: ${markets.length} markets, ${selections.length} selections`);
        foundSubcats.push(id);
        // Show first few market names as examples
        const examples = markets.slice(0, 3).map(m => m.name).join(', ');
        console.log(`     Examples: ${examples}`);
      }
    } catch (error) {
      // Silently skip errors
    }
  }
  
  console.log(`\n📊 Found active subcategory IDs: ${foundSubcats.join(', ')}\n`);
  
  console.log('\n✅ Check complete\n');
}

checkEvent().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
