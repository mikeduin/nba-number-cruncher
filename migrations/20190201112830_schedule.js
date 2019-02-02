exports.up = function(knex, Promise) {
  return knex.schema.createTable('schedule', t => {
    t.increments();
    t.integer('gid');
    t.string('gcode');
    t.
  });
};

exports.down = function(knex, Promise) {};
