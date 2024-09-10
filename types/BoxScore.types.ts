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
  gid: number;
  final: boolean;
  active?: boolean;
  q1: BoxScore | null;
  q2: BoxScore | null;
  q3: BoxScore | null;
  q4: BoxScore | null;
  ot: BoxScore | null;
  totals: BoxScore;
  init?: boolean;
  quarterEnd?: boolean;
  live?: boolean;
  clock?: string;
  gameSecs?: number;
  period?: number;
  thru_period?: number;
  poss?: number;
  pace?: number;
  currentQuarter?: BoxScore;
  prevQuarters?: BoxScore;
  playerStats?: any; // TODO: Update for player stats model
}

