import { getCurrentSeasonStartYearInt } from "../schedule";

export const formPlayerAdvancedStatsBuild = (headers, player) => ({
    team_id: player[headers.indexOf('TEAM_ID')],
    team_abbreviation: player[headers.indexOf('TEAM_ABBREVIATION')],
    age: player[headers.indexOf('AGE')],
    gp: player[headers.indexOf('GP')],
    w: player[headers.indexOf('W')],
    l: player[headers.indexOf('L')],
    w_pct: player[headers.indexOf('W_PCT')],
    min: player[headers.indexOf('MIN')],
    eoff_rating: player[headers.indexOf('E_OFF_RATING')],
    off_rating: player[headers.indexOf('OFF_RATING')],
    sp_work_off_rating: player[headers.indexOf('sp_work_OFF_RATING')],
    edef_rating: player[headers.indexOf('E_DEF_RATING')],
    def_rating: player[headers.indexOf('DEF_RATING')],
    sp_work_def_rating: player[headers.indexOf('sp_work_DEF_RATING')],
    enet_rating: player[headers.indexOf('E_NET_RATING')],
    net_rating: player[headers.indexOf('NET_RATING')],
    sp_work_net_rating: player[headers.indexOf('sp_work_NET_RATING')],
    ast_pct: player[headers.indexOf('AST_PCT')],
    ast_to: player[headers.indexOf('AST_TO')],
    ast_ratio: player[headers.indexOf('AST_RATIO')],
    oreb_pct: player[headers.indexOf('OREB_PCT')],
    dreb_pct: player[headers.indexOf('DREB_PCT')],
    reb_pct: player[headers.indexOf('REB_PCT')],
    tm_tov_pct: player[headers.indexOf('TM_TOV_PCT')],
    e_tov_pct: player[headers.indexOf('E_TOV_PCT')],
    efg_pct: player[headers.indexOf('EFG_PCT')],
    ts_pct: player[headers.indexOf('TS_PCT')],
    usg_pct: player[headers.indexOf('USG_PCT')],
    e_usg_pct: player[headers.indexOf('E_USG_PCT')],
    epace: player[headers.indexOf('E_PACE')],
    pace: player[headers.indexOf('PACE')],
    pace_per40: player[headers.indexOf('PACE_PER40')],
    sp_work_pace: player[headers.indexOf('sp_work_PACE')],
    pie: player[headers.indexOf('PIE')],
    poss: player[headers.indexOf('POSS')],
    fg_pct: player[headers.indexOf('FG_PCT')],
    gp_rank: player[headers.indexOf('GP_RANK')],
    w_rank: player[headers.indexOf('W_RANK')],
    l_rank: player[headers.indexOf('L_RANK')],
    w_pct_rank: player[headers.indexOf('W_PCT_RANK')],
    min_rank: player[headers.indexOf('MIN_RANK')],
    eoff_rating_rank: player[headers.indexOf('E_OFF_RATING_RANK')],
    off_rating_rank: player[headers.indexOf('OFF_RATING_RANK')],
    sp_work_off_rating_rank: player[headers.indexOf('sp_work_OFF_RATING_RANK')],
    edef_rating_rank: player[headers.indexOf('E_DEF_RATING_RANK')],
    def_rating_rank: player[headers.indexOf('DEF_RATING_RANK')],
    sp_work_def_rating_rank: player[headers.indexOf('sp_work_DEF_RATING_RANK')],
    enet_rating_rank: player[headers.indexOf('E_NET_RATING_RANK')],
    net_rating_rank: player[headers.indexOf('NET_RATING_RANK')],
    sp_work_net_rating_rank: player[headers.indexOf('sp_work_NET_RATING_RANK')],
    ast_pct_rank: player[headers.indexOf('AST_PCT_RANK')],
    ast_to_rank: player[headers.indexOf('AST_TO_RANK')],
    ast_ratio_rank: player[headers.indexOf('AST_RATIO_RANK')],
    oreb_pct_rank: player[headers.indexOf('OREB_PCT_RANK')],
    dreb_pct_rank: player[headers.indexOf('DREB_PCT_RANK')],
    reb_pct_rank: player[headers.indexOf('REB_PCT_RANK')],
    tov_pct_rank: player[headers.indexOf('TOV_PCT_RANK')],
    e_tov_pct_rank: player[headers.indexOf('E_TOV_PCT_RANK')],
    efg_pct_rank: player[headers.indexOf('EFG_PCT_RANK')],
    ts_pct_rank: player[headers.indexOf('TS_PCT_RANK')],
    usg_pct_rank: player[headers.indexOf('USG_PCT_RANK')],
    e_usg_pct_rank: player[headers.indexOf('E_USG_PCT_RANK')],
    epace_rank: player[headers.indexOf('E_PACE_RANK')],
    pace_rank: player[headers.indexOf('PACE_RANK')],
    sp_work_pace_rank: player[headers.indexOf('sp_work_PACE_RANK')],
    pie_rank: player[headers.indexOf('PIE_RANK')],
    fgm_rank: player[headers.indexOf('FGM_RANK')],
    fga_rank: player[headers.indexOf('FGA_RANK')],
    fgm_pg_rank: player[headers.indexOf('FGM_PG_RANK')],
    fga_pg_rank: player[headers.indexOf('FGA_PG_RANK')],
    fg_pct_rank: player[headers.indexOf('FG_PCT_RANK')],
    season: getCurrentSeasonStartYearInt(),
    updated_at: new Date()
});
