const moment = require("moment");
// let nbaDate = moment().format('YYYYMMDD');

module.exports = {
  fetchScoreMonth: function() {
    // This fn is an array shortcut to cut through the league schedule JSON
    let month = moment().format("M");
    switch (true) {
      case month == 9:
        return 0;
      case month == 10:
        return 1;
      case month == 11:
        return 2;
      case month == 12:
        return 3;
      case month == 1:
        return 4;
      case month == 2:
        return 5;
      case month == 3:
        return 6;
      case month == 4:
        return 7;
      default:
        return 8;
    }
  },
  fetchGmWk: function(date, season, stage) {
    if (season == 2018) {
      switch (true) {
        case date > 20181015 && date < 20181022:
          return 1;
        case date > 20181021 && date < 20181029:
          return 2;
        case date > 20181028 && date < 20181105:
          return 3;
        case date > 20181104 && date < 20181112:
          return 4;
        case date > 20181111 && date < 20181119:
          return 5;
        case date > 20181118 && date < 20181126:
          return 6;
        case date > 20181125 && date < 20181203:
          return 7;
        case date > 20181202 && date < 20181210:
          return 8;
        case date > 20181209 && date < 20181217:
          return 9;
        case date > 20181216 && date < 20181224:
          return 10;
        case date > 20181223 && date < 20181231:
          return 11;
        case date > 20181230 && date < 20190107:
          return 12;
        case date > 20190106 && date < 20190114:
          return 13;
        case date > 20190113 && date < 20190121:
          return 14;
        case date > 20190120 && date < 20190128:
          return 15;
        case date > 20190127 && date < 20190204:
          return 16;
        case date > 20190203 && date < 20190211:
          return 17;
        case date > 20190210 && date < 20190218:
          return 18;
        case date > 20190217 && date < 20190225:
          return 19;
        case date > 20190224 && date < 20190304:
          return 20;
        case date > 20190303 && date < 20190311:
          return 21;
        case date > 20190310 && date < 20190318:
          return 22;
        case date > 20190317 && date < 20190325:
          return 23;
        case date > 20190324 && date < 20190401:
          return 24;
        case date > 20190331 && date < 20190408:
          return 25;
        case date > 20190407 && date < 20190411:
          return 26;
        default:
          return 0;
      }
    } else if (season == 2019 && date > 20191021) {
      switch (true) {
        case date > 20191021 && date < 20191028:
          return 1;
        case date > 20191027 && date < 20191104:
          return 2;
        case date > 20191103 && date < 20191111:
          return 3;
        case date > 20191110 && date < 20191118:
          return 4;
        case date > 20191117 && date < 20191125:
          return 5;
        case date > 20191124 && date < 20191202:
          return 6;
        case date > 20191201 && date < 20191209:
          return 7;
        case date > 20191208 && date < 20191216:
          return 8;
        case date > 20191215 && date < 20191223:
          return 9;
        case date > 20191222 && date < 20191230:
          return 10;
        case date > 20191229 && date < 20200106:
          return 11;
        case date > 20200105 && date < 20200113:
          return 12;
        case date > 20200112 && date < 20200120:
          return 13;
        case date > 20200119 && date < 20200127:
          return 14;
        case date > 20200126 && date < 20200203:
          return 15;
        case date > 20200202 && date < 20200210:
          return 16;
        case date > 20200209 && date < 20200217:
          return 17;
        case date > 20200216 && date < 20200224:
          return 18;
        case date > 20200223 && date < 20200303:
          return 19;
        case date > 20200302 && date < 20200310:
          return 20;
        case date > 20200309 && date < 20200317:
          return 21;
        case date > 20200316 && date < 20200324:
          return 22;
        case date > 20200323 && date < 20200331:
          return 23;
        case date > 20200330 && date < 20200407:
          return 24;
        case date > 20200406 && date < 20200414:
          return 25;
        case date > 20200413 && date < 20200416:
          return 26;
        default:
          return 0;
      }
    } else if (season == 2019 && date < 20191022) {
      switch (true) {
        case date > 20190901 && date < 20190909:
          return 1;
        case date > 20190908 && date < 20190916:
          return 2;
        case date > 20190915 && date < 20190923:
          return 3;
        case date > 20190922 && date < 20190930:
          return 4;
        case date > 20190929 && date < 20191007:
          return 5;
        case date > 20191006 && date < 20191014:
          return 6;
        case date > 20191013 && date < 20191021:
          return 7;
        case date > 20191020 && date < 20191022:
          return 8;
        default:
          return 0;
      }
    }
  },
  fetchGmWkArrays: function(week, season, stage, date) {
    const summerArray19 = [
      [null],
      [20190701, 20190702, 20190703, 20190704, 20190705, 20190706, 20190707],
      [20190708, 20190709, 20190710, 20190711, 20190712, 20190713, 20190714]
    ];
    const seasonArray18 = [
      [null],
      [20181016, 20181017, 20181018, 20181019, 20181020, 20181021],
      [20181022, 20181023, 20181024, 20181025, 20181026, 20181027, 20181028],
      [20181029, 20181030, 20181031, 20181101, 20181102, 20181103, 20181104],
      [20181105, 20181106, 20181107, 20181108, 20181109, 20181110, 20181111],
      [20181112, 20181113, 20181114, 20181115, 20181116, 20181117, 20181118],
      [20181119, 20181120, 20181121, 20181122, 20181123, 20181124, 20181125],
      [20181126, 20181127, 20181128, 20181129, 20181130, 20181201, 20181202],
      [20181203, 20181204, 20181205, 20181206, 20181207, 20181208, 20181209],
      [20181210, 20181211, 20181212, 20181213, 20181214, 20181215, 20181216],
      [20181217, 20181218, 20181219, 20181220, 20181221, 20181222, 20181223],
      [20181224, 20181225, 20181226, 20181227, 20181228, 20181229, 20181230],
      [20181231, 20190101, 20190102, 20190103, 20190104, 20190105, 20190106],
      [20190107, 20190108, 20190109, 20190110, 20190111, 20190112, 20190113],
      [20190114, 20190115, 20190116, 20190117, 20190118, 20190119, 20190120],
      [20190121, 20190122, 20190123, 20190124, 20190125, 20190126, 20190127],
      [20190128, 20190129, 20190130, 20190131, 20190201, 20190202, 20190203],
      [20190204, 20190205, 20190206, 20190207, 20190208, 20190209, 20190210],
      [20190211, 20190212, 20190213, 20190214, 20190215, 20190216, 20190217],
      [20190218, 20190219, 20190220, 20190221, 20190222, 20190223, 20190224],
      [20190225, 20190226, 20190227, 20190228, 20190301, 20190302, 20190303],
      [20190304, 20190305, 20190306, 20190307, 20190308, 20190309, 20190310],
      [20190311, 20190312, 20190313, 20190314, 20190315, 20190316, 20190317],
      [20190318, 20190319, 20190320, 20190321, 20190322, 20190323, 20190324],
      [20190325, 20190326, 20190327, 20190328, 20190329, 20190330, 20190331],
      [20190401, 20190402, 20190403, 20190404, 20190405, 20190406, 20190407],
      [20190408, 20190409, 20190410, 20190411]
    ];
    const offseasonArray19 = [
      [null],
      [20190902, 20190903, 20190904, 20190905, 20190906, 20190907, 20190908],
      [20190909, 20190910, 20190911, 20190912, 20190913, 20190914, 20190915],
      [20190916, 20190917, 20190918, 20190919, 20190920, 20190921, 20190922],
      [20190923, 20190924, 20190925, 20190926, 20190927, 20190928, 20190929],
      [20190930, 20191001, 20191002, 20191003, 20191004, 20191005, 20191006],
      [20191007, 20191008, 20191009, 20191010, 20191011, 20191012, 20191013],
      [20191014, 20191015, 20191016, 20191017, 20191018, 20191019, 20191020],
      [20191021]
    ];
    const seasonArray19 = [
      [null],
      [20181022, 20181023, 20181024, 20181025, 20181026, 20181027],
      [20181028, 20181029, 20181030, 20181031, 20181101, 20181102, 20181103],
      [20181104, 20181105, 20181106, 20181107, 20181108, 20181109, 20181110],
      [20181111, 20181112, 20181113, 20181114, 20181115, 20181116, 20181117],
      [20181118, 20181119, 20181120, 20181121, 20181122, 20181123, 20181124],
      [20181125, 20181126, 20181127, 20181128, 20181129, 20181130, 20181201],
      [20181202, 20181203, 20181204, 20181205, 20181206, 20181207, 20181208],
      [20181209, 20181210, 20181211, 20181212, 20181213, 20181214, 20181215],
      [20181216, 20181217, 20181218, 20181219, 20181220, 20181221, 20181222],
      [20181223, 20181224, 20181225, 20181226, 20181227, 20181228, 20181229],
      [20181230, 20191231, 20200101, 20200102, 20200103, 20200104, 20200105],
      [20200106, 20200107, 20200108, 20200109, 20200110, 20200111, 20200112],
      [20200113, 20200114, 20200115, 20200116, 20200117, 20200118, 20200119],
      [20200120, 20200121, 20200122, 20200123, 20200124, 20200125, 20200126],
      [20200127, 20200128, 20200129, 20200130, 20200131, 20200201, 20200202],
      [20200203, 20200204, 20200205, 20200206, 20200207, 20200208, 20200209],
      [20200210, 20200211, 20200212, 20200213, 20200214, 20200215, 20200216],
      [20200217, 20200218, 20200219, 20200220, 20200221, 20200222, 20200223],
      [20200224, 20200225, 20200226, 20200227, 20200228, 20200301, 20200302],
      [20200303, 20200304, 20200305, 20200306, 20200307, 20200308, 20200309],
      [20200310, 20200311, 20200312, 20200313, 20200314, 20200315, 20200316],
      [20200317, 20200318, 20200319, 20200320, 20200321, 20200322, 20200323],
      [20200324, 20200325, 20200326, 20200327, 20200328, 20200329, 20200330],
      [20200331, 20200401, 20200402, 20200403, 20200404, 20200405, 20200406],
      [20200407, 20200408, 20200409, 20200410, 20200411, 20200412, 20200413],
      [20200414, 20200415]
    ];

    if (season == 2018) {
      return seasonArray18[week];
    } else if (season == 2019 && date < 20191022) {
      return offseasonArray19[week];
    } else if (season == 2019 && date > 20191021) {
      return seasonArray19[week];
    } else {
      console.log('error in date filters - no applicable week found, returning null');
      return null;
    }
  }
};
