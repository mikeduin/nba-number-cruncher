exports.up = function(knex, Promise) {
  return knex.schema.table('players_on_off', (t) => {
    t.float('total_rating');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('players_on_off', (t) => {
    t.dropColumn('total_rating');
  })
};
