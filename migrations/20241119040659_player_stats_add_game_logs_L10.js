exports.up = function(knex, Promise) {
  return knex.schema.alterTable('player_data', (t) => {
    t.specificType('game_logs_l10', 'jsonb[]');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('player_data', (t) => {
    t.dropColumn('game_logs_l10')
  })
};
