const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

(async () => {
  console.log('🚀 Testing puppeteer-extra with stealth plugin...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage'
    ]
  });

  const page = await browser.newPage();
  
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  console.log('📄 Loading FanDuel NBA page...');
  await page.goto('https://nj.sportsbook.fanduel.com/navigation/nba', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });
  
  console.log('⏳ Waiting for content to render...');
  await page.waitForTimeout(5000);
  
  // Check page title
  const title = await page.title();
  console.log('📋 Page title:', title);
  
  if (title.includes('denied') || title.includes('Access')) {
    console.log('❌ FAILED - Still being blocked by bot detection');
  } else {
    console.log('✅ SUCCESS - Page loaded without being blocked!');
  }
  
  // Look for event links
  const eventLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="/event/"]'));
    return links.length;
  });
  
  console.log(`🔗 Found ${eventLinks} event links`);
  
  if (eventLinks > 0) {
    // Get sample games
    const games = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/event/"]')).slice(0, 5);
      return links.map(link => ({
        href: link.getAttribute('href'),
        text: link.textContent.trim().substring(0, 100)
      }));
    });
    
    console.log('\n📊 Sample games found:');
    games.forEach((game, i) => {
      console.log(`${i + 1}. ${game.text}`);
      console.log(`   URL: ${game.href}`);
    });
  }
  
  // Take screenshot for debugging
  await page.screenshot({ path: 'fanduel-stealth-test.png' });
  console.log('\n📸 Screenshot saved to fanduel-stealth-test.png');
  
  await browser.close();
  console.log('\n✨ Test complete!');
})();
