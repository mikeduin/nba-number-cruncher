exports.up = function(knex, Promise) {
  return knex.schema.createTable('players_playoffs', (t) => {
    t.increments();
    t.integer('player_id');
    t.string('player_name');
    t.integer('team_id');
    t.string('team_abbreviation');
    t.integer('gp');
    t.float('min');
    t.float('fgm');
    t.float('fga');
    t.float('fg3m'),
    t.float('fg3a'),
    t.float('ftm'),
    t.float('fta'),
    t.float('oreb'),
    t.float('dreb'),
    t.float('reb'),
    t.float('ast'),
    t.float('tov'),
    t.float('stl'),
    t.float('blk'),
    t.float('pf'),
    t.float('pts'),
    t.float('min_3q'),
    t.float('fgm_3q');
    t.float('fga_3q');
    t.float('fg3m_3q'),
    t.float('fg3a_3q'),
    t.float('ftm_3q');
    t.float('fta_3q');
    t.float('reb_3q'),
    t.float('ast_3q'),
    t.float('tov_3q'),
    t.float('stl_3q'),
    t.float('blk_3q'),
    t.float('pts_3q'),
    t.float('min_4q'),
    t.float('fgm_4q');
    t.float('fga_4q');
    t.float('fg3m_4q'),
    t.float('fg3a_4q'),
    t.float('ftm_4q');
    t.float('fta_4q');
    t.float('reb_4q'),
    t.float('ast_4q'),
    t.float('tov_4q'),
    t.float('stl_4q'),
    t.float('blk_4q'),
    t.float('pts_4q'),
    t.timestamp('created_at'),
    t.timestamp('updated_at')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('players_playoffs');
};
