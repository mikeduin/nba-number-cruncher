export enum SeasonNameFull {
  SummerLeague = 'SummerLeague',
  Preseason = 'Preseason',
  RegularSeason = 'RegularSeason',
  Postseason = 'Postseason'
}

export enum SeasonNameAbb {
  SummerLeague = 'summer',
  Preseason = 'pre',
  RegularSeason = 'regular',
  Postseason = 'post'
}

export interface SeasonDates {
  start: string;
  end: string;
  systemStart: string;
  systemEnd: string;
  dashedDateWeeks: string[][];
  intDateWeeks: number[][];
}

export interface YearlySeasonDates {
  yearInt: number;
  yearDisplay: string;
  systemStart: string;
  systemEnd: string;
  seasons: { [key in SeasonNameFull]: SeasonDates };
}