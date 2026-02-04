const https = require('https');

/**
 * Test script to scrape DraftKings player props
 * Testing with Thunder @ 76ers game (eventId: 33344369)
 */

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

async function scrapeDraftKings(eventId) {
  console.log(`🏀 Scraping DraftKings player props for event ${eventId}...\n`);

  try {
    // DraftKings Over/Under player props subcategory is 16413 (not 16761 which is milestones)
    const url = `https://sportsbook-nash.draftkings.com/sites/US-NJ-SB/api/sportscontent/controldata/event/eventSubcategory/v1/markets?isBatchable=false&templateVars=${eventId}%2C16413&marketsQuery=%24filter%3DeventId%20eq%20%27${eventId}%27%20AND%20clientMetadata%2FsubCategoryId%20eq%20%2716413%27%20AND%20tags%2Fall%28t%3A%20t%20ne%20%27SportcastBetBuilder%27%29&entity=markets`;

    console.log('📡 Fetching from API...');
    const response = await httpsGet(url);
    const data = JSON.parse(response);

    console.log(`✅ Received ${data.markets?.length || 0} markets`);
    console.log(`✅ Received ${data.selections?.length || 0} selections\n`);

    // Group selections by marketId
    const selectionsByMarket = {};
    (data.selections || []).forEach(selection => {
      if (!selectionsByMarket[selection.marketId]) {
        selectionsByMarket[selection.marketId] = [];
      }
      selectionsByMarket[selection.marketId].push(selection);
    });

    // Parse markets and attach selections
    const parsedProps = [];
    (data.markets || []).forEach(market => {
      const selections = selectionsByMarket[market.id] || [];
      
      // Get player name and prop type from market name (e.g., "Jaren Jackson Jr. Points O/U")
      const marketNameMatch = market.name.match(/^(.+?)\s+(Points|Rebounds|Assists|Threes?|Blocks|Steals|Turnovers|Points \+ Rebounds|Points \+ Assists|Rebounds \+ Assists|Points \+ Rebounds \+ Assists)\s+O\/U$/i);
      
      if (!marketNameMatch) {
        console.log(`⚠️  Could not parse market name: ${market.name}`);
        return;
      }

      const playerName = marketNameMatch[1];
      const propType = marketNameMatch[2];

      // Find Over and Under selections
      const overSelection = selections.find(s => s.outcomeType === 'Over');
      const underSelection = selections.find(s => s.outcomeType === 'Under');

      if (!overSelection || !underSelection) {
        console.log(`⚠️  Missing Over/Under for: ${market.name}`);
        return;
      }

      // Extract player info from participants
      const player = overSelection.participants.find(p => p.type === 'Player');
      if (!player) {
        return;
      }

      parsedProps.push({
        player: player.name,
        propType: propType,
        line: overSelection.points,
        overOdds: overSelection.displayOdds.american,
        underOdds: underSelection.displayOdds.american,
        marketId: market.id,
        overSelectionId: overSelection.id,
        underSelectionId: underSelection.id,
        marketType: market.marketType.name,
        isSuspended: market.isSuspended || false
      });
    });

    console.log('📊 PARSED PROPS:\n');
    console.log(`Total props: ${parsedProps.length}\n`);

    // Group by prop type
    const byPropType = {};
    parsedProps.forEach(prop => {
      if (!byPropType[prop.propType]) {
        byPropType[prop.propType] = [];
      }
      byPropType[prop.propType].push(prop);
    });

    // Display summary
    Object.entries(byPropType).forEach(([propType, props]) => {
      console.log(`\n${propType} (${props.length} props):`);
      console.log('─'.repeat(80));
      props.slice(0, 5).forEach(prop => {
        const suspended = prop.isSuspended ? ' [SUSPENDED]' : '';
        console.log(`  ${prop.player.padEnd(30)} | Line: ${String(prop.line).padStart(4)} | Over: ${prop.overOdds.padStart(6)} | Under: ${prop.underOdds.padStart(6)}${suspended}`);
      });
      if (props.length > 5) {
        console.log(`  ... and ${props.length - 5} more`);
      }
    });

    // Show a detailed example
    if (parsedProps.length > 0) {
      console.log('\n\n📝 DETAILED EXAMPLE:');
      console.log('─'.repeat(80));
      const example = parsedProps.find(p => p.player.includes('Gilgeous-Alexander')) || parsedProps[0];
      console.log(JSON.stringify(example, null, 2));
    }

    return parsedProps;

  } catch (error) {
    console.error('❌ Error scraping DraftKings:', error.message);
    throw error;
  }
}

// Run the scraper
const eventId = process.argv[2] || '33344369'; // Thunder @ 76ers
scrapeDraftKings(eventId)
  .then(() => {
    console.log('\n✅ DraftKings scraping test complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
