const puppeteer = require('puppeteer');

const TABS = [
  { name: 'Points', url: 'https://sportsbook.draftkings.com/event/mem-grizzlies-%2540-was-wizards/33365894?category=all-odds&subcategory=live-player-points' },
  { name: 'Threes', url: 'https://sportsbook.draftkings.com/event/mem-grizzlies-%2540-was-wizards/33365894?category=all-odds&subcategory=live-player-threes' },
  { name: 'Rebounds', url: 'https://sportsbook.draftkings.com/event/mem-grizzlies-%2540-was-wizards/33365894?category=all-odds&subcategory=live-player-rebounds' },
  { name: 'Assists', url: 'https://sportsbook.draftkings.com/event/mem-grizzlies-%2540-was-wizards/33365894?category=all-odds&subcategory=live-player-assists' },
  { name: 'Combos', url: 'https://sportsbook.draftkings.com/event/mem-grizzlies-%2540-was-wizards/33365894?category=all-odds&subcategory=live-player-combos' },
  { name: 'Defense', url: 'https://sportsbook.draftkings.com/event/mem-grizzlies-%2540-was-wizards/33365894?category=all-odds&subcategory=live-player-defense' }
];

async function discoverAllSubcategories() {
  console.log('🔍 Discovering all DraftKings player prop subcategories...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });

  const results = {};

  for (const tab of TABS) {
    const page = await browser.newPage();
    const subcatIds = new Set();
    
    await page.setRequestInterception(true);
    
    page.on('request', (request) => {
      const url = request.url();
      
      if (url.includes('api') && url.includes('markets') && url.includes('subCategoryId')) {
        const match = url.match(/subCategoryId%20eq%20%27(\d+)%27/);
        if (match) {
          subcatIds.add(match[1]);
        }
      }
      
      request.continue();
    });

    try {
      console.log(`📡 Loading ${tab.name} tab...`);
      await page.goto(tab.url, {
        waitUntil: 'networkidle2',
        timeout: 15000
      });
      await page.waitForTimeout(2000);
    } catch (error) {
      console.log(`  ⚠️  Error: ${error.message}`);
    }

    results[tab.name] = Array.from(subcatIds);
    console.log(`  ✅ Found subcategories: ${results[tab.name].join(', ')}\n`);
    
    await page.close();
  }

  await browser.close();

  console.log('='.repeat(80));
  console.log('📊 SUMMARY - DraftKings Subcategory IDs');
  console.log('='.repeat(80));
  Object.entries(results).forEach(([name, ids]) => {
    console.log(`${name.padEnd(15)} => ${ids.join(', ')}`);
  });
  console.log('='.repeat(80));
}

discoverAllSubcategories().catch(console.error);
