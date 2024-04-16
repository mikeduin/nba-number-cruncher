const knex = require("../db/knex");
const axios = require("axios");
const moment = require("moment");
const momentTz = require("moment-timezone")
const _ = require('lodash');
const formBovadaUrl = require("../utils/props/formBovadaUrl");

const dateFilters = require("./dateFilters");
const buildGameStints = require("./buildGameStints");
const teamLookup = require("../modules/teamLookup");

// MUST CHANGE THIS SEASON VARIABLE AT BEGINNING OF EACH SEASON
const season = "2023-24";

const leagueScheduleUrl =
  "https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2023/league/00_full_schedule_week.json";
// const leagueScheduleUrl = "https://data.nba.com/data/10s/v2015/json/mobile_teams/utah/2019/league/16_full_schedule.json";
const teamInfoUrl = "https://data.nba.net/10s/prod/v2/2019/teams.json";
let now = new Date();

// ONE-TIME BUILDER/UPDATE INDEX ... NO REGULAR REPETITION NEEDED
// (*) updateTeamInfo: Used to add/update info for new teams/franchises that appear
// (*) buildSchedule: Used to build initial schedule upon creation. Update leagueScheduleUrl for appropriate schedule feed (e.g. there were three separate links found for 2019 summer league, visible by visiting https://stats.nba.com/schedule/summerleague/ and looking at XHR sources)

// NOTE: For future season builds, will have to change hard-coded season values in params below

module.exports = {
  fetchAdvancedPlayerParams: games => {
    return {
      College: "",
      Conference: "",
      Country: "",
      DateFrom: "",
      DateTo: "",
      Division: "",
      DraftPick: "",
      DraftYear: "",
      GameScope: "",
      GameSegment: "",
      Height: "",
      LastNGames: games,
      LeagueID: "00",
      Location: "",
      MeasureType: "Advanced",
      Month: 0,
      OpponentTeamID: 0,
      Outcome: "",
      PORound: 0,
      PaceAdjust: "N",
      PerMode: "PerGame",
      Period: 0,
      PlayerExperience: "",
      PlayerPosition: "",
      PlusMinus: "N",
      Rank: "N",
      Season: season,
      SeasonSegment: "",
      SeasonType: "Regular Season",
      ShotClockRange: "",
      StarterBench: "",
      TeamID: 0,
      TwoWay: 0,
      VsConference: "",
      VsDivision: "",
      Weight: ""
    };
  },
  fetchBasePlayerParams: (games, period = 0) => {
    return {
      College: "",
      Conference: "",
      Country: "",
      DateFrom: "",
      DateTo: "",
      Division: "",
      DraftPick: "",
      DraftYear: "",
      GameScope: "",
      GameSegment: "",
      Height: "",
      LastNGames: games,
      LeagueID: "00",
      Location: "",
      MeasureType: "Base",
      Month: 0,
      OpponentTeamID: 0,
      Outcome: "",
      PORound: 0,
      PaceAdjust: "N",
      PerMode: "PerGame",
      Period: period,
      PlayerExperience: "",
      PlayerPosition: "",
      PlusMinus: "N",
      Rank: "N",
      Season: season,
      SeasonSegment: "",
      SeasonType: "Regular Season",
      ShotClockRange: "",
      StarterBench: "",
      TeamID: 0,
      TwoWay: 0,
      VsConference: "",
      VsDivision: "",
      Weight: ""
    };
  },
  fetchBaseTeamParams: (games, period) => {
    return {
      Conference: "",
      DateFrom: "",
      DateTo: "",
      Division: "",
      GameScope: "",
      GameSegment: "",
      LastNGames: games,
      LeagueID: "00",
      Location: "",
      MeasureType: "Base",
      Month: 0,
      OpponentTeamID: 0,
      Outcome: "",
      PORound: 0,
      PaceAdjust: "N",
      PerMode: "PerGame",
      Period: period,
      PlayerExperience: "",
      PlayerPosition: null, // added
      PlusMinus: "N",
      Rank: "N",
      Season: season,
      SeasonSegment: "",
      SeasonType: "Regular Season",
      ShotClockRange: null,
      StarterBench: null,
      TeamID: 0,
      TwoWay: 0,
      VsConference: "",
      VsDivision: ""
    };
  },
  fetchAdvancedTeamParams: (games, period) => {
    return {
      MeasureType: "Advanced",
      PerMode: "PerGame",
      PlusMinus: "N",
      PaceAdjust: "N",
      Rank: "N",
      Season: season,
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
      Season: season,
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

    games.forEach(game => {
      buildGameStints.buildSubData(game);
    });
  },
  updateTeamInfo: async () => {
    // This just needs to be run as needed to update new teams (such as international/summer teams) that might appear in the DB.
    const response = await axios.get(teamInfoUrl);
    _.forOwn(response.data.league, (teams, league) => {
      teams.forEach(team => {
        knex("teams").where({tid: team.teamId}).then(res => {
          if (!res[0]) {
            knex("teams").insert({
              tid: team.teamId,
              city: team.city,
              name: team.nickname,
              abb: team.tricode,
              isNBAFranchise: team.isNBAFranchise,
              isAllStar: team.isAllStar,
              confName: team.confName,
              divName: team.divName,
              fullName: team.fullName
            }, '*').then(returned => {
              console.log(returned[0].city, " has been added to the DB");
            })
          } else {
            // This portion of the code does not need to be regularly run and was initially built just to quickly update some new DB fields for teams that already existed
            if (league == "standard") {
              knex("teams").where({tid: team.teamId}).update({
                isNBAFranchise: team.isNBAFranchise,
                isAllStar: team.isAllStar,
                confName: team.confName,
                divName: team.divName,
                fullName: team.fullName
              }, '*').then(returned => {
                console.log(returned[0].city, " has been updated in the DB");
              })
            }
          }
        })
      })
    })
  },
  buildSchedule: () => {
    // This function builds out the initial schedule and should only need to be run at the beginning of each season
    // CHECK HARD-CODED SEASON VALUES BEFORE RUNNING!!!
    axios.get(leagueScheduleUrl).then(response => {
      response.data.lscd.forEach(month => {
        month.mscd.g.forEach(game => {
          let season_name = game.gweek ? 'regular' : null;
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
                etm: moment(game.etm).subtract(3, 'hours'),
                gweek: game.gweek,
                h: [hObj],
                v: [vObj],
                stt: game.stt,
                // BEGIN HARD-CODED VALUES
                season_year: 2023,
                season_name,
                display_year: '2023-24',
                // END HARD-CODED VALUES
                bovada_url: formBovadaUrl(game),
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
    // let currMonth = dateFilters.fetchScoreMonth();
    axios.get(leagueScheduleUrl).then(response => {
      // response.data.lscd.slice(currMonth).forEach(month => {
      response.data.lscd.forEach(month => {
        month.mscd.g.forEach(game => {
          // let hObj = {
          //   tid: game.h.tid,
          //   re: game.h.re,
          //   ta: game.h.ta,
          //   tn: game.h.tn,
          //   tc: game.h.tc,
          //   s: game.h.s
          // };
          // let vObj = {
          //   tid: game.v.tid,
          //   re: game.v.re,
          //   ta: game.v.ta,
          //   tn: game.v.tn,
          //   tc: game.v.tc,
          //   s: game.v.s
          // };
          knex("schedule")
            .where({ gid: game.gid })
            .update({
              // h: [hObj],
              // v: [vObj],
              etm: momentTz.tz(game.etm, 'America/New_York'),
              // stt: game.stt,
              updated_at: new Date()
            })
            .then(res => {
              console.log("game updated");
            });
        });
      });
    });
  },
  updatePlayoffScnedule: () => {
    console.log('updating playoff schedule');
    // let currMonth = dateFilters.fetchScoreMonth();
    axios.get(leagueScheduleUrl).then(response => {
      console.log('response is ', response.data.lscd);
      // response.data.lscd.slice(currMonth).forEach(month => {
      response.data.lscd
      .filter((month, i) => month.mscd.mon === "April")
      .forEach(month => {
        console.log('month is ', month);
        month.mscd.g
        .filter((game, i) => moment(game.gdte).isAfter(moment('2024-04-15')))
        .forEach(async (game) => {
          // console.log('game is ', game);

          // if game does not exist, insert game
          const existingGame = await knex("schedule").where({ gid: game.gid.slice(2) }); 

          if (!existingGame.length) {
            console.log('game is not found in schedule, adding ', game.gid);

            if (game.etm === 'TBD') {
              console.log('start time is TBD for game.gid ', game.gid);
              return;
            }

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

            // .insert(
            //   {
            //     gid: game.gid,
            //     gcode: game.gcode,
            //     gdte: game.gdte,
            //     an: game.an,
            //     ac: game.ac,
            //     as: game.as,
            //     etm: moment(game.etm).subtract(3, 'hours'),
            //     gweek: game.gweek,
            //     h: [hObj],
            //     v: [vObj],
            //     stt: game.stt,
            //     // BEGIN HARD-CODED VALUES
            //     season_year: 2023,
            //     season_name,
            //     display_year: '2023-24',
            //     // END HARD-CODED VALUES
            //     bovada_url: formBovadaUrl(game),
            //     updated_at: new Date()
            //   },
            //   "*"
            // )

            console.log('game is ', game);

            try {
              await knex("schedule")
                .insert({
                  gid: game.gid,
                  gcode: game.gcode,
                  gdte: game.gdte,
                  an: game.an,
                  ac: game.ac,
                  as: game.as,
                  etm: moment(game.etm).subtract(3, 'hours'),
                  gweek: 26, // temp while figuring this out
                  h: [hObj],
                  v: [vObj],
                  stt: game.stt,
                  season_year: 2023,
                  season_name: 'regular', // needs this for fetchApiData to work
                  display_year: '2023-24',
                  bovada_url: formBovadaUrl(game),
                  updated_at: new Date(),
                });
              console.log("game added", game.gid);
            } catch (e) {
              console.log('error adding game ', game.gid, e);
            }

          } else {
            console.log('game already exists in schedule ', game.gid);
          }
        });
      });
    });
  },
  // updateBovadaUrls: () => {
  //   axios.get(leagueScheduleUrl).then(response => {
  //     response.data.lscd.forEach(month => {
  //       month.mscd.g.forEach(game => {
  //         knex("schedule")
  //           .where({ gid: game.gid })
  //           .update({
  //             bovada_url: formBovadaUrl(game),
  //           })
  //           .then(res => {
  //             console.log("game updated");
  //           });
  //       });
  //     });
  //   });

  // },
  // NOTE: method below overwrites existing games, do not re-use without editing!
  updateScheduleAddMissingGames: () => {
    console.log('adding missing games');
    axios.get(leagueScheduleUrl).then(response => {
      response.data.lscd.forEach(month => {
        month.mscd.g.forEach(async game => {
          let season_name = game.gweek ? 'regular' : null;
          console.log('game.gid is ', game.gid);
          const gameLookup = await knex("schedule").where({ gid: game.gid });
          if (gameLookup.etm !== game.etm) { // NO
            // console.log('game is ', game);
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
            const newGame = await knex("schedule")
            .where({ gid: game.gid })
            .update(
                {
                  gid: game.gid,
                  gcode: game.gcode,
                  gdte: game.gdte,
                  an: game.an,
                  ac: game.ac,
                  as: game.as,
                  etm: momentTz.tz(game.etm, 'America/New_York'),
                  gweek: game.gweek,
                  h: [hObj],
                  v: [vObj],
                  stt: game.stt,
                  // BEGIN HARD-CODED VALUES
                  season_year: 2023,
                  display_year: '2023-24',
                  // END HARD-CODED VALUES
                  bovada_url: formBovadaUrl(game),
                  updated_at: new Date()
                },
                "*"
              );
            console.log('new game updated', newGame[0].gcode);
          } 
          // else {
          //   console.log('game', game.gid, ' already exists in DB');
          // }          
        });
      });
    });
  },
  updatePlayerDbBaseStats: (db, arrayData, headers) => {
    arrayData.forEach(player => {
      knex(db)
        .where({ player_id: player[headers.indexOf('PLAYER_ID')] })
        .then(res => {
          if (!res[0]) {
            knex(db)
              .insert(
                {
                  player_id: player[headers.indexOf('PLAYER_ID')],
                  player_name: player[headers.indexOf('PLAYER_NAME')],
                  team_id: player[headers.indexOf('TEAM_ID')],
                  team_abbreviation: player[headers.indexOf('TEAM_ABBREVIATION')],
                  age: player[headers.indexOf('AGE')],
                  gp: player[headers.indexOf('GP')],
                  w: player[headers.indexOf('W')],
                  l: player[headers.indexOf('L')],
                  w_pct: player[headers.indexOf('W_PCT')],
                  min: player[headers.indexOf('MIN')],
                  fg3m: player[headers.indexOf('FG3M')],
                  fg3a: player[headers.indexOf('FG3A')],
                  fg3_pct: player[headers.indexOf('FG3_PCT')],
                  ftm: player[headers.indexOf('FTM')],
                  fta: player[headers.indexOf('FTA')],
                  ft_pct: player[headers.indexOf('FT_PCT')],
                  oreb: player[headers.indexOf('OREB')],
                  dreb: player[headers.indexOf('DREB')],
                  reb: player[headers.indexOf('REB')],
                  ast: player[headers.indexOf('AST')],
                  tov: player[headers.indexOf('TOV')],
                  stl: player[headers.indexOf('STL')],
                  blk: player[headers.indexOf('BLK')],
                  blka: player[headers.indexOf('BLKA')],
                  pf: player[headers.indexOf('PF')],
                  pfd: player[headers.indexOf('PFD')],
                  pts: player[headers.indexOf('PTS')],
                  plus_minus: player[headers.indexOf('PLUS_MINUS')],
                  nba_fantasy_pts: player[headers.indexOf('NBA_FANTASY_PTS')],
                  dd2: player[headers.indexOf('DD2')],
                  td3: player[headers.indexOf('TD3')],
                  updated_at: new Date()
                },
                "*"
              )
              .then(entered => {
                console.log(entered[0].player_name, " entered into ", db);
              });
          } else {
            knex(db)
              .where({ player_id: player[headers.indexOf('PLAYER_ID')] })
              .update(
                {
                  team_id: player[headers.indexOf('TEAM_ID')],
                  team_abbreviation: player[headers.indexOf('TEAM_ABBREVIATION')],
                  age: player[headers.indexOf('AGE')],
                  gp: player[headers.indexOf('GP')],
                  w: player[headers.indexOf('W')],
                  l: player[headers.indexOf('L')],
                  w_pct: player[headers.indexOf('W_PCT')],
                  min: player[headers.indexOf('MIN')],
                  fg3m: player[headers.indexOf('FG3M')],
                  fg3a: player[headers.indexOf('FG3A')],
                  fg3_pct: player[headers.indexOf('FG3_PCT')],
                  ftm: player[headers.indexOf('FTM')],
                  fta: player[headers.indexOf('FTA')],
                  ft_pct: player[headers.indexOf('FT_PCT')],
                  oreb: player[headers.indexOf('OREB')],
                  dreb: player[headers.indexOf('DREB')],
                  reb: player[headers.indexOf('REB')],
                  ast: player[headers.indexOf('AST')],
                  tov: player[headers.indexOf('TOV')],
                  stl: player[headers.indexOf('STL')],
                  blk: player[headers.indexOf('BLK')],
                  blka: player[headers.indexOf('BLKA')],
                  pf: player[headers.indexOf('PF')],
                  pfd: player[headers.indexOf('PFD')],
                  pts: player[headers.indexOf('PTS')],
                  plus_minus: player[headers.indexOf('PLUS_MINUS')],
                  nba_fantasy_pts: player[headers.indexOf('NBA_FANTASY_PTS')],
                  dd2: player[headers.indexOf('DD2')],
                  td3: player[headers.indexOf('TD3')],
                  updated_at: new Date()
                },
                "*"
              )
              .then(updated => {
                console.log(updated[0].player_name, " had base stats updated in ", db);
              });
          }
        });
    });
  },
  updatePlayerDbBaseStatsThirdQ: (db, arrayData, headers) => {
    arrayData.forEach(player => {
      knex(db)
        .where({ player_id: player[headers.indexOf('PLAYER_ID')] })
        .then(res => {
          knex(db)
            .where({ player_id: player[headers.indexOf('PLAYER_ID')] })
            .update(
              {
                min_3q: player[headers.indexOf('MIN')],
                fgm_3q: player[headers.indexOf('FGM')],
                fga_3q: player[headers.indexOf('FGA')],
                fg3m_3q: player[headers.indexOf('FG3M')],
                fg3a_3q: player[headers.indexOf('FG3A')],
                ftm_3q: player[headers.indexOf('FTM')],
                fta_3q: player[headers.indexOf('FTA')],
                reb_3q: player[headers.indexOf('REB')],
                ast_3q: player[headers.indexOf('AST')],
                tov_3q: player[headers.indexOf('TOV')],
                stl_3q: player[headers.indexOf('STL')],
                blk_3q: player[headers.indexOf('BLK')],
                pts_3q: player[headers.indexOf('PTS')],
                updated_at: new Date()
              },
              "*"
            )
            .then(updated => {
              console.log(updated[0].player_name, " had base stats updated for 3rd Q in ", db);
            });
        });
    });
  },
  updatePlayerDbBaseStatsFourthQ: (db, arrayData, headers) => {
    arrayData.forEach(player => {
      knex(db)
        .where({ player_id: player[headers.indexOf('PLAYER_ID')] })
        .then(res => {
          knex(db)
            .where({ player_id: player[headers.indexOf('PLAYER_ID')] })
            .update(
              {
                min_4q: player[headers.indexOf('MIN')],
                fgm_4q: player[headers.indexOf('FGM')],
                fga_4q: player[headers.indexOf('FGA')],
                fg3m_4q: player[headers.indexOf('FG3M')],
                fg3a_4q: player[headers.indexOf('FG3A')],
                ftm_4q: player[headers.indexOf('FTM')],
                fta_4q: player[headers.indexOf('FTA')],
                fg3m_4q: player[headers.indexOf('FG3M')],
                reb_4q: player[headers.indexOf('REB')],
                ast_4q: player[headers.indexOf('AST')],
                tov_4q: player[headers.indexOf('TOV')],
                stl_4q: player[headers.indexOf('STL')],
                blk_4q: player[headers.indexOf('BLK')],
                pts_4q: player[headers.indexOf('PTS')],
                updated_at: new Date()
              },
              "*"
            )
            .then(updated => {
              console.log(updated[0].player_name, " had base stats updated for 4th Q in ", db);
            });
        });
    });
  },
  updatePlayerDbAdvancedStats: (db, arrayData, headers) => {
    arrayData.forEach(player => {
      knex(db)
        .where({ player_id: player[0] })
        .then(res => {
          if (!res[0]) {
            knex(db)
              .insert(
                {
                  player_id: player[headers.indexOf('PLAYER_ID')],
                  player_name: player[headers.indexOf('PLAYER_NAME')],
                  team_id: player[headers.indexOf('TEAM_ID')],
                  team_abbreviation: player[headers.indexOf('TEAM_ABBREVIATION')],
                  age: player[headers.indexOf('AGE')],
                  gp: player[headers.indexOf('GP')],
                  w: player[headers.indexOf('W')],
                  l: player[headers.indexOf('L')],
                  w_pct: player[headers.indexOf('W_PCT')],
                  min: player[headers.indexOf('MIN')],
                  eoff_rating: player[headers.indexOf('E_OFF_RATING')],
                  off_rating: player[headers.indexOf('OFF_RATING')],
                  sp_work_off_rating: player[headers.indexOf('sp_work_OFF_RATING')],
                  edef_rating: player[headers.indexOf('E_DEF_RATING')],
                  def_rating: player[headers.indexOf('DEF_RATING')],
                  sp_work_def_rating: player[headers.indexOf('sp_work_DEF_RATING')],
                  enet_rating: player[headers.indexOf('E_NET_RATING')],
                  net_rating: player[headers.indexOf('NET_RATING')],
                  sp_work_net_rating: player[headers.indexOf('sp_work_NET_RATING')],
                  ast_pct: player[headers.indexOf('AST_PCT')],
                  ast_to: player[headers.indexOf('AST_TO')],
                  ast_ratio: player[headers.indexOf('AST_RATIO')],
                  oreb_pct: player[headers.indexOf('OREB_PCT')],
                  dreb_pct: player[headers.indexOf('DREB_PCT')],
                  reb_pct: player[headers.indexOf('REB_PCT')],
                  tm_tov_pct: player[headers.indexOf('TM_TOV_PCT')],
                  e_tov_pct: player[headers.indexOf('E_TOV_PCT')],
                  efg_pct: player[headers.indexOf('EFG_PCT')],
                  ts_pct: player[headers.indexOf('TS_PCT')],
                  usg_pct: player[headers.indexOf('USG_PCT')],
                  e_usg_pct: player[headers.indexOf('E_USG_PCT')],
                  epace: player[headers.indexOf('E_PACE')],
                  pace: player[headers.indexOf('PACE')],
                  pace_per40: player[headers.indexOf('PACE_PER40')],
                  sp_work_pace: player[headers.indexOf('sp_work_PACE')],
                  pie: player[headers.indexOf('PIE')],
                  poss: player[headers.indexOf('POSS')],
                  fgm: player[headers.indexOf('FGM')],
                  fga: player[headers.indexOf('FGA')],
                  fgm_pg: player[headers.indexOf('FGM_PG')],
                  fga_pg: player[headers.indexOf('FGA_PG')],
                  fg_pct: player[headers.indexOf('FG_PCT')],
                  gp_rank: player[headers.indexOf('GP_RANK')],
                  w_rank: player[headers.indexOf('W_RANK')],
                  l_rank: player[headers.indexOf('L_RANK')],
                  w_pct_rank: player[headers.indexOf('W_PCT_RANK')],
                  min_rank: player[headers.indexOf('MIN_RANK')],
                  eoff_rating_rank: player[headers.indexOf('E_OFF_RATING_RANK')],
                  off_rating_rank: player[headers.indexOf('OFF_RATING_RANK')],
                  sp_work_off_rating_rank: player[headers.indexOf('sp_work_OFF_RATING_RANK')],
                  edef_rating_rank: player[headers.indexOf('E_DEF_RATING_RANK')],
                  def_rating_rank: player[headers.indexOf('DEF_RATING_RANK')],
                  sp_work_def_rating_rank: player[headers.indexOf('sp_work_DEF_RATING_RANK')],
                  enet_rating_rank: player[headers.indexOf('E_NET_RATING_RANK')],
                  net_rating_rank: player[headers.indexOf('NET_RATING_RANK')],
                  sp_work_net_rating_rank: player[headers.indexOf('sp_work_NET_RATING_RANK')],
                  ast_pct_rank: player[headers.indexOf('AST_PCT_RANK')],
                  ast_to_rank: player[headers.indexOf('AST_TO_RANK')],
                  ast_ratio_rank: player[headers.indexOf('AST_RATIO_RANK')],
                  oreb_pct_rank: player[headers.indexOf('OREB_PCT_RANK')],
                  dreb_pct_rank: player[headers.indexOf('DREB_PCT_RANK')],
                  reb_pct_rank: player[headers.indexOf('REB_PCT_RANK')],
                  tov_pct_rank: player[headers.indexOf('TOV_PCT_RANK')],
                  e_tov_pct_rank: player[headers.indexOf('E_TOV_PCT_RANK')],
                  efg_pct_rank: player[headers.indexOf('EFG_PCT_RANK')],
                  ts_pct_rank: player[headers.indexOf('TS_PCT_RANK')],
                  usg_pct_rank: player[headers.indexOf('USG_PCT_RANK')],
                  e_usg_pct_rank: player[headers.indexOf('E_USG_PCT_RANK')],
                  epace_rank: player[headers.indexOf('E_PACE_RANK')],
                  pace_rank: player[headers.indexOf('PACE_RANK')],
                  sp_work_pace_rank: player[headers.indexOf('sp_work_PACE_RANK')],
                  pie_rank: player[headers.indexOf('PIE_RANK')],
                  fgm_rank: player[headers.indexOf('FGM_RANK')],
                  fga_rank: player[headers.indexOf('FGA_RANK')],
                  fgm_pg_rank: player[headers.indexOf('FGM_PG_RANK')],
                  fga_pg_rank: player[headers.indexOf('FGA_PG_RANK')],
                  fg_pct_rank: player[headers.indexOf('FG_PCT_RANK')],
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
                  team_id: player[headers.indexOf('TEAM_ID')],
                  team_abbreviation: player[headers.indexOf('TEAM_ABBREVIATION')],
                  age: player[headers.indexOf('AGE')],
                  gp: player[headers.indexOf('GP')],
                  w: player[headers.indexOf('W')],
                  l: player[headers.indexOf('L')],
                  w_pct: player[headers.indexOf('W_PCT')],
                  min: player[headers.indexOf('MIN')],
                  eoff_rating: player[headers.indexOf('E_OFF_RATING')],
                  off_rating: player[headers.indexOf('OFF_RATING')],
                  sp_work_off_rating: player[headers.indexOf('sp_work_OFF_RATING')],
                  edef_rating: player[headers.indexOf('E_DEF_RATING')],
                  def_rating: player[headers.indexOf('DEF_RATING')],
                  sp_work_def_rating: player[headers.indexOf('sp_work_DEF_RATING')],
                  enet_rating: player[headers.indexOf('E_NET_RATING')],
                  net_rating: player[headers.indexOf('NET_RATING')],
                  sp_work_net_rating: player[headers.indexOf('sp_work_NET_RATING')],
                  ast_pct: player[headers.indexOf('AST_PCT')],
                  ast_to: player[headers.indexOf('AST_TO')],
                  ast_ratio: player[headers.indexOf('AST_RATIO')],
                  oreb_pct: player[headers.indexOf('OREB_PCT')],
                  dreb_pct: player[headers.indexOf('DREB_PCT')],
                  reb_pct: player[headers.indexOf('REB_PCT')],
                  tm_tov_pct: player[headers.indexOf('TM_TOV_PCT')],
                  e_tov_pct: player[headers.indexOf('E_TOV_PCT')],
                  efg_pct: player[headers.indexOf('EFG_PCT')],
                  ts_pct: player[headers.indexOf('TS_PCT')],
                  usg_pct: player[headers.indexOf('USG_PCT')],
                  e_usg_pct: player[headers.indexOf('E_USG_PCT')],
                  epace: player[headers.indexOf('E_PACE')],
                  pace: player[headers.indexOf('PACE')],
                  pace_per40: player[headers.indexOf('PACE_PER40')],
                  sp_work_pace: player[headers.indexOf('sp_work_PACE')],
                  pie: player[headers.indexOf('PIE')],
                  poss: player[headers.indexOf('POSS')],
                  fgm: player[headers.indexOf('FGM')],
                  fga: player[headers.indexOf('FGA')],
                  fgm_pg: player[headers.indexOf('FGM_PG')],
                  fga_pg: player[headers.indexOf('FGA_PG')],
                  fg_pct: player[headers.indexOf('FG_PCT')],
                  gp_rank: player[headers.indexOf('GP_RANK')],
                  w_rank: player[headers.indexOf('W_RANK')],
                  l_rank: player[headers.indexOf('L_RANK')],
                  w_pct_rank: player[headers.indexOf('W_PCT_RANK')],
                  min_rank: player[headers.indexOf('MIN_RANK')],
                  eoff_rating_rank: player[headers.indexOf('E_OFF_RATING_RANK')],
                  off_rating_rank: player[headers.indexOf('OFF_RATING_RANK')],
                  sp_work_off_rating_rank: player[headers.indexOf('sp_work_OFF_RATING_RANK')],
                  edef_rating_rank: player[headers.indexOf('E_DEF_RATING_RANK')],
                  def_rating_rank: player[headers.indexOf('DEF_RATING_RANK')],
                  sp_work_def_rating_rank: player[headers.indexOf('sp_work_DEF_RATING_RANK')],
                  enet_rating_rank: player[headers.indexOf('E_NET_RATING_RANK')],
                  net_rating_rank: player[headers.indexOf('NET_RATING_RANK')],
                  sp_work_net_rating_rank: player[headers.indexOf('sp_work_NET_RATING_RANK')],
                  ast_pct_rank: player[headers.indexOf('AST_PCT_RANK')],
                  ast_to_rank: player[headers.indexOf('AST_TO_RANK')],
                  ast_ratio_rank: player[headers.indexOf('AST_RATIO_RANK')],
                  oreb_pct_rank: player[headers.indexOf('OREB_PCT_RANK')],
                  dreb_pct_rank: player[headers.indexOf('DREB_PCT_RANK')],
                  reb_pct_rank: player[headers.indexOf('REB_PCT_RANK')],
                  tov_pct_rank: player[headers.indexOf('TOV_PCT_RANK')],
                  e_tov_pct_rank: player[headers.indexOf('E_TOV_PCT_RANK')],
                  efg_pct_rank: player[headers.indexOf('EFG_PCT_RANK')],
                  ts_pct_rank: player[headers.indexOf('TS_PCT_RANK')],
                  usg_pct_rank: player[headers.indexOf('USG_PCT_RANK')],
                  e_usg_pct_rank: player[headers.indexOf('E_USG_PCT_RANK')],
                  epace_rank: player[headers.indexOf('E_PACE_RANK')],
                  pace_rank: player[headers.indexOf('PACE_RANK')],
                  sp_work_pace_rank: player[headers.indexOf('sp_work_PACE_RANK')],
                  pie_rank: player[headers.indexOf('PIE_RANK')],
                  fgm_rank: player[headers.indexOf('FGM_RANK')],
                  fga_rank: player[headers.indexOf('FGA_RANK')],
                  fgm_pg_rank: player[headers.indexOf('FGM_PG_RANK')],
                  fga_pg_rank: player[headers.indexOf('FGA_PG_RANK')],
                  fg_pct_rank: player[headers.indexOf('FG_PCT_RANK')],
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
  updateBaseTeamDb: (db, arrayData) => {
    arrayData.forEach(team => {
      const fg2m = parseFloat(team[7]) - parseFloat(team[10]);
      const fg2a = parseFloat(team[8]) - parseFloat(team[11]);
      const fg2_pct = fg2m/fg2a;

      knex(db)
        .where({ team_id: team[0] })
        .update(
          {
            min: team[6],
            fgm: team[7],
            fga: team[8],
            fg_pct: team[9],
            fg2m: fg2m,
            fg2a: fg2a,
            fg2_pct: fg2_pct,
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
            updated_at: new Date()
          },
          "*"
        )
        .then(team => {
          // console.log('team is ', team);
          console.log(team[0].team_name, " has been updated in base db");
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
            pace_per40: team[24],
            poss: team[25],
            pie: team[26],
            gp_rank: team[27],
            w_rank: team[28],
            l_rank: team[29],
            w_pct_rank: team[30],
            min_rank: team[31],
            off_rating_rank: team[32],
            def_rating_rank: team[33],
            net_rating_rank: team[34],
            ast_pct_rank: team[35],
            ast_to_rank: team[36],
            ast_ratio_rank: team[37],
            oreb_pct_rank: team[38],
            dreb_pct_rank: team[39],
            reb_pct_rank: team[40],
            tm_tov_pct_rank: team[41],
            efg_pct_rank: team[42],
            ts_pct_rank: team[43],
            pace_rank: team[44],
            pie_rank: team[45],
            cfid: team[46],
            cfparams: team[47],
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
      // console.log('array data being updated for ', team);
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
            pace_per40: team[24],
            poss: team[25],
            pie: team[26],
            gp_rank: team[27],
            w_rank: team[28],
            l_rank: team[29],
            w_pct_rank: team[30],
            min_rank: team[31],
            off_rating_rank: team[32],
            def_rating_rank: team[33],
            net_rating_rank: team[34],
            ast_pct_rank: team[35],
            ast_to_rank: team[36],
            ast_ratio_rank: team[37],
            oreb_pct_rank: team[38],
            dreb_pct_rank: team[39],
            reb_pct_rank: team[40],
            tm_tov_pct_rank: team[41],
            efg_pct_rank: team[42],
            ts_pct_rank: team[43],
            pace_rank: team[44],
            pie_rank: team[45],
            cfid: team[46],
            cfparams: team[47],
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
  insertPlayerBoxScoresByPeriod: async (gid, period, playerStats, teamAbb) => {
    playerStats.forEach(async player => {
      const { player_id, player_name, min, pts, reb, ast, stl, blk, tov, fg3m, fg3a, fgm, fga, ftm, fta, fouls } = player;
      await knex('player_boxscores_by_q')
        .insert({
          player_id,
          player_name,
          team: teamAbb,
          gid,
          period,
          min,
          pts,
          reb,
          ast,
          stl,
          blk,
          tov,
          fg3m,
          fg3a,
          fgm,
          fga,
          ftm,
          fta,
          fouls,
          updated_at: new Date(),
          created_at: new Date()
        });
      console.log('player stats inserted for ', player_name, ' for period ', period, ' of game ', gid);
    });
  },
  buildGameWeekArrays: () => {
    let digitSched = [
      // [null],
      // [20181016, 20181017, 20181018, 20181019, 20181020, 20181021]
    ];
    let day = moment()
      .set("year", 2021)
      .set("month", 09)
      .set("date", 10);
    let week = [];

    const dayAdder = () => {
      while (moment(day).isBefore("2022-04-14")) {
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
