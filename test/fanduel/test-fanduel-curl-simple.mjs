/**
 * Test FanDuel scraping using a cURL command (pure JS version)
 * 
 * Usage: node test-fanduel-curl-simple.mjs "<curl_command>"
 */

import axios from 'axios';

const curlCommand = process.argv[2];

if (!curlCommand) {
  console.log('\n❌ Missing cURL command\n');
  console.log('Usage: node test-fanduel-curl-simple.mjs "<curl_command>"\n');
  console.log('Steps:');
  console.log('  1. Go to FanDuel game page');
  console.log('  2. Click "Same Game Parlay" tab');
  console.log('  3. Open DevTools → Network');
  console.log('  4. Find request to api.sportsbook.fanduel.com/sbapi/event-page');
  console.log('  5. Right-click → Copy → Copy as cURL (bash)');
  console.log('  6. Run: node test-fanduel-curl-simple.mjs "<paste_curl_here>"\n');
  process.exit(1);
}

function parseCurl(curlCommand) {
  // Extract URL
  const urlMatch = curlCommand.match(/curl '([^']+)'/);
  if (!urlMatch) {
    throw new Error('Could not find URL in cURL command');
  }
  
  const fullUrl = urlMatch[1];
  
  // Parse URL and query parameters
  const [baseUrl, queryString] = fullUrl.split('?');
  const queryParams = {};
  
  if (queryString) {
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      queryParams[key] = decodeURIComponent(value || '');
    });
  }
  
  // Extract headers
  const headers = {};
  const headerMatches = curlCommand.matchAll(/-H '([^:]+):\s*([^']+)'/g);
  
  for (const match of headerMatches) {
    const headerName = match[1].trim();
    const headerValue = match[2].trim();
    headers[headerName] = headerValue;
  }
  
  return {
    url: fullUrl,
    headers,
    queryParams,
    eventId: queryParams.eventId,
    region: headers['X-Sportsbook-Region'],
    pxContext: headers['x-px-context']
  };
}

function filterFullGameProps(props) {
  const quarterHalfRegex = /\b(1st|2nd|3rd|4th|First|Second|Third|Fourth)\s+(Quarter|Half|Qtr|Q)\b/i;
  return props.filter(prop => !quarterHalfRegex.test(prop.marketName));
}

try {
  console.log('\n🔍 Parsing cURL command...\n');
  
  const parsed = parseCurl(curlCommand);
  
  if (!parsed.eventId) {
    throw new Error('No eventId found in URL');
  }
  
  if (!parsed.pxContext) {
    throw new Error('No x-px-context header found');
  }
  
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
  fullGameProps.slice(0, 10).forEach(prop => {
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
  
  console.log(`✅ Test complete! Found ${fullGameProps.length} usable props.\n`);
  console.log('This game has event ID:', parsed.eventId);
  console.log('\nNext: Find the gid for this game and run the full integration test.\n');
  
} catch (error) {
  console.error('\n❌ Error:', error.message);
  if (error.response?.status === 403) {
    console.error('\n💡 The PerimeterX token may have expired.');
    console.error('Get a fresh cURL command from DevTools and try again.\n');
  } else if (error.response) {
    console.error('Response status:', error.response.status);
    console.error('Response data:', error.response.data);
  }
  process.exit(1);
}
