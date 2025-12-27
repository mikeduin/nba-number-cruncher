import { scrapeBetsson } from './controllers/Scraper.Controller.js';

const testUrl = 'https://www.betsson.com/en/sportsbook/basketball/nba/new-york-knicks-cleveland-cavaliers/1026158191';

console.log('Testing Betsson scraper...');
scrapeBetsson(testUrl)
  .then(result => {
    console.log('Scrape successful!');
    console.log('Result:', JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error('Scrape failed:', error.message);
    process.exit(1);
  });
