exports.up = function(knex) {
  return knex.schema.alterTable('teams', (t) => {
    t.text('notes');
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('teams', (t) => {
    t.dropColumn('notes');
  })
};