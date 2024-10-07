import { SEASON_DATES } from "../../constants";
import { 
  getCurrentSeasonStartYearInt,
  getCurrentSeasonStage,
} from "./";

/**
 * Returns the game week number for a given dashed date.
 * @param dashedDate - The dashed date string (e.g., "2022-01-15").
 * @returns The game week number.
 */
export const getGameWeek = (dashedDate: string): number => {
  let wk = 0;
  const currentSeasonInt = getCurrentSeasonStartYearInt();
  const currentSeasonStage = getCurrentSeasonStage(dashedDate);
  const seasonStages = SEASON_DATES.find(season => season.yearInt === currentSeasonInt)?.seasons;
  const dashedDateWeeks = seasonStages[currentSeasonStage]?.dashedDateWeeks;

  if (dashedDateWeeks) {
    for (let i = 0; i < dashedDateWeeks.length; i++) {
      if (dashedDateWeeks[i].includes(dashedDate)) {
        wk = i;
        break;
      }
    }
  }

  return wk;
}