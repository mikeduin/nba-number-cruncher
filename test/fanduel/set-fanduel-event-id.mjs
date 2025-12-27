/**
 * Helper script to set FanDuel event ID for a game
 * 
 * Usage: node set-fanduel-event-id.mjs <gid> <fanduel_event_id>
 * Example: node set-fanduel-event-id.mjs 0022400453 35085635
 */

import knex from './db/knex.js';

const gid = process.argv[2];
const fanDuelEventId = process.argv[3];

if (!gid || !fanDuelEventId) {
  console.log('Usage: node set-fanduel-event-id.mjs <gid> <fanduel_event_id>');
  console.log('Example: node set-fanduel-event-id.mjs 0022400453 35085635');
  process.exit(1);
}

try {
  await knex('schedule')
    .where({ gid })
    .update({ fanduel_event_id: fanDuelEventId });
  
  console.log(`✅ Set FanDuel event ID ${fanDuelEventId} for game ${gid}`);
  
  const game = await knex('schedule')
    .where({ gid })
    .select('gid', 'gdte', 'v', 'h', 'fanduel_event_id')
    .first();
  
  console.log('\nGame info:');
  console.log(`  Date: ${game.gdte}`);
  console.log(`  Teams: ${game.v[0].tn} @ ${game.h[0].tn}`);
  console.log(`  FanDuel Event ID: ${game.fanduel_event_id}`);
  
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
} finally {
  await knex.destroy();
}
