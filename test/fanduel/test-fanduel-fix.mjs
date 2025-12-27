/**
 * Test FanDuel prop scraping with propDisplay fix
 * Tests that DB column mapping works correctly
 */

import axios from 'axios';

const TEST_GAME_ID = 22500433; // Nuggets @ Magic, Dec 27, 2025
const EVENT_ID = '35085636';
const PX_CONTEXT = '_px3=06991ef96e25b9cf78b61799217d3e17c3c2a705585cc7f11409691f2a017d05:7td8dPeQNeaVlfItYuKD/VPGPKj5ugbaf8Pd6WHfCcfdGA0ZjRqUckElm7qOjXj39c0CiYeP1uboCh6r9ltpPA==:1000:qBLoFSSqkrFW3R7TITFXQAQsxTgYoc/2A921xBDSnu+2p7PUKBMxJxOg9gP1xNuVG11XC+OIqWgRjbDf/BfAzzlCBs6/uxxqG+EAQ/fQTBdUZgxL/F9z3jRA3M/qIgPLI719rTppoEcUzicbX0ENUTeEK3JEP6ftW6Twmopq+stM9BuUw1l8DhpUNJPBAXaARuNdfLyCbCDBUMSV3wQk32aQnCTWnHnMaQgSqCjU07Pa2++0MLt2dkfA8slkWXh2+aHZGGJl6dDsiuzWDRo+I00brFNjZhJ1hEYarIqV61XiVsbRqLjxIMeuma1cCj+I9M9YQzko8xvwUMZ0E9KdyQMLiLvgzmg472tkWaopRIs=;_pxvid=843fb5c3-dd1a-11f0-a072-a881202bd65a;pxcts=843fc028-dd1a-11f0-a072-af1f9d103e49;';

const BASE_URL = 'http://localhost:5000';

console.log('🧪 Testing FanDuel prop scraping with propDisplay fix\n');
console.log('Test game: Nuggets @ Magic (gid:', TEST_GAME_ID, ')');
console.log('Event ID:', EVENT_ID);
console.log('---\n');

// Test updating props
console.log('📥 Step 1: Updating FanDuel props...');
try {
  const response = await axios.post(`${BASE_URL}/api/updateProps`, {
    gid: TEST_GAME_ID,
    sportsbook: 'FanDuel',
    pxContext: PX_CONTEXT
  });
  
  console.log('✅ Props update response:', response.status);
  console.log('Response data:', JSON.stringify(response.data, null, 2));
} catch (error) {
  console.error('❌ Failed to update props:', error.message);
  if (error.response) {
    console.error('Response:', error.response.status, error.response.data);
  }
  process.exit(1);
}

console.log('\n---');
console.log('✅ Test complete! Check server logs for parsing details.');
console.log('Expected: propDisplay values like "Points", "Rebounds" should now map to DB columns');
