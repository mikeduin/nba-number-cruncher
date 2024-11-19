import { getCurrentSeasonStartYearInt } from "..";
// import { GAME_LOGS_HEADERS } from "../../constants";

const formKey = (label, period) => {
  switch (period) {
    case 0:
      return label;
    case 3:
      return label + "_3q";
    case 4:
      return label + "_4q";
    default:
      return label;
  }
}

export const formPlayerBaseStatsBuild = (headers, player, period, seasonType) => {
  let baseInsert = {
    team_id: player[headers.indexOf('TEAM_ID')],
    team_abbreviation: player[headers.indexOf('TEAM_ABBREVIATION')],
    [`${formKey('min', period)}`]: player[headers.indexOf('MIN')],
    [`${formKey('fgm', period)}`]: player[headers.indexOf('FGM')],
    [`${formKey('fga', period)}`]: player[headers.indexOf('FGA')],
    [`${formKey('fg3m', period)}`]: player[headers.indexOf('FG3M')],
    [`${formKey('fg3a', period)}`]: player[headers.indexOf('FG3A')],
    [`${formKey('ftm', period)}`]: player[headers.indexOf('FTM')],
    [`${formKey('fta', period)}`]: player[headers.indexOf('FTA')],
    [`${formKey('reb', period)}`]: player[headers.indexOf('REB')],
    [`${formKey('ast', period)}`]: player[headers.indexOf('AST')],
    [`${formKey('tov', period)}`]: player[headers.indexOf('TOV')],
    [`${formKey('stl', period)}`]: player[headers.indexOf('STL')],
    [`${formKey('blk', period)}`]: player[headers.indexOf('BLK')],
    [`${formKey('pts', period)}`]: player[headers.indexOf('PTS')],
    season: getCurrentSeasonStartYearInt(),
    updated_at: new Date()
  }

  if (period === 0) {
    baseInsert = {
      ...baseInsert,
      player_id: player[headers.indexOf('PLAYER_ID')],
      player_name: player[headers.indexOf('PLAYER_NAME')],
      gp: player[headers.indexOf('GP')],
      [`${formKey('oreb', period)}`]: player[headers.indexOf('OREB')],
      [`${formKey('dreb', period)}`]: player[headers.indexOf('DREB')],
      [`${formKey('pf', period)}`]: player[headers.indexOf('PF')],
    }

    if (seasonType === 'Regular Season') {
      baseInsert = {
        ...baseInsert,
        age: player[headers.indexOf('AGE')],
        w: player[headers.indexOf('W')],
        l: player[headers.indexOf('L')],
        w_pct: player[headers.indexOf('W_PCT')],
        fg3_pct: player[headers.indexOf('FG3_PCT')],
        ft_pct: player[headers.indexOf('FT_PCT')],
        blka: player[headers.indexOf('BLKA')],
        pfd: player[headers.indexOf('PFD')],
        plus_minus: player[headers.indexOf('PLUS_MINUS')],
        nba_fantasy_pts: player[headers.indexOf('NBA_FANTASY_PTS')],
        dd2: player[headers.indexOf('DD2')],
        td3: player[headers.indexOf('TD3')]
      }
    }
  }

  return baseInsert;
}