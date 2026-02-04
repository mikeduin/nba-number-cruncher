const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

(async () => {
  console.log('🚀 Inspecting FanDuel page structure...');
  
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
  
  console.log('⏳ Waiting 10 seconds for React to render...');
  await page.waitForTimeout(10000);
  
  // Check page title
  const title = await page.title();
  console.log('📋 Page title:', title);
  
  // Look for ALL links on the page
  const allLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    return {
      total: links.length,
      withEvent: links.filter(a => a.href.includes('/event/')).length,
      sample: links.slice(0, 10).map(a => ({
        href: a.href,
        text: a.textContent.trim().substring(0, 50),
        classes: a.className
      }))
    };
  });
  
  console.log(`\n🔗 Link analysis:`);
  console.log(`   Total links: ${allLinks.total}`);
  console.log(`   Links with /event/: ${allLinks.withEvent}`);
  console.log(`\n   Sample links:`);
  allLinks.sample.forEach((link, i) => {
    console.log(`   ${i + 1}. ${link.text || '(no text)'}`);
    console.log(`      ${link.href}`);
  });
  
  // Check for specific data attributes
  const dataElements = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('[data-test-id], [data-testid]'));
    return {
      count: elements.length,
      testIds: elements
        .map(el => el.getAttribute('data-test-id') || el.getAttribute('data-testid'))
        .filter(id => id)
        .slice(0, 20)
    };
  });
  
  console.log(`\n📊 Data attributes:`);
  console.log(`   Elements with test IDs: ${dataElements.count}`);
  console.log(`   Sample test IDs:`, dataElements.testIds);
  
  // Get body text preview
  const bodyText = await page.evaluate(() => {
    return document.body.textContent.substring(0, 1000);
  });
  
  console.log(`\n📝 Body text preview:`);
  console.log(bodyText.substring(0, 500));
  
  await page.screenshot({ path: 'fanduel-inspect.png', fullPage: true });
  console.log('\n📸 Full page screenshot saved to fanduel-inspect.png');
  
  await browser.close();
})();
