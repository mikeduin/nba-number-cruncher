import knex from './db/knex.js';
import { updateSingleGameProps } from './controllers/Props.Controller.ts';
import { SportsbookName } from './types/index.ts';

async function testDraftKings() {
  try {
    // First update the schedule with the DraftKings event ID
    console.log('Adding DraftKings event ID to schedule...');
    await knex('schedule')
      .where('gid', '0022500421')
      .update({ draftkings_event_id: '33365894' });
    
    console.log('✅ Schedule updated\n');
    
    // Now scrape and save DraftKings props
    console.log('Scraping DraftKings props for game 0022500421...\n');
    await updateSingleGameProps('0022500421', SportsbookName.DraftKings);
    
    console.log('\n✅ DraftKings props scraped and saved!');
    
    // Query the saved props to verify
    console.log('\nQuerying saved DraftKings props...');
    const savedProps = await knex('player_props')
      .where({ gid: '0022500421', sportsbook: 'DraftKings' })
      .orderBy('player_name')
      .limit(10);
    
    console.log(`\n📊 Found ${savedProps.length} sample props (showing first 10):`);
    savedProps.forEach(prop => {
      console.log(`  ${prop.player_name}: pts=${prop.pts_line}/${prop.pts_over}/${prop.pts_under}, ` +
                  `reb=${prop.reb_line}/${prop.reb_over}/${prop.reb_under}, ` +
                  `ast=${prop.ast_line}/${prop.ast_over}/${prop.ast_under}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testDraftKings();
