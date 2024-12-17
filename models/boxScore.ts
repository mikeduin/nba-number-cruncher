import { BoxScore } from "../types/BoxScore";

export interface BoxScoreModel {
  id: string;
  gid: number;
  h_tid: number;
  v_tid: number;
  period_updated: number;
  clock_last_updated: number;
  totals: BoxScore;
  q1: BoxScore | null;
  q2: BoxScore | null;
  q3: BoxScore | null;
  q4: BoxScore | null;
  ot: BoxScore | null;
  updated_at: string;
  final: boolean;
  player_stats: string;
}

export interface CompletedBoxScoreModel extends BoxScoreModel {
  inactives: any
}

export interface UpdateBoxScore {
  period_updated?: number;
  clock_last_updated?: number;
  totals?: BoxScore[];
  q1?: BoxScore[] | null;
  q2?: BoxScore[] | null;
  q3?: BoxScore[] | null;
  q4?: BoxScore[] | null;
  ot?: BoxScore[] | null;
  updated_at?: string;
  final?: boolean;
  player_stats?: string;
}