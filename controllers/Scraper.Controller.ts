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
import { PlayerProp } from '../types';

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

      // If GameURL does not have "&mtg=4" at the end, add it
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
            
            // Find all player prop accordions within this market group
            const accordions = marketGroupEl.querySelectorAll('.obg-m-event-player-props-market-group');
            console.log(`  Found ${accordions.length} player props`);
            
            accordions.forEach((accordion, propIdx) => {
              try {
                const playerLabel = accordion.querySelector('span.obg-selection-v2-label.group-label');
                const player = playerLabel ? playerLabel.textContent?.trim() : '';
                
                const lineLabel = accordion.querySelector('span.obg-selection-v2-label:not(.group-label)');
                const lineText = lineLabel ? lineLabel.textContent?.trim() : '';
                const lineParts = lineText.split(' ');
                const line = lineParts.length > 1 ? lineParts[1] : '';
                
                const oddsValues = accordion.querySelectorAll('span.obg-numeric-change-container-odds-value');
                const over = oddsValues[0] ? oddsValues[0].textContent?.trim() : '';
                const under = oddsValues[1] ? oddsValues[1].textContent?.trim() : '';
                
                if (player && line && over && under) {
                  propsData.push({
                    market,
                    player,
                    line: parseFloat(line),
                    over: parseFloat(over),
                    under: parseFloat(under)
                  });
                  console.log(`    Prop ${propIdx + 1}: ${player} ${line} (${over}/${under})`);
                }
              } catch (err) {
                console.log(`    Error extracting prop ${propIdx + 1}:`, err);
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