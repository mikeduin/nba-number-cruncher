/**
 * Verify players exist in player_data for season 2025
 */

import knex from './db/knex.js';

const gid = '0022400648'; // Lakers @ Hornets

try {
  const game = await knex('schedule').where({ gid }).first();
  
  if (!game) {
    console.error('❌ Game not found');
    process.exit(1);
  }
  
  console.log(`\nGame: ${game.v[0].tn} @ ${game.h[0].tn}`);
  console.log(`Team IDs: ${game.v[0].tid}, ${game.h[0].tid}\n`);
  
  // Check season 2024
  const players2024 = await knex('player_data')
    .where({ season: 2024 })
    .whereIn('team_id', [game.v[0].tid, game.h[0].tid])
    .select('player_id', 'player_name', 'team_abbreviation');
  
  console.log(`Season 2024: ${players2024.length} players`);
  if (players2024.length > 0) {
    console.log('Sample players:', players2024.slice(0, 5).map(p => p.player_name).join(', '));
  }
  
  // Check season 2025
  const players2025 = await knex('player_data')
    .where({ season: 2025 })
    .whereIn('team_id', [game.v[0].tid, game.h[0].tid])
    .select('player_id', 'player_name', 'team_abbreviation');
  
  console.log(`\nSeason 2025: ${players2025.length} players`);
  if (players2025.length > 0) {
    console.log('Sample players:', players2025.slice(0, 5).map(p => p.player_name).join(', '));
    
    // Check for specific FanDuel players
    const fanDuelPlayers = [
      'Cooper Flagg',
      'DeMar DeRozan',
      'Dennis Schröder',
      'Klay Thompson',
      'Russell Westbrook'
    ];
    
    console.log('\n✓ Checking FanDuel players in season 2025:');
    fanDuelPlayers.forEach(name => {
      const found = players2025.find(p => p.player_name === name);
      console.log(`  ${found ? '✅' : '❌'} ${name}${found ? ` (${found.team_abbreviation})` : ''}`);
    });
  }
  
  await knex.destroy();
} catch (error) {
  console.error('❌ Error:', error.message);
  await knex.destroy();
  process.exit(1);
}
