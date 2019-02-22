const express = require("express");
const router = express.Router();
const axios = require("axios");
const knex = require("../db/knex");
const schedule = require("node-schedule");
const moment = require("moment");
const cheerio = require('cheerio');
const _ = require('lodash');

const updateTeamStats = require("../modules/updateTeamStats");
const updatePlayerStats = require("../modules/updatePlayerStats");
const dbBuilders = require("../modules/dbBuilders");
const dbMappers = require("../modules/dbMappers");
const dateFilters = require("../modules/dateFilters");
const teamLookup = require("../modules/teamLookup");
const oddsLoaders = require("../modules/oddsLoaders");

const sampleBoxScoreQ1active = require('../modules/boxScoreResponse_q1_active.json');

const startPeriodSec = require('../modules/startPeriodSec');
const getGameSecs = require('../modules/getGameSecs');
const emptyTotalsObj = require('../modules/boxScoreHelpers/emptyTotalsObj');

// remove these after more testing
const buildGameStints = require("../modules/buildGameStints");
const webScrapeHelpers = require("../modules/webScrapeHelpers");

let now = moment().format('YYYY-MM-DD');

setInterval(()=>{
  oddsLoaders.sportsbookFull();
  oddsLoaders.sportsbookFirstH();
  oddsLoaders.sportsbookFirstQ();
}, 200000);
setInterval(()=>{oddsLoaders.sportsbookThirdQ()}, 30000);
setInterval(()=>{oddsLoaders.sportsbookSecondH()}, 30000);

// setTimeout(async ()=>{
//   const gameStintsA = await knex("player_game_stints")
//     .where("gdte", ">", "2019-01-15")
//     .andWhere((builder)=> {
//       builder.whereIn('team_id', [1610612740, 1610612754]).whereIn('player_id', impPlayerArray)
//     });
//
//   console.log(gameStintsA);
// }, 2000)

/* GET home page. */
router.get("/", (req, res, next) => {
  console.log('hello');

  res.send({ Hi: "there" });
});

router.get("/api/fetchPlayerData/:pid", async (req, res, next) => {
  const pid = req.params.pid;

  const mappedData = await knex("player_data as pd")
    .innerJoin("teams as t", "pd.team_id", "=", "t.tid")
    .where({player_id: pid})
    .select("t.color", "t.color_2", "pd.*");

  const gameStints = await knex("player_game_stints as pgs")
    .innerJoin("schedule as s", "pgs.gid", "=", "s.gid")
    .where('pgs.player_id', pid)
    .orderBy('s.gid', 'desc')
    .select('s.*', "pgs.game_stints");

  res.send({
    gameStints: gameStints,
    mappedData: mappedData[0]
  });
})

router.get("/fetchBoxScore/:date/:gid", async (req, res, next) => {
  const { gid, date } = req.params;
  const url = `https://data.nba.net/prod/v1/${date}/00${gid}_boxscore.json`;
  const boxScore = await axios.get(url);
  // let gid = 21800862;
  // let boxScore = {
  //   data: sampleBoxScoreQ1active
  // };

  if (!boxScore.data.stats) {
    res.send ({
      gid: gid,
      active: false
    })
    return;
  }

  // console.log('boxScore basicGameData for ', gid, ' is ', boxScore.data.basicGameData);

  let { period, clock, isGameActivated } = boxScore.data.basicGameData;
  const hTid = boxScore.data.basicGameData.hTeam.teamId;
  const vTid = boxScore.data.basicGameData.vTeam.teamId;

  if (clock.length < 1) {
    clock = '0:00';
  };

  let gameSecs = getGameSecs(period.current-1, clock);

  const calcPoss = (fga, to, fta, oreb) => {
    return (0.96*((fga+to+(0.44*fta)-oreb)));
  };

  const calcGamePace = (poss, per, gameSecs) => {
    if (per < 5) {
      return (((2880/gameSecs)*poss)/2)
    } else {
      return (((2880 + (300*(per-4)))*poss)/2)
    }
  }

  const calcFgPct = (fgm, fga) => {
    return (((fgm/fga)*100).toFixed(1));
  }

  // console.log('period is ', period);

  let { hTeam, vTeam, activePlayers } = boxScore.data.stats;

  let poss = calcPoss(
    (parseInt(hTeam.totals.fga) + parseInt(vTeam.totals.fga)),
    (parseInt(hTeam.totals.turnovers) + parseInt(vTeam.totals.turnovers)),
    (parseInt(hTeam.totals.fta) + parseInt(vTeam.totals.fta)),
    (parseInt(hTeam.totals.offReb) + parseInt(vTeam.totals.offReb)));
  let hFgPct = calcFgPct(hTeam.totals.fgm, hTeam.totals.fga);
  let vFgPct = calcFgPct(vTeam.totals.fgm, vTeam.totals.fga);


  let hPlayers = activePlayers.filter(player => {
    return (player.teamId === hTid && player.isOnCourt)
  }).map(active => active.personId);

  let vPlayers = activePlayers.filter(player => {
    return (player.teamId === hTid && player.isOnCourt)
  }).map(active => active.personId);

  // this is the obj that sends back the current totals every 5 seconds when the req is sent
  let totalsObj = {
    h: {
      pts: hTeam.totals.points,
      fgm: hTeam.totals.fgm,
      fga: hTeam.totals.fga,
      fgPct: calcFgPct(hTeam.totals.fgm, hTeam.totals.fga),
      fta: hTeam.totals.fta,
      to: hTeam.totals.turnovers,
      offReb: hTeam.totals.offReb,
      fouls: hTeam.totals.pFouls
    },
    v: {
      pts: vTeam.totals.points,
      fgm: vTeam.totals.fgm,
      fga: vTeam.totals.fga,
      fgPct: calcFgPct(vTeam.totals.fgm, vTeam.totals.fga),
      fta: vTeam.totals.fta,
      to: vTeam.totals.turnovers,
      offReb: vTeam.totals.offReb,
      fouls: vTeam.totals.pFouls
    },
    t: {
      pts: parseInt(hTeam.totals.points) + parseInt(vTeam.totals.points),
      fgm: parseInt(hTeam.totals.fgm) + parseInt(vTeam.totals.fgm),
      fga: parseInt(hTeam.totals.fga) + parseInt(vTeam.totals.fga),
      fgPct: calcFgPct((hTeam.totals.fgm + vTeam.totals.fgm), (hTeam.totals.fga + vTeam.totals.fga)),
      fta: parseInt(hTeam.totals.fta) + parseInt(vTeam.totals.fta),
      to: parseInt(hTeam.totals.turnovers) + parseInt(vTeam.totals.turnovers),
      offReb: parseInt(hTeam.totals.offReb) + parseInt(vTeam.totals.offReb),
      fouls: parseInt(hTeam.totals.pFouls) + parseInt(vTeam.totals.pFouls),
      poss: poss,
      pace: calcGamePace(poss, period.current, gameSecs)
    }
  };

  prevTotals = await knex("box_scores_v2").where({gid: gid}).select('totals');

  // for testing
  q1DataPull = [];
  q1Pull = [];

  if (parseInt(gid) === 21800871 || parseInt(gid) === 21800872) {
    q1DataPull = await knex("box_scores_v2").where({gid: gid}).select('q1');
    q1Pull = q1DataPull[0].q1[0];
  }

  let totalsObjv4 = await knex("box_scores_v2").where({gid: gid}).select('totals');
  console.log('totals obj for ', gid , ' is ', totalsObjv4[0]);

  // this is the fn that subtract current totals from stored prevTotals values
  let quarterObj = async () => {
    prevTotals = await knex("box_scores_v2").where({gid: gid}).select('totals');
    return {
      h: {
        pts: parseInt(hTeam.totals.points) - prevTotals[0].totals[0].h.pts,
        fgm: parseInt(hTeam.totals.fgm) - prevTotals[0].totals[0].h.fgm,
        fga: parseInt(hTeam.totals.fga) - prevTotals[0].totals[0].h.fga,
        fgPct: calcFgPct((parseInt(hTeam.totals.fgm)-prevTotals[0].totals[0].h.fgm), (parseInt(hTeam.totals.fga) - prevTotals[0].totals[0].h.fga)),
        fta: parseInt(hTeam.totals.fta) - prevTotals[0].totals[0].h.fta,
        to: parseInt(hTeam.totals.turnovers) - prevTotals[0].totals[0].h.to,
        offReb: parseInt(hTeam.totals.offReb) - prevTotals[0].totals[0].h.offReb,
        fouls: parseInt(hTeam.totals.pFouls) - prevTotals[0].totals[0].h.fouls
      },
      v: {
        pts: parseInt(vTeam.totals.points) - prevTotals[0].totals[0].v.pts,
        fgm: parseInt(vTeam.totals.fgm) - prevTotals[0].totals[0].v.fgm,
        fga: parseInt(vTeam.totals.fga) - prevTotals[0].totals[0].v.fga,
        fgPct: calcFgPct((parseInt(vTeam.totals.fgm)-prevTotals[0].totals[0].v.fgm), (parseInt(vTeam.totals.fga) - prevTotals[0].totals[0].v.fga)),
        fta: parseInt(vTeam.totals.fta) - prevTotals[0].totals[0].v.fta,
        to: parseInt(vTeam.totals.turnovers) - prevTotals[0].totals[0].v.to,
        offReb: parseInt(vTeam.totals.offReb) - prevTotals[0].totals[0].v.offReb,
        fouls: parseInt(vTeam.totals.pFouls) - prevTotals[0].totals[0].v.fouls
      },
      t: {
        pts: (hTeam.totals.points + vTeam.totals.points) - prevTotals[0].totals[0].t.pts,
        fgm: (hTeam.totals.fgm + vTeam.totals.fgm) - prevTotals[0].totals[0].t.fgm,
        fga: (hTeam.totals.fga + vTeam.totals.fga) - prevTotals[0].totals[0].t.fga,
        fgPct: calcFgPct(
          ((hTeam.totals.fgm + vTeam.totals.fgm) - prevTotals[0].totals[0].t.fgm),
          ((hTeam.totals.fga + vTeam.totals.fga) - prevTotals[0].totals[0].t.fga)
        ),
        fta: (hTeam.totals.fta + vTeam.totals.fta) - prevTotals[0].totals[0].t.fta,
        to: (hTeam.totals.turnovers + vTeam.totals.turnovers) - prevTotals[0].totals[0].t.to,
        offReb: (hTeam.totals.offReb + vTeam.totals.offReb) - prevTotals[0].totals[0].t.offReb,
        fouls: (hTeam.totals.pFouls + vTeam.totals.pFouls) - prevTotals[0].totals[0].t.fouls,
        poss: poss - prevTotals[0].totals[0].poss,
        pace: ( ( (poss - prevTotals[0].totals[0].poss) * 4) / 2)
      }
    }
  }

    if (period.isEndOfPeriod) {
      console.log('end of period, current period is ', period.current);
      if (period.current === 1) {
        let q1 = totalsObj;
        gameSecs = getGameSecs((period.current-1), clock);
        knex("box_scores_v2").where({gid: gid}).then(entry => {
          if (!entry[0]) {
            knex("box_scores_v2").insert({
              gid: gid,
              h_tid: hTid,
              v_tid: vTid,
              period_updated: 1,
              clock_last_updated: gameSecs,
              totals: [q1],
              q1: [q1],
              updated_at: new Date()
            }).then(inserted => {
              res.send({
                quarterEnd: true,
                live: true,
                clock: clock,
                gameSecs: gameSecs,
                period: period,
                thru_period: 1,
                poss: poss,
                pace: calcGamePace(poss, period.current, gameSecs),
                totals: totalsObj,
                quarter: q1
              })
            })
          } else {
            console.log('first period already entered in gid ', gid);
          }
        })
      } else if (period.current === 2) {
        if (prevTotals.length > 0) {
          let q2 = quarterObj();
          gameSecs = getGameSecs(period.current-1, clock);
          knex("box_scores_v2").where({gid: gid}).update({
            period_updated: 2,
            clock_last_updated: gameSecs,
            totals: [totalsObj],
            q2: [q2],
            updated_at: new Date()
          }, '*').then(inserted => {
            console.log('inserted is ', inserted);
            res.send({
              quarterEnd: true,
              live: true,
              clock: clock,
              gameSecs: gameSecs,
              period: period,
              thru_period: 2,
              poss: poss,
              pace: calcGamePace(poss, period.current, gameSecs),
              totals: totalsObj,
              quarter: q2
            })
          })
        } else {
          console.log(period.current, ' has ended but no prevTotals Obj found');
        }
      } else if (period.current === 3) {
        if (prevTotals.length > 0) {
          let q3 = quarterObj();
          gameSecs = getGameSecs(period.current-1, clock);
          knex("box_scores_v2").where({gid: gid}).update({
            period_updated: 3,
            clock_last_updated: gameSecs,
            totals: [totalsObj],
            q3: [q3],
            updated_at: new Date()
          }, '*').then(inserted => {
            console.log('inserted is ', inserted);
            res.send({
              quarterEnd: true,
              live: true,
              clock: clock,
              gameSecs: gameSecs,
              period: period,
              thru_period: 3,
              poss: poss,
              pace: calcGamePace(poss, period.current, gameSecs),
              totals: totalsObj,
              quarter: q3
            })
          })
        } else {
          console.log(period.current, ' has ended but no prevTotals Obj found');
        }
      } else if (period.current === 4 ) {
        if (prevTotals.length > 0) {
          let q4 = quarterObj();
          gameSecs = getGameSecs(period.current-1, clock);
          knex("box_scores_v2").where({gid: gid}).update({
            period_updated: 4,
            clock_last_updated: gameSecs,
            totals: [totalsObj],
            q3: [q4],
            updated_at: new Date()
          }, '*').then(inserted => {
            console.log('inserted is ', inserted);
            res.send({
              quarterEnd: true,
              live: true,
              clock: clock,
              gameSecs: gameSecs,
              period: period,
              thru_period: 4,
              poss: poss,
              pace: calcGamePace(poss, period.current, gameSecs),
              totals: totalsObj,
              quarter: q4
            })
          })
        } else {
          console.log(period.current, ' has ended but no prevTotals Obj found');
        }
      }
    } else {
      if (!isGameActivated) {
        res.send({
          quarterEnd: false,
          live: false,
          clock: clock,
          gameSecs: gameSecs,
          period: period,
          thru_period: period.current,
          poss: poss,
          pace: calcGamePace(poss, period.current, gameSecs),
          totals: totalsObj,
          final: true
        })
      } else {
        res.send({
          quarterEnd: false,
          live: true,
          clock: clock,
          gameSecs: gameSecs,
          period: period,
          thru_period: period.current - 1,
          poss: poss,
          pace: calcGamePace(poss, period.current, gameSecs),
          totals: totalsObj,
          q1: q1Pull
        })
      }
    }
})

router.get("/fetchStarters", (req, res, next) => {
  axios.get('https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2018/scores/gamedetail/0021800848_gamedetail.json').then(game => {
    const h = game.data.g.hls;
    const v = game.data.g.vls;
    const home = {
      tid: h.tid,
      starters: h.pstsg.slice(0,5).map(player => player.pid),
      bench: h.pstsg.slice(5, h.pstsg.length).map(player => player.pid)
    };

    const vis = {
      tid: v.tid,
      starters: v.pstsg.slice(0,5).map(player => player.pid),
      bench: v.pstsg.slice(5, v.pstsg.length).map(player => player.pid)
    };

    const rosters = {
      h: home,
      v: vis
    };

    console.log(rosters)
  })
})

router.get("/api/getPlayerMetadata", async (req, res, next) => {
  let players = await knex("player_data")
    .orderBy('min_full', 'desc')
    .select('player_id', 'player_name', 'team_abbreviation', 'min_full', 'net_rtg_full');

  res.send({players});
})

router.get("/api/getNetRatings", (req, res, next) => {
  knex("team_net_ratings").then(netRatings => {
    res.send(netRatings);
  });
});

router.get("/api/fetchWeek/:date", (req, res, next) => {
  const week = dateFilters.fetchGmWk(req.params.date);
  const weekArray = dateFilters.fetchGmWkArrays(week);
  knex("schedule as s")
    // do a leftJoin here, not an innerJoin; otherwise if there are no odds, no games are returned
    .leftJoin("odds_sportsbook as odds", "s.gcode", '=', "odds.gcode")
    .where('s.gweek', week)
    .select('odds.*', 's.id', 's.gid', 's.gcode', 's.gdte', 's.etm', 's.gweek', 's.h', 's.v', 's.stt')
    .orderBy('s.etm')
    .then(games => {
      res.send({
        week: week,
        weekArray: weekArray,
        weekGames: games
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
  const hInfo = await knex("teams").where({tid: h});
  const vInfo = await knex("teams").where({tid: v});
  const matchups = await knex("schedule")
    .where('gcode', 'like', `%${hAbb}${vAbb}%`)
    .orWhere('gcode', 'like', `%${vAbb}${hAbb}%`);
  const hPlayers = await knex("player_data as pd")
    .leftJoin("players_on_off as po", "pd.player_id", "=", "po.player_id")
    .where("pd.team_id", "=", h)
    .orderBy("pd.min_full");
  const vPlayers = await knex("player_data as pd")
    .leftJoin("players_on_off as po", "pd.player_id", "=", "po.player_id")
    .where("pd.team_id", "=", v)
    .orderBy("pd.min_full");

  // const gameStints = await knex("player_game_stints")
  //   .where({team_id: h})
  //   .orWhere({team_id: v})

  // use this fn to sort by on/off court net rtg differential, which is 9th index
  const DoubleArraySort = (a, b) => {
    if (a[9] < b[9]) {return 1};
    if (b[9] < a[9]) {return -1};
    return 0;
  }

  const impactPlayers = hPlayers.concat(vPlayers)
  .filter(player => player.mp_pct > 0.2)
  .map(player => {
    return [player.player_id, player.player_name, player.min_l15, player.net_rtg_full, player.off_rtg_full, player.def_rtg_full, player.pace_full, player.team_offRtg_delta, player.opp_offRtg_delta, player.netRtg_delta];
  })
  .sort(DoubleArraySort);

  const impPlayerArray = impactPlayers.map(player => player[0]);

  const monthPlusAgo = moment().subtract(45, 'days').format('YYYY-MM-DD');

  const gameStints = await knex("player_game_stints")
    .where("gdte", ">", monthPlusAgo)
    .andWhere(buildOne => {
      buildOne.whereIn('team_id', [h, v])
    })
    .andWhere(buildTwo => {
      buildTwo.whereIn('player_id', impPlayerArray)
    })
    .orderBy('gdte', 'desc');

  const impPlayerObj = {};

  impPlayerArray.forEach(player => {
    const stints = gameStints.filter(stint => stint.player_id === player);
    const allEntries = [];
    const allExits = [];
    stints.forEach(game => {
      const gameEntries = [];
      const gameExits = [];
      game.game_stints.forEach(stretch => {
        gameEntries.push(parseInt(stretch[0]));
        gameExits.push(parseInt(stretch[1]));
      })
      allEntries.push(gameEntries);
      allExits.push(gameExits);
    })

    // entries.sort();
    // exits.sort();
    impPlayerObj[`pid_${player}`] = {
      entries: allEntries,
      exits: allExits
    }
  })

  console.log(impPlayerObj['pid_201571'].entries);

  res.send({
    info: game[0],
    odds: odds[0],
    hTen: hSched,
    vTen: vSched,
    matchups: matchups,
    hNetRtg: hNetRtg[0],
    vNetRtg: vNetRtg[0],
    hPace: hPace[0],
    vPace: vPace[0],
    hInfo: hInfo[0],
    vInfo: vInfo[0],
    hPlayers: hPlayers,
    vPlayers: vPlayers
  });


})




const timedDbUpdaters = schedule.scheduleJob("13 04 * * *", () => {
  setTimeout(()=>{updateTeamStats.updateFullTeamBuilds()}, 1000);
  setTimeout(()=>{updateTeamStats.updateStarterBuilds()}, 60000);
  setTimeout(()=>{updateTeamStats.updateBenchBuilds()}, 120000);
  setTimeout(()=>{updateTeamStats.updateQ1Builds()}, 180000);
  setTimeout(()=>{updateTeamStats.updateQ2Builds()}, 240000);
  setTimeout(()=>{updateTeamStats.updateQ3Builds()}, 300000);
  setTimeout(()=>{updateTeamStats.updateQ4Builds()}, 360000);
  setTimeout(()=>{updatePlayerStats.updatePlayerStatBuilds()}, 420000);
  setTimeout(()=>{dbBuilders.updateSchedule()}, 480000);
  setTimeout(()=>{dbMappers.mapTeamNetRatings()}, 540000);
  setTimeout(()=>{dbMappers.mapTeamPace()}, 600000);
  setTimeout(()=>{dbMappers.mapFullPlayerData()}, 660000);
  setTimeout(()=>{dbMappers.mapSegmentedPlayerData()}, 720000);
  setTimeout(()=>{dbBuilders.addGameStints()}, 780000);
})



module.exports = router;
