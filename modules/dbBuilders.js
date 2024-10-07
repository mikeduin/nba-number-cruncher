import knex from "../db/knex.js";
import moment from "moment";
import _ from 'lodash';
import { getCurrentSeasonDisplayYear } from "../utils";
import { buildSubData } from "./buildGameStints.js";
import {
  formPlayerAdvancedStatsBuild,
  formPlayerBaseStatsBuild,
  formTeamAdvancedStatsBuild,
  formTeamBaseStatsBuild,
} from "../utils";

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
    Season: getCurrentSeasonDisplayYear(),
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
