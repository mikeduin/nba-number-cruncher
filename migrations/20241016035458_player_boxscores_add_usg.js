
exports.up = function(knex) {
  return knex.schema.alterTable('player_boxscores_by_q', (t) => {
    t.float('usg');
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('player_boxscores_by_q', (t) => {
    t.dropColumn('usg');
  })
};
