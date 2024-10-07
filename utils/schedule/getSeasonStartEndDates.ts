import { SeasonNameFull } from '../../types';
import { SEASON_DATES } from '../../constants';

export const getSeasonStartEndDates = (seasonYear: number, seasonStage: SeasonNameFull) => {
  try {
    const seasonStages = SEASON_DATES.find(season => season.yearInt === seasonYear)?.seasons;
    const { start, end } = seasonStages[seasonStage];
    return [start, end];
  } catch {
    throw new Error(`Missing dates for ${seasonYear} in SEASON_DATES`);
  }
}