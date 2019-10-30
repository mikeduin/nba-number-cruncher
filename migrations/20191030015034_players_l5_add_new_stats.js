exports.up = function(knex, Promise) {
  return knex.schema.alterTable('players_l5', (t) => {
    t.float('e_tov_pct');
    t.float('e_usg_pct');
    t.float('pace_per40');
    t.integer('poss');
    t.renameColumn('tm_tov_pct_rank', 'tov_pct_rank');
    t.integer('e_tov_pct_rank');
    t.integer('e_usg_pct_rank');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('players_l5', (t) => {
    t.dropColumn('e_tov_pct');
    t.dropColumn('e_usg_pct');
    t.dropColumn('pace_per40');
    t.dropColumn('poss');
    t.renameColumn('tov_pct_rank', 'tm_tov_pct_rank');
    t.dropColumn('e_tov_pct_rank');
    t.dropColumn('e_usg_pct_rank');
  })
};
