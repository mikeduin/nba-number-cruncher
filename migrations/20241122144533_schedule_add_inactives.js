exports.up = function(knex, Promise) {
  return knex.schema.alterTable('schedule', (t) => {
    t.string('inactives');
    t.boolean('inactives_set').defaultTo(false);
    t.text('notes');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('schedule', (t) => {
    t.dropColumn('inactives');
    t.dropColumn('inactives_set');
    t.dropColumn('notes');
  })
};