import moment from 'moment-timezone';
import * as Db from './Db.Controller.js';

export const getSeasonStartEndDates = (season) => {
  if (season === 2024) {
    return ['2024-10-22', '2025-04-13'];
  } else {
    throw new Error('Add season start dates for ', season, ' in Schedule.Controller.js');
  }
}

export const getCurrentNbaSeason = () => {
  if (moment().isBefore('2024-09-01')) {
    return '2023-24';
  } else if (moment().isBefore(`2025-09-01`)) {
    return '2024-25';
  } else if (moment().isBefore(`2026-10-01`)) {
    return '2025-26';
  } else if (moment().isBefore(`2027-10-01`)) {
    return '2026-27';
  } else if (moment().isBefore(`2028-10-01`)) {
    return '2027-28';
  } else {
    throw new Error('configure Schedule.Controller.js for getCurrentNbaSeason()');
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
    'timezone': 'America/Los_Angeles'
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
  .where({
    gdte: date,
    stt: 'Final'
  })
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
