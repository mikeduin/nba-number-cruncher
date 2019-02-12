exports.up = function(knex, Promise) {
  return knex.schema.createTable('players_full', (t) => {
    t.increments();
    t.integer('PLAYER_ID');
    t.string('PLAYER_NAME');
    t.integer("TEAM_ID");
    t.string("TEAM_ABBREVIATION");
    t.integer("AGE");
    t.integer("GP");
    t.integer("W");
    t.integer("L");
    t.float("W_PCT")
    t.float("MIN");
    t.float("eOFF_RATING");
    t.float("OFF_RATING");
    t.float("sp_work_OFF_RATING");
    t.float("eDEF_RATING");
    t.float("DEF_RATING");
    t.float("sp_work_DEF_RATING");
    t.float("eNET_RATING");
    t.float("NET_RATING");
    t.float("sp_work_NET_RATING");
    t.float("AST_PCT");
    t.float("AST_TO");
    t.float("AST_RATIO");
    t.float("OREB_PCT");
    t.float("DREB_PCT");
    t.float("REB_PCT");
    t.float("TM_TOV_PCT");
    t.float("EFG_PCT");
    t.float("TS_PCT");
    t.float("USG_PCT");
    t.float("ePACE");
    t.float("PACE");
    t.float("sp_work_PACE");
    t.float("PIE");
    t.integer("FGM");
    t.integer("FGA");
    t.float("FGM_PG");
    t.float("FGA_PG");
    t.float("FG_PCT");
    t.integer("GP_RANK");
    t.integer("W_RANK");
    t.integer("L_RANK");
    t.integer("W_PCT_RANK");
    t.integer("MIN_RANK");
    t.integer("eOFF_RATING_RANK");
    t.integer("OFF_RATING_RANK");
    t.integer("sp_work_OFF_RATING_RANK");
    t.integer("eDEF_RATING_RANK");
    t.integer("DEF_RATING_RANK");
    t.integer("sp_work_DEF_RATING_RANK");
    t.integer("eNET_RATING_RANK");
    t.integer("NET_RATING_RANK");
    t.integer("sp_work_NET_RATING_RANK");
    t.integer("AST_PCT_RANK");
    t.integer("AST_TO_RANK");
    t.integer("AST_RATIO_RANK");
    t.integer("OREB_PCT_RANK");
    t.integer("DREB_PCT_RANK");
    t.integer("REB_PCT_RANK");
    t.integer("TM_TOV_PCT_RANK");
    t.integer("EFG_PCT_RANK");
    t.integer("TS_PCT_RANK");
    t.integer("USG_PCT_RANK");
    t.integer("ePACE_RANK");
    t.integer("PACE_RANK");
    t.integer("sp_work_PACE_RANK");
    t.integer("PIE_RANK");
    t.integer("FGM_RANK");
    t.integer("FGA_RANK");
    t.integer("FGM_PG_RANK");
    t.integer("FGA_PG_RANK");
    t.integer("FG_PCT_RANK");
    t.integer("CFID");
    t.string("CFPARAMS");
    t.timestamp("updated_at");
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('players_full');
};
