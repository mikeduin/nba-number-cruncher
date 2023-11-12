exports.up = function(knex, Promise) {
    return knex.schema.alterTable('players_l5', (t) => {
        t.float('fg3m'),
        t.float('fg3a'),
        t.float('fg3_pct'),
        t.float('ftm'),
        t.float('fta'),
        t.float('ft_pct'),
        t.float('oreb'),
        t.float('dreb'),
        t.float('reb'),
        t.float('ast'),
        t.float('tov'),
        t.float('stl'),
        t.float('blk'),
        t.float('blka'),
        t.float('pf'),
        t.float('pfd'),
        t.float('pts'),
        t.float('plus_minus'),
        t.float('nba_fantasy_pts'),
        t.integer('dd2'),
        t.integer('td3')
    })  
  };
  
  exports.down = function(knex, Promise) {
    return knex.schema.alterTable('players_l5', (t) => {
        t.dropColumn('fg3m'),
        t.dropColumn('fg3a'),
        t.dropColumn('fg3_pct'),
        t.dropColumn('ftm'),
        t.dropColumn('fta'),
        t.dropColumn('ft_pct'),
        t.dropColumn('oreb'),
        t.dropColumn('dreb'),
        t.dropColumn('reb'),
        t.dropColumn('ast'),
        t.dropColumn('tov'),
        t.dropColumn('stl'),
        t.dropColumn('blk'),
        t.dropColumn('blka'),
        t.dropColumn('pf'),
        t.dropColumn('pfd'),
        t.dropColumn('pts'),
        t.dropColumn('plus_minus'),
        t.dropColumn('nba_fantasy_pts'),
        t.dropColumn('dd2'),
        t.dropColumn('td3')
    })
  };
  