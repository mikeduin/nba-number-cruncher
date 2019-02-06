exports.up = function(knex, Promise) {
  return knex.schema.createTable('odds_sportsbook', (t) => {
    t.increments();
    t.sb_id('string');
    
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('odds_sportsbook');
};
