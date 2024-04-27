const express = require("express");
const router = express.Router();
const axios = require("axios");
const knex = require("../db/knex");
const schedule = require("node-schedule");
const moment = require("moment");
const momentTz = require("moment-timezone");
const cheerio = require('cheerio');
const _ = require('lodash');

// import endQuarterResObj from '../modules/boxScoreHelpers/endQuarterResObj';

const updateTeamStats = require("../modules/updateTeamStats");
const updatePlayerStats = require("../modules/updatePlayerStats");
const dbBuilders = require("../modules/dbBuilders");
const dbMappers = require("../modules/dbMappers");
const dateFilters = require("../modules/dateFilters");
const teamLookup = require("../modules/teamLookup");
const oddsLoaders = require("../modules/oddsLoaders");
const boxScoreHelpers = require("../modules/boxScoreHelpers");
const endQuarterResObj = require("../modules/boxScoreHelpers/endQuarterResObj");
const fetchBoxScore = require("../modules/fetchBoxScore");
const mapPlayerStatistics = require("../utils/boxScores/mapPlayerStatistics");

const parseGameData = require('../modules/parseGameData');

const getGameSecs = require('../modules/getGameSecs');
const gameSecsToGameTime = require("../modules/gameTimeFuncs").gameSecsToClockAndQuarter;

const ScraperController = require("../controllers/Scraper.Controller");
const PropsController = require("../controllers/Props.Controller");

const bovadaScraper = ScraperController.scrapeBovada;
const { fetchDailyGameProps } = PropsController;

const formBovadaUrl = require("../utils/props/formBovadaUrl");

(async () => {
  await fetchDailyGameProps();
})();

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

// subtract 8 hours to convert to west coast time ...
// moment.tz.add('America/Los_Angeles|PST PDT|80 70|0101|1Lzm0 1zb0 Op0');
let today = moment().subtract(8, 'hours').format('YYYY-MM-DD');
let activeGames = [];
let completedGames = [];

let rule = new schedule.RecurrenceRule();
rule.tz = 'America/Los_Angeles';

rule.hour = 02;
rule.minute = 19;
rule.second = 48;

dbBuilders.updatePlayoffScnedule();

// (async () => { 
// // schedule.scheduleJob(rule, async () => {
//   let yesterday = moment().subtract(24, 'hours').format('YYYY-MM-DD');
//   while (moment(yesterday).isAfter('2024-04-23')) {
//     await updatePlayerStats.updatePlayerBoxScoresByPeriod(yesterday);
//     await delay(20000);
//     yesterday = moment(yesterday).subtract(1, 'days').format('YYYY-MM-DD');
//   }

//   setTimeout(()=>{updateTeamStats.updateFullTeamBuilds()}, 1000);
//   setTimeout(()=>{updateTeamStats.updateStarterBuilds()}, 10000);
//   setTimeout(()=>{updateTeamStats.updateBenchBuilds()}, 20000);
//   setTimeout(()=>{updateTeamStats.updateQ1Builds()}, 30000);
//   setTimeout(()=>{updateTeamStats.updateQ2Builds()}, 40000);
//   setTimeout(()=>{updateTeamStats.updateQ3Builds()}, 50000);
//   setTimeout(()=>{updateTeamStats.updateQ4Builds()}, 60000);
//   setTimeout(()=>{updatePlayerStats.updatePlayerBaseStatBuilds(0)}, 70000);
//   setTimeout(()=>{updatePlayerStats.updatePlayerBaseStatBuilds(3)}, 80000);
//   setTimeout(()=>{updatePlayerStats.updatePlayerBaseStatBuilds(4)}, 90000);
//   setTimeout(()=>{updatePlayerStats.updatePlayerAdvancedStatBuilds()}, 100000);
//   setTimeout(()=>{updatePlayerStats.updatePlayerBaseStatBuildsPlayoffs()}, 111000);
//   // setTimeout(()=>{dbBuilders.updateSchedule()}, 240000); // not working for playoffs
//   setTimeout(()=>{dbBuilders.addGameStints()}, 120000);
//   setTimeout(()=>{dbMappers.mapTeamNetRatings()}, 140000);
//   setTimeout(()=>{dbMappers.mapTeamPace()}, 160000);
//   setTimeout(()=>{dbMappers.mapFullPlayerData()}, 180000);
//   setTimeout(()=>{dbMappers.mapSegmentedPlayerData()}, 200000);
// // }) 
// })()

// (async () => {
//   // setTimeout(()=>{updateTeamStats.updateQ1Builds()}, 1000);
//   // setTimeout(()=>{updateTeamStats.updateFullTeamBuilds()}, 1000);
//   // setTimeout(()=>{updatePlayerStats.updatePlayerAdvancedStatBuilds()}, 1000);
//   // setTimeout(()=>{updatePlayerStats.updatePlayerBaseStatBuilds(0)}, 1000);
//   // setTimeout(()=>{updatePlayerStats.updatePlayerBaseStatBuildsPlayoffs()}, 1000);
//   // setTimeout(()=>{dbMappers.mapPlayerPlayoffData()}, 1000);
// })()

if (process.env.NODE_ENV !== 'production') {
  setInterval(async () => {
    await fetchDailyGameProps();
  }, 8000)
}


// setTimeout(async () => {
//   const scheduleGames = await knex("schedule");
//   scheduleGames.forEach(async game => {
//     try {
//       await knex("schedule").where({gid: game.gid}).update({bovada_url: formBovadaUrl(game)});
//       console.log('bovada_url updated for ', game.gid);
//     } catch (e) {
//       console.log('error updating bovada_url for ', game.gid, ' is ', e);
//     }
//   })
// }, 1000)

// this function manages a day's active and completed games for the GambleCast
setInterval(async () => {
  // await fetchDailyGameProps();
  // today = moment().subtract(18, 'hours').format('YYYY-MM-DD');
  const todayGames = await knex("schedule").where({gdte: today});
  const todayGids = todayGames.map(game => game.gid);

  // console.log('todayGames are ', todayGames);

  // FIX THIS EVENTUALLY TO BE UTC TIME, NOT MANUALLY ADJUSTED WEST COAST TIME
  // let nowET = moment().add(180, 'minutes');
  let nowET = moment();
  console.log('nowET is ', nowET);
  // let nowET = moment().tz("America/Toronto");
  const completedGames = await knex("box_scores_v2")
    .whereIn('gid', todayGids)
    .where({final: true})
    .pluck('gid');

  todayGames.forEach(game => {

    // adjustedTime below is necessary because the DB stores the EST start time (as found in NBA DB) as a PST date (since I build the schedule locally in PST)
    // So, to fix the date and bring it back to PST-based, you need to adjust three hours
    const adjustedTime = moment(game.etm).subtract(3, 'hours'); 

    let mins = nowET.diff(adjustedTime, 'minutes');
    console.log(game.gid, ' at ', game.etm, ' starts in ', mins, ' mins');

    // you need mins to be a positive value

    if (mins >= 0 && activeGames.map(g => g.gid).indexOf(game.gid) === -1 && completedGames.indexOf(game.gid) === -1) {
      // If ...
      // mins >= 0 ... (fix this shit)
      // and game is not already in activeGames
      // and game has not been completed
      // push to activeGames
      console.log('pushing ', game.gid, ' to activeGames');
      if (game.gid !== 22200998 && game.gid !== 22200999) {
        activeGames.push(game);
      }
    };

    if (completedGames.indexOf(game.gid) !== -1 && activeGames.indexOf(game.gid) !== -1) {
      const index = completedGames.indexOf(completedGames.indexOf(game.gid));
      completedGames.splice(index, 1);
      console.log(game.gid, ' removed from active games');
    }
  })
}, 10000)

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

router.get("/todayGameStatus", (req, res, next) => {
  // console.log('in todayGameStatus active Games are ', activeGames)
  res.send({
    activeGames: activeGames.map(g => g.gid),
    completedGames: completedGames
  })
})

router.delete("/api/deleteDuplicateProps/:gid", async (req, res, next) => {
  const gid = req.params.gid;
  try {
    await PropsController.deleteDuplicateProps(gid);
    res.send({message: 'success'});
  } catch (e) {
    console.log('error updating bovada url for ', gid, ' is ', e);
    res.send({message: 'error'});
  }
})

router.post("/api/updateBovadaUrl", async (req, res, next) => {
  const { gid, url } = req.body;
  try {
    await knex("schedule").where({gid: gid}).update({bovada_url: url});
    res.send({message: 'success'});
  } catch (e) {
    console.log('error updating bovada url for ', gid, ' is ', e);
    res.send({message: 'error'});
  }
})

router.get("/api/fetchPlayerData/:pid", async (req, res, next) => {
  const pid = req.params.pid;

  const emptyBoxScore = {
    min: 0,
    pts: 0,
    reb: 0,
    ast: 0,
    stl: 0,
    blk: 0,
    tov: 0,
    fg3m: 0,
    fg3a: 0,
    fgm: 0,
    fga: 0,
    ftm: 0,
    fta: 0,
    fouls: 0
  }

  const mappedData = await knex("player_data as pd")
    .innerJoin("teams as t", "pd.team_id", "=", "t.tid")
    .where({player_id: pid})
    .select("t.color", "t.color_2", "pd.*");

  const gameStints = await knex("player_game_stints as pgs")
    .innerJoin("schedule as s", "pgs.gid", "=", "s.gid")
    .where('pgs.player_id', pid)
    .where('pgs.gdte', '>', '2021-10-10')
    .orderBy('pgs.gdte', 'desc')
    .select('s.*', "pgs.game_stints");

  const boxScoresByQuarter = await knex("player_boxscores_by_q as pbs")
    .innerJoin("schedule as s", "pbs.gid", "=", "s.gid")
    .where('pbs.player_id', pid)
    .orderBy('s.gdte', 'desc')
    .select('s.gdte', 's.h', 's.v', "pbs.*");

  // Group by gid
  const groupedByGame = boxScoresByQuarter.reduce((acc, curr) => {
    let game = acc.find(game => game.gid === curr.gid);
    if (!game) {
      game = { 
        gid: curr.gid, 
        gdte: curr.gdte, 
        summary: `${curr.v[0].ta} ${curr.v[0].s} @ ${curr.h[0].ta} ${curr.h[0].s}`,
        periods: [emptyBoxScore, emptyBoxScore, emptyBoxScore, emptyBoxScore] 
      };
      acc.push(game);
    }
    let { h, v, id, gdte, created_at, updated_at, ... restOfStats } = curr;
    game.periods[curr.period - 1] = restOfStats; // Set the item at the index curr.period - 1
    return acc;
  }, []);

  res.send({
    gameStints: gameStints,
    mappedData: mappedData[0],
    boxScoresByQuarter: groupedByGame
  });
})

router.get('/api/fetchPlayerProps', async (req, res, next) => {
  // console.log('player props being fetched from server');
  const today = momentTz.tz('America/Los_Angeles').format('YYYY-MM-DD');
  const dailyProps = await knex("player_props").where({gdte: today});
  res.send(dailyProps);
})

setInterval(() => {
  activeGames.forEach(async (game) => {
    const hAbb = game.h[0].ta;
    const vAbb = game.v[0].ta;
    const gid = game.gid;

    try {
      const response = await fetchBoxScore(vAbb, hAbb, gid);
      const boxScore = response.props.pageProps.game;
      await parseGameData(boxScore);
    } catch (e) {
      console.log('error attempt to fetch box score for gid ', gid, ' is ', e);
    }
  })
}, 3000)

router.get("/fetchBoxScore/:date/:gid/:init/:vAbb/:hAbb", async (req, res, next) => {
  const { gid, init, vAbb, hAbb } = req.params;

  // <-- If Game Is Final --> //
  if (completedGames.indexOf(parseInt(gid)) !== -1) {
    let inDb = await knex("box_scores_v2").where({gid: gid});
    let ot = null;
    if (inDb[0].ot != null) { ot = inDb[0].ot[0] };

    // ERROR AT START OF 2Q: CANNOT READ PROPERTY '0' OF NULL FOR Q2

    res.send({
      gid: gid,
      q1: inDb[0].q1[0],
      q2: inDb[0].q2[0],
      q3: inDb[0].q3[0],
      q4: inDb[0].q4[0],
      ot: ot,
      totals: inDb[0].totals[0],
      final: true
    })
    return;
  };

  let q1 = null;
  let q2 = null;
  let q3 = null;
  let q4 = null;
  let ot = null;
  let thru_period = 0;

  let boxScore;

  try {
    const response = await fetchBoxScore(vAbb, hAbb, gid);
    boxScore = response.props.pageProps.game;
  } catch (e) {
    console.log('error attempt to fetch box score for gid ', gid, ' is ', e);
    return res.status(400).send({
      message: `error attempting to fetch boc score for ${gid} is ${e}`
   });
  }

  const { period, gameClock, gameStatus, gameStatusText, homeTeam, awayTeam, homeTeamId: hTid, awayTeamId: vTid} = boxScore;
  const isGameActivated = gameStatus > 1;
  const clock = `${gameClock.slice(2, 4)}:${gameClock.slice(5, 7)}`; // e.g., 01:02
  const fullClock = `${gameClock.slice(2, 4)}:${gameClock.slice(5, 7)}:${gameClock.slice(8, 10)}`; // e.g., 01:02:00

  const gameSecs = getGameSecs((parseInt(period)-1), clock);
  const derivedClock = boxScoreHelpers.clockReturner(clock, period, gameSecs);

  // <-- If Game Has Begun --> //
  if (isGameActivated) {
    const hTeam = homeTeam.statistics;
    const vTeam = awayTeam.statistics;
    const poss = boxScoreHelpers.calcGamePoss(hTeam, vTeam);
    const derivedPace = boxScoreHelpers.calcGamePace(poss, period, gameSecs);
    const totalsObj = boxScoreHelpers.compileGameStats(hTeam, vTeam, poss, period, gameSecs);

    // this object calculates the stats for each quarter, using the previous totals from earlier Qs
    const quarterObj = prevTotals => {
      return boxScoreHelpers.compileQuarterStats(hTeam, vTeam, prevTotals[0], period, gameSecs);
    }

    // this is the function that combines the two above
    const quarterUpdFn = async () => {
      const prevTotalsPull = await knex("box_scores_v2").where({gid: gid}).select('totals');
      const quarterTotals = await quarterObj(prevTotalsPull[0].totals);
      return {
        currentQuarter: quarterTotals,
        prevQuarters: prevTotalsPull[0].totals[0]
      }
    }

    const gameOver = gameStatusText === 'Final';
    const isEndOfPeriod = fullClock === '00:00:00';

    // <-- If Initial Box Score Load --> //
    if (init == 'true' && period !== 1) {
      try {
        let inDb = await knex("box_scores_v2").where({gid: gid});

        // <-- If Game Is Found in DB (e.g., Q1 or later) --> //
        q1 = inDb[0].q1[0];
        thru_period = inDb[0].period_updated;
        if (inDb[0].q2 != null) { q2 = inDb[0].q2[0] };
        if (inDb[0].q3 != null) { q3 = inDb[0].q3[0] };
        if (inDb[0].q4 != null) { q4 = inDb[0].q4[0] };
        if (inDb[0].ot != null) { ot = inDb[0].ot[0] };
  
        quarterUpdFn().then(qTotals => {
          if (period == 2) {inDb[0].q2 != null ? q2 = inDb[0].q2[0] : q2 = qTotals.currentQuarter};
          if (period == 3) {inDb[0].q3 != null ? q3 = inDb[0].q3[0] : q3 = qTotals.currentQuarter};
          if (period == 4) {inDb[0].q4 != null ? q4 = inDb[0].q4[0] : q4 = qTotals.currentQuarter};
          if (period > 4) ot = qTotals.currentQuarter;
  
          res.send({
            gid: gid,
            init: true,
            quarterEnd: isEndOfPeriod,
            live: true,
            clock: derivedClock,
            gameSecs: gameSecs,
            period: period,
            thru_period: thru_period,
            poss: poss,
            pace: derivedPace,
            totals: totalsObj,
            q1: q1,
            q2: q2,
            q3: q3,
            q4: q4,
            ot: ot,
            prevQuarters: qTotals.prevQuarters,
            playerStats: JSON.parse(inDb[0].player_stats)
          })
        })
        return;
      } catch (e) {
        console.log('error send box score response is ', e);
      }
    }
    // <-- If at End of Period, or if Game is Over --> //
    if (isEndOfPeriod || gameOver) {
      try {
      const qTotals = await quarterUpdFn();
      res.send(endQuarterResObj(clock, period, thru_period, gameSecs, poss, totalsObj, qTotals, playerStats))
      } catch (e) {
        console.log('error setting end of game q totals is ', e);
      } 
      
    } else {
      // if endOfPeriod is false && game is not activated ... does it get here if game has started?
      // CONFIRM THIS WORKS IN EVENT OF OT
      if (!isGameActivated) {
        console.log(gid, ' has not started or has finished and gameOver fn not reached');
        res.send({
          quarterEnd: false,
          clock: derivedClock,
          gameSecs: gameSecs,
          period: period,
          poss: poss,
          pace: derivedPace,
          totals: totalsObj
        })
      } else {
        const prevTotalsPull = await knex("box_scores_v2").where({gid: gid}).select('totals');
        const hPlayerStats = mapPlayerStatistics(homeTeam.players, hTid, homeTeam.teamTricode);
        const vPlayerStats = mapPlayerStatistics(awayTeam.players, vTid, awayTeam.teamTricode);
        const playerStats = [ ...hPlayerStats, ...vPlayerStats];

        res.send({
          quarterEnd: false,
          live: true,
          clock: derivedClock,
          gameSecs: gameSecs,
          period: period,
          poss: poss,
          pace: derivedPace,
          totals: totalsObj,
          thru_period: period === 1 ? 0 : null,
          prevQuarters: period === 1 
            ? null 
            : prevTotalsPull[0]?.totals[0],
          playerStats
        })
      }
    }
  } else {
    console.log(gid, ' has not started, sending back gid ref and active: false');
    res.send({
      gid: gid,
      active: false
    })
  }
})

// how best to use this?
// router.get("/fetchStarters", (req, res, next) => {
//   axios.get('https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2018/scores/gamedetail/0021800848_gamedetail.json').then(game => {
//     const h = game.data.g.hls;
//     const v = game.data.g.vls;
//     const home = {
//       tid: h.tid,
//       starters: h.pstsg.slice(0,5).map(player => player.pid),
//       bench: h.pstsg.slice(5, h.pstsg.length).map(player => player.pid)
//     };
//
//     const vis = {
//       tid: v.tid,
//       starters: v.pstsg.slice(0,5).map(player => player.pid),
//       bench: v.pstsg.slice(5, v.pstsg.length).map(player => player.pid)
//     };
//
//     const rosters = {
//       h: home,
//       v: vis
//     };
//
//     console.log(rosters)
//   })
// })

router.get("/api/getPlayerMetadata", async (req, res, next) => {
  const players = await knex("player_data")
    .orderBy('min_full', 'desc')
    .select('player_id', 'player_name', 'team_abbreviation', 'team_id', 'min_full', 'net_rtg_full', 
    'min_l5', 'ppg_full', 'ppg_l5', 'rpg_full', 'rpg_l5', 'apg_full', 'apg_l5', 'spg_full',
    'spg_l5', 'bpg_full', 'bpg_l5', '3pg_full', '3pg_l5', '3pa_full', '3pa_l5', 'topg_full', 'topg_l5', 'ppg_3q_full', 
    'ppg_3q_l5', 'rpg_3q_full', 'rpg_3q_l5', 'apg_3q_full', 'apg_3q_l5', 'spg_3q_full', 'spg_3q_l5',
    'bpg_3q_full', 'bpg_3q_l5', '3pg_3q_full', '3pg_3q_l5', '3pa_3q_full', '3pa_3q_l5', 'topg_3q_full', 'topg_3q_l5', 'min_3q_full', 'min_3q_l5', 'ppg_4q_full',
    'ppg_4q_l5', 'rpg_4q_full', 'rpg_4q_l5', 'apg_4q_full', 'apg_4q_l5', 'spg_4q_full', 'spg_4q_l5',
    'bpg_4q_full', 'bpg_4q_l5', '3pg_4q_full', '3pg_4q_l5', '3pa_4q_full', '3pa_4q_l5', 'topg_4q_full', 'topg_4q_l5', 'min_4q_full', 'min_4q_l5',
    'fgm_full', 'fgm_l5', 'fgm_3q_full', 'fgm_3q_l5', 'fgm_4q_full', 'fgm_4q_l5', 'fga_full', 'fga_l5', 'fga_3q_full', 'fga_3q_l5', 'fga_4q_full', 'fga_4q_l5',
    'ftm_full', 'ftm_l5', 'ftm_3q_full', 'ftm_3q_l5', 'ftm_4q_full', 'ftm_4q_l5', 'fta_full', 'fta_l5', 'fta_3q_full', 'fta_3q_l5', 'fta_4q_full', 'fta_4q_l5',
    '3pa_full', '3pa_l5', '3pa_3q_full', '3pa_3q_l5', '3pa_4q_full', '3pa_4q_l5', 'min_post', 'fgm_post', 'fga_post', '3pg_post', '3pa_post', 'ftm_post', 'fta_post',
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
  // const todayInfo = await axios.get('https://data.nba.net/10s/prod/v3/today.json');
  // const seasonYear = todayInfo.data.seasonScheduleYear;
  const seasonYear = dateFilters.fetchCurrentSeason();
  const seasonName = dateFilters.fetchSeasonName(date);
  const week = dateFilters.fetchGmWk(date, seasonYear, seasonName);
  const weekArray = dateFilters.fetchGmWkArrays(week, seasonYear, seasonName, date);

  knex("schedule as s")
    .leftJoin("odds_sportsbook as odds", "s.gcode", '=', "odds.gcode")
    .where('s.gweek', week - 1)
    .where('s.season_year', seasonYear)
    .where('s.season_name', seasonName)
    .select('odds.*', 's.id', 's.gid', 's.gcode', 's.gdte', 's.etm', 's.gweek', 's.h', 's.v', 's.stt', 's.bovada_url')
    .orderBy('s.etm')
    .then(async (games) => {
      // console.log('games are ', games);
      const teamStats = await knex("teams_full_base");
      res.send({
        week: week,
        weekArray: weekArray,
        weekGames: games,
        teamStats
      })
    });
});

router.get("/api/fetchGames/:day", async (req, res, next) => {
  knex("schedule as s")
    .leftJoin("odds_sportsbook as odds", "s.gcode", '=', "odds.gcode")
    .where('s.gdte', req.params.day)
    .select('odds.*', 's.id', 's.gid', 's.gcode', 's.gdte', 's.etm', 's.gweek', 's.h', 's.v', 's.stt')
    .orderBy('s.etm')
    .then(async (games) => {
      res.send({
        dayGames: games
      })
    });
})

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

  let fullPlayerData = sortedRotPlayers.map(player => {
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

    sigEntries = gameEntries
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

    sigExits = gameExits
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

module.exports = router;
