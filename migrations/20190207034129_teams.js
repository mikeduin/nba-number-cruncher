exports.up = function(knex, Promise) {
  return knex.schema.createTable('teams', (t) => {
    t.increments();
    t.integer('tid');
    t.string('city');
    t.string('name');
    t.string('abb');
    t.string('color');
    t.string('color_2');
    t.string('logo');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('teams');
};
