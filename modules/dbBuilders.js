const knex = require('../db/knex');
const axios = require('axios');
const moment = require('moment');

const dateFilters = require('./dateFilters');

const leagueScheduleUrl = "https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2018/league/00_full_schedule_week.json";
let now = new Date();

module.exports = {
  fetchAdvancedParams: function (games, period) {
    return {
      MeasureType: 'Advanced',
      PerMode: 'PerGame',
      PlusMinus: 'N',
      PaceAdjust: 'N',
      Rank: 'N',
      Season: '2018-19',
      SeasonType: 'Regular Season',
      Outcome: '',
      SeasonSegment: '',
      DateFrom: '',
      DateTo: '',
      OpponentTeamID: 0,
      VsConference: '',
      VsDivision: '',
      LastNGames: games,
      Location: '',
      Period: period,
      GameSegment: '',
      Month: 0
    }
  },
  fetchLineupParams: function (games, lineup) {
    return {
      MeasureType: 'Advanced',
      PerMode: 'PerGame',
      PlusMinus: 'N',
      PaceAdjust: 'N',
      Rank: 'N',
      Season: '2018-19',
      SeasonType: 'Regular Season',
      Outcome: '',
      SeasonSegment: '',
      DateFrom: '',
      DateTo: '',
      OpponentTeamID: 0,
      VsConference: '',
      VsDivision: '',
      LastNGames: games,
      Location: '',
      Period: 0,
      GameSegment: '',
      Month: 0,
      StarterBench: lineup
    }
  },
  buildSchedule: function () {
    // This function builds out the initial schedule and should only need to be run at the beginning of each season
    axios.get(leagueScheduleUrl).then(response => {
      response.data.lscd.forEach(month => {
        month.mscd.g.forEach(game => {
          let hObj = {
            tid: game.h.tid,
            re: game.h.re,
            ta: game.h.ta,
            tn: game.h.tn,
            tc: game.h.tc,
            s: game.h.s
          };
          let vObj = {
            tid: game.v.tid,
            re: game.v.re,
            ta: game.v.ta,
            tn: game.v.tn,
            tc: game.v.tc,
            s: game.v.s
          };
          knex('schedule').insert({
            gid: game.gid,
            gcode: game.gcode,
            gdte: game.gdte,
            an: game.an,
            ac: game.ac,
            as: game.as,
            etm: game.etm,
            gweek: game.gweek,
            h: [hObj],
            v: [vObj],
            stt: game.stt,
            updated_at: new Date()
          }, '*').then(ent => {
            console.log(ent[0].gcode, ' entered in DB');
          });
        })
      })
    })
  },
  updateSchedule: function () {
    let currMonth = dateFilters.fetchScoreMonth();
    axios.get(leagueScheduleUrl).then(response => {
      response.data.lscd.slice(currMonth).forEach(month => {
        month.mscd.g.forEach(game => {
          let hObj = {
            tid: game.h.tid,
            re: game.h.re,
            ta: game.h.ta,
            tn: game.h.tn,
            tc: game.h.tc,
            s: game.h.s
          };
          let vObj = {
            tid: game.v.tid,
            re: game.v.re,
            ta: game.v.ta,
            tn: game.v.tn,
            tc: game.v.tc,
            s: game.v.s
          };
          knex('schedule').where({gid: game.gid}).update({
            h: [hObj],
            v: [vObj],
            stt: game.stt,
            updated_at: new Date()
          }).then(res => {
            console.log('game updated');
          });
        })
      })
    });
  },
  buildTeamDb: function (db, arrayData) {
    arrayData.forEach(team => {
      knex(db).insert({
        team_id: team[0],
        team_name: team[1],
        gp: team[2],
        w: team[3],
        l: team[4],
        w_pct: team[5],
        min: team[6],
        e_off_rating: team[7],
        off_rating: team[8],
        e_def_rating: team[9],
        def_rating: team[10],
        e_net_rating: team[11],
        net_rating: team[12],
        ast_pct: team[13],
        ast_to: team[14],
        ast_ratio: team[15],
        oreb_pct: team[16],
        dreb_pct: team[17],
        reb_pct: team[18],
        tm_tov_pct: team[19],
        efg_pct: team[20],
        ts_pct: team[21],
        e_pace: team[22],
        pace: team[23],
        pie: team[24],
        gp_rank: team[25],
        w_rank: team[26],
        l_rank: team[27],
        w_pct_rank: team[28],
        min_rank: team[29],
        off_rating_rank: team[30],
        def_rating_rank: team[31],
        net_rating_rank: team[32],
        ast_pct_rank: team[33],
        ast_to_rank: team[34],
        ast_ratio_rank: team[35],
        oreb_pct_rank: team[36],
        dreb_pct_rank: team[37],
        reb_pct_rank: team[38],
        tm_tov_pct_rank: team[39],
        efg_pct_rank: team[40],
        ts_pct_rank: team[41],
        pace_rank: team[42],
        pie_rank: team[43],
        cfid: team[44],
        cfparams: team[45],
        updated_at: new Date()
      }, '*').then(team =>{
        console.log(team[0].team_name, ' has been added to db');
      });
    })
  },
  updateTeamDb: function (db, arrayData) {
    arrayData.forEach(team => {
      knex(db)
        .where({team_id: team[0]})
        .update({
          gp: team[2],
          w: team[3],
          l: team[4],
          w_pct: team[5],
          min: team[6],
          e_off_rating: team[7],
          off_rating: team[8],
          e_def_rating: team[9],
          def_rating: team[10],
          e_net_rating: team[11],
          net_rating: team[12],
          ast_pct: team[13],
          ast_to: team[14],
          ast_ratio: team[15],
          oreb_pct: team[16],
          dreb_pct: team[17],
          reb_pct: team[18],
          tm_tov_pct: team[19],
          efg_pct: team[20],
          ts_pct: team[21],
          e_pace: team[22],
          pace: team[23],
          pie: team[24],
          gp_rank: team[25],
          w_rank: team[26],
          l_rank: team[27],
          w_pct_rank: team[28],
          min_rank: team[29],
          off_rating_rank: team[30],
          def_rating_rank: team[31],
          net_rating_rank: team[32],
          ast_pct_rank: team[33],
          ast_to_rank: team[34],
          ast_ratio_rank: team[35],
          oreb_pct_rank: team[36],
          dreb_pct_rank: team[37],
          reb_pct_rank: team[38],
          tm_tov_pct_rank: team[39],
          efg_pct_rank: team[40],
          ts_pct_rank: team[41],
          pace_rank: team[42],
          pie_rank: team[43],
          cfid: team[44],
          cfparams: team[45],
          updated_at: new Date()
        }, '*')
        .then(team => {
          console.log(team[0], ' has been updated in the ', db, ' db');
        })
    })
  }
}
