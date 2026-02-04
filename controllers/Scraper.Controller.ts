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
import {
  DraftKingsMarketResponse,
  DraftKingsMarket,
  DraftKingsSelection,
  DraftKingsParsedProp
} from '../types/DraftKings.js';

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
    if (!gameUrl.includes('&mtg=5')) {
      gameUrl += '&mtg=5';
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

/**
 * Scrape DraftKings player props for a given event
 * Fetches from multiple subcategories to get all prop types
 * 
 * @param eventId - DraftKings event ID (e.g., "33365894")
 * @param region - State abbreviation for sportsbook (default: "NJ")
 * @returns Array of parsed player props with Over/Under odds
 */
export const scrapeDraftKings = async (
  eventId: string,
  region: string = 'NJ'
): Promise<DraftKingsParsedProp[]> => {
  console.log(`🎯 Scraping DraftKings props for event ${eventId}...`);
  
  const baseUrl = `https://sportsbook-nash.draftkings.com/sites/US-${region}-SB/api/sportscontent/controldata/event/eventSubcategory/v1/markets`;
  
  const client = axios.create({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.9',
      'Content-Type': 'application/json charset=utf-8',
      'DNT': '1',
      'Origin': 'https://sportsbook.draftkings.com',
      'Referer': 'https://sportsbook.draftkings.com/',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'x-client-feature': 'eventSubcategory',
      'x-client-name': 'web',
      'x-client-page': 'event',
      'x-client-version': '2551.1.1.9',
      'x-client-widget-name': 'cms',
      'x-client-widget-version': '1.7.0',
    },
    timeout: 30000
  });
  
  // Step 1: Dynamically discover active subcategories for this event
  console.log(`  🔍 Scanning subcategories 16400-16500 to find active props...`);
  const activeSubcategoryIds: number[] = [];
  
  // Scan range in batches to find which subcategories have data
  const scanPromises = [];
  for (let id = 16400; id <= 16500; id++) {
    scanPromises.push(
      (async () => {
        try {
          const url = `${baseUrl}?isBatchable=false&templateVars=${eventId}%2C${id}&marketsQuery=%24filter%3DeventId%20eq%20%27${eventId}%27%20AND%20clientMetadata%2FsubCategoryId%20eq%20%27${id}%27%20AND%20tags%2Fall%28t%3A%20t%20ne%20%27SportcastBetBuilder%27%29&entity=markets`;
          const response = await client.get<DraftKingsMarketResponse>(url, { timeout: 5000 });
          if (response.data.markets && response.data.markets.length > 0) {
            return id;
          }
        } catch (error) {
          // Silently skip failed requests
        }
        return null;
      })()
    );
  }
  
  const results = await Promise.all(scanPromises);
  activeSubcategoryIds.push(...results.filter((id): id is number => id !== null));
  
  console.log(`  ✅ Found ${activeSubcategoryIds.length} active subcategories: ${activeSubcategoryIds.join(', ')}`);
  
  if (activeSubcategoryIds.length === 0) {
    console.log(`  ⚠️ No active subcategories found for event ${eventId}`);
    return [];
  }
  
  // Step 2: Fetch full data from active subcategories
  const allProps: DraftKingsParsedProp[] = [];
  
  for (const subcatId of activeSubcategoryIds) {
    try {
      const url = `${baseUrl}?isBatchable=false&templateVars=${eventId}%2C${subcatId}&marketsQuery=%24filter%3DeventId%20eq%20%27${eventId}%27%20AND%20clientMetadata%2FsubCategoryId%20eq%20%27${subcatId}%27%20AND%20tags%2Fall%28t%3A%20t%20ne%20%27SportcastBetBuilder%27%29&entity=markets`;
      
      const response = await client.get<DraftKingsMarketResponse>(url);
      const { markets = [], selections = [] } = response.data;
      
      console.log(`  📊 Subcategory ${subcatId}: ${markets.length} markets, ${selections.length} selections`);
      
      // Group selections by marketId
      const selectionsByMarket: Record<string, DraftKingsSelection[]> = {};
      selections.forEach(selection => {
        if (!selectionsByMarket[selection.marketId]) {
          selectionsByMarket[selection.marketId] = [];
        }
        selectionsByMarket[selection.marketId].push(selection);
      });
      
      // Parse each market
      for (const market of markets) {
        const marketSelections = selectionsByMarket[market.id] || [];
        
        // Parse market name - DraftKings format: "{Player Name} {Stat Type} O/U"
        // Examples: "Kawhi Leonard Points O/U", "Cade Cunningham Points + Rebounds + Assists O/U"
        // First strip the " O/U" suffix
        let marketNameWithoutOU = market.name;
        if (market.name.endsWith(' O/U')) {
          marketNameWithoutOU = market.name.slice(0, -4); // Remove " O/U"
        }
        
        // Split on the last occurrence of a known stat pattern
        const statPatterns = [
          'Points + Rebounds + Assists',
          'Points + Rebounds',
          'Points + Assists',
          'Rebounds + Assists',
          'Three Pointers Made',
          'Points',
          'Rebounds',
          'Assists',
          'Blocks',
          'Steals',
          'Turnovers'
        ];
        
        let playerName = '';
        let statType = '';
        
        for (const pattern of statPatterns) {
          if (marketNameWithoutOU.endsWith(pattern)) {
            const splitIndex = marketNameWithoutOU.lastIndexOf(' ' + pattern);
            if (splitIndex !== -1) {
              playerName = marketNameWithoutOU.substring(0, splitIndex);
              statType = pattern;
              break;
            }
          }
        }
        
        if (!playerName || !statType) {
          console.warn(`⚠️  Could not parse market name: ${market.name}`);
          continue;
        }
        
        // Find Over and Under selections
        const overSelection = marketSelections.find(s => s.outcomeType === 'Over');
        const underSelection = marketSelections.find(s => s.outcomeType === 'Under');
        
        if (!overSelection || !underSelection) {
          console.warn(`⚠️  Missing Over/Under for: ${market.name}`);
          continue;
        }
        
        // Get player info from participants
        const player = overSelection.participants?.find(p => p.type === 'Player');
        if (!player) {
          console.warn(`⚠️  No player participant found for: ${market.name}`);
          continue;
        }
        
        // Normalize odds - DraftKings uses Unicode minus sign (−) instead of hyphen (-)
        const normalizeOdds = (odds: string): string => {
          // Replace Unicode minus (U+2212) with regular hyphen-minus (U+002D)
          return odds.replace(/−/g, '-');
        };
        
        const overOdds = normalizeOdds(overSelection.displayOdds.american);
        const underOdds = normalizeOdds(underSelection.displayOdds.american);
        
        allProps.push({
          player: player.name,
          propType: statType,
          line: overSelection.points,
          overOdds: overOdds,
          underOdds: underOdds,
          marketId: market.id,
          overSelectionId: overSelection.id,
          underSelectionId: underSelection.id,
          marketType: market.marketType.name,
          isSuspended: market.isSuspended || false,
        });
      }
      
    } catch (error) {
      console.warn(`  ⚠️  Subcategory ${subcatId} failed:`, error instanceof Error ? error.message : String(error));
    }
  }
  
  console.log(`📊 Total DraftKings props scraped: ${allProps.length}`);
  return allProps;
};

/**
 * Fetch all NBA games from DraftKings API
 * Returns array of games with eventId and team abbreviations
 */
export const fetchDraftKingsGames = async (): Promise<Array<{
  eventId: string;
  awayTeam: string;
  homeTeam: string;
  startDate: string;
  name: string;
}>> => {
  const DRAFT_KINGS_GAMES_URL = 
    'https://sportsbook-nash.draftkings.com/sites/US-SB/api/sportscontent/controldata/league/leagueSubcategory/v1/markets?' +
    'isBatchable=false&templateVars=42648%2C4511' +
    '&eventsQuery=%24filter%3DleagueId%20eq%20%2742648%27%20AND%20clientMetadata%2FSubcategories%2Fany%28s%3A%20s%2FId%20eq%20%274511%27%29' +
    '&marketsQuery=%24filter%3DclientMetadata%2FsubCategoryId%20eq%20%274511%27%20AND%20tags%2Fall%28t%3A%20t%20ne%20%27SportcastBetBuilder%27%29' +
    '&include=Events&entity=events';

  console.log('🏀 Fetching DraftKings NBA games...');

  try {
    const response = await axios.get(DRAFT_KINGS_GAMES_URL, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    if (!response.data || !response.data.events) {
      console.error('❌ Invalid response from DraftKings API');
      return [];
    }

    const games = response.data.events.map((event: any) => {
      const away = event.participants?.find((p: any) => p.venueRole === 'Away');
      const home = event.participants?.find((p: any) => p.venueRole === 'Home');

      return {
        eventId: event.id,
        awayTeam: away?.metadata?.shortName || away?.name || '',
        homeTeam: home?.metadata?.shortName || home?.name || '',
        startDate: event.startEventDate,
        name: event.name
      };
    });

    console.log(`✅ Found ${games.length} DraftKings games`);
    return games;
  } catch (error) {
    console.error('❌ Error fetching DraftKings games:', error instanceof Error ? error.message : String(error));
    return [];
  }
};

/**
 * Fetch all NBA games from FanDuel using Puppeteer with Stealth Plugin
 * Returns array of games with eventId and team names
 */
export const fetchFanDuelGames = async (): Promise<Array<{
  eventId: string;
  awayTeam: string;
  homeTeam: string;
  startTime: string;
  gameName: string;
}>> => {
  console.log('🏀 Fetching FanDuel NBA games with Puppeteer (stealth mode)...');
  
  const puppeteer = require('puppeteer-extra');
  const StealthPlugin = require('puppeteer-extra-plugin-stealth');
  
  // Add stealth plugin to avoid detection
  puppeteer.use(StealthPlugin());
  
  let browser;

  try {
    console.log('🚀 Launching browser with stealth mode...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage'
      ]
    });

    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('📄 Loading FanDuel NBA page...');
    await page.goto('https://nj.sportsbook.fanduel.com/navigation/nba', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait longer for JavaScript to render
    console.log('⏳ Waiting for page to fully render...');
    await page.waitForTimeout(5000);
    
    // Check if we got blocked
    const pageTitle = await page.title();
    console.log('📋 Page title:', pageTitle);
    
    if (pageTitle.includes('denied') || pageTitle.includes('Access')) {
      throw new Error('Page access denied - bot detection still active');
    }
    
    // Try to find event links
    console.log('🔍 Extracting game data from DOM...');
    
    const games: Array<{
      eventId: string;
      awayTeam: string;
      homeTeam: string;
      startTime: string;
      gameName: string;
    }> = await page.evaluate(() => {
      const extractedGames: Array<{
        eventId: string;
        awayTeam: string;
        homeTeam: string;
        startTime: string;
        gameName: string;
      }> = [];

      // Look for links with /event/ in them
      const eventLinks = document.querySelectorAll('a[href*="/event/"]');
      
      eventLinks.forEach((link: Element) => {
        try {
          const href = link.getAttribute('href') || '';
          const eventIdMatch = href.match(/\/event\/(\d+)/);
          
          if (!eventIdMatch) return;
          
          const eventId = eventIdMatch[1];
          
          // Try to extract team names from the link text or nearby elements
          const linkText = link.textContent?.trim() || '';
          
          // Look for team names in parent containers
          const parent = link.closest('[class*="event"], [class*="game"], [class*="card"]');
          const teamElements = parent ? 
            Array.from(parent.querySelectorAll('[class*="team"], [class*="participant"]')) : 
            [];
          
          const teamTexts: string[] = [];
          teamElements.forEach((el: Element) => {
            const text = el.textContent?.trim();
            if (text && text.length > 2 && text.length < 50) {
              teamTexts.push(text);
            }
          });
          
          // If we found teams, add the game
          if (teamTexts.length >= 2) {
            extractedGames.push({
              eventId,
              awayTeam: teamTexts[0],
              homeTeam: teamTexts[1],
              startTime: new Date().toISOString(),
              gameName: linkText || `${teamTexts[0]} @ ${teamTexts[1]}`
            });
          } else if (linkText.includes('@') || linkText.includes('vs')) {
            // Try to parse from link text
            const parts = linkText.split(/@|vs/i).map(s => s.trim());
            if (parts.length >= 2) {
              extractedGames.push({
                eventId,
                awayTeam: parts[0],
                homeTeam: parts[1],
                startTime: new Date().toISOString(),
                gameName: linkText
              });
            }
          }
        } catch (err) {
          console.error('Error extracting game:', err);
        }
      });

      return extractedGames;
    });

    console.log(`✅ Found ${games.length} FanDuel games`);
    
    // Remove duplicates based on eventId
    const uniqueGames: Array<{
      eventId: string;
      awayTeam: string;
      homeTeam: string;
      startTime: string;
      gameName: string;
    }> = Array.from(
      new Map(games.map(game => [game.eventId, game])).values()
    );
    
    console.log(`✅ After deduplication: ${uniqueGames.length} unique games`);
    
    await browser.close();
    return uniqueGames;

  } catch (error) {
    console.error('❌ Error fetching FanDuel games:', error instanceof Error ? error.message : String(error));
    if (browser) {
      await browser.close();
    }
    return [];
  }
};

/**
 * Helper function to parse games from various FanDuel API response formats
 */
function parseFanDuelGames(data: any): Array<{
  eventId: string;
  awayTeam: string;
  homeTeam: string;
  startTime: string;
  gameName: string;
}> {
  const games: Array<{
    eventId: string;
    awayTeam: string;
    homeTeam: string;
    startTime: string;
    gameName: string;
  }> = [];

  try {
    // Try different data structures
    let events = data.events || data.attachments?.events || data.data?.events || [];
    
    if (Array.isArray(events)) {
      events.forEach((event: any) => {
        const eventId = event.eventId || event.id || event.marketId;
        const name = event.name || event.eventName || '';
        const openDate = event.openDate || event.startTime || new Date().toISOString();
        
        // Try to extract team names from the event name or competitors
        let awayTeam = '';
        let homeTeam = '';
        
        if (event.competitors && Array.isArray(event.competitors)) {
          awayTeam = event.competitors[0]?.name || '';
          homeTeam = event.competitors[1]?.name || '';
        } else if (name.includes(' @ ') || name.includes(' vs ')) {
          const teams = name.split(/ @ | vs /);
          awayTeam = teams[0]?.trim() || '';
          homeTeam = teams[1]?.trim() || '';
        }
        
        if (eventId && awayTeam && homeTeam) {
          games.push({
            eventId: String(eventId),
            awayTeam,
            homeTeam,
            startTime: openDate,
            gameName: name
          });
        }
      });
    }
  } catch (err) {
    console.error('Error parsing FanDuel games:', err);
  }

  return games;
}