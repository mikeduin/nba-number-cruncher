import moment from 'moment-timezone';
import axios from 'axios';
import knex from '../db/knex.js';
import * as Db from './Db.Controller.js';
import { SEASON_DATES } from '../constants';
import { Month, SeasonNameFull, SeasonNameAbb } from '../types';
import {
  formBovadaUrl,
  getCurrentNbaSeason,
  getCurrentNbaSeasonInt,
  getLeagueScheduleUrl,
  getSeasonNameAbb,
  getSeasonNameFull,
} from '../utils';

const getPrePostGameWeek = (gameDate: string, dashedDateWeeks) => {
  // dashedDateWeeks is an array of arrays, where each inner array is a week of dates
  // find the array that includes the gameDate, and return the index of that array
  return dashedDateWeeks.findIndex(week => week.includes(gameDate));
}

export const getSeasonStartEndDates = (season: number, seasonType: SeasonNameFull) => {
  try {
    const { start, end } = SEASON_DATES[season.toString()][seasonType];
    return [start, end];
  } catch {
    throw new Error(`Missing dates for ${season} in SEASON_DATES`);
  }
}
export const getTodaysGames = async (today) => await Db.Schedule().where({gdte: today});

export const getActiveGames = async (date) => {
  let testMoment = moment().set({
    'year': 2024,
    'month': 3,
    'date': 27,
    'hour': 19,
    'minute': 20,
    'second': 0,
    // 'timezone': 'America/Los_Angeles'
  }); // 7pm on 4/27/2024

  const todayGames = await Db.Schedule()
    .where({
      gdte: date,
    })
    .whereNot({
      stt: 'Final'
    });

  // console.log('todayGames are ', todayGames);

  // return todayGames.filter(game => moment(game.etm).diff(moment()) <= 0);
  return todayGames.filter(game => moment(game.etm).diff(testMoment, 'minutes') <= 0);
};

export const getCompletedGameGids = async (date) => await Db.Schedule()
  .where({gdte: date, stt: 'Final'})
  .pluck('gid');

export const buildSeasonGameWeekArray = (seasonStart, seasonEnd) => {
  // Remember that in dashedDates and intDates, array indices correspond to LITERAL GAME WEEKS.
  // So dashedDates[1] will be the first week of Survivor play, and dashedDates[0] will be the week BEFORE the game begins
  let dashedDateWeeks = [];
  let intDateWeeks = [];
  let mondayAfterLastWeek = null;

  // STEP 1: Get day of week of first + last game through MomentJS (Sun = 0, Mon = 1 ... Sat = 6)
  const startDay = moment(seasonStart).day();
  const endDay = moment(seasonEnd).day();

  // first item of dashedDateWeeks needs to begin with the Monday of the week BEFORE games begin (week 0)
  // e.g., 2024 season begins Tuesday, October 22nd ...
  // so index 0 of first item of 2024 game weeks needs to be Monday, October 14th

  const weekZeroStart = moment(seasonStart).subtract(((startDay - 1) + 7), 'days');

  // mondayAfterLastWeek should be first Monday AFTER last week of season
  if (endDay === 0) {
    mondayAfterLastWeek = moment(seasonEnd).add(1, 'days');
  } else if (endDay > 2) {
    mondayAfterLastWeek = moment(seasonEnd).add((8 - endDay), 'days');
  } else {
    mondayAfterLastWeek = moment(seasonEnd).subtract((endDay - 1), 'days');
  }

  let movingDate = weekZeroStart;
  let day = 0;
  let tempDashedWeekArr = [];
  let tempIntWeekArr = [];

  while (moment(movingDate).isSameOrBefore(moment(mondayAfterLastWeek))) {
    if (day < 7) {
      tempDashedWeekArr.push(moment(movingDate).format('YYYY-MM-DD'));
      tempIntWeekArr.push(parseInt(moment(movingDate).format('YYYYMMDD')));
      movingDate = moment(movingDate).add(1, 'days');
      day++;
    } else {
      dashedDateWeeks.push(tempDashedWeekArr);
      intDateWeeks.push(tempIntWeekArr);
      tempDashedWeekArr = [];
      tempIntWeekArr = [];
      day = 0;
    }
  }

  return {dashedDateWeeks, intDateWeeks};
}

export const buildSchedule = async (monthFilter?: Month, seasonStageFilter?: SeasonNameAbb) => {
  const seasonYear = getCurrentNbaSeasonInt();
  console.log('seasonYear is ', seasonYear);
  const currentSeasonDates = SEASON_DATES[seasonYear.toString()];
  const schedulePull = await axios.get(getLeagueScheduleUrl());
  const leagueSchedule = schedulePull.data.lscd;

  const parsedSchedule = monthFilter
    ? leagueSchedule.filter((month) => month.mscd.mon === monthFilter)
    : leagueSchedule;

  console.log('parsedSchedule is ', parsedSchedule);

  parsedSchedule.forEach(month => {
    month.mscd.g.forEach(async game => {
      // if game does not exist, insert game
      const existingGame = await knex("schedule").where({ gid: game.gid.slice(2) });

      if (!existingGame.length) {
        console.log('game is not found in schedule, adding ', game.gid);

        if (game.etm === 'TBD') {
          console.log('start time is TBD for game.gid ', game.gid);
          return;
        }

        const seasonNameAbb = game.gweek ? SeasonNameAbb.RegularSeason : getSeasonNameAbb(game.gdte, currentSeasonDates.RegularSeason);
        const seasonNameFull = game.gweek ? SeasonNameFull.RegularSeason : getSeasonNameFull(game.gdte, currentSeasonDates.RegularSeason);
        const gweek = game.gweek ?? getPrePostGameWeek(game.gdte, currentSeasonDates[seasonNameFull].dashedDateWeeks);
    
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
  
        if (!seasonStageFilter || seasonStageFilter === seasonNameAbb) {
          await Db.Schedule().insert(
            {
              gid: game.gid,
              gcode: game.gcode,
              gdte: game.gdte,
              an: game.an,
              ac: game.ac,
              as: game.as,
              etm: moment(game.etm).subtract(3, 'hours'),
              gweek,
              h: [hObj],
              v: [vObj],
              stt: game.stt,
              season_year: seasonYear,
              season_name: seasonNameAbb,
              display_year: getCurrentNbaSeason(),
              bovada_url: formBovadaUrl(game),
              updated_at: new Date()
            }
          );
          console.log(game.gcode, " entered in DB");
        }
      } else {
        const existingGameIdentical = game.gdte === existingGame[0].gdte && game.etm !== existingGame[0].etm;

        if (!existingGameIdentical) {
          await Db.Schedule().where({ gid: game.gid.slice(2) }).update({
            gdte: game.gdte,
            etm: moment(game.etm).subtract(3, 'hours'),
          });
          console.log(game.gcode, " updated in DB");
        } else {
          console.log('game already exists in schedule with same time and date', game.gid);
        }
      }
    });
  });
}; 

buildSchedule(Month.October, SeasonNameAbb.Preseason);


// DELETE THIS BELOW AFTER 2024 POSTSEASON PROCESSES CORRECTLY

// export const updatePlayoffScnedule = () => {
//   console.log('updating playoff schedule');
//   // let currMonth = dateFilters.fetchScoreMonth();
//   axios.get(leagueScheduleUrl).then(response => {
//     response.data.lscd
//     .filter((month, i) => month.mscd.mon === "June")
//     .forEach(month => {
//       month.mscd.g
//       .filter((game, i) => moment(game.gdte).isAfter(moment('2024-04-15')))
//       .forEach(async (game) => {
//         // console.log('game is ', game);

//         // if game does not exist, insert game
//         const existingGame = await knex("schedule").where({ gid: game.gid.slice(2) }); 

//         if (!existingGame.length) {
//           console.log('game is not found in schedule, adding ', game.gid);

//           if (game.etm === 'TBD') {
//             console.log('start time is TBD for game.gid ', game.gid);
//             return;
//           }

//           let hObj = {
//             tid: game.h.tid,
//             re: game.h.re,
//             ta: game.h.ta,
//             tn: game.h.tn,
//             tc: game.h.tc,
//             s: game.h.s
//           };
//           let vObj = {
//             tid: game.v.tid,
//             re: game.v.re,
//             ta: game.v.ta,
//             tn: game.v.tn,
//             tc: game.v.tc,
//             s: game.v.s
//           };

//           try {
//             await knex("schedule")
//               .insert({
//                 gid: game.gid,
//                 gcode: game.gcode,
//                 gdte: game.gdte,
//                 an: game.an,
//                 ac: game.ac,
//                 as: game.as,
//                 etm: moment(game.etm).subtract(3, 'hours'),
//                 gweek: 28, // temp while figuring this out
//                 h: [hObj],
//                 v: [vObj],
//                 stt: game.stt,
//                 season_year: currentNbaSeasonInt,
//                 season_name: 'regular', // needs this for fetchApiData to work
//                 display_year: getCurrentNbaSeason(),
//                 bovada_url: formBovadaUrl(game),
//                 updated_at: new Date(),
//               });
//             console.log("game added", game.gid);
//           } catch (e) {
//             console.log('error adding game ', game.gid, e);
//           }

//         } else {
//           console.log('game already exists in schedule ', game.gid);
//         }
//       });
//     });
//   });
// };

