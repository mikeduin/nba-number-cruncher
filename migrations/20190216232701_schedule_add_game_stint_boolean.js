exports.up = function(knex, Promise) {
  return knex.schema.table("schedule", (t) => {
    t.boolean("game_stints");
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table("schedule", (t) => {
    t.dropColumn("game_stints");
  })
};
