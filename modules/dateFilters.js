const moment = require('moment');
// let nbaDate = moment().format('YYYYMMDD');

module.exports = {
  fetchScoreMonth: function () {
    // This fn is an array shortcut to cut through the league schedule JSON
    let month = moment().format('M');
    switch (true) {
      case (month == 9):
        return 0;
      case (month == 10):
        return 1;
      case (month == 11):
        return 2;
      case (month == 12):
        return 3;
      case (month == 1):
        return 4;
      case (month == 2):
        return 5;
      case (month == 3):
        return 6;
      case (month == 4):
        return 7;
      default:
        return 8;
    }
  },
  fetchGmWk: function (date) {
    switch (true) {
      case (date > 20181015 && date < 20181022):
        return 1;
      case (date > 20181021 && date < 20181029):
        return 2;
      case (date > 20181028 && date < 20181105):
        return 3;
      case (date > 20181104 && date < 20181112):
        return 4;
      case (date > 20181111 && date < 20181119):
        return 5;
      case (date > 20181118 && date < 20181126):
        return 6;
      case (date > 20181125 && date < 20181203):
        return 7;
      case (date > 20181202 && date < 20181210):
        return 8;
      case (date > 20181209 && date < 20181217):
        return 9;
      case (date > 20181216 && date < 20181224):
        return 10;
      case (date > 20181223 && date < 20181231):
        return 11;
      case (date > 20181230 && date < 20190107):
        return 12;
      case (date > 20190106 && date < 20190114):
        return 13;
      case (date > 20190113 && date < 20190121):
        return 14;
      case (date > 20190120 && date < 20190128):
        return 15;
      case (date > 20190127 && date < 20190204):
        return 16;
      case (date > 20190203 && date < 20190211):
        return 17;
      case (date > 20190210 && date < 20190218):
        return 18;
      case (date > 20190217 && date < 20190225):
        return 19;
      case (date > 20190224 && date < 20190304):
        return 20;
      case (date > 20190303 && date < 20190311):
        return 21;
      case (date > 20190310 && date < 20190318):
        return 22;
      case (date > 20190317 && date < 20190325):
        return 23;
      case (date > 20190324 && date < 20190401):
        return 24;
      case (date > 20190331 && date < 20190408):
        return 25;
      case (date > 20190407 && date < 20190411):
        return 26;
      default:
        return 0;
    }
  }
}
