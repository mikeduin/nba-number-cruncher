
exports.up = function(knex) {
  return knex.schema.alterTable('player_data', (t) => {
    t.integer('season');
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('player_data', (t) => {
    t.dropColumn('season');
  })
};
