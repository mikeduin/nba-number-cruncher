import knex from "../db/knex.js";

function PlayerBoxScores() {return knex('player_boxscores_by_q')}

export const insertPlayerBoxScoresByPeriod = (gid: string, period: number, playerStats, teamAbb: string, season: number) => {
  playerStats.forEach(async player => {
    const { player_id, player_name, min, pts, reb, ast, stl, blk, tov, fg3m, fg3a, fgm, fga, ftm, fta, fouls, usg } = player;
    await PlayerBoxScores()
      .insert({
        player_id,
        player_name,
        team: teamAbb,
        gid,
        period,
        min,
        pts,
        reb,
        ast,
        stl,
        blk,
        tov,
        fg3m,
        fg3a,
        fgm,
        fga,
        ftm,
        fta,
        fouls,
        usg,
        season,
        updated_at: new Date(),
        created_at: new Date()
      });
    console.log('player stats inserted for ', player_name, ' for period ', period, ' of game ', gid);
  });
};

export const getFinalPlayerBoxScoresForGame = async (gid: string) => {
  return await PlayerBoxScores()
    .where({ gid, period: 5 });
}