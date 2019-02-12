exports.up = function(knex, Promise) {
  return knex.schema.createTable('players_l15', (t) => {
    t.increments();
    t.integer("player_id");
    t.string("player_name");
    t.integer("team_id");
    t.string("team_abbreviation");
    t.integer("age");
    t.integer("gp");
    t.integer("w");
    t.integer("l");
    t.float("w_pct")
    t.float("min");
    t.float("eoff_rating");
    t.float("off_rating");
    t.float("sp_work_off_rating");
    t.float("edef_rating");
    t.float("def_rating");
    t.float("sp_work_def_rating");
    t.float("enet_rating");
    t.float("net_rating");
    t.float("sp_work_net_rating");
    t.float("ast_pct");
    t.float("ast_to");
    t.float("ast_ratio");
    t.float("oreb_pct");
    t.float("dreb_pct");
    t.float("reb_pct");
    t.float("tm_tov_pct");
    t.float("efg_pct");
    t.float("ts_pct");
    t.float("usg_pct");
    t.float("epace");
    t.float("pace");
    t.float("sp_work_pace");
    t.float("pie");
    t.integer("fgm");
    t.integer("fga");
    t.float("fgm_pg");
    t.float("fga_pg");
    t.float("fg_pct");
    t.integer("gp_rank");
    t.integer("w_rank");
    t.integer("l_rank");
    t.integer("w_pct_rank");
    t.integer("min_rank");
    t.integer("eoff_rating_rank");
    t.integer("off_rating_rank");
    t.integer("sp_work_off_rating_rank");
    t.integer("edef_rating_rank");
    t.integer("def_rating_rank");
    t.integer("sp_work_def_rating_rank");
    t.integer("enet_rating_rank");
    t.integer("net_rating_rank");
    t.integer("sp_work_net_rating_rank");
    t.integer("ast_pct_rank");
    t.integer("ast_to_rank");
    t.integer("ast_ratio_rank");
    t.integer("oreb_pct_rank");
    t.integer("dreb_pct_rank");
    t.integer("reb_pct_rank");
    t.integer("tm_tov_pct_rank");
    t.integer("efg_pct_rank");
    t.integer("ts_pct_rank");
    t.integer("usg_pct_rank");
    t.integer("epace_rank");
    t.integer("pace_rank");
    t.integer("sp_work_pace_rank");
    t.integer("pie_rank");
    t.integer("fgm_rank");
    t.integer("fga_rank");
    t.integer("fgm_pg_rank");
    t.integer("fga_pg_rank");
    t.integer("fg_pct_rank");
    t.integer("cfid");
    t.string("cfparams");
    t.timestamp("updated_at");
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('players_l15');
};
