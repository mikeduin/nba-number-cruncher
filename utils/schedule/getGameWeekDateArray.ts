// DELETE THIS AFTER CONFIRMING NO ISSUES

// import { SEASON_DATES } from "../../constants";
// import { convertIntDateToDashedDate } from "../dates";
// import { 
//   getCurrentSeasonStartYearInt,
//   getCurrentSeasonStage,
// } from "./";

// /**
//  * Retrieves an array of Mon - Sun dates for a specific game week in the NBA season.
//  * 
//  * @param intDate - The integer representation of the date.
//  * @param gameWeek - The game week number.
//  * @returns An array of Mon - Sun dates for the specified game week.
//  */
// export const getGameWeekDateArray = (intDate: number, gameWeek: number): number[] => {
//   const currentSeasonInt = getCurrentSeasonStartYearInt();
//   const dashedDate = convertIntDateToDashedDate(intDate);

//   const currentSeasonStage = getCurrentSeasonStage(dashedDate);
//   const seasonStages = SEASON_DATES.find(season => season.yearInt === currentSeasonInt)?.seasons;

//   const intDateWeeks = seasonStages[currentSeasonStage]?.intDateWeeks;
  
//   return intDateWeeks ? intDateWeeks[gameWeek] : [];
// }
