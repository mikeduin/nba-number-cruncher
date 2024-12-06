import axios from "axios";
import knex from "../../db/knex.js";
import { getCurrentSeasonStartYearInt } from "../schedule";
import { LEAGUE_SCHEDULE_URL } from "../../constants";

export const updateGameInactives = async () => {
  const seasonYear = getCurrentSeasonStartYearInt();
  const schedulePull = await axios.get(LEAGUE_SCHEDULE_URL(seasonYear));
  const leagueSchedule = schedulePull.data.lscd;

  leagueSchedule.forEach(month => {
    month.mscd.g
      .forEach(async game => {
        // console.log('game is ', game);
      });
  });
}
