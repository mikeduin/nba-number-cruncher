import knex from "../db/knex.js";
import axios from "axios";
import moment from "moment";
import momentTz from "moment-timezone";
import _ from 'lodash';
import formBovadaUrl from "../utils/props/formBovadaUrl.js";

import { buildSubData } from "./buildGameStints.js";
import { formPlayerBaseStatsBuild } from "../utils/nbaApi/formPlayerBaseStatsBuild.js";
import { formPlayerAdvancedStatsBuild } from "../utils/nbaApi/formPlayerAdvancedStatsBuild.js";
import { formTeamBaseStatsBuild } from "../utils/nbaApi/formTeamBaseStatsBuild.js";
import { formTeamAdvancedStatsBuild } from "../utils/nbaApi/formTeamAdvancedStatsBuild.js";

import { getCurrentNbaSeason } from '../controllers/Schedule.Controller.js';
const currentNbaSeasonInt = parseInt(getCurrentNbaSeason().slice(0, 4));

const leagueScheduleUrl = `https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/${currentNbaSeasonInt}/league/00_full_schedule_week.json`;
const teamInfoUrl = "https://data.nba.net/10s/prod/v2/2019/teams.json";
// ONE-TIME BUILDER/UPDATE INDEX ... NO REGULAR REPETITION NEEDED
// (*) updateTeamInfo: Used to add/update info for new teams/franchises that appear
// (*) buildSchedule: Used to build initial schedule upon creation. Update leagueScheduleUrl for appropriate schedule feed (e.g. there were three separate links found for 2019 summer league, visible by visiting https://stats.nba.com/schedule/summerleague/ and looking at XHR sources)

// NOTE: For future season builds, will have to change hard-coded season values in params below

export const fetchLineupParams = (games, lineup) => {
  return {
    LastNGames: games,
    MeasureType: "Advanced",
    Month: 0,
    OpponentTeamID: 0,
    PaceAdjust: "N",
    PerMode: "PerGame",
    PlusMinus: "N",
    Period: 0,
    Rank: "N",
    Season: getCurrentNbaSeason(),
    SeasonType: "Regular Season",
    StarterBench: lineup
  };
}; 

export const buildGameStintsDb = async () => {
  // This is the initial function to populate the game_stints DB from games already played during season
  let games = await knex("schedule")
    .pluck("gid")
    .whereNotNull("gweek")
    .whereNull("game_stints")
    .where({ stt: "Final" })
    .limit(40);

  games.forEach(game => {
    buildSubData(game);
  });
}; 

export const addGameStints = async () => {
  // This is the in-season function to add game stints each night after games conclude
  let games = await knex("schedule")
    .pluck("gid")
    .whereNotNull("gweek")
    .where({ stt: "Final" })
    .whereNull("game_stints");

  games.forEach(game => {
    buildSubData(game);
  });
};
  
export const updateTeamInfo = async () => {
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
};

export const buildSchedule = () => {
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
              season_year: currentNbaSeasonInt,
              season_name,
              display_year: getCurrentNbaSeason(),
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
}; 

export const updateSchedule = () => {
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
};

export const updatePlayoffScnedule = () => {
  console.log('updating playoff schedule');
  // let currMonth = dateFilters.fetchScoreMonth();
  axios.get(leagueScheduleUrl).then(response => {
    response.data.lscd
    .filter((month, i) => month.mscd.mon === "June")
    .forEach(month => {
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
                gweek: 28, // temp while figuring this out
                h: [hObj],
                v: [vObj],
                stt: game.stt,
                season_year: currentNbaSeasonInt,
                season_name: 'regular', // needs this for fetchApiData to work
                display_year: getCurrentNbaSeason(),
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
};

// export const updateBovadaUrls = () => {
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
export const updateScheduleAddMissingGames = () => {
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
                season_year: getCurrentNbaSeason(),
                display_year: currentNbaSeasonInt,
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
};

export const updatePlayerDbBaseStats = (db, arrayData, headers, period, seasonType) => {
  arrayData.forEach(async player => {
    const checkExist = await knex(db).where({ player_id: player[headers.indexOf('PLAYER_ID')] });
    if (!checkExist.length) {
      try {
        const insert = await knex(db)
          .insert(
            {
              ...formPlayerBaseStatsBuild(headers, player, period, seasonType),
              created_at: new Date()
            },"*");
        console.log(`${insert[0].player_name} entered into ${db} in base stats build`);
      } catch (e) {
        console.log(`error inserting player into DB for ${seasonType} stats in base stats build is ${e}`);
      }
    } else {
      try {
        const update = await knex(db)
          .where({ player_id: player[headers.indexOf('PLAYER_ID')] })
          .update({
            ...formPlayerBaseStatsBuild(headers, player, period, seasonType),
          }, '*');
        console.log(`${update[0].player_name} updated for ${seasonType} stats for period ${period} in ${db}`);
      } catch (e) {
        console.log(`error updating player in DB for ${seasonType} stats in base stats build is ${e}`);
      }
    }
  })
};

export const updatePlayerDbAdvancedStats = (db, arrayData, headers) => {
  arrayData.forEach(async player => {
    const checkExist = await knex(db).where({ player_id: player[headers.indexOf('PLAYER_ID')] });
    if (!checkExist.length) {
      try {
        const insert = await knex(db)
          .insert(
            {
              player_id: player[headers.indexOf('PLAYER_ID')],
              player_name: player[headers.indexOf('PLAYER_NAME')],
              ...formPlayerAdvancedStatsBuild(headers, player),
              created_at: new Date()
            },"*");
          console.log(`${insert[0].player_name} entered into ${db} in advanced stats build`);
      } catch (e) {
        console.log(`error inserting player into DB for in advanced stats build is ${e}`);
      }
    } else {
      try {
        const update = await knex(db)
          .where({ player_id: player[headers.indexOf('PLAYER_ID')] })
          .update({
            ...formPlayerAdvancedStatsBuild(headers, player),
          }, '*');
        console.log(`${update[0].player_name} updated in ${db} for advanced stats`);
      } catch (e) {
        console.log(`error updating player in DB for in advanced stats build is ${e}`);
      }
    }
  });
};

export const updateTeamDbBaseStats = (db, arrayData, headers) => {
  arrayData.forEach(async team => {
    const checkExist = await knex(db).where({ team_id: team[headers.indexOf('TEAM_ID')] });
    if (!checkExist.length) {
      try {
        const insert = await knex(db)
          .insert(
            {
              team_id: team[headers.indexOf('TEAM_ID')],
              team_name: team[headers.indexOf('TEAM_NAME')],
              ...formTeamBaseStatsBuild(headers, team),
              updated_at: new Date()
            },"*");
        console.log(`${insert[0].team_name} entered into ${db} in base stats build`);
      } catch (e) {
        console.log(`error inserting team into DB in base stats build is ${e}`);
      }
    } else {
      try {
        const update = await knex(db)
          .where({ team_id: team[headers.indexOf('TEAM_ID')] })
          .update({
            ...formTeamBaseStatsBuild(headers, team),
            updated_at: new Date()
          }, '*');
        console.log(`${update[0].team_name} updated in ${db} for base stats`);
      } catch (e) {
        console.log(`error updating team in DB in base stats build is ${e}`);
      }
    }
  });
}; 

export const updateTeamDbAdvancedStats = (db, arrayData, headers) => {
  arrayData.forEach(async team => {
    const checkExist = await knex(db).where({ team_id: team[headers.indexOf('TEAM_ID')] });
    if (!checkExist.length) {
      try {
        const insert = await knex(db)
          .insert(
            {
              team_id: team[headers.indexOf('TEAM_ID')],
              team_name: team[headers.indexOf('TEAM_NAME')],
              ...formTeamAdvancedStatsBuild(headers, team),
              updated_at: new Date()
            },"*");
        console.log(`${insert[0].team_name} entered into ${db} in advanced stats build`);
      } catch (e) {
        console.log(`error inserting team into DB in advanced stats build is ${e}`);
      }
    } else {
      try {
        const update = await knex(db)
          .where({ team_id: team[headers.indexOf('TEAM_ID')] })
          .update({
            ...formTeamAdvancedStatsBuild(headers, team),
            updated_at: new Date()
          }, '*');
        console.log(`${update[0].team_name} updated in ${db} for advanced stats`);
      } catch (e) {
        console.log(`error updating team in DB in advanced stats build is ${e}`);
      }
    }
  });  
};

export const insertPlayerBoxScoresByPeriod = (gid, period, playerStats, teamAbb) => {
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
};

export const buildGameWeekArrays = () => {
  let day = moment()
    .set("year", 2021)
    .set("month", 9)
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
};
