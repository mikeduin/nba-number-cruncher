import fs from 'fs';
import cheerio from 'cheerio';

// Load the HTML file
const html = fs.readFileSync('./stubs/betssonScrape2025-11-21.html', 'utf8');
const $ = cheerio.load(html);

// Simulate the extraction logic from the scraper
function extractProps() {
  const propsData = [];
  
  // Find all market groups
  const marketGroups = $('.obg-m-event-market-group');
  
  console.log(`Found ${marketGroups.length} market groups to process\n`);
  
  marketGroups.each((idx, marketGroupEl) => {
    const $marketGroup = $(marketGroupEl);
    const marketHeader = $marketGroup.find('.obg-m-event-market-group-header').first();
    const market = marketHeader.text().trim();
    
    console.log(`Processing market ${idx + 1}: ${market}`);
    
    // Find all individual selection containers (each represents one bet - over or under)
    const selections = $marketGroup.find('obg-selection-container-v2[playerpropsvariant]');
    console.log(`  Found ${selections.length} player prop selections`);
    
    // Group selections by player (they come in pairs: over/under)
    const playerProps = new Map();
    
    selections.each((selIdx, selection) => {
      try {
        const $selection = $(selection);
        
        const playerLabel = $selection.find('span.obg-selection-v2-group-label');
        const player = playerLabel.text().trim();
        
        const lineLabel = $selection.find('span.obg-selection-v2-label:not(.obg-selection-v2-group-label)');
        const lineText = lineLabel.text().trim();
        // lineText is like "Over 12.5" or "Under 12.5"
        const lineParts = lineText.split(' ');
        const direction = lineParts[0]; // "Over" or "Under"
        const lineValue = lineParts.length > 1 ? lineParts[1] : '';
        
        const oddsElement = $selection.find('span.obg-numeric-change-container-odds-value');
        const odds = oddsElement.text().trim();
        
        if (player && lineValue && odds) {
          // Create a unique key for this player/line combination
          const key = `${player}-${lineValue}`;
          
          if (!playerProps.has(key)) {
            playerProps.set(key, {
              market,
              player,
              line: parseFloat(lineValue),
              over: null,
              under: null
            });
          }
          
          const prop = playerProps.get(key);
          if (direction.toLowerCase() === 'over') {
            prop.over = parseFloat(odds);
          } else if (direction.toLowerCase() === 'under') {
            prop.under = parseFloat(odds);
          }
        }
      } catch (err) {
        console.log(`    Error extracting selection ${selIdx + 1}:`, err);
      }
    });
    
    // Add completed props (those with both over and under)
    playerProps.forEach((prop, key) => {
      if (prop.over !== null && prop.under !== null) {
        propsData.push(prop);
        console.log(`    ✓ ${prop.player} ${prop.line} (${prop.over}/${prop.under})`);
      }
    });
    
    console.log('');
  });
  
  return propsData;
}

// Convert European (decimal) odds to American (moneyline) odds
function convertDecimalToAmerican(decimal) {
  if (!decimal || decimal === 1) return 0;
  
  if (decimal >= 2.0) {
    return Math.round((decimal - 1) * 100);
  } else {
    return Math.round(-100 / (decimal - 1));
  }
}

// Run the extraction
console.log('='.repeat(60));
console.log('EXTRACTING PROPS FROM HTML');
console.log('='.repeat(60));
console.log('');

const extractedProps = extractProps();

console.log('='.repeat(60));
console.log('CONVERSION TO AMERICAN ODDS');
console.log('='.repeat(60));
console.log('');

const convertedProps = extractedProps.map(prop => ({
  ...prop,
  over: convertDecimalToAmerican(prop.over),
  under: convertDecimalToAmerican(prop.under)
}));

console.log(`Total props extracted: ${convertedProps.length}\n`);

convertedProps.forEach((prop, idx) => {
  console.log(`${idx + 1}. ${prop.market} - ${prop.player}`);
  console.log(`   Line: ${prop.line}`);
  console.log(`   Over: ${prop.over > 0 ? '+' : ''}${prop.over}`);
  console.log(`   Under: ${prop.under > 0 ? '+' : ''}${prop.under}`);
  console.log('');
});

console.log('='.repeat(60));
console.log('JSON OUTPUT');
console.log('='.repeat(60));
console.log(JSON.stringify(convertedProps, null, 2));
