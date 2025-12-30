import axios from 'axios';

// Event ID from the Betsson URL
const EVENT_ID = 'f--M5-fjk2rkyAutsiDU1vCA';

// Market template IDs based on what we found
const MARKET_TEMPLATES = {
  POINTS: 'PLYPROPPOINTS',
  REBOUNDS: 'PLYPROPREBOUNDS',
  ASSISTS: 'PLYPROPASSISTS',
  THREES: 'PLYPROPTHRSMDE',
  BLOCKS: 'PLYPROP TM',
  FT: 'PLYPROPFTM',
  PRA: 'PLYPROPPNTSASSTSRBNDS',
  PR: 'PLYPROPPNTSRBNDS'
};

async function testBetssonAPI() {
  console.log('🧪 Testing Betsson API Direct Access\n');
  console.log(`Event ID: ${EVENT_ID}\n`);

  // Try different header combinations
  const headerSets = [
    {
      name: 'Basic headers',
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'accept': 'application/json',
        'referer': `https://www.betsson.com/en/sportsbook/live/basketball?eventId=${EVENT_ID}&eti=1&mtg=4`
      }
    },
    {
      name: 'With correlation ID',
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'accept': 'application/json',
        'correlationid': Math.random().toString(36).substring(7),
        'x-obg-country-code': 'US',
        'x-obg-device': 'Desktop',
        'referer': `https://www.betsson.com/en/sportsbook/live/basketball?eventId=${EVENT_ID}&eti=1&mtg=4`
      }
    }
  ];

  for (const headerSet of headerSets) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Testing: ${headerSet.name}`);
    console.log('='.repeat(80));

    try {
      const url = `https://www.betsson.com/api/sb/v1/widgets/accordion/v1?eventId=${EVENT_ID}&marketTemplateIds=${MARKET_TEMPLATES.POINTS}`;
      console.log(`\nURL: ${url}\n`);

      const response = await axios.get(url, { headers: headerSet.headers });
      
      console.log(`✅ SUCCESS! Status: ${response.status}\n`);
      console.log('Response preview:');
      console.log(JSON.stringify(response.data, null, 2).substring(0, 1000) + '...\n');
      
      // If successful, test other prop types
      console.log('🎯 Testing other prop types...\n');
      for (const [type, templateId] of Object.entries(MARKET_TEMPLATES)) {
        try {
          const testUrl = `https://www.betsson.com/api/sb/v1/widgets/accordion/v1?eventId=${EVENT_ID}&marketTemplateIds=${templateId}`;
          const testResponse = await axios.get(testUrl, { headers: headerSet.headers });
          console.log(`  ✅ ${type}: ${Object.keys(testResponse.data).length} keys returned`);
        } catch (err) {
          console.log(`  ❌ ${type}: ${err.response?.status || err.message}`);
        }
      }
      
      // If we got here, we found working headers!
      console.log('\n🎉 Found working API access! These headers work:\n');
      console.log(JSON.stringify(headerSet.headers, null, 2));
      break;
      
    } catch (error) {
      console.log(`❌ FAILED: ${error.response?.status || error.message}`);
      if (error.response?.data) {
        console.log('Error response:', JSON.stringify(error.response.data));
      }
    }
  }
}

testBetssonAPI().catch(console.error);
