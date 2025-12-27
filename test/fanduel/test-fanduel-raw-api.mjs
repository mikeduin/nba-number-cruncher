/**
 * Diagnostic test - check what markets FanDuel API returns
 * Run this to see raw market data before filtering
 */

import axios from 'axios';

const EVENT_ID = '35085636';
const PX_CONTEXT = '_px3=398de490e4089ef8bb1ee3ff81cdbc248217098240058b4b6af786c9c10198ba:zGh6IaPayFIGEBDd8A7jKEEndGqLYr3uqRVyYfsfwJD2m7nG9z0zyvrP4kEKV57ErdR+vDemUZBWFjFFhmWRzg==:1000:nPvEpOQqH2iuxoNEhBnHgeluu08UPUwBPDjdHek2SFphrfeU2p/PsWRvsHDAXees/KA8zZKxvsRlnlUi+waFVonOII3A70vyDOAWLJLmssLr8BvKCt35ixE/V3HMd8dYf259WpRFcalmuJkn6a5oV5rqQLYvbFCIdwBXF2Y2bHlopfTr6RvUIWLOmUPG/38JUW9xblNqjD0+hosCkTf7vhvJfRmfr6dIm4qdTRy969r8qY965z+MWvDqmThnQdiBv0GNQ7jrOjWd3emY94Z+4kAUKYuvcD8zxY73SvYXzWJTchruYPzkDNhYMXxAKtMw26qhFlE2ri0ZL3kjGDWGaQ==;_pxvid=843fb5c3-dd1a-11f0-a072-a881202bd65a;pxcts=843fc028-dd1a-11f0-a072-af1f9d103e49;';
const REGION = 'NJ';

console.log('🔍 Checking FanDuel API raw response...\n');
console.log('Event ID:', EVENT_ID);
console.log('---\n');

try {
  const url = `https://api.sportsbook.fanduel.com/sbapi/event-page?betslipSize=REGULAR&eventId=${EVENT_ID}&includeMarketType=PLAYER_MARKET_TYPES&sportsbookRegionId=${REGION}&stateCode=${REGION}&referrer=%2Fsame-game-parlay%2Fbasketball%2Fnba%2Forland o-magic-%40-denver-nuggets-35085636&sgpEligible=true`;

  const headers = {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/json',
    'origin': 'https://sportsbook.fanduel.com',
    'referer': 'https://sportsbook.fanduel.com/',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'x-px-context': PX_CONTEXT,
    'x-sportsbook-region': REGION
  };

  console.log('📡 Fetching from FanDuel API...');
  const response = await axios.get(url, { headers });
  
  console.log(`✅ Response received (${JSON.stringify(response.data).length} bytes)\n`);
  
  const markets = Object.values(response.data.attachments.markets || {});
  console.log(`📊 Total markets: ${markets.length}`);
  
  // Filter to player prop markets
  const playerMarkets = markets.filter(m => 
    m.runners && m.runners.length > 0 && m.runners.some(r => r.isPlayerSelection)
  );
  console.log(`👥 Player prop markets: ${playerMarkets.length}\n`);
  
  // Group by prop type
  const propTypes = {};
  playerMarkets.forEach(market => {
    const marketType = market.marketType;
    if (!propTypes[marketType]) {
      propTypes[marketType] = [];
    }
    propTypes[marketType].push(market.marketName);
  });
  
  console.log('📈 Market types found:');
  Object.keys(propTypes).sort().forEach(type => {
    console.log(`\n  ${type} (${propTypes[type].length} markets)`);
    // Show first 3 examples
    propTypes[type].slice(0, 3).forEach(name => {
      console.log(`    - ${name}`);
    });
    if (propTypes[type].length > 3) {
      console.log(`    ... and ${propTypes[type].length - 3} more`);
    }
  });
  
} catch (error) {
  if (error.response) {
    console.error(`❌ API error: ${error.response.status} ${error.response.statusText}`);
    if (error.response.status === 403) {
      console.error('⚠️  Token expired! Get a fresh px-context from browser DevTools.');
    }
  } else {
    console.error('❌ Error:', error.message);
  }
  process.exit(1);
}

console.log('\n✅ Diagnostic complete');
