exports.up = function(knex, Promise) {
  return knex.schema.alterTable('players_l5', (t) => {
    t.float('fg3a_3q'),
    t.float('fg3a_4q')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('players_l5', (t) => {
    t.dropColumn('fg3a_3q'),
    t.dropColumn('fg3a_4q')
  })
};
