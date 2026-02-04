const puppeteer = require('puppeteer');

async function findPlayerPropTabs() {
  console.log('🔍 Looking for DraftKings player prop tabs...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  const apiCalls = [];
  
  await page.setRequestInterception(true);
  
  page.on('request', (request) => {
    const url = request.url();
    
    if (url.includes('subcategory') || url.includes('markets')) {
      apiCalls.push({
        url,
        method: request.method(),
      });
    }
    
    request.continue();
  });

  try {
    console.log('🏀 Loading game page...\n');
    await page.goto('https://sportsbook.draftkings.com/event/phi-76ers-%2540-okc-thunder/33344369', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log('✅ Page loaded, looking for player prop sections...\n');
    await page.waitForTimeout(3000);

    // Try to find and log all visible tabs/sections
    const tabs = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('[role="tab"], [class*="tab"], [class*="Tab"], button, a'));
      return elements
        .map(el => ({
          text: el.textContent?.trim(),
          className: el.className,
          dataTestId: el.getAttribute('data-test-id'),
          href: el.href
        }))
        .filter(el => el.text && (
          el.text.toLowerCase().includes('point') ||
          el.text.toLowerCase().includes('rebound') ||
          el.text.toLowerCase().includes('assist') ||
          el.text.toLowerCase().includes('player') ||
          el.text.toLowerCase().includes('prop')
        ));
    });

    console.log('🎯 Found relevant tabs/buttons:');
    tabs.forEach((tab, i) => {
      console.log(`  ${i + 1}. "${tab.text}" (${tab.dataTestId || tab.className})`);
    });

    // Try clicking on a player props tab if found
    console.log('\n📱 Attempting to click on player props sections...\n');
    
    const clickSelectors = [
      'button:has-text("Player Points")',
      'button:has-text("Player Rebounds")',
      '[data-test-id*="player"]',
      '[class*="player"]',
      'text=Player Points',
      'text=Points',
      'text=Rebounds',
      'text=Assists'
    ];

    for (const selector of clickSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          console.log(`  Clicking: ${selector}`);
          await element.click();
          await page.waitForTimeout(2000);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n📡 API Calls captured:');
  const uniqueUrls = [...new Set(apiCalls.map(call => {
    const url = new URL(call.url);
    return url.pathname + url.search;
  }))];
  
  uniqueUrls.forEach((url, i) => {
    console.log(`  ${i + 1}. ${url}`);
  });

  console.log('\n👀 Browser staying open for 60 seconds...\n');
  await page.waitForTimeout(60000);
  
  await browser.close();
}

findPlayerPropTabs().catch(console.error);
