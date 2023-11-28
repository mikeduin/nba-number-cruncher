exports.up = function(knex, Promise) {
  return knex.schema.alterTable('players_full', (t) => {
    t.float('fgm_3q'),
    t.float('fga_3q'),
    t.float('fgm_4q'),
    t.float('fga_4q'),
    t.float('ftm_3q'),
    t.float('fta_3q'),
    t.float('ftm_4q'),
    t.float('fta_4q')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('players_full', (t) => {
    t.dropColumn('fgm_3q'),
    t.dropColumn('fga_3q'),
    t.dropColumn('fgm_4q'),
    t.dropColumn('fga_4q'),
    t.dropColumn('ftm_3q'),
    t.dropColumn('fta_3q'),
    t.dropColumn('ftm_4q'),
    t.dropColumn('fta_4q')
  })
};

