const puppeteer = require('puppeteer');
const axios = require("axios");
const cheerio = require('cheerio');

const gameUrl = 'https://www.bovada.lv/sports/basketball/nba/milwaukee-bucks-orlando-magic-202311111810';

module.exports = {
  scrapeBovada: async () => {
    const browser = await puppeteer.launch({
      executablePath: '/opt/homebrew/bin/chromium'
    });
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto(gameUrl, { waitUntil: 'domcontentloaded' });

    // You might need to wait for a specific element or some time for the dynamic content to load
    // e.g., wait for an element with a specific selector
    await page.waitForSelector('.STATSCOREWidget--live__statDisplayValues');

    // Extract the content
    const content = await page.content();


    // const response = await axios.get('https://www.bovada.lv/sports/basketball/nba/milwaukee-bucks-orlando-magic-202311111810');
    const $ = cheerio.load(content);

    // Your scraping logic here

    console.log('$ is ', $);
    $('sp-alternate').each(function(i, elem) {
      // console.log('i is ', i);
      // console.log('elem is ', elem);
      const text = $(elem).find('h3.league-header').text();
      const line = $(elem).find('ul.spread-header').children().first().text().trim();
      const overPrice = $(elem).find('ul.market-type').find('span.bet-price').first().text().trim();
      const underPrice = $(elem).find('ul.market-type').find('span.bet-price').eq(1).text().trim();
      console.log('text is ', text, ' and line is ', line, ' and overPrice is ', overPrice, ' and underPrice is ', underPrice);
    })

    // Close the browser when you're done
    await browser.close();
  }
}