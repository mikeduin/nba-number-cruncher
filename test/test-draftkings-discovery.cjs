const puppeteer = require('puppeteer');

/**
 * Test script to discover DraftKings API endpoints
 * Similar approach to how we discovered FanDuel and Betsson APIs
 */
async function discoverDraftKingsAPI() {
  console.log('🔍 Discovering DraftKings API endpoints...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  
  // Array to store captured API calls
  const apiCalls = [];
  
  // Intercept network requests
  await page.setRequestInterception(true);
  
  page.on('request', (request) => {
    const url = request.url();
    
    // Look for API calls related to markets, props, or events
    if (url.includes('api') && 
        (url.includes('market') || url.includes('prop') || url.includes('event') || 
         url.includes('offering') || url.includes('sportscontent'))) {
      
      const headers = request.headers();
      apiCalls.push({
        url,
        method: request.method(),
        headers,
        timestamp: new Date().toISOString()
      });
      
      console.log(`📡 API Call detected:`);
      console.log(`   URL: ${url}`);
      console.log(`   Method: ${request.method()}`);
      console.log('');
    }
    
    request.continue();
  });

  // Capture responses for player props
  page.on('response', async (response) => {
    const url = response.url();
    
    // Look for responses that might contain player props
    if (url.includes('api') && 
        (url.includes('market') || url.includes('prop') || url.includes('offering'))) {
      try {
        const contentType = response.headers()['content-type'];
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          
          console.log(`📦 Response received:`);
          console.log(`   URL: ${url}`);
          console.log(`   Status: ${response.status()}`);
          console.log(`   Data keys:`, Object.keys(data).slice(0, 10));
          console.log('');
          
          // Save first meaningful response
          if (!global.sampleResponse && Object.keys(data).length > 0) {
            global.sampleResponse = {
              url,
              data: JSON.stringify(data, null, 2).substring(0, 5000) // First 5000 chars
            };
          }
        }
      } catch (e) {
        // Not JSON or error parsing
      }
    }
  });

  try {
    console.log('🏀 Navigating to Thunder @ 76ers game page...\n');
    
    await page.goto('https://sportsbook.draftkings.com/event/phi-76ers-%2540-okc-thunder/33344369', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log('✅ Page loaded, waiting for player props to load...\n');
    
    // Wait a bit for all API calls to complete
    await page.waitForTimeout(5000);
    
    // Try to find and click on player props tab if it exists
    try {
      await page.waitForSelector('[data-test-id*="player"]', { timeout: 3000 });
      console.log('🎯 Found player props section, clicking...\n');
      await page.click('[data-test-id*="player"]');
      await page.waitForTimeout(3000);
    } catch (e) {
      console.log('ℹ️  No player props tab found, may already be visible\n');
    }

  } catch (error) {
    console.error('❌ Error during page load:', error.message);
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total API calls captured: ${apiCalls.length}\n`);
  
  if (apiCalls.length > 0) {
    console.log('🎯 Unique API endpoints:');
    const uniqueUrls = [...new Set(apiCalls.map(call => {
      try {
        const urlObj = new URL(call.url);
        return urlObj.origin + urlObj.pathname;
      } catch {
        return call.url;
      }
    }))];
    
    uniqueUrls.forEach((url, i) => {
      console.log(`   ${i + 1}. ${url}`);
    });
    
    console.log('\n🔑 Sample headers from first API call:');
    if (apiCalls[0] && apiCalls[0].headers) {
      Object.entries(apiCalls[0].headers).forEach(([key, value]) => {
        if (!key.includes('cookie') && !key.includes('authorization')) {
          console.log(`   ${key}: ${value}`);
        }
      });
    }
  }
  
  if (global.sampleResponse) {
    console.log('\n📄 Sample response structure:');
    console.log(`   URL: ${global.sampleResponse.url}`);
    console.log(`   Data preview (first 5000 chars):\n`);
    console.log(global.sampleResponse.data);
  }

  console.log('\n👀 Browser will stay open for 30 seconds for manual inspection...');
  console.log('   Check Network tab for additional API calls\n');
  
  await page.waitForTimeout(30000);
  
  await browser.close();
  
  console.log('✅ Discovery complete!');
}

// Run the discovery
discoverDraftKingsAPI().catch(console.error);
