import express from 'express';
import puppeteer from 'puppeteer';
// import puppeteer from 'puppeteer-core';
// import chromium from 'chrome-aws-lambda';
import axios from 'axios';
import cheerio from 'cheerio';
import parseBovadaLines from '../utils/props/parseBovadaLines.js';

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

  try {
    // const browser = await puppeteer.launch({
    //   executablePath: '/opt/homebrew/bin/chromium',
    //   args: ['--no-sandbox']
    // });
    const page = await browser.newPage();

    // Navigate to the URL
    // await page.goto(gameUrl, { waitUntil: 'domcontentloaded' }); // This wasn't working pregame, but might need to be used for live games?
    await page.goto(gameUrl);

    const props = [];

    try {
      // You might need to wait for a specific element or some time for the dynamic content to load
      // await page.waitForSelector('.sp-main-content');
      await page.waitForSelector('.league-header');

      // Extract the content
      const content = await page.content();
      const $ = cheerio.load(content);

      $('sp-alternate').each(function (i, elem) {
        const market = parseBovadaLines($(elem).find('h3.league-header').text());

        // console.log('market is ', market);

        if (market) {
          const over = $(elem).find('ul.market-type').find('span.bet-price').first().text().trim();
          // Continue with the rest of the function logic...
        }
      });
    } catch (error) {
      console.error('Error extracting content:', error);
    }
  } catch (error) {
    console.error('Error launching browser:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};