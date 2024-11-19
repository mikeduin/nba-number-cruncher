export const formPlayerBaseGameLogsBuild = (game: any[], headers: string[]) => { // game is in the form of rowSet item
  return {
    player_id: game[headers.indexOf('PLAYER_ID')],
    player_name: game[headers.indexOf('PLAYER_NAME')],
    gdte: game[headers.indexOf('GAME_DATE')],
    gid: game[headers.indexOf('GAME_ID')],
    min: game[headers.indexOf('MIN')],
    fgm: game[headers.indexOf('FGM')],
    fga: game[headers.indexOf('FGA')],
    fg3m: game[headers.indexOf('FG3M')],
    fg3a: game[headers.indexOf('FG3A')],
    ftm: game[headers.indexOf('FTM')],
    fta: game[headers.indexOf('FTA')],
    reb: game[headers.indexOf('REB')],
    ast: game[headers.indexOf('AST')],
    tov: game[headers.indexOf('TOV')],
    stl: game[headers.indexOf('STL')],
    blk: game[headers.indexOf('BLK')],
    pts: game[headers.indexOf('PTS')],
    pf: game[headers.indexOf('PF')],
  }
}