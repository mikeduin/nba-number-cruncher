import knex from './db/knex.js';

const result = await knex('player_props')
  .where({ gid: '0022400648', sportsbook: 'FanDuel', player_name: 'Cooper Flagg' })
  .first();

console.log(JSON.stringify(result, null, 2));

await knex.destroy();
