import knex from './db/knex.js';

// Check what seasons exist in player_data
const seasons = await knex('player_data')
  .distinct('season')
  .orderBy('season', 'desc');

console.log('\n📋 Seasons in player_data table:');
seasons.forEach(s => console.log(`  - ${s.season}`));

// Check for specific players in season 2024
const testPlayers = ['Cooper Flagg', 'Dennis Schröder', 'DeMar DeRozan', 'Klay Thompson'];

console.log('\n🔍 Searching for test players in season 2024:\n');

for (const playerName of testPlayers) {
  const found = await knex('player_data')
    .where({ season: 2024 })
    .where('player_name', 'like', `%${playerName.split(' ')[0]}%`)
    .select('player_name', 'team_abbreviation', 'player_id');
  
  if (found.length > 0) {
    found.forEach(p => console.log(`  ✅ Found: ${p.player_name} (${p.team_abbreviation}) - ID: ${p.player_id}`));
  } else {
    console.log(`  ❌ NOT FOUND: ${playerName}`);
  }
}

await knex.destroy();
