exports.up = function(knex, Promise) {
  return knex.schema.alterTable('schedule', (t) => {
    t.string('bovada_url')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('schedule', (t) => {
    t.dropColumn('bovada_url')
  })
};