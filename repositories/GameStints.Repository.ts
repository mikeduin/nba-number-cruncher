import knex from "../db/knex.js";

function GameStints() {return knex('player_game_stints')}

export const insertPlayerGameStint = async (
  player, 
  teamId: string,
  gid: number,
  gcode: string,
  gdte: string,
  stints,
  season: number
) => {
  await GameStints().insert({
    player_id: player,
    team_id: teamId,
    gid,
    gcode,
    gdte,
    game_stints: stints,
    season,
    updated_at: new Date()
  }, '*')
}