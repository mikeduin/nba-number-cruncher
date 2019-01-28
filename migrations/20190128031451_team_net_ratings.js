exports.up = function(knex, Promise) {
  return knex.schema.createTable('team_net_ratings', (t) => {
    t.increments();
    t.integer('team_id');
    t.string('team_name');
    t.float('team_full');
    t.float('team_l5');
    t.float('team_l10');
    t.float('team_l15');
    t.float('team_l20');
    t.float('starters_full');
    t.float('starters_l5');
    t.float('starters_l10');
    t.float('starters_l15');
    t.float('starters_l20');
    t.float('bench_full');
    t.float('bench_l5');
    t.float('bench_l10');
    t.float('bench_l15');
    t.float('bench_l20');
    t.float('1q_full');
    t.float('1q_l5');
    t.float('1q_l10');
    t.float('1q_l15');
    t.float('1q_l20');
    t.float('2q_full');
    t.float('2q_l5');
    t.float('2q_l10');
    t.float('2q_l15');
    t.float('2q_l20');
    t.float('3q_full');
    t.float('3q_l5');
    t.float('3q_l10');
    t.float('3q_l15');
    t.float('3q_l20');
    t.float('4q_full');
    t.float('4q_l5');
    t.float('4q_l10');
    t.float('4q_l15');
    t.float('4q_l20');
    t.timestamp('updated_at');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('team_net_ratings');
};
