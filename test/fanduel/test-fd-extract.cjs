const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  console.log('Loading FanDuel...');
  await page.goto('https://nj.sportsbook.fanduel.com/navigation/nba', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  
  await page.waitForNetworkIdle({ timeout: 30000 });
  await page.waitForTimeout(5000);
  
  // Extract event data from window.__INITIAL_STATE__ or similar
  const games = await page.evaluate(() => {
    // Check various possible data sources
    const dataKeys = Object.keys(window).filter(key => 
      key.toLowerCase().includes('state') || 
      key.toLowerCase().includes('data') ||
      key.toLowerCase().includes('redux')
    );
    
    console.log('Window data keys:', dataKeys);
    
    // Try to find Redux store
    if (window.__PRELOADED_STATE__) {
      console.log('Found __PRELOADED_STATE__');
      return { source: '__PRELOADED_STATE__', data: window.__PRELOADED_STATE__ };
    }
    
    if (window.__INITIAL_STATE__) {
      console.log('Found __INITIAL_STATE__');
      return { source: '__INITIAL_STATE__', data: window.__INITIAL_STATE__ };
    }
    
    // Check for React root data
    const root = document.querySelector('#root');
    if (root && root.__reactContainer$randomstring) {
      console.log('Found React container');
    }
    
    // Return what we found
    return { 
      source: 'window_keys',
      keys: dataKeys,
      sample: dataKeys.length > 0 ? window[dataKeys[0]] : null
    };
  });
  
  console.log('\nData found:');
  console.log(JSON.stringify(games, null, 2).substring(0, 1000));
  
  await browser.close();
})();
