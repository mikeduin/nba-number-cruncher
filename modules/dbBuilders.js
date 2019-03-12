const knex = require("../db/knex");
const axios = require("axios");
const moment = require("moment");

const dateFilters = require("./dateFilters");
const buildGameStints = require("./buildGameStints");

const leagueScheduleUrl =
  "https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2018/league/00_full_schedule_week.json";
let now = new Date();

// NOTE: For future season builds, will have to change hard-coded season values in params below

module.exports = {
  fetchAdvancedPlayerParams: games => {
    return {
      DateFrom: "",
      DateTo: "",
      GameScope: "",
      GameSegment: "",
      LastNGames: games,
      LeagueID: "00",
      Location: "",
      MeasureType: "Advanced",
      Month: 0,
      OpponentTeamID: 0,
      Outcome: "",
      PaceAdjust: "N",
      PerMode: "PerGame",
      Period: 0,
      PlayerExperience: "",
      PlayerPosition: "",
      PlusMinus: "N",
      Rank: "N",
      Season: "2018-19",
      SeasonSegment: "",
      SeasonType: "Regular Season",
      StarterBench: "",
      VsConference: "",
      VsDivision: ""
    };
  },
  fetchBaseTeamParams: (games, period) => {
    return {
      Conference: "",
      Division: "",
      GameScope: "",
      PlayerExperience: "",
      PlayerNull: "",
      MeasureType: "Base",
      LeagueID: "00",
      PerMode: "PerGame",
      PlusMinus: "N",
      PaceAdjust: "N",
      Rank: "N",
      Season: "2018-19",
      SeasonType: "Regular Season",
      Outcome: "",
      SeasonSegment: "",
      DateFrom: "",
      DateTo: "",
      OpponentTeamID: 0,
      VsConference: "",
      VsDivision: "",
      LastNGames: games,
      Location: "",
      Period: period,
      GameSegment: "",
      Month: 0,
      PORound: 0,
      TeamID: 0,
      TwoWay: 0
    };
  },
  fetchAdvancedTeamParams: (games, period) => {
    return {
      MeasureType: "Advanced",
      PerMode: "PerGame",
      PlusMinus: "N",
      PaceAdjust: "N",
      Rank: "N",
      Season: "2018-19",
      SeasonType: "Regular Season",
      Outcome: "",
      SeasonSegment: "",
      DateFrom: "",
      DateTo: "",
      OpponentTeamID: 0,
      VsConference: "",
      VsDivision: "",
      LastNGames: games,
      Location: "",
      Period: period,
      GameSegment: "",
      Month: 0
    };
  },
  fetchLineupParams: (games, lineup) => {
    return {
      MeasureType: "Advanced",
      PerMode: "PerGame",
      PlusMinus: "N",
      PaceAdjust: "N",
      Rank: "N",
      Season: "2018-19",
      SeasonType: "Regular Season",
      Outcome: "",
      SeasonSegment: "",
      DateFrom: "",
      DateTo: "",
      OpponentTeamID: 0,
      VsConference: "",
      VsDivision: "",
      LastNGames: games,
      Location: "",
      Period: 0,
      GameSegment: "",
      Month: 0,
      StarterBench: lineup
    };
  },
  buildGameStintsDb: async () => {
    // This is the initial function to populate the game_stints DB from games already played during season
    let games = await knex("schedule")
      .pluck("gid")
      .whereNotNull("gweek")
      .whereNull("game_stints")
      .where({ stt: "Final" })
      .limit(40);

    games.forEach(game => {
      buildGameStints.buildSubData(game);
    });
  },
  addGameStints: async () => {
    // This is the in-season function to add game stints each night after games conclude
    let games = await knex("schedule")
      .pluck("gid")
      .whereNotNull("gweek")
      .where({ stt: "Final" })
      .whereNull("game_stints");

    console.log('games are ', games);

    games.forEach(game => {
      buildGameStints.buildSubData(game);
    });
  },
  buildSchedule: () => {
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
          knex("schedule")
            .insert(
              {
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
              },
              "*"
            )
            .then(ent => {
              console.log(ent[0].gcode, " entered in DB");
            });
        });
      });
    });
  },
  updateSchedule: () => {
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
          knex("schedule")
            .where({ gid: game.gid })
            .update({
              h: [hObj],
              v: [vObj],
              stt: game.stt,
              updated_at: new Date()
            })
            .then(res => {
              console.log("game updated");
            });
        });
      });
    });
  },
  buildPlayerDb: (db, arrayData) => {
    // This function builds out the initial player DB and should only need to be run at the beginning of each season
    arrayData.forEach(player => {
      knex(db)
        .insert(
          {
            player_id: player[0],
            player_name: player[1],
            team_id: player[2],
            team_abbreviation: player[3],
            age: player[4],
            gp: player[5],
            w: player[6],
            l: player[7],
            w_pct: player[8],
            min: player[9],
            eoff_rating: player[10],
            off_rating: player[11],
            sp_work_off_rating: player[12],
            edef_rating: player[13],
            def_rating: player[14],
            sp_work_def_rating: player[15],
            enet_rating: player[16],
            net_rating: player[17],
            sp_work_net_rating: player[18],
            ast_pct: player[19],
            ast_to: player[20],
            ast_ratio: player[21],
            oreb_pct: player[22],
            dreb_pct: player[23],
            reb_pct: player[24],
            tm_tov_pct: player[25],
            efg_pct: player[26],
            ts_pct: player[27],
            usg_pct: player[28],
            epace: player[29],
            pace: player[30],
            sp_work_pace: player[31],
            pie: player[32],
            fgm: player[33],
            fga: player[34],
            fgm_pg: player[35],
            fga_pg: player[36],
            fg_pct: player[37],
            gp_rank: player[38],
            w_rank: player[39],
            l_rank: player[40],
            w_pct_rank: player[41],
            min_rank: player[42],
            eoff_rating_rank: player[43],
            off_rating_rank: player[44],
            sp_work_off_rating_rank: player[45],
            edef_rating_rank: player[46],
            def_rating_rank: player[47],
            sp_work_def_rating_rank: player[48],
            enet_rating_rank: player[49],
            net_rating_rank: player[50],
            sp_work_net_rating_rank: player[51],
            ast_pct_rank: player[52],
            ast_to_rank: player[53],
            ast_ratio_rank: player[54],
            oreb_pct_rank: player[55],
            dreb_pct_rank: player[56],
            reb_pct_rank: player[57],
            tm_tov_pct_rank: player[58],
            efg_pct_rank: player[59],
            ts_pct_rank: player[60],
            usg_pct_rank: player[61],
            epace_rank: player[62],
            pace_rank: player[63],
            sp_work_pace_rank: player[64],
            pie_rank: player[65],
            fgm_rank: player[66],
            fga_rank: player[67],
            fgm_pg_rank: player[68],
            fga_pg_rank: player[69],
            fg_pct_rank: player[70],
            cfid: player[71],
            cfparams: player[72],
            updated_at: new Date()
          },
          "*"
        )
        .then(entered => {
          console.log(entered.player_name, " entered into player db");
        });
    });
  },
  updatePlayerDb: (db, arrayData) => {
    arrayData.forEach(player => {
      knex(db)
        .where({ player_id: player[0] })
        .then(res => {
          if (!res[0]) {
            knex(db)
              .insert(
                {
                  player_id: player[0],
                  player_name: player[1],
                  team_id: player[2],
                  team_abbreviation: player[3],
                  age: player[4],
                  gp: player[5],
                  w: player[6],
                  l: player[7],
                  w_pct: player[8],
                  min: player[9],
                  eoff_rating: player[10],
                  off_rating: player[11],
                  sp_work_off_rating: player[12],
                  edef_rating: player[13],
                  def_rating: player[14],
                  sp_work_def_rating: player[15],
                  enet_rating: player[16],
                  net_rating: player[17],
                  sp_work_net_rating: player[18],
                  ast_pct: player[19],
                  ast_to: player[20],
                  ast_ratio: player[21],
                  oreb_pct: player[22],
                  dreb_pct: player[23],
                  reb_pct: player[24],
                  tm_tov_pct: player[25],
                  efg_pct: player[26],
                  ts_pct: player[27],
                  usg_pct: player[28],
                  epace: player[29],
                  pace: player[30],
                  sp_work_pace: player[31],
                  pie: player[32],
                  fgm: player[33],
                  fga: player[34],
                  fgm_pg: player[35],
                  fga_pg: player[36],
                  fg_pct: player[37],
                  gp_rank: player[38],
                  w_rank: player[39],
                  l_rank: player[40],
                  w_pct_rank: player[41],
                  min_rank: player[42],
                  eoff_rating_rank: player[43],
                  off_rating_rank: player[44],
                  sp_work_off_rating_rank: player[45],
                  edef_rating_rank: player[46],
                  def_rating_rank: player[47],
                  sp_work_def_rating_rank: player[48],
                  enet_rating_rank: player[49],
                  net_rating_rank: player[50],
                  sp_work_net_rating_rank: player[51],
                  ast_pct_rank: player[52],
                  ast_to_rank: player[53],
                  ast_ratio_rank: player[54],
                  oreb_pct_rank: player[55],
                  dreb_pct_rank: player[56],
                  reb_pct_rank: player[57],
                  tm_tov_pct_rank: player[58],
                  efg_pct_rank: player[59],
                  ts_pct_rank: player[60],
                  usg_pct_rank: player[61],
                  epace_rank: player[62],
                  pace_rank: player[63],
                  sp_work_pace_rank: player[64],
                  pie_rank: player[65],
                  fgm_rank: player[66],
                  fga_rank: player[67],
                  fgm_pg_rank: player[68],
                  fga_pg_rank: player[69],
                  fg_pct_rank: player[70],
                  cfid: player[71],
                  cfparams: player[72],
                  updated_at: new Date()
                },
                "*"
              )
              .then(entered => {
                console.log(entered[0].player_name, " entered into ", db);
              });
          } else {
            knex(db)
              .where({ player_id: player[0] })
              .update(
                {
                  team_id: player[2],
                  team_abbreviation: player[3],
                  age: player[4],
                  gp: player[5],
                  w: player[6],
                  l: player[7],
                  w_pct: player[8],
                  min: player[9],
                  eoff_rating: player[10],
                  off_rating: player[11],
                  sp_work_off_rating: player[12],
                  edef_rating: player[13],
                  def_rating: player[14],
                  sp_work_def_rating: player[15],
                  enet_rating: player[16],
                  net_rating: player[17],
                  sp_work_net_rating: player[18],
                  ast_pct: player[19],
                  ast_to: player[20],
                  ast_ratio: player[21],
                  oreb_pct: player[22],
                  dreb_pct: player[23],
                  reb_pct: player[24],
                  tm_tov_pct: player[25],
                  efg_pct: player[26],
                  ts_pct: player[27],
                  usg_pct: player[28],
                  epace: player[29],
                  pace: player[30],
                  sp_work_pace: player[31],
                  pie: player[32],
                  fgm: player[33],
                  fga: player[34],
                  fgm_pg: player[35],
                  fga_pg: player[36],
                  fg_pct: player[37],
                  gp_rank: player[38],
                  w_rank: player[39],
                  l_rank: player[40],
                  w_pct_rank: player[41],
                  min_rank: player[42],
                  eoff_rating_rank: player[43],
                  off_rating_rank: player[44],
                  sp_work_off_rating_rank: player[45],
                  edef_rating_rank: player[46],
                  def_rating_rank: player[47],
                  sp_work_def_rating_rank: player[48],
                  enet_rating_rank: player[49],
                  net_rating_rank: player[50],
                  sp_work_net_rating_rank: player[51],
                  ast_pct_rank: player[52],
                  ast_to_rank: player[53],
                  ast_ratio_rank: player[54],
                  oreb_pct_rank: player[55],
                  dreb_pct_rank: player[56],
                  reb_pct_rank: player[57],
                  tm_tov_pct_rank: player[58],
                  efg_pct_rank: player[59],
                  ts_pct_rank: player[60],
                  usg_pct_rank: player[61],
                  epace_rank: player[62],
                  pace_rank: player[63],
                  sp_work_pace_rank: player[64],
                  pie_rank: player[65],
                  fgm_rank: player[66],
                  fga_rank: player[67],
                  fgm_pg_rank: player[68],
                  fga_pg_rank: player[69],
                  fg_pct_rank: player[70],
                  updated_at: new Date()
                },
                "*"
              )
              .then(updated => {
                console.log(updated[0].player_name, " updated in ", db);
              });
          }
        });
    });
  },
  buildBaseTeamDb: (db, arrayData) => {
    // This function builds out the initial advanced team DB and should only need to be run at the beginning of each season
    arrayData.forEach(team => {
      knex(db)
        .insert(
          {
            team_id: team[0],
            team_name: team[1],
            min: team[6],
            fgm: team[7],
            fga: team[8],
            fg_pct: team[9],
            fg3m: team[10],
            fg3a: team[11],
            fg3_pct: team[12],
            ftm: team[13],
            fta: team[14],
            ft_pct: team[15],
            oreb: team[16],
            dreb: team[17],
            reb: team[18],
            ast: team[19],
            tov: team[20],
            stl: team[21],
            blk: team[22],
            blka: team[23],
            pf: team[24],
            pfd: team[25],
            pts: team[26],
            plus_minus: team[27],
            gp_rank: team[28],
            w_rank: team[29],
            l_rank: team[30],
            w_pct_rank: team[31],
            min_rank: team[32],
            fgm_rank: team[33],
            fga_rank: team[34],
            fg_pct_rank: team[35],
            fg3m_rank: team[36],
            fg3a_rank: team[37],
            fg3_pct_rank: team[38],
            ftm_rank: team[39],
            fta_rank: team[40],
            ft_pct_rank: team[41],
            oreb_rank: team[42],
            dreb_rank: team[43],
            reb_rank: team[44],
            ast_rank: team[45],
            tov_rank: team[46],
            stl_rank: team[47],
            blk_rank: team[48],
            blka_rank: team[49],
            pf_rank: team[50],
            pfd_rank: team[51],
            pts_rank: team[52],
            plus_minus_rank: team[53],
            cfid: team[54],
            cfparams: team[55],
            updated_at: new Date()
          },
          "*"
        )
        .then(team => {
          console.log(team[0].team_name, " has been added to db");
        });
    });
  },
  buildAdvancedTeamDb: (db, arrayData) => {
    // This function builds out the initial advanced team DB and should only need to be run at the beginning of each season
    arrayData.forEach(team => {
      knex(db)
        .insert(
          {
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
          },
          "*"
        )
        .then(team => {
          console.log(team[0].team_name, " has been added to db");
        });
    });
  },
  updateAdvancedTeamDb: (db, arrayData) => {
    arrayData.forEach(team => {
      knex(db)
        .where({ team_id: team[0] })
        .update(
          {
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
          },
          "*"
        )
        .then(team => {
          console.log(
            team[0].team_name,
            " has been updated in the ",
            db,
            " db"
          );
        });
    });
  },
  buildGameWeekArrays: () => {
    let digitSched = [
      [null],
      [20181016, 20181017, 20181018, 20181019, 20181020, 20181021]
    ];
    let day = moment()
      .set("year", 2018)
      .set("month", 9)
      .set("date", 21);
    let week = [];

    const dayAdder = () => {
      while (moment(day).isBefore("2019-04-11")) {
        day = moment(day).add(1, "days");
        let digitDay = moment(day).format("YYYYMMDD");
        if (week.length < 7) {
          week.push(parseInt(digitDay));
        } else {
          digitSched.push(week);
          week = [];
          week.push(parseInt(digitDay));
        }
      }
    };

    dayAdder();
    return digitSched;
  }
};
