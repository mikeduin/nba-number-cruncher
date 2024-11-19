exports.up = function(knex, Promise) {
  return knex.schema.alterTable('player_data', (t) => {
    t.integer('gp_post'),
    t.float('min_post'),
    t.float('fgm_post'),
    t.float('fga_post'),
    t.float('3pg_post'),
    t.float('3pa_post'),
    t.float('ftm_post'),
    t.float('fta_post'),
    t.float('rpg_post'),
    t.float('apg_post'),
    t.float('spg_post'),
    t.float('bpg_post'),
    t.float('topg_post'),
    t.float('ppg_post'),
    t.float('pf_post'),
    t.float('min_3q_post'),
    t.float('fgm_3q_post'),
    t.float('fga_3q_post'),
    t.float('3pg_3q_post'),
    t.float('3pa_3q_post'),
    t.float('ftm_3q_post'),
    t.float('fta_3q_post'),
    t.float('rpg_3q_post'),
    t.float('apg_3q_post'),
    t.float('spg_3q_post'),
    t.float('bpg_3q_post'),
    t.float('topg_3q_post'),
    t.float('ppg_3q_post'),
    t.float('min_4q_post'),
    t.float('fgm_4q_post'),
    t.float('fga_4q_post'),
    t.float('3pg_4q_post'),
    t.float('3pa_4q_post'),
    t.float('ftm_4q_post'),
    t.float('fta_4q_post'),
    t.float('rpg_4q_post'),
    t.float('apg_4q_post'),
    t.float('spg_4q_post'),
    t.float('bpg_4q_post'),
    t.float('topg_4q_post'),
    t.float('ppg_4q_post')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('player_data', (t) => {
    t.dropColumn('gp_post'),
    t.dropColumn('min_post'),
    t.dropColumn('fgm_post'),
    t.dropColumn('fga_post'),
    t.dropColumn('3pg_post'),
    t.dropColumn('3pa_post'),
    t.dropColumn('ftm_post'),
    t.dropColumn('fta_post'),
    t.dropColumn('rpg_post'),
    t.dropColumn('apg_post'),
    t.dropColumn('spg_post'),
    t.dropColumn('bpg_post'),
    t.dropColumn('topg_post'),
    t.dropColumn('ppg_post'),
    t.dropColumn('pf_post'),
    t.dropColumn('min_3q_post'),
    t.dropColumn('fgm_3q_post'),
    t.dropColumn('fga_3q_post'),
    t.dropColumn('3pg_3q_post'),
    t.dropColumn('3pa_3q_post'),
    t.dropColumn('ftm_3q_post'),
    t.dropColumn('fta_3q_post'),
    t.dropColumn('rpg_3q_post'),
    t.dropColumn('apg_3q_post'),
    t.dropColumn('spg_3q_post'),
    t.dropColumn('bpg_3q_post'),
    t.dropColumn('topg_3q_post'),
    t.dropColumn('ppg_3q_post'),
    t.dropColumn('min_4q_post'),
    t.dropColumn('fgm_4q_post'),
    t.dropColumn('fga_4q_post'),
    t.dropColumn('3pg_4q_post'),
    t.dropColumn('3pa_4q_post'),
    t.dropColumn('ftm_4q_post'),
    t.dropColumn('fta_4q_post'),
    t.dropColumn('rpg_4q_post'),
    t.dropColumn('apg_4q_post'),
    t.dropColumn('spg_4q_post'),
    t.dropColumn('bpg_4q_post'),
    t.dropColumn('topg_4q_post'),
    t.dropColumn('ppg_4q_post')
  })
};