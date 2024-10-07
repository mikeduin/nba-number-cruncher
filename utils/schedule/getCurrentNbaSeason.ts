import moment from 'moment-timezone';
import { convertIntDateToDashedDate } from '../dates';
import { SEASON_DATES } from '../../constants';
import { SeasonNameFull } from '../../types';

export const getCurrentSeasonDisplayYear = (): string => {
  if (moment().isBefore('2024-09-01')) {
    return '2023-24';
  } else if (moment().isBefore(`2025-09-01`)) {
    return '2024-25';
  } else if (moment().isBefore(`2026-10-01`)) {
    return '2025-26';
  } else if (moment().isBefore(`2027-10-01`)) {
    return '2026-27';
  } else if (moment().isBefore(`2028-10-01`)) {
    return '2027-28';
  } else {
    throw new Error('configure getCurrentSeasonDisplayYear for current dates');
  }
}

export const getCurrentSeasonStartYearInt = () => parseInt(getCurrentSeasonDisplayYear().slice(0, 4));

export const getCurrentSeasonStage = (dashedDate: string): string | undefined => {
  const seasonYear = getCurrentSeasonStartYearInt();
  const seasonStages = SEASON_DATES.find(season => season.yearInt === seasonYear)?.seasons;
  if (!seasonStages) {
    return undefined;
  }

  const inputDate = moment(dashedDate);

  for (const [key, stage] of Object.entries(seasonStages)) {
    const systemStartDate = moment(stage.systemStart);
    const systemEndDate = moment(stage.systemEnd);

    if (inputDate.isBetween(systemStartDate, systemEndDate, undefined, '[]')) {
      return key; // key is the SeasonNameFull
    }
  }

  return undefined;
}