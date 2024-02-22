exports.up = function(knex, Promise) {
  return knex.schema.createTable('player_boxscores_by_q', t => {
    t.increments();
    t.integer('player_id');
    t.string('player_name');
    t.string('team');
    t.integer('gid');
    t.integer('period');
    t.string('min');
    t.integer('pts');
    t.integer('reb');
    t.integer('ast');
    t.integer('stl');
    t.integer('blk');
    t.integer('tov');
    t.integer('fg3m');
    t.integer('fg3a');
    t.integer('fgm');
    t.integer('fga');
    t.integer('ftm');
    t.integer('fta');
    t.integer('fouls');
    t.timestamp('created_at');
    t.timestamp('updated_at');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('player_boxscores_by_q');
};
