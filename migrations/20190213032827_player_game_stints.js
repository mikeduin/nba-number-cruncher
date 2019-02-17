exports.up = function(knex, Promise) {
  return knex.schema.createTable('player_game_stints', (t) => {
    t.increments();
    t.integer('player_id');
    t.integer('team_id');
    t.integer('gid');
    t.string('gcode');
    t.string('gdte');
    t.specificType('game_stints', 'integer ARRAY');
    t.timestamp('updated_at');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('player_game_stints');
};
