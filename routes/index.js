import express from "express";
const router = express.Router();
// import dotenv from 'dotenv';
import axios from 'axios';
import knex from '../db/knex.js';
import schedule from 'node-schedule';
import moment from 'moment';
import momentTz from 'moment-timezone';
import cheerio from 'cheerio';
import _ from 'lodash';

import { updateFullTeamBuilds, updateStarterBuilds, updateBenchBuilds, updateQ1Builds, updateQ2Builds, updateQ3Builds, updateQ4Builds } from "../modules/updateTeamStats.js";
import { updatePlayerBaseStatBuilds, updatePlayerAdvancedStatBuilds, updatePlayerBaseStatBuildsPlayoffs, updatePlayerBoxScoresByPeriod, updatePlayerPositions } from "../modules/updatePlayerStats.js";
import { mapTeamNetRatings, mapTeamPace, mapFullPlayerData, mapPlayerPlayoffData, mapSegmentedPlayerData } from "../modules/dbMappers.js";
import { fetchCurrentSeason, fetchSeasonName } from "../modules/dateFilters.js";
import {
  calcGamePoss,
  compileGameStats,
  convertIntDateToDashedDate,
  gameSecsToClockAndQuarter as gameSecsToGameTime,
  getClocks,
  getCurrentAndPrevQuarterStats,
  getCurrentSeasonStartYearInt,
  getCurrentSeasonStage,
  getGameSecs,
  getGameWeek,
  getWeekIntDateArray,
  mapPlayerStatistics,
  quarterInProgressResponse,
} from "../utils";
import { SeasonNameAbb, SportsbookName } from "../types";
import { EMPTY_BOX_SCORE } from "../constants";

import * as Db from '../controllers/Db.Controller.js';
import { fetchDailyGameProps } from "../controllers/Props.Controller.js";
import { updateSchedule, getActiveGames, updatePastScheduleForInactives, updatePastScheduleForResults, checkForMissingInactives } from "../controllers/Schedule.Controller.js";
import { fetchBoxScore, getCompletedGameResponse, parseGameData } from "../controllers/BoxScore.Controller.js";
import { scrapeBetsson } from "../controllers/Scraper.Controller.js";
import { deleteDuplicateProps, updateSingleGameProps } from "../controllers/Props.Controller.js";
import { addGameStints } from "../controllers/GameStints.Controller.js"
import { getDailyGames, getCompletedGameGids } from "../repositories";
import { buildGameStints } from "../controllers/GameStints.Controller.js";

// dotenv.config();

const app = express();

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// STEP 1: BUILD NBA SCHEDULE
// dbBuilders.buildSchedule();
// dbBuilders.updateScheduleAddMissingGames();
// dbBuilders.updateBovadaUrls();

// TEAM DB: I think I can just wipe out all in-season data and it will rebuild it all. leave the basic team details in place
// PLAYER DB: should be built by default in timed process (adds new players)

// dbBuilders.buildGameStintsDb();

// const testToday = moment().set({'year': 2024, 'month': 3, 'date': 27, 'timezone': 'America/Los_Angeles'}).format('YYYY-MM-DD');
// console.log('testToday is ', testToday);
// let activeGames = await getActiveGames(testToday);
// let completedGames = await getCompletedGameGids(testToday);

let rule = new schedule.RecurrenceRule();
rule.tz = 'America/Los_Angeles';

rule.hour = 0o2;
rule.minute = 19;
rule.second = 48;

// checkForMissingInactives();
// updatePastScheduleForInactives();

// dbBuilders.updatePlayoffSchedule();

// (async () => { 
//     setTimeout(()=>{updateSchedule()}, 1000); // not working for playoffs
// })()

// (async () => { 
//   // await updatePastScheduleForResults(); // don't think we need this anymore, but confirm no FE errors
// // schedule.scheduleJob(rule, async () => {
//   let yesterday = moment().subtract(24, 'hours').format('YYYY-MM-DD');
//   while (moment(yesterday).isAfter('2025-10-18')) {
//     await updatePlayerBoxScoresByPeriod(yesterday);
//     await delay(1000);
//     yesterday = moment(yesterday).subtract(1, 'days').format('YYYY-MM-DD');
//   }
//     // Team Stat Updaters
//     // setTimeout(()=>{updateFullTeamBuilds()}, 1000);
//     // setTimeout(()=>{updateStarterBuilds()}, 10000);
//     // setTimeout(()=>{updateBenchBuilds()}, 20000);
//     // setTimeout(()=>{updateQ1Builds()}, 30000);
//     // setTimeout(()=>{updateQ2Builds()}, 40000);
//     // setTimeout(()=>{updateQ3Builds()}, 50000); 
//     // setTimeout(()=>{updateQ4Builds()}, 60000);XX
//     // setTimeout(()=>{mapTeamNetRatings()}, 70000);
//     // setTimeout(()=>{mapTeamPace()}, 80000);

//     // Player Stat Updaters
//     // setTimeout(()=>{updatePlayerPositions()}, 500);
//     // setTimeout(()=>{updatePlayerBaseStatBuilds(0)}, 5000);
//     // setTimeout(()=>{updatePlayerBaseStatBuilds(3)}, 10000);
//     // setTimeout(()=>{updatePlayerBaseStatBuilds(4)}, 20000);
//     // setTimeout(()=>{updatePlayerAdvancedStatBuilds()}, 30000);
//     // setTimeout(()=>{updatePlayerBaseStatBuildsPlayoffs()}, 45000);
//     // setTimeout(()=>{updateSchedule()}, 60000); // not working for playoffs
//     // setTimeout(()=>{checkForMissingInactives()}, 70000);
//     // setTimeout(()=>{mapFullPlayerData()}, 100000);
//     // setTimeout(()=>{addGameStints()}, 1000);
//     // setTimeout(()=>{mapPlayerPlayoffData()}, 140000);
//     // setTimeout(()=>{mapSegmentedPlayerData()}, 170000);
//   // }) 
// })()

// if (process.env.NODE_ENV !== 'production') {
//   const fetchWithRandomInterval = async () => {
//     await fetchDailyGameProps(SportsbookName.Betsson);
//     const randomDelay = Math.floor(Math.random() * (45000 - 35000 + 1)) + 10000; // Random delay between 10000ms (10s) and 20000ms (20s)
//     setTimeout(fetchWithRandomInterval, randomDelay);
//   };
// }

//   // Start the first fetch
//   fetchWithRandomInterval();
// }

// if (app.get("env") === 'development') {
//   setTimeout(async () => {
//     await fetchDailyGameProps(SportsbookName.Bovada);
//   }, 1000);
// }

// This function pulls in odds
// setInterval(()=>{
//   oddsLoaders.sportsbookFull();
//   oddsLoaders.sportsbookFirstH();
//   oddsLoaders.sportsbookFirstQ();
// }, 5000);

// This function attempts to retrieve 2H/3Q odds [DISABLED TIME CONDITIONAL] between 9am and midnight
// setInterval(()=>{
//   // const hour = new Date().getHours();
//   // if (hour >= 9 && hour <= 24) {
//     oddsLoaders.sportsbookSecondH();
//     oddsLoaders.sportsbookThirdQ();
//   // }
// }, 60000);

router.get("/todayGameStatus/:date", async (req, res) => {
  const activeGames = await getActiveGames(req.params.date);
  const completedGames = await getCompletedGameGids(req.params.date);

  res.send({
    activeGames: activeGames.map(game => game.gid),
    completedGames: completedGames
  })
})

router.delete("/api/deleteDuplicateProps/:gid", async (req, res) => {
  const gid = req.params.gid;
  try {
    await deleteDuplicateProps(gid);
    res.send({message: 'success'});
  } catch (e) {
    console.log('error updating bovada url for ', gid, ' is ', e);
    res.send({message: 'error'});
  }
})

router.post("/api/updateProps", async (req, res, next) => {
  const { gid, sportsbook } = req.body;
  try {
    // await updateSingleGameProps(gid, SportsbookName.Bovada);
    // await updateSingleGameProps(gid, SportsbookName.Betsson);
    await updateSingleGameProps(gid, sportsbook);
    res.send({message: 'success'});
  } catch (e) {
    console.log('error updating props for ', gid, ' is ', e);
    res.send({message: 'error'});
  }
})

router.get('/api/getTeamNotes', async (req, res) => {
  const teamNotes = await knex("teams")
    .where('isNBAFranchise', true)
    .select('tid', 'city', 'name', 'abb', 'notes');
  res.send(teamNotes);
})

router.post("/api/updateTeamNotes", async (req, res, next) => {
  const { abb, notes } = req.body;
  console.log('abb is ', abb, ' notes is ', notes);
  try {
    await knex("teams")
      .where({
        abb,
        isNBAFranchise: true,
      })
      .update({ notes });
    res.send({message: 'success'});
  } catch (e) {
    console.log('error updating notes for ', abb, ' is ', e);
    res.send({message: 'error'});
  }
})

router.post("/api/updateSportsbookUrl", async (req, res, next) => {
  const { gid, sportsbook, url } = req.body;
  const sportsbookField = sportsbook === SportsbookName.Bovada ? 'bovada_url' : 'betsson_url';
  try {
    await knex("schedule").where({gid: gid}).update(sportsbookField, url);
    res.send({message: 'success'});
  } catch (e) {
    console.log('error updating bovada url for ', gid, ' is ', e);
    res.send({message: 'error'});
  }
})

router.get("/api/fetchPlayerData/:pid", async (req, res, next) => {
  const pid = req.params.pid;
  const season = getCurrentSeasonStartYearInt();

  const mappedData = await knex("player_data as pd")
    .innerJoin("teams as t", "pd.team_id", "=", "t.tid")
    .where({player_id: pid, season})
    .select("t.color", "t.color_2", "pd.*");

  const gameStints = await knex("player_game_stints as pgs")
    .innerJoin("schedule as s", "pgs.gid", "=", "s.gid")
    .where('pgs.player_id', pid)
    .where({season })
    .orderBy('pgs.gdte', 'desc')
    .select('s.*', "pgs.game_stints");

  const boxScoresByQuarter = await knex("player_boxscores_by_q as pbs")
    .innerJoin("schedule as s", "pbs.gid", "=", "s.gid")
    .where('pbs.player_id', pid)
    .where({ season })
    .orderBy('s.gdte', 'desc')
    .select('s.gdte', 's.h', 's.v', 's.inactives', 's.result', "pbs.*");

  // Group by gid
  const groupedByGame = boxScoresByQuarter.reduce((acc, curr) => {
    let game = acc.find(game => game.gid === curr.gid);
    if (!game) {
      game = { 
        gid: curr.gid, 
        gdte: curr.gdte, 
        summary: `${curr.v[0].ta} ${curr.v[0].s} @ ${curr.h[0].ta} ${curr.h[0].s}`, // change to curr.result
        periods: [EMPTY_BOX_SCORE, EMPTY_BOX_SCORE, EMPTY_BOX_SCORE, EMPTY_BOX_SCORE] 
      };
      acc.push(game);
    }
    let { h, v, id, gdte, created_at, updated_at, season, ...restOfStats } = curr;
    game.periods[curr.period - 1] = restOfStats; // Set the item at the index curr.period - 1
    game.summary = curr.result;
    return acc;
  }, []);

  res.send({
    gameStints: gameStints,
    mappedData: mappedData[0],
    boxScoresByQuarter: groupedByGame
  });
})

router.get('/api/fetchPlayerProps/:date', async (req, res) => {
  const dailyProps = await knex("player_props").where({gdte: req.params.date});
  res.send(dailyProps);
})

if (app.get("env") === 'production' || app.get("env") === 'development') {
  setInterval(async () => {
    const activeGames = await getActiveGames(momentTz.tz('America/Los_Angeles').format('YYYY-MM-DD'));
    activeGames.forEach(async (game) => {
      const hAbb = game.h[0].ta;
      const vAbb = game.v[0].ta;
      const gid = game.gid;

      try {
        const response = await fetchBoxScore(vAbb, hAbb, gid); // pull live NBA.com data, convert to JSON
        const boxScore = response.props.pageProps.game;
        await parseGameData(boxScore); // write to DB if quarter is over
      } catch (e) {
        console.log('error attempt to fetch box score for gid ', gid, ' is ', e);
      }
    })
  }, 3000)
}

router.get("/api/fetchDailyBoxScores/:activeDay", async (req, res) => {
  // const today = momentTz.tz('America/Los_Angeles').format('YYYY-MM-DD');
  // const today = '2024-11-18'; // REVERT
  const todaysGames = await getDailyGames(req.params.activeDay);
  const todayGids = todaysGames.map(game => game.gid);
  const completedGames = await knex('box_scores_v2 as bs')
    .innerJoin("schedule as s", "s.gid", "=", "bs.gid")
    .whereIn('s.gid', todayGids)
    .where('bs.final', true)
    .select("s.inactives", "bs.*");
  
  const completedBoxScores = completedGames.map((boxScore) => getCompletedGameResponse(boxScore));
  res.send(completedBoxScores);
})

router.get("/api/fetchActiveBoxScores/:activeDay", async (req, res) => {
  // const today = momentTz.tz('America/Los_Angeles').format('YYYY-MM-DD');
  const activeGames = await getActiveGames(req.params.activeDay);

  const activeBoxScores = async () => {
    const boxScorePromises = activeGames.map(async (game) => {
      const hAbb = game.h[0].ta;
      const vAbb = game.v[0].ta;
      const { gid, inactives_set, inactives } = game;
      let boxScore;
  
      try {
        const response = await fetchBoxScore(vAbb, hAbb, gid); // pull live NBA.com data, convert to JSON
        boxScore = response.props.pageProps.game;
      } catch (e) {
        console.log('error attempt to fetch box score for gid ', gid, ' is ', e);
      }

      if (boxScore) {
  
        const { period, gameClock, gameStatus, gameStatusText, homeTeam, awayTeam, homeTeamId: hTid, awayTeamId: vTid} = boxScore;
        const isGameActivated = gameStatus > 1;
    
        if (isGameActivated) {
  
          if (!inactives_set) {
            const hInactives = homeTeam.inactives;
            const vInactives = awayTeam.inactives;
  
            const gamePlayers = await Db.Players()
              .where({season: getCurrentSeasonStartYearInt()})
              .whereIn('team_abbreviation', [hAbb, vAbb])
              .select('player_id', 'player_name', 'team_abbreviation', 'position', 'min_full')
  
            const hInactivesWithPos = hInactives.map(player => {
              const dbPlayer = gamePlayers.find(p => p.player_id === player.personId);
              return {
                ...player,
                position: gamePlayers.find(p => p.player_id === player.personId)?.position,
                min: dbPlayer?.min_full,
                teamId: hTid,
                fullName: `${player.firstName} ${player.familyName}`
              }
            })
  
            const vInactivesWithPos = vInactives.map(player => {
              const dbPlayer = gamePlayers.find(p => p.player_id === player.personId);
  
              return {
                ...player,
                position: dbPlayer?.position,
                min: dbPlayer?.min_full,
                teamId: vTid,
                fullName: `${player.firstName} ${player.familyName}`
              }
            })
    
            const gameInactives = {
              h: hInactivesWithPos,
              v: vInactivesWithPos
            }
            await knex("schedule").where({gid: gid}).update({inactives: gameInactives, inactives_set: true});
            console.log('inactive players for gid ', gid, ' have been set as ', gameInactives);
          }
  
          const { clock, fullClock } = getClocks(gameClock);
          const gameSecs = getGameSecs((parseInt(period)-1), clock);
          const poss = calcGamePoss(homeTeam.statistics, awayTeam.statistics);
          const totalsObj = compileGameStats(homeTeam.statistics, awayTeam.statistics, poss, period, gameSecs);
    
          // console.log('gameStatusText is ', gameStatusText); // "Half" when game at half
          const isEndOfPeriod = fullClock === '00:00:00';
          const hPlayerStats = mapPlayerStatistics(homeTeam.players, hTid, homeTeam.teamTricode, homeTeam.statistics);
          const vPlayerStats = mapPlayerStatistics(awayTeam.players, vTid, awayTeam.teamTricode, awayTeam.statistics);
          const playerStats = [ ...hPlayerStats, ...vPlayerStats];
    
          const { currentQuarter, prevQuarters } = await getCurrentAndPrevQuarterStats(gid, homeTeam.statistics, awayTeam.statistics, period, gameSecs);
  
          const inDb = await knex("box_scores_v2").where({gid: gid});
  
          const q1 = (inDb[0]?.q1?.[0]) || (period === 1 ? currentQuarter : null);
          const q2 = (inDb[0]?.q2?.[0]) || (period === 2 ? currentQuarter : null);
          const q3 = (inDb[0]?.q3?.[0]) || (period === 3 ? currentQuarter : null);
          const q4 = (inDb[0]?.q4?.[0]) || (period === 4 ? currentQuarter : null);
          const ot = (inDb[0]?.ot?.[0]) || (period > 4 ? currentQuarter : null);
  
          const thru_period = inDb[0]?.period_updated ?? 0;
    
          try {
            return quarterInProgressResponse(gid, isEndOfPeriod, clock, period, gameSecs, thru_period, poss, totalsObj, q1, q2, q3, q4, ot, {prevQuarters, currentQuarter}, playerStats, inactives);
          } catch (e) {
            console.log('error sending quarter in progress response is ', e);
          }
        } else {
          console.log(gid, ' has not started, sending back gid ref and active: false, gameStatus is ', gameStatus);
          return {
            gid: gid,
            active: false
          }
        }
      } else {
        console.log('bos score data not updated -- no boxScore found for gid ', gid);
      }

    })

    return Promise.all(boxScorePromises);
  }

  const prepActiveBoxScores = await activeBoxScores();
  res.send(prepActiveBoxScores);
})


// UPDATE THIS TO ONLY SEND POSTSEASON IF IN POSTSEASON! 
// ALSO UPDATE FE TO ONLY DISPLAY POSTSEASON BUTTON IF IN POSTSEASON
router.get("/api/getPlayerMetadata", async (req, res, next) => {
  const season = getCurrentSeasonStartYearInt();
  const players = await knex("player_data")
    .where({ season })
    .orderBy('min_full', 'desc')
    .select('player_id', 'player_name', 'team_abbreviation', 'team_id', 'min_full', 'net_rtg_full', 'gp_full', 'gp_l5',
    'min_l5', 'ppg_full', 'ppg_l5', 'rpg_full', 'rpg_l5', 'apg_full', 'apg_l5', 'spg_full',
    'spg_l5', 'bpg_full', 'bpg_l5', '3pg_full', '3pg_l5', '3pa_full', '3pa_l5', 'topg_full', 'topg_l5', 'ppg_3q_full', 
    'ppg_3q_l5', 'rpg_3q_full', 'rpg_3q_l5', 'apg_3q_full', 'apg_3q_l5', 'spg_3q_full', 'spg_3q_l5',
    'bpg_3q_full', 'bpg_3q_l5', '3pg_3q_full', '3pg_3q_l5', '3pa_3q_full', '3pa_3q_l5', 'topg_3q_full', 'topg_3q_l5', 'min_3q_full', 'min_3q_l5', 'ppg_4q_full',
    'ppg_4q_l5', 'rpg_4q_full', 'rpg_4q_l5', 'apg_4q_full', 'apg_4q_l5', 'spg_4q_full', 'spg_4q_l5',
    'bpg_4q_full', 'bpg_4q_l5', '3pg_4q_full', '3pg_4q_l5', '3pa_4q_full', '3pa_4q_l5', 'topg_4q_full', 'topg_4q_l5', 'min_4q_full', 'min_4q_l5',
    'fgm_full', 'fgm_l5', 'fgm_3q_full', 'fgm_3q_l5', 'fgm_4q_full', 'fgm_4q_l5', 'fga_full', 'fga_l5', 'fga_3q_full', 'fga_3q_l5', 'fga_4q_full', 'fga_4q_l5',
    'ftm_full', 'ftm_l5', 'ftm_3q_full', 'ftm_3q_l5', 'ftm_4q_full', 'ftm_4q_l5', 'fta_full', 'fta_l5', 'fta_3q_full', 'fta_3q_l5', 'fta_4q_full', 'fta_4q_l5',
    '3pa_full', '3pa_l5', '3pa_3q_full', '3pa_3q_l5', '3pa_4q_full', '3pa_4q_l5',
    'min_post', 'fgm_post', 'fga_post', '3pg_post', '3pa_post', 'ftm_post', 'fta_post',
    'topg_post', 'ppg_post', 'rpg_post', 'apg_post', 'spg_post', 'bpg_post', 'min_3q_post', 'fgm_3q_post', 'fga_3q_post', '3pg_3q_post', '3pa_3q_post', 'ftm_3q_post', 
    'fta_3q_post', 'topg_3q_post', 'ppg_3q_post', 'rpg_3q_post', 'apg_3q_post', 'spg_3q_post', 'bpg_3q_post', 'min_4q_post', 'fgm_4q_post', 'fga_4q_post', '3pg_4q_post', 
    '3pa_4q_post', 'ftm_4q_post', 'fta_4q_post', 'topg_4q_post', 'ppg_4q_post', 'rpg_4q_post', 'apg_4q_post', 'spg_4q_post', 'bpg_4q_post');

  res.send({players});
})

router.get("/api/getNetRatings", (req, res, next) => {
  knex("team_net_ratings").then(netRatings => {
    res.send(netRatings);
  });
});

router.get("/api/fetchWeek/:date", async (req, res, next) => {
  const { date } = req.params;
  const dashedDate = convertIntDateToDashedDate(date)

  const seasonYear = getCurrentSeasonStartYearInt();
  const week = getGameWeek(dashedDate);
  const weekArray = getWeekIntDateArray(dashedDate);
  const seasonName = getCurrentSeasonStage(dashedDate);

  let query = knex("schedule as s")
    .leftJoin("odds_sportsbook as odds", "s.gcode", '=', "odds.gcode")
    .where('s.gweek', week)
    .where('s.season_year', seasonYear);

  if (seasonName) {
    query = query.where('s.season_name', SeasonNameAbb[seasonName]);
  }
  
  query
    .select('odds.*', 's.id', 's.gid', 's.gcode', 's.gdte', 's.etm', 's.gweek', 's.h', 's.v', 's.stt', 's.bovada_url', 's.betsson_url')
    .orderBy('s.etm')
    .then(async (games) => {
      res.send({
        week,
        weekArray: weekArray,
        weekGames: games,
      })
    });
});

router.get("/api/fetchGame/:gid", async (req, res, next) => {
  const gid = req.params.gid;
  const game = await knex("schedule").where({gid: gid});
  const odds = await knex("odds_sportsbook").where({gcode: game[0].gcode});
  const h = game[0].h[0].tid;
  const v = game[0].v[0].tid;
  const hAbb = game[0].h[0].ta;
  const vAbb = game[0].v[0].ta;
  const nineAgo = moment().subtract(8, 'days').format('YYYY-MM-DD');
  const oneAhead = moment().add(1, 'days').format('YYYY-MM-DD');

  const hSched = await knex("schedule")
    .where('gcode', 'like', `%${hAbb}%`)
    .whereBetween('gdte', [nineAgo, oneAhead])
    .orderBy('gdte');
  const vSched = await knex("schedule")
    .where('gcode', 'like', `%${vAbb}%`)
    .whereBetween('gdte', [nineAgo, oneAhead])
    .orderBy('gdte');
  const hNetRtg = await knex("team_net_ratings").where({team_id: h});
  const vNetRtg = await knex("team_net_ratings").where({team_id: v});
  const hPace = await knex("team_pace").where({team_id: h});
  const vPace = await knex("team_pace").where({team_id: v});
  const hTradStats = await knex("teams_full_base").where({team_id: h});
  const vTradStats = await knex("teams_full_base").where({team_id: v});
  const hInfo = await knex("teams").where({tid: h});
  const vInfo = await knex("teams").where({tid: v});
  const matchups = await knex("schedule")
    .where('gcode', 'like', `%${hAbb}${vAbb}%`)
    .orWhere('gcode', 'like', `%${vAbb}${hAbb}%`);
  const hPlayers = await knex("player_data as pd")
    .leftJoin("players_on_off as po", "pd.player_id", "=", "po.player_id")
    .where("po.team_id", "=", h)
    .orderBy("po.netRtg_delta", "desc")
    .select('pd.player_id as id', 'pd.player_name as name', 'mp_pct', 'min_l15', 'net_rtg_full', 'off_rtg_full', 'def_rtg_full', 'pace_full', 'team_offRtg_delta', 'opp_offRtg_delta', 'netRtg_delta', 'diff_pace_delta', 'team_abb', 'total_rating');
  const vPlayers = await knex("player_data as pd")
    .leftJoin("players_on_off as po", "pd.player_id", "=", "po.player_id")
    .where("po.team_id", "=", v)
    .orderBy("po.netRtg_delta", "desc")
    .select('pd.player_id as id', 'pd.player_name as name', 'mp_pct', 'min_l15', 'net_rtg_full', 'off_rtg_full', 'def_rtg_full', 'pace_full', 'team_offRtg_delta', 'opp_offRtg_delta', 'netRtg_delta', 'diff_pace_delta', 'team_abb', 'total_rating');

  // default numerical sort for use with Array.sort
  const defSort = (a, b) => {
    return a - b;
  }

  const rotationPlayers = hPlayers.concat(vPlayers)
    .filter(player => player.mp_pct > 0.2);

  // Do not modify this sort w/o also modifying impactPlayers pull on client side
  const sortedRotPlayers = _.orderBy(rotationPlayers, ['netRtg_delta'], ['desc']);

  const rotPlayerIds = sortedRotPlayers.map(player => player.id);
  const monthPlusAgo = moment().subtract(45, 'days').format('YYYY-MM-DD');

  const gameStints = await knex("player_game_stints")
    .where("gdte", ">", monthPlusAgo)
    .andWhere(buildOne => {
      buildOne.whereIn('team_id', [h, v])
    })
    .andWhere(buildTwo => {
      buildTwo.whereIn('player_id', rotPlayerIds)
    })
    .orderBy('gdte', 'desc');

  // binary search fn to speed up sorting/median determ of significant substitution patterns
  const findInsertionPoint = (sortedArr, val, comparator) => {
    let low = 0, high = sortedArr.length;
    let mid = -1, c = 0;
    while (low < high) {
      mid = parseInt((low + high) / 2);
      c = comparator(sortedArr[mid], val);
      if (c < 0) {
        low = mid + 1;
      } else if (c > 0) {
        high = mid;
      } else {
        return mid;
      }
    }
    return low;
  }

  const fullPlayerData = sortedRotPlayers.map(player => {
    const playerStints = gameStints.filter(stint => stint.player_id === player.id);
    const gameEntries = [];
    const gameExits = [];
    let games = 0;
    playerStints.forEach(game => {
      games++;
      game.game_stints.forEach((stretch, i) => {
        if (gameEntries[i]) {
          let idx = findInsertionPoint(gameEntries[i], parseInt(stretch[0]), defSort)
          gameEntries[i].splice(idx, 0, parseInt(stretch[0]));
        } else {
          gameEntries.push([parseInt(stretch[0])])
        };

        if (gameExits[i]) {
          let idx = findInsertionPoint(gameExits[i], parseInt(stretch[1]), defSort);
          gameExits[i].splice(idx, 0, parseInt(stretch[1]));
        } else {
          gameExits.push([parseInt(stretch[1])])
        };
      })
    })

    const sigEntries = gameEntries
      .filter(set => {
        const median = Math.floor(set.length/2);
        return (
          (set.length > (games*0.4)) && (set[median] !== 0)
        )
      })
      .reduce((quarters, filtered) => {
        let median = filtered[Math.floor(filtered.length/2)];
        if (median < 719) {
          quarters[0].push(gameSecsToGameTime(median).slice(3))
        } else if (median < 1439) {
          quarters[1].push(gameSecsToGameTime(median).slice(3))
        } else if (median < 2159) {
          quarters[2].push(gameSecsToGameTime(median).slice(3))
        } else if (median < 2879) {
          quarters[3].push(gameSecsToGameTime(median).slice(3))
        };
        return quarters;
      }, [[], [], [], []]);

    const sigExits = gameExits
      .filter(set => {
        const median = Math.floor(set.length/2);
        return (
          (set.length > (games*0.4)) && (set[median] !== 2880)
        )
      })
      .reduce((quarters, filtered) => {
        let median = filtered[Math.floor(filtered.length/2)];
        if (median < 721) {
          quarters[0].push(gameSecsToGameTime(median).slice(3))
        } else if (median < 1441) {
          quarters[1].push(gameSecsToGameTime(median).slice(3))
        } else if (median < 2161) {
          quarters[2].push(gameSecsToGameTime(median).slice(3))
        } else if (median < 2881) {
          quarters[3].push(gameSecsToGameTime(median).slice(3))
        };
        return quarters;
      }, [[], [], [], []]);

      return {...player, sigEntries, sigExits}
  })

  res.send({
    info: game[0],
    odds: odds[0],
    hTen: hSched,
    vTen: vSched,
    matchups,
    hNetRtg: hNetRtg[0],
    vNetRtg: vNetRtg[0],
    hTradStats: hTradStats[0],
    vTradStats: vTradStats[0],
    hPace: hPace[0],
    vPace: vPace[0],
    hInfo: hInfo[0],
    vInfo: vInfo[0],
    rotPlayers: fullPlayerData
  });
})

export default router;
