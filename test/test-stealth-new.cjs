const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

(async () => {
  console.log('🚀 Testing with headless: "new" mode...');
  
  const browser = await puppeteer.launch({
    headless: 'new', // Use the new headless mode
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--window-size=1920,1080'
    ]
  });

  const page = await browser.newPage();
  
  // Set more realistic browser properties
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  // Set additional headers
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
  });
  
  console.log('📄 Loading FanDuel NBA page...');
  
  try {
    await page.goto('https://nj.sportsbook.fanduel.com/navigation/nba', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    console.log('⏳ Waiting for network to be idle...');
    await page.waitForNetworkIdle({ timeout: 30000 });
    
    console.log('⏳ Additional 5 second wait...');
    await page.waitForTimeout(5000);
    
    // Check page title
    const title = await page.title();
    console.log('📋 Page title:', title);
    
    if (title.includes('denied') || title.includes('Access')) {
      console.log('❌ BLOCKED - Bot detection active');
      
      // Try to see what triggered it
      const bodyHtml = await page.content();
      if (bodyHtml.includes('PerimeterX')) {
        console.log('   Reason: PerimeterX CAPTCHA challenge');
      }
    } else {
      console.log('✅ SUCCESS - Page loaded!');
      
      // Wait for any element that might contain games
      try {
        await page.waitForSelector('a', { timeout: 5000 });
      } catch (e) {
        console.log('   No links found on page');
      }
      
      // Look for event links
      const eventLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        const eventLinks = links.filter(a => a.href && a.href.includes('/event/'));
        
        return {
          totalLinks: links.length,
          eventLinks: eventLinks.length,
          samples: eventLinks.slice(0, 3).map(link => ({
            href: link.href,
            text: link.textContent.trim()
          }))
        };
      });
      
      console.log(`\n🔗 Found ${eventLinks.totalLinks} total links, ${eventLinks.eventLinks} with /event/`);
      
      if (eventLinks.samples.length > 0) {
        console.log('\n📊 Sample games:');
        eventLinks.samples.forEach((game, i) => {
          console.log(`${i + 1}. ${game.text}`);
          console.log(`   ${game.href}`);
        });
      }
    }
    
    await page.screenshot({ path: 'fanduel-new-headless.png' });
    console.log('\n📸 Screenshot saved');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  await browser.close();
  console.log('\n✨ Test complete!');
})();
