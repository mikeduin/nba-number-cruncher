const puppeteer = require('puppeteer');

async function discoverLivePlayerPropsAPI() {
  console.log('🔍 Discovering DraftKings Live Player Props API...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  const apiCalls = [];
  
  await page.setRequestInterception(true);
  
  page.on('request', (request) => {
    const url = request.url();
    
    if (url.includes('api') && url.includes('markets')) {
      apiCalls.push(url);
      console.log(`📡 ${url}`);
    }
    
    request.continue();
  });

  try {
    console.log('🏀 Loading Live Player Points tab (Grizzlies @ Wizards)...\n');
    await page.goto('https://sportsbook.draftkings.com/event/mem-grizzlies-%2540-was-wizards/33365894?category=all-odds&subcategory=live-player-points', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('\n✅ Page loaded, waiting 5 seconds...\n');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 CAPTURED API CALLS');
  console.log('='.repeat(80));
  apiCalls.forEach((url, i) => {
    console.log(`\n${i + 1}. ${url}`);
  });

  console.log('\n✅ Done! Closing in 10 seconds...\n');
  await page.waitForTimeout(10000);
  
  await browser.close();
}

discoverLivePlayerPropsAPI().catch(console.error);
