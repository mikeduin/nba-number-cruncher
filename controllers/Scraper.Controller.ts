import express from 'express';
import puppeteer from 'puppeteer';
// import puppeteer from 'puppeteer-core';
// import chromium from 'chrome-aws-lambda';
import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { getReadablePrice } from '../utils/props/getReadablePrice.js';
import { parseBovadaLines } from '../utils/props/parseBovadaLines.js';
import { convertDecimalToAmerican } from '../utils/props/convertOdds.js';
import { 
  parseFanDuelMarketName, 
  mapFanDuelPropType 
} from '../utils/props/parseFanDuelMarket.js';
import { PlayerProp } from '../types';
import { 
  FanDuelEventPageResponse, 
  FanDuelMarket, 
  FanDuelProp 
} from '../types/FanDuel.js';

const app = express();

export const scrapeBovada = async (gameUrl) => {
  let browser;

  // const executablePath = await chromium.executablePath;

  if (app.get('env') === 'development') {
    // browser = await puppeteer.launch({
    //   args: ['--no-sandbox']
    // });
    // } else {
    browser = await puppeteer.launch({
      executablePath: '/opt/homebrew/bin/chromium',
      args: ['--no-sandbox']
    });
  }

  if (gameUrl) {
    try {
      // const browser = await puppeteer.launch({
      //   executablePath: '/opt/homebrew/bin/chromium',
      //   args: ['--no-sandbox']
      // });
      const page = await browser.newPage();
  
      // Navigate to the URL
      // await page.goto(gameUrl, { waitUntil: 'domcontentloaded' }); // This wasn't working pregame, but might need to be used for live games?
      await page.goto(gameUrl);
      // await page.goto('https://www.unibet.com/betting/sports/event/live/1021435931');
      // await page.goto('https://www.betsson.com/en/sportsbook/live/basketball?eventId=f-7hHH7c6YRU6WrnG6SJKZRQ&eti=0&mtg=6&fs=true');

      // await page.waitForSelector(buttonSelector);
  
      const props = [];
  
      try {
        // You might need to wait for a specific element or some time for the dynamic content to load
        // await page.waitForSelector('.sp-main-content');
        // await page.waitForSelector('.league-header');

        // await page.waitForSelector('.KambiBC-event-page-component__columns');
        await page.waitForSelector('.league-header');
  
        // Extract the content
        const content = await page.content();
        // console.log('content is ', content);
        const $ = cheerio.load(content);

        // console.log('$ response from scraper is ', $);
  
  
        $('sp-alternate').each(function(i, elem) {
          const market: PlayerProp = parseBovadaLines($(elem).find('h3.league-header').text());

          // console.log('market is ', market);
  
          if (market) {
            const over = $(elem).find('ul.market-type').find('span.bet-price').first().text().trim();
            const under = $(elem).find('ul.market-type').find('span.bet-price').eq(1).text().trim()
  
            market.line = parseFloat($(elem).find('ul.spread-header').children().first().text().trim());
            // console.log('line for ', market.player, market.market, ' is ', market.line);
            market.over = getReadablePrice(over);
            market.under = getReadablePrice(under);
            props.push(market);
          }
        })
      } catch (e) {
        console.log('error scraping bovada props for ', gameUrl, ' and error is ', e);
      }

      // Close the browser when you're done
      await browser.close();
  
      return props;
    } catch (e) {
      console.log('OUTER error scraping bovada props for ', gameUrl, ' and error is ', e);
    }
  } else {
    console.log('No gameUrl provided');
  }
};

/**
 * Helper: Capture session token from Betsson page via Puppeteer
 * This is the slow part (~4-5s) but only needs to be done once per scrape
 */
const getBetssonSessionToken = async (gameUrl: string): Promise<any> => {
  console.log('🌐 Opening Betsson page to get session token...');
  const startTime = Date.now();
  
  const browser = await puppeteer.launch({
    executablePath: '/opt/homebrew/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  let capturedHeaders: any = null;
  
  // Intercept the first API call to capture headers with session token
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/api/sb/v1/widgets/accordion/v1') && !capturedHeaders) {
      capturedHeaders = request.headers();
      console.log('✅ Captured session token and headers!');
    }
  });

  await page.goto(gameUrl, { 
    waitUntil: 'networkidle2',
    timeout: 30000 
  });

  // Wait a moment for API calls to fire
  if (!capturedHeaders) {
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  await browser.close();
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`⏱️  Token acquisition took ${duration}s\n`);
  
  return capturedHeaders;
};

/**
 * Helper: Fetch props for a specific market template via Betsson API
 * This is fast (~0.3-0.5s per template)
 */
const fetchBetssonPropsByTemplate = async (
  headers: any, 
  eventId: string, 
  templateId: string, 
  templateName: string
) => {
  const url = `https://www.betsson.com/api/sb/v1/widgets/accordion/v1?eventId=${eventId}&marketTemplateIds=${templateId}`;
  
  try {
    const response = await axios.get(url, { headers });
    
    // Extract markets from accordion structure
    const accordions = response.data?.data?.accordions || {};
    let allMarkets: any[] = [];
    
    Object.values(accordions).forEach((accordion: any) => {
      if (accordion.markets) {
        allMarkets = allMarkets.concat(accordion.markets);
      }
    });
    
    // Fetch odds for these markets
    if (allMarkets.length > 0) {
      const marketIds = allMarkets.map((m: any) => m.id).join(',');
      const oddsUrl = `https://www.betsson.com/api/sb/v1/widgets/event-market/v1?includescoreboards=true&marketids=${marketIds}`;
      
      try {
        const oddsResponse = await axios.get(oddsUrl, { headers });
        const marketSelections = oddsResponse.data?.data?.marketSelections || [];
        
        // Group selections by marketId
        const selectionsByMarket: Record<string, any[]> = {};
        marketSelections.forEach((sel: any) => {
          if (!selectionsByMarket[sel.marketId]) {
            selectionsByMarket[sel.marketId] = [];
          }
          selectionsByMarket[sel.marketId].push(sel);
        });
        
        // Add selections to each market
        allMarkets = allMarkets.map((market: any) => ({
          ...market,
          selectionsData: selectionsByMarket[market.id] || []
        }));
      } catch (oddsError) {
        console.log(`  ⚠️  ${templateName}: Got markets but failed to fetch odds`);
      }
    }
    
    return {
      template: templateName,
      success: true,
      markets: allMarkets
    };
  } catch (error) {
    console.log(`  ❌ ${templateName}: ${(error as any).message}`);
    return {
      template: templateName,
      success: false,
      markets: []
    };
  }
};

/**
 * Scrape Betsson player props using hybrid approach:
 * 1. Brief Puppeteer session (~5s) to capture session token
 * 2. Direct API calls (~0.5s) for all prop types
 * Total: ~6-8s vs 15-30s with old Shadow DOM scraping
 */
export const scrapeBetsson = async (gameUrl: string) => {
  console.log('🚀 Fast Betsson scraper starting...');
  const totalStart = Date.now();

  if (!gameUrl) {
    console.log('No gameUrl provided');
    return [];
  }

  try {
    // Ensure URL has proper market group parameter
    if (!gameUrl.includes('&mtg=4')) {
      gameUrl += '&mtg=4';
    }

    // Extract event ID from URL
    const eventIdMatch = gameUrl.match(/eventId=([^&]+)/);
    if (!eventIdMatch) {
      console.log('❌ Could not extract event ID from URL');
      return [];
    }
    const eventId = eventIdMatch[1];

    // Step 1: Get session token (slow part - ~4-5s)
    const headers = await getBetssonSessionToken(gameUrl);
    
    if (!headers || !headers.sessiontoken) {
      console.error('❌ Failed to capture session token');
      return [];
    }
    
    // Step 2: Fetch all prop types in parallel (fast - ~0.5s total)
    console.log('📊 Fetching player props via API...\n');
    
    const MARKET_TEMPLATES: Record<string, string> = {
      POINTS: 'PLYPROPPOINTS',
      REBOUNDS: 'PLYPROPREBOUNDS',
      ASSISTS: 'PLYPROPASSISTS',
      THREES: 'PLYPROPTHRSMDE',
      BLOCKS: 'PLYPROPTM',
      PRA: 'PLYPROPPNTSASSTSRBNDS',
      PR: 'PLYPROPPNTSRBNDS'
    };
    
    const promises = Object.entries(MARKET_TEMPLATES).map(([name, templateId]) =>
      fetchBetssonPropsByTemplate(headers, eventId, templateId, name)
    );
    
    const results = await Promise.all(promises);
    
    // Step 3: Map API data to our prop format
    const props: any[] = [];
    
    results.forEach(result => {
      if (!result.success || !result.markets) return;
      
      result.markets.forEach((market: any) => {
        if (!market.selectionsData || market.selectionsData.length === 0) return;
        
        try {
          // Extract player name from marketFriendlyName (format: "Game | Player Name")
          const playerName = market.marketFriendlyName?.split(' | ')[1];
          if (!playerName) return;
          
          // Extract line value from groupSortBy
          const lineData = market.marketSpecifics?.groupSortBy?.find(
            (g: any) => g.groupLevel === '3'
          );
          const line = lineData?.sort;
          if (!line) return;
          
          // Extract over/under odds
          const overSelection = market.selectionsData.find(
            (s: any) => s.label?.toLowerCase().includes('over')
          );
          const underSelection = market.selectionsData.find(
            (s: any) => s.label?.toLowerCase().includes('under')
          );
          
          if (!overSelection || !underSelection) return;
          
          // Map market template to Betsson prop type naming (must match dbMappers.ts)
          const marketTypeMap: Record<string, string> = {
            'PLYPROPPOINTS': 'Total Points',
            'PLYPROPREBOUNDS': 'Total Rebounds',
            'PLYPROPASSISTS': 'Total Assists',
            'PLYPROPTHRSMDE': "Total Three's Made",
            'PLYPROPTM': 'Total Blocks',
            'PLYPROPPNTSASSTSRBNDS': 'Total Points + Assists + Rebounds',
            'PLYPROPPNTSRBNDS': 'Total Points + Rebounds'
          };
          
          const propType = marketTypeMap[market.marketTemplateId] || market.marketTemplateId;
          
          // Convert European odds to American format
          const overAmerican = convertDecimalToAmerican(overSelection.odds);
          const underAmerican = convertDecimalToAmerican(underSelection.odds);
          
          props.push({
            market: propType,
            player: playerName,
            line: parseFloat(line),
            over: overAmerican,
            under: underAmerican
          });
        } catch (err) {
          console.log('Error mapping market:', err);
        }
      });
    });
    
    const totalDuration = ((Date.now() - totalStart) / 1000).toFixed(1);
    console.log(`\n✅ Fast Betsson scraper complete: ${props.length} props in ${totalDuration}s\n`);
    
    return props;
  } catch (e) {
    console.log('Error in fast Betsson scraper:', e);
    return [];
  }
};

/**
 * Scrape player props from FanDuel
 * 
 * @param eventId - FanDuel event ID (e.g., 35085635)
 * @param pxContext - PerimeterX authentication token (from x-px-context header)
 * @param region - Sportsbook region (e.g., 'NJ', 'PA', 'MI')
 * @returns Array of parsed FanDuel props
 * 
 * Usage:
 * const props = await scrapeFanDuel('35085635', 'your-px-token', 'NJ');
 * 
 * Note: PerimeterX tokens expire after 5-30 minutes. 
 * Get fresh token from browser DevTools when needed.
 */
export const scrapeFanDuel = async (
  eventId: string,
  pxContext: string,
  region: string = 'NJ'
): Promise<FanDuelProp[]> => {
  console.log(`🎯 Scraping FanDuel props for event ${eventId}...`);
  
  // Build the API URL - remove tab parameter to get ALL markets
  const apiUrl = `https://api.sportsbook.fanduel.com/sbapi/event-page?_ak=FhMFpcPWXMeyZxOx&eventId=${eventId}&useCombinedTouchdownsVirtualMarket=true&usePulse=true&useQuickBets=true&useQuickBetsMLB=true`;
  
  // Configure axios client with FanDuel headers
  const client = axios.create({
    headers: {
      'accept': 'application/json',
      'accept-language': 'en-US,en;q=0.9',
      'dnt': '1',
      'origin': `https://${region.toLowerCase()}.sportsbook.fanduel.com`,
      'priority': 'u=1, i',
      'referer': `https://${region.toLowerCase()}.sportsbook.fanduel.com/`,
      'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
      'x-px-context': pxContext,
      'x-sportsbook-region': region.toUpperCase()
    },
    timeout: 30000
  });
  
  try {
    // Fetch from multiple tabs to get all prop types
    const tabs = ['player-points', 'player-rebounds', 'player-assists', 'player-threes', 'player-combos', 'player-defense'];
    let allMarkets: FanDuelMarket[] = [];
    
    console.log(`🔄 Fetching markets from ${tabs.length} tabs...`);
    
    for (const tab of tabs) {
      try {
        const tabUrl = `https://api.sportsbook.fanduel.com/sbapi/event-page?_ak=FhMFpcPWXMeyZxOx&eventId=${eventId}&tab=${tab}&useCombinedTouchdownsVirtualMarket=true&usePulse=true&useQuickBets=true&useQuickBetsMLB=true`;
        const response = await client.get<FanDuelEventPageResponse>(tabUrl);
        
        if (response.data.attachments?.markets) {
          const markets = Object.values(response.data.attachments.markets);
          console.log(`  ✅ Tab "${tab}": ${markets.length} markets`);
          allMarkets = allMarkets.concat(markets);
        }
      } catch (err) {
        console.warn(`  ⚠️  Tab "${tab}" failed:`, err.message);
      }
    }
    
    // Deduplicate markets by marketId
    const uniqueMarkets = Array.from(
      new Map(allMarkets.map(m => [m.marketId, m])).values()
    );
    
    console.log(`📊 Found ${allMarkets.length} total markets, ${uniqueMarkets.length} unique after deduplication`);
    
    // Filter for player prop markets (those with runners and player selections)
    const playerPropMarkets = uniqueMarkets.filter((market: FanDuelMarket) => 
      market.runners && 
      market.runners.length > 0 &&
      market.runners.some(r => r.isPlayerSelection)
    );
    
    console.log(`👥 Found ${playerPropMarkets.length} player prop markets`);
    
    // Parse each market into our standardized format
    const props: FanDuelProp[] = [];
    
    for (const market of playerPropMarkets) {
      try {
        // Parse player name from market name
        const parsed = parseFanDuelMarketName(market.marketName);
        if (!parsed) {
          console.warn(`⚠️  Could not parse market name: ${market.marketName}`);
          continue;
        }
        
        // Get standardized prop type
        const propType = mapFanDuelPropType(market.marketType, market.marketName);
        
        // Find over and under runners
        const overRunner = market.runners.find(r => r.result.type === 'OVER');
        const underRunner = market.runners.find(r => r.result.type === 'UNDER');
        
        if (!overRunner || !underRunner) {
          console.warn(`⚠️  Missing over/under for ${market.marketName}`);
          continue;
        }
        
        // Extract odds
        const overOdds = overRunner.winRunnerOdds?.americanDisplayOdds?.americanOddsInt;
        const underOdds = underRunner.winRunnerOdds?.americanDisplayOdds?.americanOddsInt;
        
        if (overOdds === undefined || underOdds === undefined) {
          console.warn(`⚠️  Missing odds for ${market.marketName}`);
          continue;
        }
        
        // Create standardized prop object
        const prop: FanDuelProp = {
          eventId: market.eventId,
          playerName: parsed.player,
          marketId: market.marketId,
          marketType: market.marketType,
          marketName: market.marketName,
          propType,
          propDisplay: parsed.propDisplay,
          line: overRunner.handicap,
          overOdds,
          underOdds,
          overSelectionId: overRunner.selectionId,
          underSelectionId: underRunner.selectionId,
          marketStatus: market.marketStatus,
          inPlay: market.inPlay,
          marketTime: market.marketTime,
          rawMarketData: JSON.stringify(market)
        };
        
        props.push(prop);
        
      } catch (err) {
        console.error(`❌ Error parsing market ${market.marketId}:`, err);
      }
    }
    
    console.log(`✅ Successfully parsed ${props.length} props`);
    
    // Log prop type distribution for debugging
    const propTypeCount = {};
    props.forEach(p => {
      propTypeCount[p.propDisplay] = (propTypeCount[p.propDisplay] || 0) + 1;
    });
    console.log('📊 Prop types found:', propTypeCount);
    
    return props;
    
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('❌ FanDuel API error:', error.response.status, error.response.statusText);
      
      if (error.response.status === 403) {
        console.error('⚠️  403 Forbidden: PerimeterX token may have expired. Get a fresh token from browser.');
      }
    } else {
      console.error('❌ Error scraping FanDuel:', error);
    }
    
    return [];
  }
};