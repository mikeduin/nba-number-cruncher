/**
 * Debug script to see what markets FanDuel is returning
 */

import axios from 'axios';

const EVENT_ID = '35085636';
const PX_CONTEXT = '_px3=06991ef96e25b9cf78b61799217d3e17c3c2a705585cc7f11409691f2a017d05:7td8dPeQNeaVlfItYuKD/VPGPKj5ugbaf8Pd6WHfCcfdGA0ZjRqUckElm7qOjXj39c0CiYeP1uboCh6r9ltpPA==:1000:qBLoFSSqkrFW3R7TITFXQAQsxTgYoc/2A921xBDSnu+2p7PUKBMxJxOg9gP1xNuVG11XC+OIqWgRjbDf/BfAzzlCBs6/uxxqG+EAQ/fQTBdUZgxL/F9z3jRA3M/qIgPLI719rTppoEcUzicbX0ENUTeEK3JEP6ftW6Twmopq+stM9BuUw1l8DhpUNJPBAXaARuNdfLyCbCDBUMSV3wQk32aQnCTWnHnMaQgSqCjU07Pa2++0MLt2dkfA8slkWXh2+aHZGGJl6dDsiuzWDRo+I00brFNjZhJ1hEYarIqV61XiVsbRqLjxIMeuma1cCj+I9M9YQzko8xvwUMZ0E9KdyQMLiLvgzmg472tkWaopRIs=;_pxvid=843fb5c3-dd1a-11f0-a072-a881202bd65a;pxcts=843fc028-dd1a-11f0-a072-af1f9d103e49;';
const REGION = 'NJ';

console.log('🔍 Fetching FanDuel markets for event:', EVENT_ID);
console.log('---\n');

try {
  const url = `https://api.sportsbook.fanduel.com/sbapi/event-page?eventId=${EVENT_ID}`;
  
  const response = await axios.get(url, {
    headers: {
      'accept': '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/json',
      'origin': 'https://sportsbook.fanduel.com',
      'referer': 'https://sportsbook.fanduel.com/',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'x-px-context': PX_CONTEXT,
      'x-sportsbook-region': REGION
    }
  });
  
  const markets = Object.values(response.data.attachments.markets || {});
  
  console.log(`📊 Total markets: ${markets.length}\n`);
  
  // Filter to player markets
  const playerMarkets = markets.filter(m => 
    m.runners && 
    m.runners.length > 0 &&
    m.runners.some(r => r.isPlayerSelection)
  );
  
  console.log(`👥 Player prop markets: ${playerMarkets.length}\n`);
  
  // Group by market type
  const marketTypes = {};
  playerMarkets.forEach(m => {
    const name = m.marketName.split(' - ')[1] || m.marketName;
    if (!marketTypes[name]) {
      marketTypes[name] = 0;
    }
    marketTypes[name]++;
  });
  
  console.log('📈 Market breakdown:');
  Object.entries(marketTypes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([name, count]) => {
      console.log(`  - ${name}: ${count}`);
    });
  
  console.log('\n📝 Sample market names (first 20):');
  playerMarkets.slice(0, 20).forEach((m, i) => {
    console.log(`  ${i + 1}. ${m.marketName} (${m.marketType})`);
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Data:', error.response.data);
  }
  process.exit(1);
}
