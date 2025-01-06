import knex from "../db/knex.js";

function Schedule() {return knex('schedule')}

export const getScheduleGame = async (gid: number) => await Schedule().where({ gid });

export const getDailyGames = async (gdte: string) => await Schedule().where({ gdte });

export const getCompletedGameGids = async (gdte: string) => await Schedule()
  .where({ gdte, stt: 'Final'})
  .pluck('gid');

export const getCompletedGamesWithNoGameStints = async (season: number) => await Schedule()
  .whereNotNull("gweek")
  .where({ stt: "Final", season_year: season })
  .whereNull("game_stints")
  .pluck("gid");

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