exports.up = function(knex, Promise) {
  return knex.schema.alterTable('player_data', (t) => {
    t.float('min_3q_full'),
    t.float('min_3q_l5'),
    t.float('min_4q_full'),
    t.float('min_4q_l5')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('player_data', (t) => {
    t.dropColumn('min_3q_full'),
    t.dropColumn('min_3q_l5'),
    t.dropColumn('min_4q_full'),
    t.dropColumn('min_4q_l5')
  })
};
