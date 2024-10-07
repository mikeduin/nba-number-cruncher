import moment from 'moment-timezone';
import { SeasonNameFull, SeasonNameAbb } from '../../types';

// TODO: Update to conditionally return summer league

export const getSeasonNameAbb = (gameDate: string, regularSeasonDates): SeasonNameAbb => {
  switch (true) {
    case moment(gameDate).isBefore(moment(regularSeasonDates.start)):
      return SeasonNameAbb.Preseason;
    case moment(gameDate).isAfter(moment(regularSeasonDates.end)):
      return SeasonNameAbb.Postseason;
    default:
      return SeasonNameAbb.RegularSeason;
  }
}

export const getSeasonNameFull = (gameDate: string, regularSeasonDates): SeasonNameFull => {
  switch (true) {
    case moment(gameDate).isBefore(moment(regularSeasonDates.start)):
      return SeasonNameFull.Preseason;
    case moment(gameDate).isAfter(moment(regularSeasonDates.end)):
      return SeasonNameFull.Postseason;
    default:
      return SeasonNameFull.RegularSeason;
  }
}