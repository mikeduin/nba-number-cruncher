import knex from "../db/knex.js";
import { UpdateBoxScore } from "../models/boxScore.js";

function GameBoxScores() {return knex("box_scores_v2")};

export const updateGameBoxScore = async (gid: number, payload: UpdateBoxScore) => {
  try {
    await GameBoxScores()
      .where({gid})
      .update({
        ...payload,
        updated_at: new Date()
      });
    console.log('updated box score for game ', gid);
  } catch (error) {
    console.error('Error updating box score:', error);
  }
}