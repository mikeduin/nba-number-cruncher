const regex = /PT(\d+)M/;

module.exports = (players, teamId, teamAbb) => players.map(player => {
  const { 
    assists: ast,
    blocks: blk,
    fieldGoalsMade: fgm,
    fieldGoalsAttempted: fga,
    foulsPersonal: fouls,
    freeThrowsMade: ftm,
    freeThrowsAttempted: fta,
    minutes: min,
    points: pts,
    reboundsTotal: reb,
    steals: stl,
    threePointersMade: fg3m,
    threePointersAttempted: fg3a,
    turnovers: tov 
  } = player.statistics;

  return {
    player_id: player.personId,
    player_name: player.name,
    team_id: teamId,
    team_abbrev: teamAbb,
    ast,
    blk,
    fgm,
    fga,
    fouls,
    ftm,
    fta,
    min: parseInt(min.match(regex)[1]),
    pts,
    stl,
    fg3m,
    fg3a,
    tov
  }
});
