import knex from './db/knex.js';

const games = await knex('schedule')
  .where('gdte', '>=', '2025-01-25')
  .where('gdte', '<=', '2025-01-27')
  .select('gid', 'gdte', 'v', 'h', 'fanduel_event_id')
  .orderBy('gdte');

console.log('\nRecent games:\n');
games.forEach(g => {
  const visitor = g.v[0].tn;
  const home = g.h[0].tn;
  const fd = g.fanduel_event_id || 'not set';
  console.log(`${g.gid} | ${g.gdte} | ${visitor} @ ${home} | FD: ${fd}`);
});

await knex.destroy();
