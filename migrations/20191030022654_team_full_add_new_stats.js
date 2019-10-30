exports.up = function(knex, Promise) {
  return knex.schema.alterTable('teams_full', (t) => {
    t.float('pace_per40');
    t.integer('poss');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('teams_full', (t) => {
    t.dropColumn('pace_per40');
    t.dropColumn('poss');
  })
};
