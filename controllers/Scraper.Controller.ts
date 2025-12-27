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

export const scrapeBetsson = async (gameUrl: string) => {
  let browser;

  // const executablePath = await chromium.executablePath;

  if (app.get('env') === 'development') {
    browser = await puppeteer.launch({
      executablePath: '/opt/homebrew/bin/chromium',
      headless: true, // Try with visible browser first to debug
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled', // Hide automation
        '--disable-features=IsolateOrigins,site-per-process',
        '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });
  }

  console.log('gameUrl is ', gameUrl);

  if (gameUrl) {
    try {
      // const browser = await puppeteer.launch({
      //   executablePath: '/opt/homebrew/bin/chromium',
      //   args: ['--no-sandbox']
      // });
      const page = await browser.newPage();
      
      // Set a realistic viewport
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Mask that we're using automation
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => false,
        });
      });

      // If GameURL does not have "&mtg=3" at the end, add it
      if (!gameUrl.includes('&mtg=4')) {
        gameUrl += '&mtg=4';
      }
  
      // Navigate to the URL with longer timeout
      await page.goto(gameUrl, { 
        waitUntil: 'networkidle2',
        timeout: 60000 
      });

      console.log('has gone to gameUrl');
  
      const props = [];
  
      try {
        console.log('⏳ Waiting for page to fully load...');
        
        // // Wait longer for JS-heavy sites
        // await new Promise(resolve => setTimeout(resolve, 8000));
        
        // console.log('🔍 Analyzing page structure...');
        
        // // Comprehensive debugging and Shadow DOM traversal
        // const debugInfo = await page.evaluate(() => {
        //   // Helper function to recursively search through Shadow DOM
        //   const findInShadowDom = (root: Document | ShadowRoot, selector: string): Element | null => {
        //     // First try in current root
        //     let element = root.querySelector(selector);
        //     if (element) return element;
            
        //     // Then search in all shadow roots
        //     const allElements = root.querySelectorAll('*');
        //     for (const el of allElements) {
        //       if ((el as any).shadowRoot) {
        //         element = findInShadowDom((el as any).shadowRoot, selector);
        //         if (element) return element;
        //       }
        //     }
        //     return null;
        //   };
          
        //   // Helper to get all classes from Shadow DOM
        //   const getAllClassesFromShadowDom = (root: Document | ShadowRoot): string[] => {
        //     const classes: string[] = [];
        //     const elements = root.querySelectorAll('*');
            
        //     elements.forEach(el => {
        //       if (el.className && typeof el.className === 'string') {
        //         el.className.split(' ').forEach(c => {
        //           if (c && c.includes('obg')) classes.push(c);
        //         });
        //       }
              
        //       if ((el as any).shadowRoot) {
        //         classes.push(...getAllClassesFromShadowDom((el as any).shadowRoot));
        //       }
        //     });
            
        //     return classes;
        //   };
          
        //   // Helper to get all elements matching selector from Shadow DOM
        //   const getAllFromShadowDom = (root: Document | ShadowRoot, selector: string): Element[] => {
        //     const results: Element[] = [];
            
        //     // Get from current root
        //     const elements = root.querySelectorAll(selector);
        //     results.push(...Array.from(elements));
            
        //     // Recursively search shadow roots
        //     const allElements = root.querySelectorAll('*');
        //     allElements.forEach(el => {
        //       if ((el as any).shadowRoot) {
        //         results.push(...getAllFromShadowDom((el as any).shadowRoot, selector));
        //       }
        //     });
            
        //     return results;
        //   };
          
        //   // Collect debug information
        //   const shadowHosts: string[] = [];
        //   document.querySelectorAll('*').forEach(el => {
        //     if ((el as any).shadowRoot) {
        //       shadowHosts.push(el.tagName.toLowerCase());
        //     }
        //   });
          
        //   const obgClasses = getAllClassesFromShadowDom(document);
        //   const marketGroups = getAllFromShadowDom(document, '.obg-m-event-market-group');
          
        //   return {
        //     shadowHosts: shadowHosts.slice(0, 10),
        //     obgClassCount: obgClasses.length,
        //     obgClassesSample: obgClasses.slice(0, 20),
        //     marketGroupsFound: marketGroups.length,
        //     marketGroupClasses: marketGroups.slice(0, 3).map(el => el.className)
        //   };
        // });
        
        // console.log('📊 Debug Info:');
        // console.log('  - Shadow DOM hosts:', debugInfo.shadowHosts);
        // console.log('  - OBG classes found:', debugInfo.obgClassCount);
        // console.log('  - Sample OBG classes:', debugInfo.obgClassesSample);
        // console.log('  - Market groups found:', debugInfo.marketGroupsFound);
        // console.log('  - Market group classes:', debugInfo.marketGroupClasses);
        
        // Save debug files
        // const debugDir = path.join(process.cwd(), 'debug');
        // if (!fs.existsSync(debugDir)) {
        //   fs.mkdirSync(debugDir, { recursive: true });
        // }
        
        // const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        // const screenshotPath = path.join(debugDir, `betsson-${timestamp}.png`);
        
        // await page.screenshot({ path: screenshotPath, fullPage: true });
        // console.log('✅ Screenshot saved to:', screenshotPath);
        
        // if (debugInfo.marketGroupsFound === 0) {
        //   throw new Error(`No betting markets found in Shadow DOM. Found ${debugInfo.obgClassCount} obg classes but no market groups.`);
        // }
        
        // console.log(`✅ Found ${debugInfo.marketGroupsFound} market groups in Shadow DOM!`);

        console.log('🔓 Attempting to expand accordions and show-more buttons...');
        
        // Expand accordions and show-more buttons using Shadow DOM traversal
        const expandResult = await page.evaluate(() => {
          const clickInShadowDom = (root: Document | ShadowRoot, selector: string): number => {
            let clickCount = 0;
            
            // Click in current root
            const elements = root.querySelectorAll(selector);
            elements.forEach(el => {
              (el as HTMLElement).click();
              clickCount++;
            });
            
            // Recursively search shadow roots
            const allElements = root.querySelectorAll('*');
            allElements.forEach(el => {
              if ((el as any).shadowRoot) {
                clickCount += clickInShadowDom((el as any).shadowRoot, selector);
              }
            });
            
            return clickCount;
          };
          
          const accordionClicks = clickInShadowDom(document, '.obg-uiuplift-accordion-item-close');
          const buttonClicks = clickInShadowDom(document, '.obg-show-more-less-button');
          
          return { accordionClicks, buttonClicks };
        });
        
        console.log(`  - Expanded ${expandResult.accordionClicks} accordions`);
        console.log(`  - Clicked ${expandResult.buttonClicks} show-more buttons`);
        
        // Wait for animations to complete
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('📦 Extracting betting data from Shadow DOM...');
        
        // Extract the data directly from Shadow DOM (no Cheerio needed)
        const extractedProps = await page.evaluate(() => {
          const getAllFromShadowDom = (root: Document | ShadowRoot, selector: string): Element[] => {
            const results: Element[] = [];
            const elements = root.querySelectorAll(selector);
            results.push(...Array.from(elements));
            
            const allElements = root.querySelectorAll('*');
            allElements.forEach(el => {
              if ((el as any).shadowRoot) {
                results.push(...getAllFromShadowDom((el as any).shadowRoot, selector));
              }
            });
            
            return results;
          };
          
          const propsData: any[] = [];
          const marketGroups = getAllFromShadowDom(document, '.obg-m-event-market-group');
          
          console.log(`Found ${marketGroups.length} market groups to process`);
          
          marketGroups.forEach((marketGroupEl, idx) => {
            const marketHeader = marketGroupEl.querySelector('.obg-m-event-market-group-header');
            const market = marketHeader ? marketHeader.textContent?.trim() : 'Unknown';
            
            console.log(`Processing market ${idx + 1}: ${market}`);
            
            // Find all individual selection containers (each represents one bet - over or under)
            const selections = marketGroupEl.querySelectorAll('obg-selection-container-v2[playerpropsvariant]');
            console.log(`  Found ${selections.length} player prop selections`);
            
            // Group selections by player (they come in pairs: over/under)
            const playerProps = new Map();
            
            selections.forEach((selection, selIdx) => {
              try {
                const playerLabel = selection.querySelector('span.obg-selection-v2-group-label');
                const player = playerLabel ? playerLabel.textContent?.trim() : '';
                
                const lineLabel = selection.querySelector('span.obg-selection-v2-label:not(.obg-selection-v2-group-label)');
                const lineText = lineLabel ? lineLabel.textContent?.trim() : '';
                // lineText is like "Over 12.5" or "Under 12.5"
                const lineParts = lineText.split(' ');
                const direction = lineParts[0]; // "Over" or "Under"
                const lineValue = lineParts.length > 1 ? lineParts[1] : '';
                
                const oddsElement = selection.querySelector('span.obg-numeric-change-container-odds-value');
                const odds = oddsElement ? oddsElement.textContent?.trim() : '';
                
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
                console.log(`    Prop: ${prop.player} ${prop.line} (${prop.over}/${prop.under})`);
              }
            });
          });
          
          return propsData;
        });
        
        console.log(`✅ Extracted ${extractedProps.length} player props`);
        
        // Convert European (decimal) odds to American (moneyline) odds
        console.log('🔄 Converting European odds to American format...');
        const convertedProps = extractedProps.map(prop => ({
          ...prop,
          over: convertDecimalToAmerican(prop.over),
          under: convertDecimalToAmerican(prop.under)
        }));
        
        console.log(`✅ Converted ${convertedProps.length} props to American odds format`);
        
        // Add converted props to our results
        props.push(...convertedProps);
      } catch (e) {
        console.log('error scraping Betsson props for ', gameUrl, ' and error is ', e);
      }

      // Close the browser when you're done
      await browser.close();
  
      return props;
    } catch (e) {
      console.log('OUTER error scraping Betsson props for ', gameUrl, ' and error is ', e);
    }
  } else {
    console.log('No gameUrl provided');
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