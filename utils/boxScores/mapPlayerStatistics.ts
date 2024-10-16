import { UsageStats } from '../../types';
import { NbaBoxScorePlayerTraditional, NbaBoxScoreStatsTraditional } from '../../models';
import { calcUsage, convertMinutesToDecimal, convertPlayingTime, getPlayerBoxScoreMinutes } from './';

const mapPlayerStatistics = (
  players: NbaBoxScorePlayerTraditional[],
  teamId: number,
  teamAbb: string, // teamTriCode
  teamStatistics: NbaBoxScoreStatsTraditional,
  gameCompleted: boolean = false,
) => players.map(player => {
  const { minutes: teamMin, fieldGoalsAttempted: teamFga, freeThrowsAttempted: teamFta, turnovers: teamTov } = teamStatistics;

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

  const playerMinutes = gameCompleted ? min : convertPlayingTime(min);
  const teamMinutes = gameCompleted ? teamMin : convertPlayingTime(teamMin);

  const decimalPlayerMinutes = convertMinutesToDecimal(playerMinutes);
  const decimalTeamMinutes = convertMinutesToDecimal(teamMinutes);

  const playerUsageStats: UsageStats = {fga, fta, tov, min: decimalPlayerMinutes};
  const teamUsageStats: UsageStats = {fga: teamFga, fta: teamFta, tov: teamTov, min: decimalTeamMinutes};

  return {
    player_id: player.personId,
    // player_name: !gameCompleted ? player.name : `${player.firstName} ${player.familyName}`, // what stats are different when the game is completed? I think this means plauer.name shows up when game is in progress?
    player_name: `${player.firstName} ${player.familyName}`, // what stats are different when the game is completed? I think this means plauer.name shows up when game is in progress?
    team_id: teamId,
    team_abbrev: teamAbb,
    ast,
    blk,
    fgm,
    fga,
    fouls,
    ftm,
    fta,
    min: !gameCompleted ? getPlayerBoxScoreMinutes(min) : min, // assume this means the PT notation also shows up while game in progress
    reb,
    pts,
    stl,
    fg3m,
    fg3a,
    tov,
    usg: decimalPlayerMinutes > 0 ? calcUsage(playerUsageStats, teamUsageStats) : 0,
  }
});

export default mapPlayerStatistics;