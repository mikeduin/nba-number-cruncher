exports.up = function(knex, Promise) {
  return knex.schema.alterTable('schedule', (t) => {
    t.string('result')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('schedule', (t) => {
    t.dropColumn('result')
  })
};