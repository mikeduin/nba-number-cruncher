import express from 'express';
import puppeteer from 'puppeteer';
// import puppeteer from 'puppeteer-core';
// import chromium from 'chrome-aws-lambda';
import axios from 'axios';
import cheerio from 'cheerio';
import { getReadablePrice, parseBovadaLines } from '../utils';
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
    // browser = await puppeteer.launch({
    //   args: ['--no-sandbox']
    // });
    // } else {
    browser = await puppeteer.launch({
      executablePath: '/opt/homebrew/bin/chromium',
      args: ['--no-sandbox']
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

      // If GameURL does not have "&mtg=6" at the end, add it
      if (!gameUrl.includes('&mtg=24')) {
      // if (!gameUrl.includes('&mtg=6')) {
        gameUrl += '&mtg=24';
        // gameUrl += '&mtg=6';
      }
  
      // Navigate to the URL
      await page.goto(gameUrl);

      console.log('has gone to gameUrl');
  
      const props = [];
  
      try {
        console.log('waiting for selector');
        // You might need to wait for a specific element or some time for the dynamic content to load
        await page.waitForSelector('.obg-m-event-markets');

        // console.log('page is ', page);

        const closedAccordionSelector = '.obg-uiuplift-accordion-item-close';
        const closedAccordions = await page.$$(closedAccordionSelector);

        console.log('closedAccordions are ', closedAccordions);

        for (const accordion of closedAccordions) {
          await accordion.click();
        }

        const buttonSelector = '.obg-show-more-less-button';
        const buttons = await page.$$(buttonSelector);
        console.log('buttons are ', buttons);
        for (const button of buttons) {
          await button.click();
          // Optionally, you can wait for some time between clicks
          // await page.waitForTimeout(1000); // Wait for 1 second
        }
  
        // Extract the content
        const content = await page.content();
        const $ = cheerio.load(content);

        // console.log('content is ', content);

        // $('.obg-m-event-player-props-market-group').each(function(i, elem) {
        $('obg-m-event-market-group').each(function(i, elem) {
          const market = $(elem).find('div.obg-m-event-market-group-header').text().trim();
          console.log('market is ', market);

          // in each market, loop through the instances of <obg-uiuplift-accordion class="obg-m-event-player-props-market-group"/>
          // and extract the player, line, over, and under
          $(elem).find('obg-uiuplift-accordion.obg-m-event-player-props-market-group').each(function(j, elem) {
            console.log('elem is ', elem);
            const player = $(elem).find('span.obg-selection-v2-label.group-label').first().text().trim();
            // console.log('player is ', player);
            const line = $(elem).find('span.obg-selection-v2-label:not(.group-label)').first().text().trim().split(' ')[1]; // "Over 25.5" ... get value after space
            const over = $(elem).find('span.obg-numeric-change-container-odds-value').first().text();
            const under = $(elem).find('span.obg-numeric-change-container-odds-value').eq(1).text();

            const playerProp: PlayerProp = {
              market,
              player,
              line: parseFloat(line),
              over: parseFloat(over),
              under: parseFloat(under)
            }

            props.push(playerProp);
          })
        })
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