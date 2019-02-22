exports.up = function(knex, Promise) {
  return knex.schema.createTable('players_on_off', (t) => {
    t.increments();
    t.string('player_name');
    t.integer('player_id');
    t.string('team_abb');
    t.integer('team_id');
    t.integer('mp_on');
    t.integer('mp_off');
    t.float('mp_pct');
    t.float('team_efgpct_on');
    t.float('team_efgpct_off');
    t.float('team_efgpct_delta');
    t.float('team_pace_on');
    t.float('team_pace_off');
    t.float('team_pace_delta');
    t.float('team_offRtg_on');
    t.float('team_offRtg_off');
    t.float('team_offRtg_delta');
    t.float('opp_efgpct_on');
    t.float('opp_efgpct_off');
    t.float('opp_efgpct_delta');
    t.float('opp_pace_on');
    t.float('opp_pace_off');
    t.float('opp_pace_delta');
    t.float('opp_offRtg_on');
    t.float('opp_offRtg_off');
    t.float('opp_offRtg_delta');
    t.float('diff_efgpct_on');
    t.float('diff_efgpct_off');
    t.float('diff_efgpct_delta');
    t.float('diff_pace_on');
    t.float('diff_pace_off');
    t.float('diff_pace_delta');
    t.float('netRtg_on');
    t.float('netRtg_off');
    t.float('netRtg_delta');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('players_on_off');
};
