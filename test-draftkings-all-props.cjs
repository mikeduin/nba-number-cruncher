const https = require('https');

/**
 * Comprehensive test script to scrape ALL DraftKings player props
 * Testing with Grizzlies @ Wizards game (eventId: 33365894)
 */

// DraftKings subcategory IDs for each prop type
const SUBCATEGORIES = {
  'Points': 16413,
  'Assists': 16414,
  'Rebounds': 16415,
  'Threes': 16416,
  'Combos': 16417,
  'Defense': 16419
};

function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'accept-encoding': 'gzip',
      ...headers
    };

    https.get(url, { headers: defaultHeaders }, (res) => {
      const chunks = [];
      const isGzipped = res.headers['content-encoding'] === 'gzip';

      if (isGzipped) {
        const zlib = require('zlib');
        const gunzip = zlib.createGunzip();
        res.pipe(gunzip);
        gunzip.on('data', chunk => chunks.push(chunk));
        gunzip.on('end', () => resolve(Buffer.concat(chunks).toString()));
        gunzip.on('error', reject);
      } else {
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks).toString()));
      }
      
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function fetchSubcategory(eventId, subcategoryId) {
  const url = `https://sportsbook-nash.draftkings.com/sites/US-NJ-SB/api/sportscontent/controldata/event/eventSubcategory/v1/markets?isBatchable=false&templateVars=${eventId}%2C${subcategoryId}&marketsQuery=%24filter%3DeventId%20eq%20%27${eventId}%27%20AND%20clientMetadata%2FsubCategoryId%20eq%20%27${subcategoryId}%27%20AND%20tags%2Fall%28t%3A%20t%20ne%20%27SportcastBetBuilder%27%29&entity=markets`;
  
  const response = await httpsGet(url);
  return JSON.parse(response);
}

async function scrapeDraftKingsAllProps(eventId) {
  console.log(`🏀 Scraping ALL DraftKings player props for event ${eventId}...\n`);

  const allProps = [];

  for (const [propCategory, subcategoryId] of Object.entries(SUBCATEGORIES)) {
    try {
      console.log(`📡 Fetching ${propCategory}...`);
      const data = await fetchSubcategory(eventId, subcategoryId);

      const markets = data.markets || [];
      const selections = data.selections || [];

      // Group selections by marketId
      const selectionsByMarket = {};
      selections.forEach(selection => {
        if (!selectionsByMarket[selection.marketId]) {
          selectionsByMarket[selection.marketId] = [];
        }
        selectionsByMarket[selection.marketId].push(selection);
      });

      // Parse markets
      markets.forEach(market => {
        const marketSelections = selectionsByMarket[market.id] || [];
        
        // Parse market name - format is "{Player Name} {Stat Type} O/U"
        const marketNameMatch = market.name.match(/^(.+?)\s+(.+?)\s+O\/U$/);
        
        if (!marketNameMatch) {
          return;
        }

        const playerName = marketNameMatch[1];
        const statType = marketNameMatch[2];

        // Find Over and Under selections
        const overSelection = marketSelections.find(s => s.outcomeType === 'Over');
        const underSelection = marketSelections.find(s => s.outcomeType === 'Under');

        if (!overSelection || !underSelection) {
          return;
        }

        // Extract player info
        const player = overSelection.participants?.find(p => p.type === 'Player');
        if (!player) {
          return;
        }

        allProps.push({
          player: player.name,
          propType: statType,
          line: overSelection.points,
          overOdds: overSelection.displayOdds.american,
          underOdds: underSelection.displayOdds.american,
          marketId: market.id,
          marketType: market.marketType.name,
          isSuspended: market.isSuspended || false,
          category: propCategory
        });
      });

      console.log(`  ✅ Found ${markets.length} markets\n`);

    } catch (error) {
      console.error(`  ❌ Error fetching ${propCategory}:`, error.message);
    }
  }

  console.log('='.repeat(80));
  console.log('📊 RESULTS');
  console.log('='.repeat(80));
  console.log(`Total props scraped: ${allProps.length}\n`);

  // Group by category
  const byCategory = {};
  allProps.forEach(prop => {
    if (!byCategory[prop.category]) {
      byCategory[prop.category] = [];
    }
    byCategory[prop.category].push(prop);
  });

  // Display summary
  Object.entries(byCategory).forEach(([category, props]) => {
    console.log(`\n${category} (${props.length} props):`);
    console.log('─'.repeat(80));
    
    // Group by prop type within category
    const byType = {};
    props.forEach(prop => {
      if (!byType[prop.propType]) {
        byType[prop.propType] = [];
      }
      byType[prop.propType].push(prop);
    });

    Object.entries(byType).forEach(([type, typeProps]) => {
      console.log(`\n  ${type}:`);
      typeProps.slice(0, 3).forEach(prop => {
        const suspended = prop.isSuspended ? ' [SUSPENDED]' : '';
        console.log(`    ${prop.player.padEnd(30)} | Line: ${String(prop.line).padStart(5)} | O: ${prop.overOdds.padStart(5)} | U: ${prop.underOdds.padStart(5)}${suspended}`);
      });
      if (typeProps.length > 3) {
        console.log(`    ... and ${typeProps.length - 3} more`);
      }
    });
  });

  // Show detailed example
  if (allProps.length > 0) {
    console.log('\n\n' + '='.repeat(80));
    console.log('📝 DETAILED EXAMPLE');
    console.log('='.repeat(80));
    const example = allProps.find(p => p.propType === 'Points + Rebounds + Assists') || allProps[0];
    console.log(JSON.stringify(example, null, 2));
  }

  return allProps;
}

// Run the scraper
const eventId = process.argv[2] || '33365894'; // Grizzlies @ Wizards
scrapeDraftKingsAllProps(eventId)
  .then(() => {
    console.log('\n✅ DraftKings ALL props scraping test complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
