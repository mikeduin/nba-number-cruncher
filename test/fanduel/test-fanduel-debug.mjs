/**
 * Debug FanDuel scraping to see what markets are being returned and filtered
 */

import axios from 'axios';

const TEST_GAME_ID = 22500433;
const PX_CONTEXT = '_px3=8d913ff04faee8774e0871ff4effa6096f0936882d800b89a08612cee69794cc:16Zs93sTcQgghU1b6CUiabvjqPUtYACaPGGJP+H4zhieaxMKxReWM4r3NdjRf7r8PzeXC6N94EVPgdA1po9A/w==:1000:0km7sM10ypTj7RcUzTQb5iN5REaeeyAQPgGAa07yzr7YoJ4FqAk+TnbbGhfujYaFGXvDcsRkecjHzFSUvoxW/G4C+m9+w9sKILDn1v80sBwg7gK7JYgmGDNk4IjhDImWslVyjKMGpmP4Zwk7UKB9tqTXdQgRsIdxvmGhH4inUjWe4IffDnD/mbWUlsT84PHVOexI+GF8njlJ+P5u5EHuNjPE6VXqK94R9ywn+EqsY22/hfR8REhr63KRjdmBk2qjTsLDcc6vmRl69saC0eq/Cpi2Wi8sM6XM9QaK76Q3mPCpjjjVD+GwYk/peR91M5lg/8GpI+U5f1XAJonqQCDEDxqmbZ57z+GXysVncLelJDPGLPpVf2TcUwQLRxY+8NKS;_pxvid=843fb5c3-dd1a-11f0-a072-a881202bd65a;pxcts=843fc028-dd1a-11f0-a072-af1f9d103e49;';

const BASE_URL = 'http://localhost:5000';

console.log('🔍 Testing FanDuel prop scraping and filtering\n');
console.log('Test game:', TEST_GAME_ID);
console.log('---\n');

// First, save the px-context globally
console.log('💾 Saving px-context globally...');
try {
  const saveResponse = await axios.post(`${BASE_URL}/api/updateFanDuelPxContext`, {
    pxContext: PX_CONTEXT
  });
  console.log('✅ px-context saved:', saveResponse.data.message);
} catch (error) {
  console.error('❌ Error saving px-context:', error.message);
}

console.log('\n📥 Calling /api/updateProps (should use stored px-context)...');
try {
  const response = await axios.post(`${BASE_URL}/api/updateProps`, {
    gid: TEST_GAME_ID,
    sportsbook: 'FanDuel'
    // Note: NOT passing pxContext - should use stored one
  });
  
  console.log('✅ Response:', response.status);
  console.log('Data:', JSON.stringify(response.data, null, 2));
  
  // Check what was saved
  console.log('\n📊 Checking database...');
  const dbCheck = await axios.get(`${BASE_URL}/api/fetchPlayerProps/2025-12-27`);
  const fanDuelProps = dbCheck.data.filter(p => 
    p.gid === TEST_GAME_ID && 
    p.sportsbook === 'FanDuel'
  );
  
  console.log(`\nFound ${fanDuelProps.length} FanDuel props for game ${TEST_GAME_ID}`);
  
  // Group by prop type
  const propTypes = {};
  fanDuelProps.forEach(p => {
    ['pts', 'reb', 'ast', 'fg3m', 'stl', 'blk', 'tov', 'pts+reb+ast'].forEach(type => {
      if (p[type] !== null) {
        propTypes[type] = (propTypes[type] || 0) + 1;
      }
    });
  });
  
  console.log('\nProp type breakdown:');
  Object.entries(propTypes).forEach(([type, count]) => {
    console.log(`  - ${type}: ${count} players`);
  });
  
  // Show sample props
  console.log('\nSample player (first with data):');
  const samplePlayer = fanDuelProps[0];
  console.log(`  ${samplePlayer.player_name} (${samplePlayer.team})`);
  ['pts', 'reb', 'ast', 'fg3m'].forEach(type => {
    if (samplePlayer[type] !== null) {
      console.log(`    ${type}: ${samplePlayer[type]} (${samplePlayer[type + '_over']}/${samplePlayer[type + '_under']}) [active: ${samplePlayer[type + '_active']}]`);
    }
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Data:', error.response.data);
  }
  process.exit(1);
}

console.log('\n✅ Debug test complete');
console.log('\nCheck server logs for details on:');
console.log('  - How many props were scraped initially');
console.log('  - How many were filtered out');
console.log('  - What propDisplay values were found');
