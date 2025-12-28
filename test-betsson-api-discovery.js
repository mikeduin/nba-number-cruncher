import puppeteer from 'puppeteer';
import fs from 'fs';

// Test URL - specific event page with betting markets
const BETSSON_URL = 'https://www.betsson.com/en/sportsbook/live/basketball?eventId=f--M5-fjk2rkyAutsiDU1vCA&eti=1&mtg=4';

async function discoverBetssonAPI() {
  console.log('🔍 Launching browser to discover Betsson API endpoints...\n');
  
  const browser = await puppeteer.launch({
    executablePath: '/opt/homebrew/bin/chromium',
    headless: false, // Set to true once we know what we're looking for
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    ]
  });

  const page = await browser.newPage();
  
  // Capture all API requests
  const apiRequests = [];
  
  page.on('request', request => {
    const url = request.url();
    // Look for the accordion API specifically
    if (url.includes('/api/sb/v1/widgets/accordion/v1')) {
      apiRequests.push({
        method: request.method(),
        url: url,
        headers: request.headers(),
        postData: request.postData()
      });
      console.log(`\n🎯 FOUND ACCORDION API CALL!\nURL: ${url}\nHeaders:`, JSON.stringify(request.headers(), null, 2));
    }
    // Look for API calls (typically JSON endpoints)
    else if (url.includes('/api/') || 
        url.includes('/sportsbook/') || 
        url.includes('.json') ||
        url.includes('graphql') ||
        request.resourceType() === 'xhr' ||
        request.resourceType() === 'fetch') {
      apiRequests.push({
        method: request.method(),
        url: url,
        headers: request.headers(),
        postData: request.postData()
      });
    }
  });

  // Capture responses
  const apiResponses = [];
  page.on('response', async response => {
    const url = response.url();
    const contentType = response.headers()['content-type'] || '';
    
    // Look for JSON responses that might contain betting data
    if (contentType.includes('application/json') || 
        url.includes('/api/') ||
        url.includes('/sportsbook/')) {
      try {
        const responseData = await response.json();
        
        // Check if this looks like betting data
        const responseStr = JSON.stringify(responseData).toLowerCase();
        if (responseStr.includes('market') || 
            responseStr.includes('selection') ||
            responseStr.includes('odds') ||
            responseStr.includes('player') ||
            responseStr.includes('prop')) {
          apiResponses.push({
            url: url,
            status: response.status(),
            headers: response.headers(),
            dataPreview: JSON.stringify(responseData).substring(0, 500)
          });
        }
      } catch (e) {
        // Not JSON or error parsing
      }
    }
  });

  console.log(`📍 Navigating to: ${BETSSON_URL}\n`);
  await page.goto(BETSSON_URL, { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });

  // Wait a bit for API calls to complete
  console.log('⏳ Waiting 3 seconds for API calls...\n');
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('\n' + '='.repeat(80));
  console.log('📊 API DISCOVERY RESULTS');
  console.log('='.repeat(80) + '\n');

  console.log(`✅ Found ${apiRequests.length} API requests\n`);
  
  // Save all requests to file for detailed analysis
  const outputFile = 'debug/betsson-api-discovery.json';
  fs.writeFileSync(outputFile, JSON.stringify({
    url: BETSSON_URL,
    totalRequests: apiRequests.length,
    allRequests: apiRequests.map(r => ({
      method: r.method,
      url: r.url,
      hasPostData: !!r.postData
    })),
    apiResponses: apiResponses.map(r => ({
      url: r.url,
      status: r.status,
      dataPreview: r.dataPreview
    }))
  }, null, 2));
  
  console.log(`💾 Full results saved to: ${outputFile}\n`);
  
  if (apiRequests.length > 0) {
    console.log('🔍 INTERESTING API ENDPOINTS:\n');
    
    // Filter to most relevant endpoints
    const bettingEndpoints = apiRequests.filter(req => {
      const url = req.url.toLowerCase();
      return url.includes('market') || 
             url.includes('bet') || 
             url.includes('event') ||
             url.includes('selection') ||
             url.includes('odds') ||
             url.includes('sport');
    });

    bettingEndpoints.slice(0, 10).forEach((req, idx) => {
      console.log(`${idx + 1}. ${req.method} ${req.url}`);
      console.log(`   Headers: ${JSON.stringify(req.headers, null, 2).substring(0, 300)}...`);
      if (req.postData) {
        console.log(`   Body: ${req.postData.substring(0, 200)}...`);
      }
      console.log('');
    });
  }

  if (apiResponses.length > 0) {
    console.log('\n📦 RESPONSES WITH BETTING DATA:\n');
    
    apiResponses.slice(0, 5).forEach((resp, idx) => {
      console.log(`${idx + 1}. ${resp.url}`);
      console.log(`   Status: ${resp.status}`);
      console.log(`   Data Preview: ${resp.dataPreview}...`);
      console.log('');
    });
  }

  console.log('\n💡 NEXT STEPS:');
  console.log('1. Look for endpoints that return player props/markets');
  console.log('2. Note the required headers (especially authentication/API keys)');
  console.log('3. Test making direct requests with curl or axios');
  console.log('4. Replace Puppeteer scraper with direct API calls\n');

  console.log('⏸️  Browser will stay open for 10 seconds so you can inspect the Network tab...');
  console.log('   Open DevTools (Cmd+Option+I) and check the Network tab for more details\n');
  
  await new Promise(resolve => setTimeout(resolve, 10000));

  await browser.close();
}

discoverBetssonAPI().catch(console.error);
