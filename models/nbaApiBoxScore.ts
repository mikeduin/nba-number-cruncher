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
  status?: string; // live -- "ACTIVE"
  order?: number; // live -- 1, 2, etc. (sequential)
  personId: number;
  jerseyNum: string;
  position: string; // "F"
  starter?: string; // live -- check if postgame
  oncourt?: string; // live -- "0"
  played?: string; // live -- "0"
  name?: string; // live -- "Brandon Miller" -- check if postgame
  nameI: string; // "B. Miller"
  firstName: string; // "Brandon"
  familyName: string; // "Miller"
  playerSlug?: string; // "brandon-miller" -- NOT in live
  comment?: string; // "" -- NOT in live
}

export interface NbaBoxScorePlayerTraditional extends NbaBoxScorePlayer {
  statistics: NbaBoxScoreStatsTraditional;
}

export interface NbaBoxScorePlayerAdvanced extends NbaBoxScorePlayer {
  statistics: NbaBoxScoreStatsAdvanced;
}

export interface NbaBoxScoreStatsTraditional {
  assists: number;
  blocks: number;
  blocksReceived?: number;
  fieldGoalsAttempted: number;
  fieldGoalsMade: number;
  fieldGoalsPercentage: number;
  foulsOffensive?: number;
  foulsDrawn?: number;
  foulsPersonal: number;
  foulsTechnical?: number;
  freeThrowsAttempted: number;
  freeThrowsMade: number;
  freeThrowsPercentage: number;
  minus?: number; // for plus minus, so points against
  minutes: string; // "9:26" (postgame I think?) // "PT27M05.97S" in-game
  minutesCalculated?: string; // "PT27M" in-game
  plus?: number; // for plus minus, so points for
  plusMinusPoints: number;
  points: number;
  pointsFastBreak?: number;
  pointsInThePaints?: number;
  pointsSecondChance?: number;
  reboundsDefensive: number;
  reboundsOffensive: number;
  reboundsTotal: number;
  steals: number;
  threePointersAttempted: number;
  threePointersMade: number;
  threePointersPercentage: number;
  turnovers: number;
  twoPointersAttempted?: number;
  twoPointersMade?: number;
  twoPointersPercentage?: number;
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