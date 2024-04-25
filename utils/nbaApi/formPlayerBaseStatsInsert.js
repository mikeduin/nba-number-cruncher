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


exports.formPlayerBaseStatsInsert = (headers, player, period) => {
  let baseInsert = {
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
    updated_at: new Date()
  }

  if (period === 0) {
    baseInsert = {
      ...baseInsert,
      player_id: player[headers.indexOf('PLAYER_ID')],
      player_name: player[headers.indexOf('PLAYER_NAME')],
      team_id: player[headers.indexOf('TEAM_ID')],
      team_abbreviation: player[headers.indexOf('TEAM_ABBREVIATION')],
      gp: player[headers.indexOf('GP')],
      [`${formKey('oreb', period)}`]: player[headers.indexOf('OREB')],
      [`${formKey('dreb', period)}`]: player[headers.indexOf('DREB')],
      [`${formKey('pf', period)}`]: player[headers.indexOf('PF')],
    }
  }

  return baseInsert;
}