import { scrapeBetsson } from './dist/controllers/Scraper.Controller.js';

const testUrl = 'https://www2.betsson.com/en/sportsbook/live/basketball?eventId=f-K9DihKsikUWfzgVb6vgNMg&eti=1&mtg=4';

console.log('🚀 Testing Betsson scraper with Shadow DOM traversal...\n');
scrapeBetsson(testUrl)
  .then(result => {
    console.log('\n✅ SCRAPE SUCCESSFUL!');
    console.log('====================================');
    console.log(`Total props extracted: ${result?.length || 0}`);
    if (result && result.length > 0) {
      console.log('\nFirst 5 props:');
      result.slice(0, 5).forEach((prop, idx) => {
        console.log(`${idx + 1}. ${prop.player} - ${prop.market}`);
        console.log(`   Line: ${prop.line} | Over: ${prop.over} | Under: ${prop.under}`);
      });
    }
    console.log('====================================\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ SCRAPE FAILED!');
    console.error('====================================');
    console.error('Error:', error.message);
    console.error('====================================\n');
    process.exit(1);
  });
