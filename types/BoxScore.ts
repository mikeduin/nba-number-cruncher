export interface BoxScoreTeam {
  pts: number;
  fgm: number;
  fga: number;
  fgPct: string;
  fta: number;
  to: number;
  offReb: number;
  fouls: number;
}

export interface BoxScoreTotal extends BoxScoreTeam {
  poss: number;
  pace: number;
}

export interface BoxScore {
  v: BoxScoreTeam;
  h: BoxScoreTeam;
  t: BoxScoreTotal;
}

export interface BoxScoreResponse {
  active?: boolean;
  clock?: string;
  currentQuarter?: BoxScore;
  final: boolean;
  gameSecs?: number;
  gid: number;
  init?: boolean;
  live?: boolean;
  period?: number;
  pace?: number;
  poss?: number;
  playerStats?: any; // TODO: Update for player stats model
  prevQuarters?: BoxScore;
  q1: BoxScore | null;
  q2: BoxScore | null;
  q3: BoxScore | null;
  q4: BoxScore | null;
  ot: BoxScore | null;
  quarterEnd?: boolean;
  thru_period?: number;
  totals: BoxScore;
}

export interface UsageStats {
  fga: number;
  fta: number;
  tov: number; // turnovers
  min: number;
}
