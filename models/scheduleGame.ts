
export interface PlayerGameStats {
  player_id: number;
  player_name: string;
  team_id: string;
  team_abbrev: string;
  ast: number;
  blk: number;
  fgm: number;
  fga: number;
  fouls: number;
  ftm: number;
  fta: number;
  min: number;
  reb: number;
  oncourt: string;
  starter: string;
  pts: number;
  stl: number;
  fg3m: number;
  fg3a: number;
  tov: number;
  usg: number;
} // can't use this because playerStats is stringified in ScheduleGame ... 


export interface ScheduleGame {
  id: number;
  gid: number;
  gcode?: string;
  gdte?: string;
  an?: string;
  ac?: string;
  as?: string;
  etm?: string;
  gweek?: number;
  // h?: Team[];
  // v?: Team[];
  // ...
  playerStats:
}