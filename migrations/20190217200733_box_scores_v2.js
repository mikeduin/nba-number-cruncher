exports.up = function(knex, Promise) {
  return knex.schema.createTable('box_scores_v2', (t) => {
    t.increments();
    t.integer('gid');
    t.integer('h_tid');
    t.integer('v_tid');
    t.integer('period_updated');
    t.string('clock_last_updated');
    t.specificType('totals', 'jsonb[]');
    t.specificType('q1', 'jsonb[]');
    t.specificType('q2', 'jsonb[]');
    t.specificType('q3', 'jsonb[]');
    t.specificType('q4', 'jsonb[]');
    t.specificType('ot', 'jsonb[]');
    t.timestamp('updated_at');
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('box_scores_v2')
};
