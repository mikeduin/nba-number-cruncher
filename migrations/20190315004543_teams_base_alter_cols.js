exports.up = function(knex, Promise) {
  return knex.schema.table('teams_full_base', (t) => {
    t.float('fg2m');
    t.float('fg2a');
    t.float('fg2_pct');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('teams_full_base', (t) => {
    t.dropColumn('fg2m');
    t.dropColumn('fg2a');
    t.dropColumn('fg2_pct');
  })
};
