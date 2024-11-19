exports.up = function(knex, Promise) {
  return knex.schema.alterTable('schedule', (t) => {
    t.string('betsson_url');
    t.boolean('fetchProps').defaultTo(true);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('schedule', (t) => {
    t.dropColumn('betsson_url');
    t.dropColumn('fetchProps');
  })
};