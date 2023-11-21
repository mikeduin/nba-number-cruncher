exports.up = function(knex, Promise) {
  return knex.schema.table("box_scores_v2", (t) => {
    t.text('player_stats');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table("box_scores_v2", (t) => {
    t.dropColumn('player_stats');
  })
};
