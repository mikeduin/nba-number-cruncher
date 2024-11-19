exports.up = function(knex) {
  return Promise.all([
    knex.schema.alterTable('player_boxscores_by_q', (t) => {
      t.integer('season');
    }),
    knex.schema.alterTable('player_game_stints', (t) => {
      t.integer('season');
    }),
    knex.schema.alterTable('player_props', (t) => {
      t.integer('season');
    }),
    knex.schema.alterTable('players_full', (t) => {
      t.integer('season');
      t.timestamp('created_at');
    }),
    knex.schema.alterTable('players_l10', (t) => {
      t.integer('season');
      t.timestamp('created_at');
    }),
    knex.schema.alterTable('players_l15', (t) => {
      t.integer('season');
      t.timestamp('created_at');
    }),
    knex.schema.alterTable('players_l5', (t) => {
      t.integer('season');
      t.timestamp('created_at');
    }),
    knex.schema.alterTable('players_playoffs', (t) => {
      t.integer('season');
    })
  ]).then(() => {
    return Promise.all([
      knex('player_boxscores_by_q').update({ season: 2023 }),
      knex('player_game_stints').update({ season: 2023 }),
      knex('player_props').update({ season: 2023 }),
      knex('player_data').update({ season: 2023 }),
      knex('players_full').update({ season: 2023 }),
      knex('players_l10').update({ season: 2023 }),
      knex('players_l15').update({ season: 2023 }),
      knex('players_l5').update({ season: 2023 }),
      knex('players_playoffs').update({ season: 2023 })
    ]);
  });
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.alterTable('player_boxscores_by_q', (t) => {
      t.dropColumn('season');
    }),
    knex.schema.alterTable('player_game_stints', (t) => {
      t.dropColumn('season');
    }),
    knex.schema.alterTable('player_props', (t) => {
      t.dropColumn('season');
    }),
    knex.schema.alterTable('players_full', (t) => {
      t.dropColumn('season');
      t.dropColumn('created_at');
    }),
    knex.schema.alterTable('players_l10', (t) => {
      t.dropColumn('season');
      t.dropColumn('created_at');
    }),
    knex.schema.alterTable('players_l15', (t) => {
      t.dropColumn('season');
      t.dropColumn('created_at');
    }),
    knex.schema.alterTable('players_l5', (t) => {
      t.dropColumn('season');
      t.dropColumn('created_at');
    }),
    knex.schema.alterTable('players_playoffs', (t) => {
      t.dropColumn('season');
    })
  ]);
};