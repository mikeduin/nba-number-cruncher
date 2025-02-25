export const formTeamBaseStatsBuild = (headers, team) => {
  const fg2m = parseFloat(team[headers.indexOf('FGM')]) - parseFloat(team[headers.indexOf('FG3M')]);
  const fg2a = parseFloat(team[headers.indexOf('FGA')]) - parseFloat(team[headers.indexOf('FG3A')]);
  const fg2_pct = fg2m/fg2a;

  return {
    min: team[headers.indexOf('MIN')],
    fgm: team[headers.indexOf('FGM')],
    fga: team[headers.indexOf('FGA')],
    fg_pct: team[headers.indexOf('FG_PCT')],
    fg2m: fg2m,
    fg2a: fg2a,
    fg2_pct: fg2_pct,
    fg3m: team[headers.indexOf('FG3M')],
    fg3a: team[headers.indexOf('FG3A')],
    fg3_pct: team[headers.indexOf('FG3_PCT')],
    ftm: team[headers.indexOf('FTM')],
    fta: team[headers.indexOf('FTA')],
    ft_pct: team[headers.indexOf('FT_PCT')],
    oreb: team[headers.indexOf('OREB')],
    dreb: team[headers.indexOf('DREB')],
    reb: team[headers.indexOf('REB')],
    ast: team[headers.indexOf('AST')],
    tov: team[headers.indexOf('TOV')],
    stl: team[headers.indexOf('STL')],
    blk: team[headers.indexOf('BLK')],
    blka: team[headers.indexOf('BLKA')],
    pf: team[headers.indexOf('PF')],
    pfd: team[headers.indexOf('PFD')],
    pts: team[headers.indexOf('PTS')],
    plus_minus: team[headers.indexOf('PLUS_MINUS')],
    gp_rank: team[headers.indexOf('GP_RANK')],
    w_rank: team[headers.indexOf('W_RANK')],
    l_rank: team[headers.indexOf('L_RANK')],
    w_pct_rank: team[headers.indexOf('W_PCT_RANK')],
    min_rank: team[headers.indexOf('MIN_RANK')],
    fgm_rank: team[headers.indexOf('FGM_RANK')],
    fga_rank: team[headers.indexOf('FGA_RANK')],
    fg_pct_rank: team[headers.indexOf('FG_PCT_RANK')],
    fg3m_rank: team[headers.indexOf('FG3M_RANK')],
    fg3a_rank: team[headers.indexOf('FG3A_RANK')],
    fg3_pct_rank: team[headers.indexOf('FG3_PCT_RANK')],
    ftm_rank: team[headers.indexOf('FTM_RANK')],
    fta_rank: team[headers.indexOf('FTA_RANK')],
    ft_pct_rank: team[headers.indexOf('FT_PCT_RANK')],
    oreb_rank: team[headers.indexOf('OREB_RANK')],
    dreb_rank: team[headers.indexOf('DREB_RANK')],
    reb_rank: team[headers.indexOf('REB_RANK')],
    ast_rank: team[headers.indexOf('AST_RANK')],
    tov_rank: team[headers.indexOf('TOV_RANK')],
    stl_rank: team[headers.indexOf('STL_RANK')],
    blk_rank: team[headers.indexOf('BLK_RANK')],
    blka_rank: team[headers.indexOf('BLKA_RANK')],
    pf_rank: team[headers.indexOf('PF_RANK')],
    pfd_rank: team[headers.indexOf('PFD_RANK')],
    pts_rank: team[headers.indexOf('PTS_RANK')],
    plus_minus_rank: team[headers.indexOf('PLUS_MINUS_RANK')],
    updated_at: new Date()
  }
}