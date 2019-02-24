exports.up = function(knex, Promise) {
  return knex.schema.table("box_scores_v2", (t) => {
    t.boolean('final');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table("box_scores_v2", (t) => {
    t.dropColumn('final');
  })
};
