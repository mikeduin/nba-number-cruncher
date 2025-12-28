import puppeteer from 'puppeteer';
import axios from 'axios';
import fs from 'fs';

const BETSSON_URL = 'https://www.betsson.com/en/sportsbook/basketball/nba/nba?tab=liveAndUpcoming&eventId=f-Szzm4os3pkGPDAOZFWv3kg&eti=0&mtg=4';
const EVENT_ID = 'f-Szzm4os3pkGPDAOZFWv3kg';

// Market templates for different prop types
const MARKET_TEMPLATES = {
  POINTS: 'PLYPROPPOINTS',
  REBOUNDS: 'PLYPROPREBOUNDS',
  ASSISTS: 'PLYPROPASSISTS',
  THREES: 'PLYPROPTHRSMDE',
  BLOCKS: 'PLYPROPTM',
  FT: 'PLYPROPFTM',
  PRA: 'PLYPROPPNTSASSTSRBNDS',
  PR: 'PLYPROPPNTSRBNDS'
};

async function getSessionToken() {
  console.log('🌐 Opening Betsson page to get session token...');
  const startTime = Date.now();
  
  const browser = await puppeteer.launch({
    executablePath: '/opt/homebrew/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  let capturedHeaders = null;
  const apiCalls = [];
  
  // Intercept the first API call to capture headers
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/api/sb/')) {
      apiCalls.push(url);
    }
    if (url.includes('/api/sb/v1/widgets/accordion/v1') && !capturedHeaders) {
      capturedHeaders = request.headers();
      console.log('✅ Captured session token and headers!');
    }
  });

  await page.goto(BETSSON_URL, { 
    waitUntil: 'networkidle2',
    timeout: 30000 
  });

  // Wait a moment for API calls to fire (if not captured yet)
  if (!capturedHeaders) {
    console.log('   Waiting for API calls...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  await browser.close();
  
  if (!capturedHeaders) {
    console.log('\n⚠️  No accordion API calls detected');
    console.log(`Found ${apiCalls.length} other /api/sb/ calls:`);
    apiCalls.slice(0, 5).forEach(url => console.log(`  - ${url}`));
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`⏱️  Token acquisition took ${duration}s\n`);
  
  return capturedHeaders;
}

async function fetchPropsByTemplate(headers, templateId, templateName) {
  const url = `https://www.betsson.com/api/sb/v1/widgets/accordion/v1?eventId=${EVENT_ID}&marketTemplateIds=${templateId}`;
  
  try {
    const response = await axios.get(url, { headers });
    
    // Extract markets from accordion structure
    const accordions = response.data?.data?.accordions || {};
    let allMarkets = [];
    
    Object.values(accordions).forEach(accordion => {
      if (accordion.markets) {
        allMarkets = allMarkets.concat(accordion.markets);
      }
    });
    
    // Now fetch odds for these markets
    if (allMarkets.length > 0) {
      const marketIds = allMarkets.map(m => m.id).join(',');
      const oddsUrl = `https://www.betsson.com/api/sb/v1/widgets/event-market/v1?includescoreboards=true&marketids=${marketIds}`;
      
      console.log(`  📡 Fetching odds for ${allMarkets.length} ${templateName} markets...`);
      
      try {
        const oddsResponse = await axios.get(oddsUrl, { headers });
        
        // Save first odds response for debugging
        if (templateName === 'POINTS') {
          fs.writeFileSync('debug/betsson-odds-response.json', JSON.stringify(oddsResponse.data, null, 2));
          console.log('  💾 Saved odds response to debug/betsson-odds-response.json');
        }
        
        // Merge odds data back into markets
        const marketSelections = oddsResponse.data?.data?.marketSelections || [];
        const oddsMarkets = oddsResponse.data?.data?.markets || [];
        
        console.log(`  ✅ Got ${marketSelections.length} selections, ${oddsMarkets.length} markets with odds`);
        
        // Group selections by marketId
        const selectionsByMarket = {};
        marketSelections.forEach(sel => {
          if (!selectionsByMarket[sel.marketId]) {
            selectionsByMarket[sel.marketId] = [];
          }
          selectionsByMarket[sel.marketId].push(sel);
        });
        
        // Add selections to each market
        allMarkets = allMarkets.map(market => {
          const selections = selectionsByMarket[market.id] || [];
          if (selections.length > 0) {
            market.selectionsData = selections;
          }
          return market;
        });
        
        const marketsWithOdds = allMarkets.filter(m => m.selectionsData?.length > 0).length;
        console.log(`  📊 ${marketsWithOdds}/${allMarkets.length} markets have selection data`);
      } catch (oddsError) {
        console.log(`  ⚠️  ${templateName}: Got markets but failed to fetch odds - ${oddsError.response?.status} ${oddsError.response?.data?.code || oddsError.message}`);
      }
    }
    
    return {
      template: templateName,
      success: true,
      markets: allMarkets,
      data: response.data
    };
  } catch (error) {
    console.log(`  ❌ ${templateName}: ${error.response?.status} - ${error.response?.data?.code || error.message}`);
    return {
      template: templateName,
      success: false,
      error: error.message,
      markets: []
    };
  }
}

async function fastBetssonScrape() {
  console.log('🚀 FAST BETSSON SCRAPER\n');
  console.log('='.repeat(80) + '\n');
  
  const totalStart = Date.now();
  
  // Step 1: Get session token (slow part - ~2-3 seconds)
  const headers = await getSessionToken();
  
  if (!headers || !headers.sessiontoken) {
    console.error('❌ Failed to capture session token');
    return;
  }
  
  console.log('📊 Fetching player props via API...\n');
  const apiStart = Date.now();
  
  // Step 2: Make parallel API calls (fast - ~0.5-1 second total)
  const promises = Object.entries(MARKET_TEMPLATES).map(([name, templateId]) =>
    fetchPropsByTemplate(headers, templateId, name)
  );
  
  const results = await Promise.all(promises);
  
  // Save raw response for analysis
  if (results[0]?.success) {
    fs.writeFileSync('debug/betsson-api-response.json', JSON.stringify(results[0].data, null, 2));
    console.log('💾 Saved full API response to debug/betsson-api-response.json\n');
  }
  
  const apiDuration = ((Date.now() - apiStart) / 1000).toFixed(1);
  console.log(`⏱️  API calls took ${apiDuration}s\n`);
  
  // Step 3: Process results
  console.log('📦 Results:\n');
  let totalProps = 0;
  
  results.forEach(result => {
    if (result.success) {
      const propCount = result.markets?.length || 0;
      totalProps += propCount;
      console.log(`  ✅ ${result.template}: ${propCount} markets`);
    } else {
      console.log(`  ❌ ${result.template}: ${result.error}`);
    }
  });
  
  const totalDuration = ((Date.now() - totalStart) / 1000).toFixed(1);
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n🎉 DONE! Total: ${totalProps} props in ${totalDuration}s`);
  console.log(`\n💡 Compare to old scraper: ~15-30s → ${totalDuration}s (${Math.round(20/totalDuration)}x faster!)\n`);
  
  // Detailed mapping analysis
  console.log('='.repeat(80));
  console.log('📊 DATA STRUCTURE ANALYSIS');
  console.log('='.repeat(80) + '\n');
  
  const pointsResult = results.find(r => r.template === 'POINTS');
  if (pointsResult?.success && pointsResult.markets?.length > 0) {
    const firstMarketWithOdds = pointsResult.markets.find(m => m.selectionsData?.length > 0);
    
    if (firstMarketWithOdds) {
      const playerName = firstMarketWithOdds.marketFriendlyName.split(' | ')[1];
      const propType = firstMarketWithOdds.marketTemplateId;
      const line = firstMarketWithOdds.marketSpecifics.groupSortBy
        .find(g => g.groupLevel === '3')?.sort;
      
      console.log('✅ Successfully mapped prop with odds:');
      console.log(`  Player: ${playerName}`);
      console.log(`  Prop Type: ${propType}`);
      console.log(`  Line: ${line}`);
      console.log(`  Selections: ${firstMarketWithOdds.selectionsData.length}`);
      
      firstMarketWithOdds.selectionsData.forEach((sel, i) => {
        console.log(`\n  Selection ${i + 1}:`);
        console.log(`    Name: ${sel.label}`);
        console.log(`    Odds: ${sel.odds}`);
        console.log(`    Status: ${sel.status}`);
      });
      console.log();
      
      // Show a few more examples
      const sampleProps = pointsResult.markets
        .filter(m => m.selectionsData?.length > 0)
        .slice(0, 5)
        .map(market => {
          const playerName = market.marketFriendlyName.split(' | ')[1];
          const line = market.marketSpecifics.groupSortBy.find(g => g.groupLevel === '3')?.sort;
          const selections = market.selectionsData || [];
          return {
            player: playerName,
            line: line,
            over: selections.find(s => s.label?.toLowerCase().includes('over'))?.odds,
            under: selections.find(s => s.label?.toLowerCase().includes('under'))?.odds
          };
        });
      
      console.log('📋 Sample mapped props:');
      sampleProps.forEach(p => {
        console.log(`  ${p.player}: O${p.line} (${p.over}) / U${p.line} (${p.under})`);
      });
      console.log();
    } else {
      console.log('❌ No markets with selection data found');
    }
  }
  
  return results;
}

// Run it
fastBetssonScrape().catch(console.error);
