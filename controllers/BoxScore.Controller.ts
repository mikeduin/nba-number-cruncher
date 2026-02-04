import axios from "axios";
import cheerio from "cheerio";
import { BoxScores, Schedule } from "../controllers/Db.Controller.js";
import { getClocks, getGameSecs, getCurrentAndPrevQuarterStats, calcGamePoss, compileGameStats, mapPlayerStatistics } from '../utils';
import { CompletedBoxScoreDb, NbaApiBoxScore, UpdateBoxScore } from "../models"
import { updateGameBoxScore } from "../repositories";
import { BoxScoreResponse } from "../types"
import { GAME_BOX_SCORE_URL } from "../constants";
import { set } from "lodash";

export const fetchBoxScore = async (vAbb: string, hAbb: string, gid: number) => {
  try {
    const gameUrl = GAME_BOX_SCORE_URL(vAbb, hAbb, gid);
    
    const { data } = await axios.get(gameUrl, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      }
    });
    const $ = cheerio.load(data);
    const boxScoreData = $('#__NEXT_DATA__').text();
    const parsedBoxScore = JSON.parse(boxScoreData);

    return parsedBoxScore;
  } catch (error) {
    console.error('Error fetching box score:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers
      });
    }
    return null;
  }
};

export const getCompletedGameResponse = (boxScore: CompletedBoxScoreDb): BoxScoreResponse => {
  const { gid, final, q1, q2, q3, q4, ot, totals, player_stats, inactives } = boxScore;
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
    inactives: JSON.parse(inactives)
  }
}

export const parseGameData = async (boxScore: NbaApiBoxScore, setToFinal?: boolean) => {
  const { period, gameClock, gameStatus, gameStatusText, homeTeam, homeTeamId: hTid, awayTeam, awayTeamId: vTid, gameId} = boxScore;
  const gid = parseInt(gameId.slice(2));

  const isGameActivated = gameStatus > 1;
  const { clock, fullClock } = getClocks(gameClock);
  const qVariable = `q${period}`;
  const gameSecs = getGameSecs((period-1), clock);

  const gameOver = gameStatusText === 'Final' || gameStatus === 3;
  const isEndOfPeriod = fullClock === '00:00:00';

  if ((isEndOfPeriod && isGameActivated) || gameOver) {
    const hTeam = homeTeam.statistics;
    const vTeam = awayTeam.statistics;
    const poss = calcGamePoss(hTeam, vTeam);
    const totalsObj = compileGameStats(hTeam, vTeam, poss, period, gameSecs);

    const hPlayerStats = mapPlayerStatistics(homeTeam.players, hTid, homeTeam.teamTricode, homeTeam.statistics);
    const vPlayerStats = mapPlayerStatistics(awayTeam.players, vTid, awayTeam.teamTricode, awayTeam.statistics);
    const playerStats = [ ...hPlayerStats, ...vPlayerStats];

    const qTotals = await getCurrentAndPrevQuarterStats(gid, hTeam, vTeam, period, gameSecs);
    const currentQuarter = qTotals?.currentQuarter;

    const baseUpdatePayload: UpdateBoxScore = {
      period_updated: period,
      clock_last_updated: gameSecs,
      totals: [totalsObj],
      player_stats: JSON.stringify(playerStats),
    }

    console.log('Processing box score for game ', gid, ' period ', period, ' gameOver: ', gameOver);

    if (period === 1) {
      try {
        const entry = await BoxScores().where({gid});
        if (!entry[0]) {
          await BoxScores().insert({
            ...baseUpdatePayload,
            gid: gid,
            h_tid: hTid,
            v_tid: vTid,
            q1: [totalsObj],
            updated_at: new Date()
          });
          console.log('Q1 stats inserted for ', gid);
        } else {
          console.log('first period already entered in gid ', gid);
        }
      } catch (e) {
        console.log(`${qVariable} insert failed for ${gid} error is ${e}`);
      }
    } else if (period === 2 || period === 3 || period === 4) {
      try {
        const qTest = await BoxScores().where({gid}).pluck(`${qVariable}`);
        if (qTest[0] == null && !setToFinal) {
          const updatePayload: UpdateBoxScore = {
            ...baseUpdatePayload,
            [qVariable]: [currentQuarter],
          }
          await updateGameBoxScore(gid, updatePayload);
          console.log(`${qVariable} stats inserted for ${gid}`);
        } else if (period === 4 && gameOver) { 
          await updateGameBoxScore(gid, {final: true})
          console.log('should be setting schedule to final');
          await Schedule().where({gid: gid}).update({
            stt: "Final",
            result: `${awayTeam.teamTricode} ${awayTeam.score} @ ${homeTeam.teamTricode} ${homeTeam.score}`,
          }); 
          console.log(`game ${gid} has been set to final in DB`)
        } else {
          console.log(`qTest for ${qVariable} does not equal null, and/or ${qVariable} already entered in gid ${gid} -- just updating player stats`);
          await updateGameBoxScore(gid, {player_stats: JSON.stringify(playerStats)});
        }
      } catch (e) {
        console.log(`${qVariable} insert failed for ${gid} error is ${e}`);
      }
    } else {
      // const qTest = await knex("box_scores_v2").where({gid: gid}).pluck('ot');
      // <-- If No OT in DB and Game is Over --> //
      // if (qTest[0] == null && !isGameActivated) {
      if (gameOver) {
        try {
          const updatePayload: UpdateBoxScore = {
            ...baseUpdatePayload,
            ot: [currentQuarter],
            final: true,
          }
          await updateGameBoxScore(gid, updatePayload);
          await Schedule().where({gid: gid}).update({
            stt: "Final",
            result: `${awayTeam.teamTricode} ${awayTeam.score} @ ${homeTeam.teamTricode} ${homeTeam.score}`,
          }); 
          console.log('OT stats inserted for ', gid);
        } catch (e) {
          console.log('error updating ot totals is ', e);
        }
      } else {
        // <-- If OT but Not Over, Keep Rolling Stats Over (OT stats not differentiated in DB) --> //
        console.log('Game still activated or ongoing!')
      }
    }
  }
}