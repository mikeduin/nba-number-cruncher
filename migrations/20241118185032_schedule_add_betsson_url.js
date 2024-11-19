exports.up = function(knex, Promise) {
  return knex.schema.alterTable('schedule', (t) => {
    t.string('betsson_url')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('schedule', (t) => {
    t.dropColumn('betsson_url')
  })
};