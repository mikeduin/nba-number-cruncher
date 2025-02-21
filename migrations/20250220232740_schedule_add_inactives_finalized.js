exports.up = function(knex, Promise) {
  return knex.schema.alterTable('schedule', (t) => {
    t.boolean('inactives_final').defaultTo(false)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('schedule', (t) => {
    t.dropColumn('inactives_final')
  })
};