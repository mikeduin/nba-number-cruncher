import axios from "axios";
import cheerio from "cheerio";
import { BoxScoreModel } from "../models/boxScore"
import { BoxScoreResponse } from "../types/BoxScore"

export const fetchBoxScore = async (vAbb: string, hAbb: string, gid: number) => {
  try {
    const gameUrl = `https://www.nba.com/game/${vAbb.toLowerCase()}-vs-${hAbb.toLowerCase()}-00${gid}/box-score.json`;
    const { data } = await axios.get(gameUrl);
    const $ = cheerio.load(data);
    const boxScoreData = $('#__NEXT_DATA__').text();
    const parsedBoxScore = JSON.parse(boxScoreData);

    return parsedBoxScore;
  } catch (error) {
    console.error('Error fetching box score:', error);
    return null;
  }
};


export const getCompletedGameResponse = (boxScore: BoxScoreModel): BoxScoreResponse => {
  const { gid, final, q1, q2, q3, q4, ot, totals, player_stats } = boxScore;
  return {
    gid,
    q1: q1?.[0] ?? null,
    q2: q2?.[0] ?? null,
    q3: q3?.[0] ?? null,
    q4: q4?.[0] ?? null,
    ot: ot?.[0] ?? null,
    totals: totals[0],
    final,
    playerStats: JSON.parse(player_stats),
  }
}