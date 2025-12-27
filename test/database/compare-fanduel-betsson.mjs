import knex from './db/knex.js';

const gid = '0022400648';

const props = await knex('player_props')
  .where({ gid, sportsbook: 'FanDuel' })
  .orderBy('player_name')
  .limit(2);

console.log('\n📋 Full FanDuel prop entries (first 2):\n');
props.forEach(p => {
  console.log(`${p.player_name}:`);
  console.log(`  ❌ MISSING: player_id = ${p.player_id} (should be numeric)`);
  console.log(`  ❌ MISSING: team = ${p.team} (should be team abbreviation)`);
  console.log(`  ❌ MISSING: gdte = ${p.gdte} (should be date)`);
  console.log(`  ❌ MISSING: created_at = ${p.created_at}`);
  console.log(`  ❌ MISSING: updated_at = ${p.updated_at}`);
  console.log(`  ❌ MISSING: pts_active = ${p.pts_active} (should be true/false)`);
  console.log(`  ❌ MISSING: reb_active = ${p.reb_active}`);
  console.log(`  ❌ MISSING: ast_active = ${p.ast_active}`);
  console.log('');
});

// Compare with Betsson
const betssonProp = await knex('player_props')
  .where({ gid, sportsbook: 'Betsson' })
  .first();

console.log('✅ CORRECT Betsson example for comparison:\n');
console.log(`${betssonProp.player_name}:`);
console.log(`  ✅ player_id = ${betssonProp.player_id}`);
console.log(`  ✅ team = ${betssonProp.team}`);
console.log(`  ✅ gdte = ${betssonProp.gdte}`);
console.log(`  ✅ created_at = ${betssonProp.created_at}`);
console.log(`  ✅ updated_at = ${betssonProp.updated_at}`);
console.log(`  ✅ pts_active = ${betssonProp.pts_active}`);
console.log(`  ✅ reb_active = ${betssonProp.reb_active}`);
console.log(`  ✅ ast_active = ${betssonProp.ast_active}`);

await knex.destroy();
