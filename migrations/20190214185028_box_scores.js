exports.up = function(knex, Promise) {
  return knex.schema.createTable('box_scores', (t) => {
    t.increments();
    t.integer('gid');
    t.integer('period_updated');
    t.timestamp('updated_at');
    t.integer('h_pts_1q');
    t.integer('h_fga_1q');
    t.integer('h_fgm_1q');
    t.float('h_fg_pct_1q');
    t.integer('h_fta_1q');
    t.integer('h_to_1q');
    t.integer('h_off_reb_1q');
    t.integer('h_fouls_1q');
    t.integer('v_pts_1q');
    t.integer('v_fga_1q');
    t.integer('v_fgm_1q');
    t.integer('v_fta_1q');
    t.integer('v_to_1q');
    t.integer('v_off_reb_1q');
    t.integer('v_fouls_1q');
  })
};

exports.down = function(knex, Promise) {

};
