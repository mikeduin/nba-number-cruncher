exports.up = function(knex, Promise) {
  return knex.schema.alterTable('player_data', (t) => {
    t.string('position')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('player_data', (t) => {
    t.dropColumn('position')
  })
};
