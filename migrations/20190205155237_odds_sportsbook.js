exports.up = function(knex, Promise) {
  return knex.schema.createTable('odds_sportsbook', (t) => {
    t.increments();
    t.string('sb_id')
    t.string('gcode');
    t.string('gdte');
    t.string('home_team');
    t.integer('home_id');
    t.float('home_spread_full');
    t.integer('home_spread_full_juice');
    t.float('home_spread_1h');
    t.integer('home_spread_1h_juice');
    t.float('home_spread_2h');
    t.integer('home_spread_2h_juice');
    t.float('home_spread_1q');
    t.integer('home_spread_1q_juice');
    t.float('home_spread_2q');
    t.integer('home_spread_2q_juice');
    t.float('home_spread_3q');
    t.integer('home_spread_3q_juice');
    t.float('home_spread_4q');
    t.integer('home_spread_4q_juice');
    t.integer('home_money_full');
    t.integer('home_money_1h');
    t.integer('home_money_2h');
    t.integer('home_money_1q');
    t.integer('home_money_2q');
    t.integer('home_money_3q');
    t.integer('home_money_4q');
    t.string('away_team');
    t.integer('away_id');
    t.float('away_spread_full');
    t.integer('away_spread_full_juice');
    t.float('away_spread_1h');
    t.integer('away_spread_1h_juice');
    t.float('away_spread_2h');
    t.integer('away_spread_2h_juice');
    t.float('away_spread_1q');
    t.integer('away_spread_1q_juice');
    t.float('away_spread_2q');
    t.integer('away_spread_2q_juice');
    t.float('away_spread_3q');
    t.integer('away_spread_3q_juice');
    t.float('away_spread_4q');
    t.integer('away_spread_4q_juice');
    t.integer('away_money_full');
    t.integer('away_money_1h');
    t.integer('away_money_2h');
    t.integer('away_money_1q');
    t.integer('away_money_2q');
    t.integer('away_money_3q');
    t.integer('away_money_4q');
    t.float('total_full');
    t.integer('total_full_over_juice');
    t.integer('total_full_under_juice')
    t.float('total_1h');
    t.integer('total_1h_over_juice');
    t.integer('total_1h_under_juice')
    t.float('total_2h');
    t.integer('total_2h_over_juice');
    t.integer('total_2h_under_juice')
    t.float('total_1q');
    t.integer('total_1q_over_juice');
    t.integer('total_1q_under_juice')
    t.float('total_2q');
    t.integer('total_2q_over_juice');
    t.integer('total_2q_under_juice')
    t.float('total_3q');
    t.integer('total_3q_over_juice');
    t.integer('total_3q_under_juice')
    t.float('total_4q');
    t.integer('total_4q_over_juice');
    t.integer('total_4q_under_juice');
    t.string('last_updated');
    t.timestamp('updated_at');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('odds_sportsbook');
};
