exports.up = function(knex, Promise) {
  return knex.schema.createTable('players_sub_patterns', (t) => {
    t.increments();
    t.integer('player_id');
    t.string('player_name');
    t.integer('team_id');
    t.string('team_abbreviation');
    t.integer('gid');
    t.string('gcode');
    t.string('gdte');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('players_sub_patterns');
};
