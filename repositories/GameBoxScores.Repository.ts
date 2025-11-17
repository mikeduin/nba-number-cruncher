import { BoxScores } from "../controllers/Db.Controller.js";
import { UpdateBoxScore } from "../models/boxScore.js";

export const getBoxScoreFromDb = async (gid: number) => {
  try {
    const boxScore = await BoxScores()
      .where({gid})
      .first();
    return boxScore;
  } catch (error) {
    console.error('Error getting box score:', error);
  }
}

export const updateGameBoxScore = async (gid: number, payload: UpdateBoxScore) => {
  try {
    await BoxScores()
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