exports.up = function(knex, Promise) {
  return knex.schema.table("player_game_stints", (t) => {
    t.timestamp('game_timestamp');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table("player_game_stints", (t) => {
    t.dropColumn('game_timestamp');
  })
};
