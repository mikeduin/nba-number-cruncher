exports.up = function(knex, Promise) {
  return knex.schema.table('schedule', (t) => {
    t.integer('season_year');
    t.string('season_name');
    t.string('display_year');
    t.integer('season_stage');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('schedule', (t) => {
    t.dropColumn('season_year');
    t.dropColumn('season_name');
    t.dropColumn('display_year');
    t.dropColumn('season_stage');
  })
};
