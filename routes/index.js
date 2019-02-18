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

setInterval(()=>{console.log(startPeriodSec(2))}, 1000);

// remove this after more testing
const buildGameStints = require("../modules/buildGameStints");

let now = moment().format('YYYY-MM-DD');

// setInterval(()=>{
//   oddsLoaders.sportsbookFull();
//   oddsLoaders.sportsbookFirstH();
//   oddsLoaders.sportsbookFirstQ();
// }, 200000);
// setInterval(()=>{oddsLoaders.sportsbookThirdQ()}, 30000);
// setInterval(()=>{oddsLoaders.sportsbookSecondH()}, 30000);

// setTimeout(()=>{
//   dbBuilders.buildGameStintsDb();
// }, 3000)

// setTimeout(()=>{
//   buildGameStints.buildSubData(21800048);
// }, 1000)


// more bets: 'https://www.sportsbook.ag/sbk/sportsbook4/live-betting-betting/home.sbk#moreBetsX2200-1300-Laker-Pacer-020519'

/* GET home page. */
router.get("/", (req, res, next) => {
  console.log('hello');


  res.send({ Hi: "there" });
});

router.get("/gameWatcher", (req, res, next) => {
  knex("schedule").where({gdte: now}).then(todayGames => {
    // are these box scores active in-game? otherwise how can I get this data?
    // https://data.nba.net/prod/v1/20190212/0021800848_boxscore.json
    console.log('watching game');
  })
})

router.get("/fetchBoxScore/:date/:gid", async (req, res, next) => {
  const { gid, date } = req.params;
  const url = `https://data.nba.net/prod/v1/${date}/00${gid}_boxscore.json`;
  const boxScore = await axios.get(url);
  // let gid = 21800862;
  // let boxScore = {
  //   data: sampleBoxScoreQ1active
  // };

  let { period, clock } = boxScore.data.basicGameData;
  let hTid = boxScore.data.basicGameData.hTeam.teamId;
  let vTid = boxScore.data.basicGameData.vTeam.teamId;

  const calcPoss = (fga, to, fta, oreb) => {
    return (0.96*((fga+to+(0.44*fta)-oreb)));
  };

  const calcFgPct = (fgm, fga) => {
    return (((fgm/fga)*100).toFixed(1));
  }

  console.log('period is ', period);
  // period.isEndOfPeriod = true;

  // if (period.current === 0) {
  //   console.log(gid, ' has not started');
  // } else {
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

    let hStats = {
      fgm: hTeam.totals.fgm,
      fga: hTeam.totals.fga,
      fgPct: hFgPct,
      points: hTeam.totals.points,
      fouls: hTeam.totals.pFouls,
      activePlayers: hPlayers,
    };

    let vStats = {
      fgm: vTeam.totals.fgm,
      fga: vTeam.totals.fga,
      fgPct: vFgPct,
      points: vTeam.totals.points,
      fouls: vTeam.totals.pFouls,
      activePlayers: vPlayers
    };

    let first_q_Obj = {
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
      totals: {
        pts: hTeam.totals.points + vTeam.totals.points,
        fgm: hTeam.totals.fgm + vTeam.totals.fgm,
        fga: hTeam.totals.fga + vTeam.totals.fga,
        fgPct: calcFgPct((hTeam.totals.fgm + vTeam.totals.fgm), (hTeam.totals.fga + vTeam.totals.fga)),
        fta: hTeam.totals.fta + vTeam.totals.fta,
        to: hTeam.totals.turnovers + vTeam.totals.turnovers,
        offReb: hTeam.totals.offReb + vTeam.totals.offReb,
        fouls: hTeam.totals.pFouls + vTeam.totals.pFouls,
        poss: poss,
        pace: ((poss*4)/2)
      }
    };


    if (period.isEndOfPeriod) {
      console.log('end of period, current period is ', period.current);
      if (period.current === 1) {
        knex("box_scores_v2").where({gid: gid}).then(entry => {
          if (!entry[0]) {
            knex("box_scores_v2").insert({
              gid: gid,
              h_tid: hTid,
              v_tid: vTid,
              period_updated: 1,
              clock_last_updated: clock,
              totals: [first_q_Obj],
              q1: [first_q_Obj],
              updated_at: new Date()
            }).then(inserted => {
              res.send({
                msg: `Q1 end`,
                clock: clock,
                period: period,
                thru_period: 1,
                poss: poss,
                hStats: hStats,
                vStats: vStats,
                insertedStats: inserted
              })
            })
          }
        })


        knex("box_scores").where({gid: gid}).then(entry => {
          if (!entry[0]) {
            knex("box_scores").insert({
              gid: gid,
              h_1q_pts: hTeam.totals.points,
              h_1q_fga: hTeam.totals.fga,
              h_1q_fgm: hTeam.totals.fgm,
              h_1q_fg_pct: hFgPct,
              h_1q_fta: hTeam.totals.fta,
              h_1q_to: hTeam.totals.turnovers,
              h_1q_off_reb: hTeam.totals.offReb,
              h_1q_fouls: hTeam.totals.pFouls,
              v_1q_pts: vTeam.totals.points,
              v_1q_fga: vTeam.totals.fga,
              v_1q_fgm: vTeam.totals.fgm,
              v_1q_fg_pct: vFgPct,
              v_1q_fta: vTeam.totals.fta,
              v_1q_to: vTeam.totals.turnovers,
              v_1q_off_reb: vTeam.totals.offReb,
              v_1q_fouls: vTeam.totals.pFouls,
              h_total_pts: hTeam.totals.points,
              h_total_fga: hTeam.totals.fga,
              h_total_fgm: hTeam.totals.fgm,
              h_total_fg_pct: hFgPct,
              h_total_fta: hTeam.totals.fta,
              h_total_to: hTeam.totals.turnovers,
              h_total_off_reb: hTeam.totals.offReb,
              h_total_fouls: hTeam.totals.pFouls,
              v_total_pts: vTeam.totals.points,
              v_total_fga: vTeam.totals.fga,
              v_total_fgm: vTeam.totals.fgm,
              v_total_fg_pct: vFgPct,
              v_total_fta: vTeam.totals.fta,
              v_total_to: vTeam.totals.turnovers,
              v_total_off_reb: vTeam.totals.offReb,
              v_total_fouls: vTeam.totals.pFouls,
              period_updated: 1,
              updated_at: new Date()
            }, '*').then(inserted => {
              console.log('inserted is ', inserted);
              res.send({
                msg: `Q1 end`,
                clock: clock,
                period: period,
                thru_period: 1,
                poss: poss,
                hStats: hStats,
                vStats: vStats,
                insertedStats: inserted
              })
            })
          } else {
            console.log('1Q period has already been entered');
            return;
          }
        })
      } else if (period.current === 2) {
        let q1Stats = await knex("box_scores").where({gid: gid});

        let obj2q = {
          h_pts: parseInt(hTeam.totals.points) - q1Stats[0].h_1q_pts,
          h_fga: parseInt(hTeam.totals.fga) - q1Stats[0].h_1q_fga,
          h_fgm: parseInt(hTeam.totals.fgm) - q1Stats[0].h_1q_fgm,
          h_fg_pct: calcFgPct((parseInt(hTeam.totals.fgm)-q1Stats[0].h_1q_fgm), (parseInt(hTeam.totals.fga) - q1Stats[0].h_1q_fga)),
          h_fta: parseInt(hTeam.totals.fta) - q1Stats[0].h_1q_fta,
          h_to: parseInt(hTeam.totals.turnovers) - q1Stats[0].h_1q_to,
          h_off_reb: parseInt(hTeam.totals.offReb) - q1Stats[0].h_1q_off_reb,
          h_fouls: parseInt(hTeam.totals.pFouls) - q1Stats[0].h_1q_fouls,
          v_pts: parseInt(vTeam.totals.points) - q1Stats[0].v_1q_pts,
          v_fga: parseInt(vTeam.totals.fga) - q1Stats[0].v_1q_fga,
          v_fgm: parseInt(vTeam.totals.fgm) - q1Stats[0].v_1q_fgm,
          v_fg_pct: calcFgPct((parseInt(vTeam.totals.fgm)-q1Stats[0].v_1q_fgm), (parseInt(vTeam.totals.fga) - q1Stats[0].v_1q_fga)),
          v_ftas: parseInt(vTeam.totals.fta) - q1Stats[0].v_1q_fta,
          v_to: parseInt(vTeam.totals.turnovers) - q1Stats[0].v_1q_to,
          v_off_reb: parseInt(vTeam.totals.offReb) - q1Stats[0].v_1q_off_reb,
          v_fouls: parseInt(vTeam.totals.pFouls) - q1Stats[0].v_1q_fouls
        }

        // _.forOwn(obj2q, (value, key) => {
        //   console.log('key is ', key, ' value is ', value);
        // });

        // _.forOwn(updating, (value, key) => {
        //   console.log('key is ', key, ' value is ', value, ' typeof value is ', typeof(value));
        // });

        knex("box_scores").where({gid: gid}).update({
          h_2q_pts: obj2q.h_pts,
          h_2q_fga: obj2q.h_fga,
          h_2q_fgm: obj2q.h_fgm,
          h_2q_fg_pct: obj2q.h_fg_pct,
          h_2q_fta: obj2q.h_fta,
          h_2q_to: obj2q.h_to,
          h_2q_off_reb: obj2q.h_off_reb,
          h_2q_fouls: obj2q.h_fouls,
          v_2q_pts: obj2q.v_pts,
          v_2q_fga: obj2q.v_fga,
          v_2q_fgm: obj2q.v_fgm,
          v_2q_fg_pct: obj2q.v_fg_pct,
          v_2q_fta: obj2q.v_fta,
          v_2q_to: obj2q.v_to,
          v_2q_off_reb: obj2q.v_off_reb,
          v_2q_fouls: obj2q.v_fouls,
          h_total_pts: hTeam.totals.points,
          h_total_fga: hTeam.totals.fga,
          h_total_fgm: hTeam.totals.fgm,
          h_total_fg_pct: hFgPct,
          h_total_fta: hTeam.totals.fta,
          h_total_to: hTeam.totals.turnovers,
          h_total_off_reb: hTeam.totals.offReb,
          h_total_fouls: hTeam.totals.pFouls,
          v_total_pts: vTeam.totals.points,
          v_total_fga: vTeam.totals.fga,
          v_total_fgm: vTeam.totals.fgm,
          v_total_fg_pct: vFgPct,
          v_total_fta: vTeam.totals.fta,
          v_total_to: vTeam.totals.turnovers,
          v_total_off_reb: vTeam.totals.offReb,
          v_total_fouls: vTeam.totals.pFouls,
          period_updated: 2,
          updated_at: new Date()
        }, '*').then(inserted => {
          console.log('inserted is ', inserted);
          res.send({
            msg: `Q2 end`,
            clock: clock,
            period: period,
            thru_period: 2,
            poss: poss,
            hStats: hStats,
            vStats: vStats,
            insertedStats: inserted
          })
        })
      } else if (period.current === 3) {
        let thruQ2 = await knex("box_scores").where({gid: gid});

        let obj3q = {
          h_pts: parseInt(hTeam.totals.points) - thruQ2[0].h_total_pts,
          h_fga: parseInt(hTeam.totals.fga) - thruQ2[0].h_total_fga,
          h_fgm: parseInt(hTeam.totals.fgm) - thruQ2[0].h_total_fgm,
          h_fg_pct: calcFgPct((parseInt(hTeam.totals.fgm)-thruQ2[0].h_total_fgm), (parseInt(hTeam.totals.fga) - thruQ2[0].h_total_fga)),
          h_fta: parseInt(hTeam.totals.fta) - thruQ2[0].h_total_fta,
          h_to: parseInt(hTeam.totals.turnovers) - thruQ2[0].h_total_to,
          h_off_reb: parseInt(hTeam.totals.offReb) - thruQ2[0].h_total_off_reb,
          h_fouls: parseInt(hTeam.totals.pFouls) - thruQ2[0].h_total_fouls,
          v_pts: parseInt(vTeam.totals.points) - thruQ2[0].v_total_pts,
          v_fga: parseInt(vTeam.totals.fga) - thruQ2[0].v_total_fga,
          v_fgm: parseInt(vTeam.totals.fgm) - thruQ2[0].v_total_fgm,
          v_fg_pct: calcFgPct((parseInt(vTeam.totals.fgm)-thruQ2[0].v_total_fgm), (parseInt(vTeam.totals.fga) - thruQ2[0].v_total_fga)),
          v_ftas: parseInt(vTeam.totals.fta) - thruQ2[0].v_total_fta,
          v_to: parseInt(vTeam.totals.turnovers) - thruQ2[0].v_total_to,
          v_off_reb: parseInt(vTeam.totals.offReb) - thruQ2[0].v_total_off_reb,
          v_fouls: parseInt(vTeam.totals.pFouls) - thruQ2[0].v_total_fouls
        }

        knex("box_scores").where({gid: gid}).update({
          h_3q_pts: obj3q.h_pts,
          h_3q_fga: obj3q.h_fga,
          h_3q_fgm: obj3q.h_fgm,
          h_3q_fg_pct: obj3q.h_fg_pct,
          h_3q_fta: obj3q.h_fta,
          h_3q_to: obj3q.h_to,
          h_3q_off_reb: obj3q.h_off_reb,
          h_3q_fouls: obj3q.h_fouls,
          v_3q_pts: obj3q.v_pts,
          v_3q_fga: obj3q.v_fga,
          v_3q_fgm: obj3q.v_fgm,
          v_3q_fg_pct: obj3q.v_fg_pct,
          v_3q_fta: obj3q.v_fta,
          v_3q_to: obj3q.v_to,
          v_3q_off_reb: obj3q.v_off_reb,
          v_3q_fouls: obj3q.v_fouls,
          h_total_pts: hTeam.totals.points,
          h_total_fga: hTeam.totals.fga,
          h_total_fgm: hTeam.totals.fgm,
          h_total_fg_pct: hFgPct,
          h_total_fta: hTeam.totals.fta,
          h_total_to: hTeam.totals.turnovers,
          h_total_off_reb: hTeam.totals.offReb,
          h_total_fouls: hTeam.totals.pFouls,
          v_total_pts: vTeam.totals.points,
          v_total_fga: vTeam.totals.fga,
          v_total_fgm: vTeam.totals.fgm,
          v_total_fg_pct: vFgPct,
          v_total_fta: vTeam.totals.fta,
          v_total_to: vTeam.totals.turnovers,
          v_total_off_reb: vTeam.totals.offReb,
          v_total_fouls: vTeam.totals.pFouls,
          period_updated: 2,
          updated_at: new Date()
        }, '*').then(inserted => {
          console.log('inserted is ', inserted);
          res.send({
            msg: `Q3 end`,
            clock: clock,
            period: period,
            thru_period: 3,
            poss: poss,
            hStats: hStats,
            vStats: vStats,
            insertedStats: inserted,
            prevStats: thruQ2[0]
          })
        })
      } else if (period.current === 4 ) {
        let thruQ3 = await knex("box_scores").where({gid: gid});

        let obj4q = {
          h_pts: parseInt(hTeam.totals.points) - thruQ3[0].h_total_pts,
          h_fga: parseInt(hTeam.totals.fga) - thruQ3[0].h_total_fga,
          h_fgm: parseInt(hTeam.totals.fgm) - thruQ3[0].h_total_fgm,
          h_fg_pct: calcFgPct((parseInt(hTeam.totals.fgm)-thruQ3[0].h_total_fgm), (parseInt(hTeam.totals.fga) - thruQ3[0].h_total_fga)),
          h_fta: parseInt(hTeam.totals.fta) - thruQ3[0].h_total_fta,
          h_to: parseInt(hTeam.totals.turnovers) - thruQ3[0].h_total_to,
          h_off_reb: parseInt(hTeam.totals.offReb) - thruQ3[0].h_total_off_reb,
          h_fouls: parseInt(hTeam.totals.pFouls) - thruQ3[0].h_total_fouls,
          v_pts: parseInt(vTeam.totals.points) - thruQ3[0].v_total_pts,
          v_fga: parseInt(vTeam.totals.fga) - thruQ3[0].v_total_fga,
          v_fgm: parseInt(vTeam.totals.fgm) - thruQ3[0].v_total_fgm,
          v_fg_pct: calcFgPct((parseInt(vTeam.totals.fgm)-thruQ3[0].v_total_fgm), (parseInt(vTeam.totals.fga) - thruQ3[0].v_total_fga)),
          v_ftas: parseInt(vTeam.totals.fta) - thruQ3[0].v_total_fta,
          v_to: parseInt(vTeam.totals.turnovers) - thruQ3[0].v_total_to,
          v_off_reb: parseInt(vTeam.totals.offReb) - thruQ3[0].v_total_off_reb,
          v_fouls: parseInt(vTeam.totals.pFouls) - thruQ3[0].v_total_fouls
        }

        knex("box_scores").where({gid: gid}).update({
          h_4q_pts: obj4q.h_pts,
          h_4q_fga: obj4q.h_fga,
          h_4q_fgm: obj4q.h_fgm,
          h_4q_fg_pct: obj4q.h_fg_pct,
          h_4q_fta: obj4q.h_fta,
          h_4q_to: obj4q.h_to,
          h_4q_off_reb: obj4q.h_off_reb,
          h_4q_fouls: obj4q.h_fouls,
          v_4q_pts: obj4q.v_pts,
          v_4q_fga: obj4q.v_fga,
          v_4q_fgm: obj4q.v_fgm,
          v_4q_fg_pct: obj4q.v_fg_pct,
          v_4q_fta: obj4q.v_fta,
          v_4q_to: obj4q.v_to,
          v_4q_off_reb: obj4q.v_off_reb,
          v_4q_fouls: obj4q.v_fouls,
          h_total_pts: hTeam.totals.points,
          h_total_fga: hTeam.totals.fga,
          h_total_fgm: hTeam.totals.fgm,
          h_total_fg_pct: hFgPct,
          h_total_fta: hTeam.totals.fta,
          h_total_to: hTeam.totals.turnovers,
          h_total_off_reb: hTeam.totals.offReb,
          h_total_fouls: hTeam.totals.pFouls,
          v_total_pts: vTeam.totals.points,
          v_total_fga: vTeam.totals.fga,
          v_total_fgm: vTeam.totals.fgm,
          v_total_fg_pct: vFgPct,
          v_total_fta: vTeam.totals.fta,
          v_total_to: vTeam.totals.turnovers,
          v_total_off_reb: vTeam.totals.offReb,
          v_total_fouls: vTeam.totals.pFouls,
          period_updated: 2,
          updated_at: new Date()
        }, '*').then(inserted => {
          console.log('inserted is ', inserted);
          res.send({
            msg: `Q4 end`,
            clock: clock,
            period: period,
            thru_period: 4,
            poss: poss,
            hStats: hStats,
            vStats: vStats,
            insertedStats: inserted,
            prevStats: thruQ3[0]
          })
        })

      }
    } else {
      // let q1Stats = await knex("box_scores").where({gid: gid});

      let totals = await knex("box_scores").where({gid: gid});

      res.send({
        msg: `Q${period.current} ongoing`,
        clock: clock,
        period: period,
        thru_period: 0,
        poss: poss,
        hStats: hStats,
        vStats: vStats,
        totals: totals[0]
      })
    }

})



router.get("/fetchStarters", (req, res, next) => {
  axios.get('https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2018/scores/gamedetail/0021800848_gamedetail.json').then(game => {
    let h = game.data.g.hls;
    let v = game.data.g.vls;
    let home = {
      tid: h.tid,
      starters: h.pstsg.slice(0,5).map(player => player.pid),
      bench: h.pstsg.slice(5, h.pstsg.length).map(player => player.pid)
    };

    let vis = {
      tid: v.tid,
      starters: v.pstsg.slice(0,5).map(player => player.pid),
      bench: v.pstsg.slice(5, v.pstsg.length).map(player => player.pid)
    };

    let rosters = {
      h: home,
      v: vis
    };

    console.log(rosters)
  })
})



router.get("/api/getNetRatings", (req, res, next) => {
  knex("team_net_ratings").then(netRatings => {
    res.send(netRatings);
  });
});

router.get("/api/fetchWeek/:date", (req, res, next) => {
  let week = dateFilters.fetchGmWk(req.params.date);
  let weekArray = dateFilters.fetchGmWkArrays(week);
  knex("schedule as s").innerJoin("odds_sportsbook as odds", "s.gcode", '=', "odds.gcode")
    .where('s.gweek', week)
    .orderBy('etm')
    .then(games => {
      res.send({
        week: week,
        weekArray: weekArray,
        weekGames: games
      })
    });
});

router.get("/api/fetchGame/:gid", (req, res, next) => {
  let gid = req.params.gid;
  knex("schedule").where({gid: gid}).then(game => {
    knex("odds_sportsbook").where({gcode: game[0].gcode}).then(odds => {

      let h = game[0].h[0].tid;
      let v = game[0].v[0].tid;
      let hAbb = game[0].h[0].ta;
      let vAbb = game[0].v[0].ta;

      let nineAgo = moment().subtract(8, 'days').format('YYYY-MM-DD');
      let oneAhead = moment().add(1, 'days').format('YYYY-MM-DD');

      knex("schedule")
      .where('gcode', 'like', `%${hAbb}%`)
      .whereBetween('gdte', [nineAgo, oneAhead])
      .orderBy('gdte')
      .then(hSched => {
        knex("schedule")
        .where('gcode', 'like', `%${vAbb}%`)
        .whereBetween('gdte', [nineAgo, oneAhead])
        .orderBy('gdte')
        .then(vSched => {
          knex("team_net_ratings").where({team_id: h}).then(hNetRtg => {
            knex("team_net_ratings").where({team_id: v}).then(vNetRtg => {
              knex("team_pace").where({team_id: h}).then(hPace => {
                knex("team_pace").where({team_id: v}).then(vPace => {
                  knex("teams").where({tid: h}).then(hInfo => {
                    knex("teams").where({tid: v}).then(vInfo => {
                      knex("schedule")
                      .where('gcode', 'like', `%${hAbb}${vAbb}%`)
                      .orWhere('gcode', 'like', `%${vAbb}${hAbb}%`)
                      .then(matchups => {
                        knex("player_data").where({team_id: h}).then(hPlayers => {
                          knex("player_data").where({team_id: v}).then(vPlayers => {
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
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })
})



const updateFullTeamBuilds = schedule.scheduleJob("16 14 * * *", () => {
  updateTeamStats.updateFullTeamBuilds();
})

const updateStarterBuilds = schedule.scheduleJob("17 14 * * *", () => {
  updateTeamStats.updateStarterBuilds();
})

const updateBenchBuilds = schedule.scheduleJob("18 14 * * *", () => {
  updateTeamStats.updateBenchBuilds();
})

const updateQ1Builds = schedule.scheduleJob("19 14 * * *", () => {
  updateTeamStats.updateQ1Builds();
})

const updateQ2Builds = schedule.scheduleJob("20 14 * * *", () => {
  updateTeamStats.updateQ2Builds();
})

const updateQ3Builds = schedule.scheduleJob("21 14 * * *", () => {
  updateTeamStats.updateQ3Builds();
})

const updateQ4Builds = schedule.scheduleJob("22 14 * * *", () => {
  updateTeamStats.updateQ4Builds();
})

const updateFullPlayersBuild = schedule.scheduleJob("23 14 * * *", () => {
  updatePlayerStats.updatePlayerStatBuilds();
})

const updateSchedule = schedule.scheduleJob("24 14 * * *", () => {
  dbBuilders.updateSchedule();
})

const mapTeamNetRatings = schedule.scheduleJob("25 4 * * *", () => {
  dbMappers.mapTeamNetRatings();
})

const mapTeamPace = schedule.scheduleJob("26 14 * * *", () => {
  dbMappers.mapTeamPace();
})

const mapFullPlayerData = schedule.scheduleJob("27 14 * * *", () => {
  dbMappers.mapFullPlayerData();
})

const mapSegmentedPlayerData = schedule.scheduleJob("28 14 * * *", () => {
  dbMappers.mapSegmentedPlayerData();
})

module.exports = router;
