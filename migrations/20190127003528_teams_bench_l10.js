exports.up = function(knex, Promise) {
  return knex.schema.createTable('teams_bench_l10', (t) => {
    t.increments();
    t.integer('team_id');
    t.string('team_name');
    t.integer('gp');
    t.integer('w');
    t.integer('l');
    t.float('w_pct');
    t.integer('min');
    t.float('e_off_rating');
    t.float('off_rating');
    t.float('e_def_rating');
    t.float('def_rating');
    t.float('e_net_rating');
    t.float('net_rating');
    t.float('ast_pct');
    t.float('ast_to');
    t.float('ast_ratio');
    t.float('oreb_pct');
    t.float('dreb_pct');
    t.float('reb_pct');
    t.float('tm_tov_pct');
    t.float('efg_pct');
    t.float('ts_pct');
    t.float('e_pace');
    t.float('pace');
    t.float('pie');
    t.integer('gp_rank');
    t.integer('w_rank');
    t.integer('l_rank');
    t.integer('w_pct_rank');
    t.integer('min_rank');
    t.integer('off_rating_rank');
    t.integer('def_rating_rank');
    t.integer('net_rating_rank');
    t.integer('ast_pct_rank');
    t.integer('ast_to_rank');
    t.integer('ast_ratio_rank');
    t.integer('oreb_pct_rank');
    t.integer('dreb_pct_rank');
    t.integer('reb_pct_rank');
    t.integer('tm_tov_pct_rank');
    t.integer('efg_pct_rank');
    t.integer('ts_pct_rank');
    t.integer('pace_rank');
    t.integer('pie_rank');
    t.integer('cfid');
    t.string('cfparams');
    t.timestamp('updated_at');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('teams_bench_l10');
};
