exports.up = function(knex, Promise) {
  return knex.schema.createTable('player_data', (t) => {
    t.increments();
    t.integer('player_id');
    t.string('player_name');
    t.integer('team_id');
    t.string('team_abbreviation');
    t.integer('gp_full');
    t.integer('gp_l5');
    t.integer('gp_l10');
    t.integer('gp_l15');
    t.float('min_full');
    t.float('min_l5');
    t.float('min_l10');
    t.float('min_l15');
    t.float('net_rtg_full');
    t.float('net_rtg_l5');
    t.float('net_rtg_l10');
    t.float('net_rtg_l15');
    t.float('off_rtg_full');
    t.float('off_rtg_l5');
    t.float('off_rtg_l10');
    t.float('off_rtg_l15');
    t.float('def_rtg_full');
    t.float('def_rtg_l5');
    t.float('def_rtg_l10');
    t.float('def_rtg_l15');
    t.float('pace_full');
    t.float('pace_l5');
    t.float('pace_l10');
    t.float('pace_l15');
    t.timestamp('updated_at');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('player_data');
};
