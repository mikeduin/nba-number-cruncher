const moment = require('moment-timezone');
const Db = require('./Db.Controller');

exports.getSeasonStartEndDates = (season) => {
  if (season === 2024) {
    return ['2024-10-22', '2025-04-13'];
  } else {
    throw new Error('Add season start dates for ', season, ' in Schedule.Controller.js');
  }
}

exports.getCurrentNbaSeason = () => {
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

exports.getTodaysGames = async (today) => {
  const games = await Db.Schedule().where({gdte: today});
  return games;
}

exports.buildSeasonGameWeekArray = (seasonStart, seasonEnd) => {
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
