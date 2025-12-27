/**
 * Debug script to inspect FanDuel prop data structures
 */

import axios from 'axios';

const curlCommand = process.argv[2];

if (!curlCommand) {
  console.log('Usage: node debug-fanduel-props.mjs "<curl_command>"');
  process.exit(1);
}

function parseCurl(curlCommand) {
  const urlMatch = curlCommand.match(/curl '([^']+)'/);
  if (!urlMatch) throw new Error('Could not find URL in cURL command');
  
  const fullUrl = urlMatch[1];
  const headers = {};
  const headerMatches = curlCommand.matchAll(/-H '([^:]+):\s*([^']+)'/g);
  for (const match of headerMatches) {
    headers[match[1].trim()] = match[2].trim();
  }
  
  return { url: fullUrl, headers };
}

try {
  const parsed = parseCurl(curlCommand);
  const response = await axios.get(parsed.url, { headers: parsed.headers });
  
  const allPlayerProps = Object.values(response.data.attachments.markets)
    .filter(m => m.marketType && m.marketType.includes('PLAYER'));
  
  // Find a points prop and a rebounds prop for comparison
  const pointsProp = allPlayerProps.find(p => p.marketName.includes('Points') && !p.marketName.includes('+'));
  const reboundsProp = allPlayerProps.find(p => p.marketName.includes('Rebounds') && !p.marketName.includes('+'));
  
  console.log('\n=== POINTS PROP ===');
  console.log('Market Name:', pointsProp.marketName);
  console.log('Market Type:', pointsProp.marketType);
  console.log('\nRunners:');
  pointsProp.runners.forEach((r, i) => {
    console.log(`\nRunner ${i}:`);
    console.log('  Result Type:', r.result?.type);
    console.log('  Handicap:', r.handicap);
    console.log('  Full odds object:', JSON.stringify(r.winRunnerOdds, null, 2));
  });
  
  console.log('\n\n=== REBOUNDS PROP ===');
  console.log('Market Name:', reboundsProp.marketName);
  console.log('Market Type:', reboundsProp.marketType);
  console.log('\nRunners:');
  reboundsProp.runners.forEach((r, i) => {
    console.log(`\nRunner ${i}:`);
    console.log('  Result Type:', r.result?.type);
    console.log('  Handicap:', r.handicap);
    console.log('  Full odds object:', JSON.stringify(r.winRunnerOdds, null, 2));
  });
  
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
