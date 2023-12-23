const express = require('express');
// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');
const axios = require("axios");
const cheerio = require('cheerio');
const app = express();

const parseBovadaLines = require('../utils/props/parseBovadaLines');

module.exports = {
  scrapeBovada: async (gameUrl) => {
    // let browser;

    // const executablePath = await chromium.executablePath;

    // // if (app.get('env') !== 'development') {
    //   const browser = await puppeteer.launch({
    //     executablePath,
    //     args: chromium.args,
    //     headless: chromium.headless,
    // });
    // // } else {
    //   // browser = await puppeteer.launch({
    //   //   executablePath: '/opt/homebrew/bin/chromium',
    //   //   args: ['--no-sandbox']
    //   // });
    // }



    try {
      const browser = await puppeteer.launch({
        executablePath: '/opt/homebrew/bin/chromium',
        args: ['--no-sandbox']
      });
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
  
  
        $('sp-alternate').each(function(i, elem) {
          const market = parseBovadaLines($(elem).find('h3.league-header').text());
  
          if (market) {
            const over = $(elem).find('ul.market-type').find('span.bet-price').first().text().trim();
            const under = $(elem).find('ul.market-type').find('span.bet-price').eq(1).text().trim()
  
            market.line = parseFloat($(elem).find('ul.spread-header').children().first().text().trim());
            market.over = over 
              ? over === 'EVEN' ? 100 : parseFloat(over)
              : null;
            market.under = under 
            ? under === 'EVEN' ? 100 : parseFloat(under)
            : null;
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
  }
}