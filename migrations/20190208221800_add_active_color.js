exports.up = function(knex, Promise) {
  return knex.schema.table('teams', t => {
    t.string('color_active');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('teams', t => {
    t.dropColumn('color_active');
  })
};
