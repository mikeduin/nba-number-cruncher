const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  console.log('Navigating to FanDuel NBA page...');
  await page.goto('https://nj.sportsbook.fanduel.com/navigation/nba', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  
  console.log('Page loaded, waiting for content...');
  await page.waitForTimeout(5000);
  
  // Take screenshot
  await page.screenshot({ path: 'fanduel-debug.png' });
  console.log('Screenshot saved');
  
  // Get all links
  const allLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    return links
      .map(a => a.href)
      .filter(href => href && href.includes('/event/'))
      .slice(0, 20);
  });
  
  console.log('Links with /event/ found:', allLinks.length);
  console.log('Links:', JSON.stringify(allLinks, null, 2));
  
  // Get page title
  const title = await page.title();
  console.log('Page title:', title);
  
  // Get body text preview
  const bodyText = await page.evaluate(() => {
    return document.body.textContent.substring(0, 500);
  });
  console.log('Body text:', bodyText);
  
  await browser.close();
  console.log('Done');
})();
