import knex from './db/knex.js';

const season = 2024;
const teamIds = [1610612766, 1610612747]; // Hornets and Lakers

const players = await knex('player_data')
  .where({ season })
  .whereIn('team_id', teamIds)
  .select('player_name', 'team_abbreviation')
  .orderBy('team_abbreviation')
  .orderBy('player_name');

console.log(`\nPlayers in database for 2024 season (Lakers & Hornets):\n`);
players.forEach(p => {
  console.log(`  ${p.team_abbreviation}: ${p.player_name}`);
});

console.log(`\nTotal: ${players.length} players\n`);

await knex.destroy();
