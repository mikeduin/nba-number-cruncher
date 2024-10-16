export interface NbaApiBoxScore {
  gameId: string;
  awayTeamId: number;
  homeTeamId: number;
  homeTeam: NbaBoxScoreTeam;
  awayTeam: NbaBoxScoreTeam;
}

export interface NbaBoxScoreTeam {
  teamId: number;
  teamCity: string; // "Los Angeles"
  teamName: string; // "Lakers"
  teamTriCode: string; // "LAL"
  teamSlug: string; // "lakers"
}

export interface NbaBoxScoreTeamTraditional extends NbaBoxScoreTeam {
  players: NbaBoxScorePlayerTraditional[];
  statistics: NbaBoxScoreStatsTraditional;
}

export interface NbaBoxScoreTeamAdvanced extends NbaBoxScoreTeam {
  players: NbaBoxScorePlayerAdvanced[];
  statistics: NbaBoxScoreStatsAdvanced;
}

export interface NbaBoxScorePlayer {
  personId: number;
  firstName: string; // "Brandon"
  familyName: string; // "Miller"
  nameI: string; // "B. Miller"
  playerSlug: string; // "brandon-miller"
  position: string; // "F"
  comment: string; // ""
  jerseyNum: string; // ""
}

export interface NbaBoxScorePlayerTraditional extends NbaBoxScorePlayer {
  statistics: NbaBoxScoreStatsTraditional;
}

export interface NbaBoxScorePlayerAdvanced extends NbaBoxScorePlayer {
  statistics: NbaBoxScoreStatsAdvanced;
}

export interface NbaBoxScoreStatsTraditional {
  minutes: string; // "9:26" (... but where does the 'PT' come from sometimes?)
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  fieldGoalsPercentage: number;
  threePointersMade: number;
  threePointersAttempted: number;
  threePointersPercentage: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  freeThrowsPercentage: number;
  reboundsOffensive: number;
  reboundsDefensive: number;
  reboundsTotal: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  foulsPersonal: number;
  points: number;
  plusMinusPoints: number;
}

export interface NbaBoxScoreStatsAdvanced {
  minutes: string; // "9:26" (... but where does the 'PT' come from sometimes?)
  estimatedOffensiveRating: number;
  offensiveRating: number;
  estimatedDefensiveRating: number;
  defensiveRating: number;
  estimatedNetRating: number;
  netRating: number;
  assistPercentage: number;
  assistToTurnover: number;
  assistRatio: number;
  offensiveReboundPercentage: number;
  defensiveReboundPercentage: number;
  reboundPercentage: number;
  turnoverRatio: number;
  effectiveFieldGoalPercentage: number;
  trueShootingPercentage: number;
  usagePercentage: number;
  estimatedUsagePercentage: number;
  estimatedPace: number;
  pace: number;
  pacePer40: number;
  possessions: number;
  PIE: number;

}