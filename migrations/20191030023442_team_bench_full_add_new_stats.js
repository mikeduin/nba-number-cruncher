exports.up = function(knex, Promise) {
  return knex.schema.alterTable('teams_bench', (t) => {
    t.float('pace_per40');
    t.integer('poss');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('teams_bench', (t) => {
    t.dropColumn('pace_per40');
    t.dropColumn('poss');
  })
};
