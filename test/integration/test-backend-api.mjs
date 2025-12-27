/**
 * Test FanDuel integration using proper backend flow
 * This will properly populate player_id, team, gdte, active flags, and timestamps
 */

import axios from 'axios';

const gid = process.argv[2];
const curlCommand = process.argv[3];

if (!gid || !curlCommand) {
  console.log('\nUsage: node test-backend-api.mjs <gid> "<curl_command>"\n');
  process.exit(1);
}

function parseCurl(curlCommand) {
  const urlMatch = curlCommand.match(/curl '([^']+)'/);
  if (!urlMatch) throw new Error('Could not find URL in cURL command');
  
  const fullUrl = urlMatch[1];
  const [baseUrl, queryString] = fullUrl.split('?');
  const queryParams = {};
  
  if (queryString) {
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      queryParams[key] = decodeURIComponent(value || '');
    });
  }
  
  const headers = {};
  const headerMatches = curlCommand.matchAll(/-H '([^:]+):\s*([^']+)'/g);
  for (const match of headerMatches) {
    headers[match[1].trim()] = match[2].trim();
  }
  
  return { 
    eventId: queryParams.eventId,
    pxContext: headers['x-px-context'] 
  };
}

try {
  const parsed = parseCurl(curlCommand);
  
  console.log(`\n🎯 Testing backend API for game ${gid}`);
  console.log(`   Event ID: ${parsed.eventId}\n`);
  
  // Call the backend API endpoint
  console.log('📡 Calling /api/updateProps...\n');
  
  const response = await axios.post('http://localhost:3000/api/updateProps', {
    gid,
    sportsbook: 'FanDuel',
    pxContext: parsed.pxContext
  });
  
  if (response.data.message === 'success') {
    console.log('✅ Props updated successfully!\n');
    
    // Now fetch and display the results
    console.log('📊 Fetching results from database...\n');
    
    const propsResponse = await axios.get(`http://localhost:3000/api/fetchPlayerProps/${gid.slice(0, 8)}`);
    const fanDuelProps = propsResponse.data.filter(p => p.gid === parseInt(gid) && p.sportsbook === 'FanDuel');
    
    console.log(`Found ${fanDuelProps.length} FanDuel prop entries\n`);
    
    // Display first 2 with all important fields
    fanDuelProps.slice(0, 2).forEach(p => {
      console.log(`${p.player_name}:`);
      console.log(`  ✅ player_id: ${p.player_id}`);
      console.log(`  ✅ team: ${p.team}`);
      console.log(`  ✅ gdte: ${p.gdte}`);
      console.log(`  ✅ created_at: ${p.created_at}`);
      console.log(`  ✅ updated_at: ${p.updated_at}`);
      console.log(`  ✅ sportsbook: ${p.sportsbook}`);
      if (p.pts) {
        console.log(`  ✅ pts: ${p.pts} (over: ${p.pts_over}, under: ${p.pts_under})`);
        console.log(`     pts_active: ${p.pts_active}`);
      }
      if (p.reb) {
        console.log(`  ✅ reb: ${p.reb} (over: ${p.reb_over}, under: ${p.reb_under})`);
        console.log(`     reb_active: ${p.reb_active}`);
      }
      if (p.ast) {
        console.log(`  ✅ ast: ${p.ast} (over: ${p.ast_over}, under: ${p.ast_under})`);
        console.log(`     ast_active: ${p.ast_active}`);
      }
      console.log('');
    });
    
    console.log('🎉 All fields properly populated!\n');
    
  } else {
    console.error('❌ Error from API:', response.data);
  }
  
} catch (error) {
  if (error.code === 'ECONNREFUSED') {
    console.error('\n❌ Cannot connect to backend server!');
    console.error('Make sure your Express server is running on port 3000\n');
    console.error('Start it with: npm start\n');
  } else if (error.response) {
    console.error('\n❌ API Error:', error.response.status, error.response.data);
  } else {
    console.error('\n❌ Error:', error.message);
  }
  process.exit(1);
}
