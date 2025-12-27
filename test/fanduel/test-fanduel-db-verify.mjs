/**
 * Verify FanDuel props were saved to database
 */

import knex from '../../db/knex.js';

const GAME_ID = 22500433; // Nuggets @ Magic
const SPORTSBOOK = 'FanDuel';

console.log('🔍 Checking for FanDuel props in database...\n');
console.log('Game ID:', GAME_ID);
console.log('Sportsbook:', SPORTSBOOK);
console.log('---\n');

try {
  // Query for FanDuel props for this game
  const props = await knex('player_props')
    .where({
      gid: GAME_ID,
      sportsbook: SPORTSBOOK
    })
    .select('*');
  
  console.log(`✅ Found ${props.length} ${SPORTSBOOK} props for game ${GAME_ID}\n`);
  
  if (props.length > 0) {
    console.log('Sample props:');
    props.slice(0, 5).forEach(prop => {
      console.log(`  - ${prop.player_name} (${prop.team})`);
      if (prop.pts) console.log(`      Points: ${prop.pts} (${prop.pts_over}/${prop.pts_under}) [active: ${prop.pts_active}]`);
      if (prop.reb) console.log(`      Rebounds: ${prop.reb} (${prop.reb_over}/${prop.reb_under}) [active: ${prop.reb_active}]`);
      if (prop.ast) console.log(`      Assists: ${prop.ast} (${prop.ast_over}/${prop.ast_under}) [active: ${prop.ast_active}]`);
    });
    
    // Count unique players
    const uniquePlayers = new Set(props.map(p => p.player_name));
    console.log(`\n📊 Stats:`);
    console.log(`  - Unique players: ${uniquePlayers.size}`);
    console.log(`  - Total prop rows: ${props.length}`);
    
    // Check which prop types are populated
    const propTypes = ['pts', 'reb', 'ast', 'fg3m', 'stl', 'blk', 'tov', 'pts+reb+ast'];
    console.log(`\n📈 Prop type coverage:`);
    propTypes.forEach(type => {
      const count = props.filter(p => p[type] !== null).length;
      if (count > 0) {
        console.log(`  - ${type}: ${count} players`);
      }
    });
  }
  
} catch (error) {
  console.error('❌ Database query failed:', error.message);
  process.exit(1);
}

await knex.destroy();
console.log('\n✅ Database connection closed');
