const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

(async () => {
  console.log('🚀 Finding the correct game selectors...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--window-size=1920,1080'
    ]
  });

  const page = await browser.newPage();
  
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
  });
  
  console.log('📄 Loading FanDuel NBA page...');
  await page.goto('https://nj.sportsbook.fanduel.com/navigation/nba', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  
  await page.waitForNetworkIdle({ timeout: 30000 });
  await page.waitForTimeout(5000);
  
  console.log('📋 Page title:', await page.title());
  
  // Analyze link structure
  const linkAnalysis = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    
    // Group links by pattern
    const patterns = {};
    links.forEach(link => {
      const url = new URL(link.href, window.location.href);
      const path = url.pathname;
      const parts = path.split('/').filter(p => p);
      const pattern = parts.slice(0, 3).join('/');
      
      if (!patterns[pattern]) {
        patterns[pattern] = [];
      }
      patterns[pattern].push({
        href: link.href,
        text: link.textContent.trim().substring(0, 60)
      });
    });
    
    // Return most common patterns with samples
    return Object.entries(patterns)
      .map(([pattern, links]) => ({
        pattern,
        count: links.length,
        samples: links.slice(0, 3)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  });
  
  console.log('\n📊 Link patterns found:');
  linkAnalysis.forEach(({ pattern, count, samples }) => {
    console.log(`\n  /${pattern} (${count} links)`);
    samples.forEach(s => {
      console.log(`    "${s.text}"`);
      console.log(`    ${s.href}`);
    });
  });
  
  // Look for any text that might be team names
  const potentialGames = await page.evaluate(() => {
    const bodyText = document.body.textContent;
    // Look for NBA team names
    const teams = ['Lakers', 'Celtics', 'Warriors', 'Heat', 'Nets', 'Knicks', 'Bulls', 'Bucks'];
    const found = teams.filter(team => bodyText.includes(team));
    
    // Also look for common basketball terms
    const terms = ['spread', 'moneyline', 'over', 'under', 'game'];
    const foundTerms = terms.filter(term => bodyText.toLowerCase().includes(term));
    
    return {
      teamsFound: found,
      termsFound: foundTerms,
      textSample: bodyText.substring(0, 500)
    };
  });
  
  console.log('\n🏀 Basketball content analysis:');
  console.log('  Teams found:', potentialGames.teamsFound.join(', ') || 'none');
  console.log('  Terms found:', potentialGames.termsFound.join(', ') || 'none');
  
  await browser.close();
})();
