exports.up = function(knex, Promise) {
    return knex.schema.alterTable('players_full', (t) => {
      t.float('min_3q'),
      t.float('fg3m_3q'),
      t.float('reb_3q'),
      t.float('ast_3q'),
      t.float('tov_3q'),
      t.float('stl_3q'),
      t.float('blk_3q'),
      t.float('pts_3q'),
      t.float('min_4q'),
      t.float('fg3m_4q'),
      t.float('reb_4q'),
      t.float('ast_4q'),
      t.float('tov_4q'),
      t.float('stl_4q'),
      t.float('blk_4q'),
      t.float('pts_4q')
    })  
  };
  
  exports.down = function(knex, Promise) {
    return knex.schema.alterTable('players_full', (t) => {
      t.dropColumn('min_3q'),
      t.dropColumn('fg3m_3q'),
      t.dropColumn('reb_3q'),
      t.dropColumn('ast_3q'),
      t.dropColumn('tov_3q'),
      t.dropColumn('stl_3q'),
      t.dropColumn('blk_3q'),
      t.dropColumn('pts_3q'),
      t.dropColumn('min_4q'),
      t.dropColumn('fg3m_4q'),
      t.dropColumn('reb_4q'),
      t.dropColumn('ast_4q'),
      t.dropColumn('tov_4q'),
      t.dropColumn('stl_4q'),
      t.dropColumn('blk_4q'),
      t.dropColumn('pts_4q')
    })
  };
  