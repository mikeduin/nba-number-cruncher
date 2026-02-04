const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
  
  console.log('Loading FanDuel NBA page...');
  await page.goto('https://nj.sportsbook.fanduel.com/navigation/nba', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  
  console.log('Page loaded, waiting 3 seconds...');
  await page.waitForTimeout(3000);
  
  // Take a screenshot
  await page.screenshot({ path: 'fanduel-screenshot.png', fullPage: false });
  console.log('Screenshot saved to fanduel-screenshot.png');
  
  console.log('Looking for selectors...');
  
  // Try to find links with /event/ in them
  const eventLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="/event/"]'));
    return links.map(link => ({
      href: link.href,
      text: link.textContent.substring(0, 100),
      className: link.className
    })).slice(0, 10);
  });
  console.log('Event links found:', eventLinks.length);
  if (eventLinks.length > 0) {
    console.log('Sample links:', JSON.stringify(eventLinks, null, 2));
  }
  
  // Look for any NBA game-related text
  const bodyText = await page.evaluate(() => {
    return document.body.textContent.substring(0, 2000);
  });
  console.log('Body text preview:', bodyText);
  
  console.log('Looking for selectors...');
  
  // Try to find event cards
  const selectors = [
    '[data-test-id*="EventCard"]',
    '[data-test-id*="event"]',
    'a[href*="/event/"]',
    '[class*="event"]'
  ];
  
  for (const selector of selectors) {
    try {
      const elements = await page.$$(selector);
      console.log(`Selector '${selector}': found ${elements.length} elements`);
      
      if (elements.length > 0 && elements.length < 50) {
        // Get sample content
        const sample = await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          return el ? { 
            html: el.outerHTML.substring(0, 500),
            text: el.textContent.substring(0, 200)
          } : null;
        }, selector);
        console.log('Sample:', JSON.stringify(sample, null, 2));
      }
    } catch (err) {
      console.log(`Selector '${selector}': error - ${err.message}`);
    }
  }
  
  // Also check for window data
  const windowData = await page.evaluate(() => {
    return {
      hasInitialState: !!window.__INITIAL_STATE__,
      hasNuxtData: !!window.__NUXT__,
      keys: Object.keys(window).filter(k => k.includes('data') || k.includes('state') || k.includes('nba') || k.includes('event')).slice(0, 20)
    };
  });
  console.log('Window data:', windowData);
  
  console.log('\nKeeping browser open for manual inspection. Press Ctrl+C to close.');
  await page.waitForTimeout(60000);
  
  await browser.close();
})();
