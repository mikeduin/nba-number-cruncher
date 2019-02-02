exports.up = function(knex, Promise) {
  return knex.schema.createTable('schedule', t => {
    t.increments();
    t.integer('gid');
    t.string('gcode');
    t.string('gdte');
    t.string('an');
    t.string('ac');
    t.string('as');
    t.timestamp('etm');
    t.integer('gweek');
    t.specificType('h', 'jsonb[]');
    t.specificType('v', 'jsonb[]');
    t.string('stt');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('schedule');
};
