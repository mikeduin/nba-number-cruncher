const regex = /PT(\d+)M/;

module.exports = (players, teamId, teamAbb, gameCompleted = false) => players.map(player => {
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

  const formMins = (min) => {
    if (min.slice(0, 2) === 'PT') {
      return parseInt(min.match(regex)[1]);
    } else {
      return parseInt(min.split(':')[0]);
    }
  }

  return {
    player_id: player.personId,
    player_name: !gameCompleted ? player.name : `${player.firstName} ${player.familyName}`,
    team_id: teamId,
    team_abbrev: teamAbb,
    ast,
    blk,
    fgm,
    fga,
    fouls,
    ftm,
    fta,
    min: !gameCompleted ? formMins(min) : min,
    reb,
    pts,
    stl,
    fg3m,
    fg3a,
    tov
  }
});
