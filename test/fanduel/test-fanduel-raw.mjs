/**
 * Direct test of FanDuel scraper to see raw output
 */

import axios from 'axios';

const EVENT_ID = '35085636';
const PX_CONTEXT = '_px3=2fe36a626c799d2f3ae0535e5df7f24a751fad7a45ec56d02ce1b905c489cfe8:m5Eu8jZC1uK0DnINVKEDGm99XRtnl6/EiUC8xag3Wo5V45cfZONuA8W8xuwyAf5+kCJ1AE762I/WVfaElzKogQ==:1000:qbf4WChtNBw19rBfIk68QSfoDo8UTegcTNU6++qfaEkkrsAOI7oIutfEhEqB8vkA3IJnBPhysds5iRJ5pg7riLsTfUGalcxicC90bBIknAfBkA2FdWmGni/knud1m6WDN2YUOqnGvHsQhY7Kw0UJoqat6mKjK789tIUF2HJBDlbblgYhd8zjSVdgVXCDpceD+JMJNqfWoDS4Nh1kp41ey4V6zN21exHAfPJG7syOncDWo5CaAoJttJ/siStTvOAVFY2ReBCx0BWUukoU0LAA7fNqKb2YqOcOhPtloVOds6YhdnOmMzTvGc2AyGNkAGukHLhSc8WOGVeVU/83ca14sdcX7BnLM0Mxv5uRGop+hfIrpHekPh/snKEcDK0wwYbG;_pxvid=843fb5c3-dd1a-11f0-a072-a881202bd65a;pxcts=843fc028-dd1a-11f0-a072-af1f9d103e49;';
const REGION = 'NJ';

console.log('🔍 Direct FanDuel API test\n');

try {
  const url = `https://api.sportsbook.fanduel.com/sbapi/event-page?eventId=${EVENT_ID}`;
  
  const response = await axios.get(url, {
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
      'x-px-context': PX_CONTEXT,
      'x-sportsbook-region': REGION
    }
  });
  
  console.log('✅ API Response received');
  
  const markets = Object.values(response.data.attachments.markets || {});
  console.log(`📊 Total markets: ${markets.length}`);
  
  // Filter to player markets
  const playerMarkets = markets.filter(m => 
    m.runners && 
    m.runners.length > 0 &&
    m.runners.some(r => r.isPlayerSelection)
  );
  
  console.log(`👥 Player prop markets: ${playerMarkets.length}\n`);
  
  // Group by market name (after player name)
  const marketTypes = {};
  playerMarkets.forEach(m => {
    // Extract prop type from market name (e.g., "Nikola Jokic - Points" -> "Points")
    const parts = m.marketName.split(' - ');
    const propType = parts.length > 1 ? parts[1] : m.marketName;
    marketTypes[propType] = (marketTypes[propType] || 0) + 1;
  });
  
  console.log('📈 Market types breakdown:');
  Object.entries(marketTypes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  - ${type}: ${count} markets`);
    });
  
  console.log('\n📝 First 30 market names:');
  playerMarkets.slice(0, 30).forEach((m, i) => {
    const parts = m.marketName.split(' - ');
    const player = parts[0];
    const propType = parts.length > 1 ? parts[1] : 'N/A';
    console.log(`  ${i + 1}. ${player} - ${propType} (${m.marketType})`);
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Data:', JSON.stringify(error.response.data));
  }
  process.exit(1);
}
