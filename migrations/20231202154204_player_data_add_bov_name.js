exports.up = function(knex, Promise) {
  return knex.schema.alterTable('player_data', (t) => {
    t.string('bovada_name')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('player_data', (t) => {
    t.dropColumn('bovada_name')
  })
};
