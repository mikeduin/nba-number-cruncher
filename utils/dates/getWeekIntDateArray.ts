import moment from "moment";

export const getWeekIntDateArray = (dashedDate: string): number[] => {
  const date = moment(dashedDate, "YYYYMMDD");

  // Find the Monday of the week
  const monday = date.clone().startOf('isoWeek');

  // Generate the array of dates from Monday to Sunday
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    weekDates.push(parseInt(monday.clone().add(i, 'days').format("YYYYMMDD")));
  }

  return weekDates;
}