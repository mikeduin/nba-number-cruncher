exports.up = function(knex, Promise) {
  return knex.schema.alterTable('player_data', (t) => {
    t.float('ppg_full'),
    t.float('ppg_l5'),
    t.float('rpg_full'),
    t.float('rpg_l5'),
    t.float('apg_full'),
    t.float('apg_l5'),
    t.float('spg_full'),
    t.float('spg_l5'),
    t.float('bpg_full'),
    t.float('bpg_l5'),
    t.float('3pg_full'),
    t.float('3pg_l5'),
    t.float('topg_full'),
    t.float('topg_l5')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('player_data', (t) => {
    t.dropColumn('ppg_full'),
    t.dropColumn('ppg_l5'),
    t.dropColumn('rpg_full'),
    t.dropColumn('rpg_l5'),
    t.dropColumn('apg_full'),
    t.dropColumn('apg_l5'),
    t.dropColumn('spg_full'),
    t.dropColumn('spg_l5'),
    t.dropColumn('bpg_full'),
    t.dropColumn('bpg_l5'),
    t.dropColumn('3pg_full'),
    t.dropColumn('3pg_l5'),
    t.dropColumn('topg_full'),
    t.dropColumn('topg_l5')
  })
};
