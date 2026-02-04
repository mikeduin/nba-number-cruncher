import knex from "../db/knex.js";

function Schedule() {return knex('schedule')}

/**
 * Retrieve a single schedule game record by its game id.
 *
 * @param gid - The numeric game identifier to query for.
 * @returns A Promise that resolves to the first matching schedule record, or `undefined` if no match is found.
 * @throws Propagates any errors thrown by the underlying query builder or database driver.
 */
export const getScheduleGame = async (gid: number) => await Schedule().where({ gid }).first();

export const getDailyGames = async (gdte: string) => await Schedule().where({ gdte });

export const getCompletedGameGids = async (gdte: string) => await Schedule()
  .where({ gdte, stt: 'Final'})
  .pluck('gid');

export const getCompletedGamesWithNoGameStints = async (season: number) => await knex("schedule as s")
  // .innerJoin("box_scores_v2 as bs", "s.gid", "=", "bs.gid")
  .whereNotNull("s.gweek")
  .where('s.stt', "Final")
  .andWhere('s.season_year', season)
  .andWhere('s.season_name', 'regular')
  .whereNull("s.game_stints")
  .pluck("s.gid");

export const getExistingSeasonGames = async (season: number) => await Schedule()
  .where({ season_year: season })
  .select('gid', 'gdte', 'etm');

export const setGameStintsUpdated = async (gid: number) => {
  await Schedule().where({ gid }).update({
    game_stints: true,
    updated_at: new Date()
  })
}

export const updateScheduleGame = async (gid: number, payload: any) => {
  try {
    await Schedule().where({ gid }).update({
      ...payload,
      updated_at: new Date()
    });
    console.log('updated schedule game for game ', gid);
  } catch (error) {
    console.error('Error updating schedule game:', error);
  }
}