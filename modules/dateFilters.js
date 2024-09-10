const moment = require("moment");
const ScheduleController = require( "../controllers/Schedule.Controller");
const { buildSeasonGameWeekArray, getCurrentNbaSeason, getSeasonStartEndDates } = ScheduleController;
// let nbaDate = moment().format('YYYYMMDD');

module.exports = {
  fetchCurrentSeason: () => {
    const date = moment().format('YYYYMMDD');
    if (date < '20200910') {
      return 2019
    } else if (date < '20210910') {
      return 2020
    } else if (date < '20220910') {
      return 2021
    } else if (date < '20230910') {
      return 2022
    } else if (date < '20240901') {
      return 2023
    } else if (date < '20250901') {
      return 2024
    } else if (date < '20260901') {
      return 2025
    }
  },
  fetchSeasonName: function (date) {
    if (date < 20201022) {
      return "pre";
    } else if (date < 20250522) {
      return "regular";
    } else {
      return "post";
    }
  },
  fetchScoreMonth: function() {
    // This fn is an array shortcut to cut through the league schedule JSON
    let month = moment().format("M");
    let season = moment().format("Y");
    // console.log('season is ', season);
    if (parseInt(season) === 2021 && moment().isBefore('2021-07-01')) {
      switch (true) {
        case month == 12:
          return 0;
        case month == 1:
          return 1;
        case month == 2:
          return 2;
        case month == 3:
          return 3;
        case month == 4:
          return 4;
        case month == 5:
          return 5;
        case month == 6:
          return 6;
        case month == 7:
          return 7;
        default:
          return 8;
      }
    } else {
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
        case date > 20200223 && date < 20200302:
          return 19;
        case date > 20200301 && date < 20200309:
          return 20;
        case date > 20200308 && date < 20200316:
          return 21;
        case date > 20200315 && date < 20200323:
          return 22;
        case date > 20200322 && date < 20200330:
          return 23;
        case date > 20200329 && date < 20200406:
          return 24;
        case date > 20200405 && date < 20200413:
          return 25;
        case date > 20200412 && date < 20200416:
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
    } else if (season == 2020) {
      let gameWkArray = [
        [20201214,20201215,20201216,20201217,20201218,20201219,20201220],
        [20201221,20201222,20201223,20201224,20201225,20201226,20201227],
        [20201228,20201229,20201230,20201231,20210101,20210102,20210103],
        [20210104,20210105,20210106,20210107,20210108,20210109,20210110],
        [20210111,20210112,20210113,20210114,20210115,20210116,20210117],
        [20210118,20210119,20210120,20210121,20210122,20210123,20210124],
        [20210125,20210126,20210127,20210128,20210129,20210130,20210131],
        [20210201,20210202,20210203,20210204,20210205,20210206,20210207],
        [20210208,20210209,20210210,20210211,20210212,20210213,20210214],
        [20210215,20210216,20210217,20210218,20210219,20210220,20210221],
        [20210222,20210223,20210224,20210225,20210226,20210227,20210228],
        [20210301,20210302,20210303,20210304,20210305,20210306,20210307],
        [20210308,20210309,20210310,20210311,20210312,20210313,20210314],
        [20210315,20210316,20210317,20210318,20210319,20210320,20210321],
        [20210322,20210323,20210324,20210325,20210326,20210327,20210328],
        [20210329,20210330,20210331,20210401,20210402,20210403,20210404],
        [20210405,20210406,20210407,20210408,20210409,20210410,20210411],
        [20210412,20210413,20210414,20210415,20210416,20210417,20210418],
        [20210419,20210420,20210421,20210422,20210423,20210424,20210425],
        [20210426,20210427,20210428,20210429,20210430,20210501,20210502],
        [20210503,20210504,20210505,20210506,20210507,20210508,20210509],
        [20210510,20210511,20210512,20210513,20210514,20210515,20210516]
      ]

      for (var i = 0; i < gameWkArray.length; i++) {
        if (gameWkArray[i].includes(parseInt(date))) {
          wk = i;
          break;
        }
      }
      return wk;
    } else if (season == 2021) {
      switch (true) {
        case date > 20211018 && date < 20211025:
          return 1;
        case date > 20211024 && date < 20211101:
          return 2;
        case date > 20211031 && date < 20211108:
          return 3;
        case date > 20211107 && date < 20211115:
          return 4;
        case date > 20211114 && date < 20211122:
          return 5;
        case date > 20211121 && date < 20211129:
          return 6;
        case date > 20211128 && date < 20211206:
          return 7;
        case date > 20211205 && date < 20211213:
          return 8;
        case date > 20211212 && date < 20211220:
          return 9;
        case date > 20211219 && date < 20211227:
          return 10;
        case date > 20211226 && date < 20220103:
          return 11;
        case date > 20220102 && date < 20220110:
          return 12;
        case date > 20220109 && date < 20220117:
          return 13;
        case date > 20220116 && date < 20220124:
          return 14;
        case date > 20220123 && date < 20220131:
          return 15;
        case date > 20220130 && date < 20220207:
          return 16;
        case date > 20220206 && date < 20220214:
          return 17;
        case date > 20220213 && date < 20220221:
          return 18;
        case date > 20220220 && date < 20220228:
          return 19;
        case date > 20220227 && date < 20220306:
          return 20;
        case date > 20220305 && date < 20220313:
          return 21;
        case date > 20220312 && date < 20220320:
          return 22;
        case date > 20220319 && date < 20220327:
          return 23;
        case date > 20220326 && date < 20220403:
          return 24;
        case date > 20220402 && date < 20220410:
          return 25;
        case date > 20220409 && date < 20220413:
          return 26;
        default:
          return 0;
      }
    } else if (season == 2022) {
      const gameWkArray = [
        [20221010, 20221011, 20221012, 20221013, 20221014, 20221015, 20221016],
        [20221017, 20221018, 20221019, 20221020, 20221021, 20221022, 20221023],
        [20221024, 20221025, 20221026, 20221027, 20221028, 20221029, 20221030],
        [20221031, 20221101, 20221102, 20221103, 20221104, 20221105, 20221106],
        [20221107, 20221108, 20221109, 20221110, 20221111, 20221112, 20221113],
        [20221114, 20221115, 20221116, 20221117, 20221118, 20221119, 20221120],
        [20221121, 20221122, 20221123, 20221124, 20221125, 20221126, 20221127],
        [20221128, 20221129, 20221130, 20221201, 20221202, 20221203, 20221204],
        [20221205, 20221206, 20221207, 20221208, 20221209, 20221210, 20221211],
        [20221212, 20221213, 20221214, 20221215, 20221216, 20221217, 20221218],
        [20221219, 20221220, 20221221, 20221222, 20221223, 20221224, 20221225],
        [20221226, 20221227, 20221228, 20221229, 20221230, 20221231, 20230101],
        [20230102, 20230103, 20230104, 20230105, 20230106, 20230107, 20230108],
        [20230109, 20230110, 20230111, 20230112, 20230113, 20230114, 20230115],
        [20230116, 20230117, 20230118, 20230119, 20230120, 20230121, 20230122],
        [20230123, 20230124, 20230125, 20230126, 20230127, 20230128, 20230129],
        [20230130, 20230131, 20230201, 20230202, 20230203, 20230204, 20230205],
        [20230206, 20230207, 20230208, 20230209, 20230210, 20230211, 20230212],
        [20230213, 20230214, 20230215, 20230216, 20230217, 20230218, 20230219],
        [20230220, 20230221, 20230222, 20230223, 20230224, 20230225, 20230226],
        [20230227, 20230228, 20230301, 20230302, 20230303, 20230304, 20230305],
        [20230306, 20230307, 20230308, 20230309, 20230310, 20230311, 20230312],
        [20230313, 20230314, 20230315, 20230316, 20230317, 20230318, 20230319],
        [20230320, 20230321, 20230322, 20230323, 20230324, 20230325, 20230326],
        [20230327, 20230328, 20230329, 20230330, 20230331, 20230401, 20230402],
        [20230403, 20230404, 20230405, 20230406, 20230407, 20230408, 20230409]
      ];
      for (var i = 0; i < gameWkArray.length; i++) {
        if (gameWkArray[i].includes(parseInt(date))) {
          wk = i;
          break;
        }
      }
      return wk;
    } else if (season == 2023) {
      const gameWkArray = [
        [20221009,20221010,20221011,20221012,20221013,20221014,20221015], // in 2023 update, when pulling from Survivor data, needed to manually add a prelim week here
        [20231016,20231017,20231018,20231019,20231020,20231021,20231022],
        [20231023,20231024,20231025,20231026,20231027,20231028,20231029],
        [20231030,20231031,20231101,20231102,20231103,20231104,20231105],
        [20231106,20231107,20231108,20231109,20231110,20231111,20231112],
        [20231113,20231114,20231115,20231116,20231117,20231118,20231119],
        [20231120,20231121,20231122,20231123,20231124,20231125,20231126],
        [20231127,20231128,20231129,20231130,20231201,20231202,20231203],
        [20231204,20231205,20231206,20231207,20231208,20231209,20231210],
        [20231211,20231212,20231213,20231214,20231215,20231216,20231217],
        [20231218,20231219,20231220,20231221,20231222,20231223,20231224],
        [20231225,20231226,20231227,20231228,20231229,20231230,20231231],
        [20240101,20240102,20240103,20240104,20240105,20240106,20240107],
        [20240108,20240109,20240110,20240111,20240112,20240113,20240114],
        [20240115,20240116,20240117,20240118,20240119,20240120,20240121],
        [20240122,20240123,20240124,20240125,20240126,20240127,20240128],
        [20240129,20240130,20240131,20240201,20240202,20240203,20240204],
        [20240205,20240206,20240207,20240208,20240209,20240210,20240211],
        [20240212,20240213,20240214,20240215,20240216,20240217,20240218],
        [20240219,20240220,20240221,20240222,20240223,20240224,20240225],
        [20240226,20240227,20240228,20240229,20240301,20240302,20240303],
        [20240304,20240305,20240306,20240307,20240308,20240309,20240310],
        [20240311,20240312,20240313,20240314,20240315,20240316,20240317],
        [20240318,20240319,20240320,20240321,20240322,20240323,20240324],
        [20240325,20240326,20240327,20240328,20240329,20240330,20240331],
        [20240401,20240402,20240403,20240404,20240405,20240406,20240407],
        [20240408,20240409,20240410,20240411,20240412,20240413,20240414],
        [20240415,20240416,20240417,20240418,20240419,20240420,20240421],
        [20240422,20240423,20240424,20240425,20240426,20240427,20240428],
        [20240429,20240430,20240501,20240502,20240503,20240504,20240505],
        [20240506,20240507,20240508,20240509,20240510,20240511,20240512],
        [20240513,20240514,20240515,20240516,20240517,20240518,20240519],
        [20240520,20240521,20240522,20240523,20240524,20240525,20240526],
        [20240527,20240528,20240529,20240530,20240531,20240601,20240602],
        [20240603,20240604,20240605,20240606,20240607,20240608,20240609],
        [20240610,20240611,20240612,20240613,20240614,20240615,20240616],
        [20240617,20240618,20240619,20240620,20240621,20240622,20240623],
      ];
      for (var i = 0; i < gameWkArray.length; i++) {
        if (gameWkArray[i].includes(parseInt(date))) {
          wk = i;
          break;
        }
      }
      return wk;
    } else {
      let wk = 0;
      const currentSeasonInt = parseInt(getCurrentNbaSeason().slice(0, 4))
      const [seasonStart, seasonEnd] = getSeasonStartEndDates(currentSeasonInt);
      const { intDateWeeks } = buildSeasonGameWeekArray(seasonStart, seasonEnd);
      for (var i = 0; i < intDateWeeks.length; i++) {
        if (intDateWeeks[i].includes(parseInt(date))) {
          wk = i;
          break;
        }
      }
      return wk;
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
      [20191021, 20191022, 20191023, 20191024, 20191025, 20191026, 20191027]
    ];
    const seasonArray19 = [
      [null],
      [20191021, 20191022, 20191023, 20191024, 20191025, 20191026, 20191027],
      [20191028, 20191029, 20191030, 20191031, 20191101, 20191102, 20191103],
      [20191104, 20191105, 20191106, 20191107, 20191108, 20191109, 20191110],
      [20191111, 20191112, 20191113, 20191114, 20191115, 20191116, 20191117],
      [20191118, 20191119, 20191120, 20191121, 20191122, 20191123, 20191124],
      [20191125, 20191126, 20191127, 20191128, 20191129, 20191130, 20191201],
      [20191202, 20191203, 20191204, 20191205, 20191206, 20191207, 20191208],
      [20191209, 20191210, 20191211, 20191212, 20191213, 20191214, 20191215],
      [20191216, 20191217, 20191218, 20191219, 20191220, 20191221, 20191222],
      [20191223, 20191224, 20191225, 20191226, 20191227, 20191228, 20191229],
      [20191230, 20191231, 20200101, 20200102, 20200103, 20200104, 20200105],
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
      [20200414, 20200415, 20200416, 20200417, 20200418, 20200419, 20200420]
    ];
    const seasonArray20 = [
      [20201214,20201215,20201216,20201217,20201218,20201219,20201220],
      [20201221,20201222,20201223,20201224,20201225,20201226,20201227],
      [20201228,20201229,20201230,20201231,20210101,20210102,20210103],
      [20210104,20210105,20210106,20210107,20210108,20210109,20210110],
      [20210111,20210112,20210113,20210114,20210115,20210116,20210117],
      [20210118,20210119,20210120,20210121,20210122,20210123,20210124],
      [20210125,20210126,20210127,20210128,20210129,20210130,20210131],
      [20210201,20210202,20210203,20210204,20210205,20210206,20210207],
      [20210208,20210209,20210210,20210211,20210212,20210213,20210214],
      [20210215,20210216,20210217,20210218,20210219,20210220,20210221],
      [20210222,20210223,20210224,20210225,20210226,20210227,20210228],
      [20210301,20210302,20210303,20210304,20210305,20210306,20210307],
      [20210308,20210309,20210310,20210311,20210312,20210313,20210314],
      [20210315,20210316,20210317,20210318,20210319,20210320,20210321],
      [20210322,20210323,20210324,20210325,20210326,20210327,20210328],
      [20210329,20210330,20210331,20210401,20210402,20210403,20210404],
      [20210405,20210406,20210407,20210408,20210409,20210410,20210411],
      [20210412,20210413,20210414,20210415,20210416,20210417,20210418],
      [20210419,20210420,20210421,20210422,20210423,20210424,20210425],
      [20210426,20210427,20210428,20210429,20210430,20210501,20210502],
      [20210503,20210504,20210505,20210506,20210507,20210508,20210509],
      [20210510,20210511,20210512,20210513,20210514,20210515,20210516]
    ];
    const seasonArray21 = [
      [20211011, 20211012, 20211013, 20211014, 20211015, 20211016, 20211017],
      [20211018, 20211019, 20211020, 20211021, 20211022, 20211023, 20211024],
      [20211025, 20211026, 20211027, 20211028, 20211029, 20211030, 20211031],
      [20211101, 20211102, 20211103, 20211104, 20211105, 20211106, 20211107],
      [20211108, 20211109, 20211110, 20211111, 20211112, 20211113, 20211114],
      [20211115, 20211116, 20211117, 20211118, 20211119, 20211120, 20211121],
      [20211122, 20211123, 20211124, 20211125, 20211126, 20211127, 20211128],
      [20211129, 20211130, 20211201, 20211202, 20211203, 20211204, 20211205],
      [20211206, 20211207, 20211208, 20211209, 20211210, 20211211, 20211212],
      [20211213, 20211214, 20211215, 20211216, 20211217, 20211218, 20211219],
      [20211220, 20211221, 20211222, 20211223, 20211224, 20211225, 20211226],
      [20211227, 20211228, 20211229, 20211230, 20211231, 20220101, 20220102],
      [20220103, 20220104, 20220105, 20220106, 20220107, 20220108, 20220109],
      [20220110, 20220111, 20220112, 20220113, 20220114, 20220115, 20220116],
      [20220117, 20220118, 20220119, 20220120, 20220121, 20220122, 20220123],
      [20220124, 20220125, 20220126, 20220127, 20220128, 20220129, 20220130],
      [20220131, 20220201, 20220202, 20220203, 20220204, 20220205, 20220206],
      [20220207, 20220208, 20220209, 20220210, 20220211, 20220212, 20220213],
      [20220214, 20220215, 20220216, 20220217, 20220218, 20220219, 20220220],
      [20220221, 20220222, 20220223, 20220224, 20220225, 20220226, 20220227],
      [20220228, 20220301, 20220302, 20220303, 20220304, 20220305, 20220306],
      [20220307, 20220308, 20220309, 20220310, 20220311, 20220312, 20220313],
      [20220314, 20220315, 20220316, 20220317, 20220318, 20220319, 20220320],
      [20220321, 20220322, 20220323, 20220324, 20220325, 20220326, 20220327],
      [20220328, 20220329, 20220330, 20220331, 20220401, 20220402, 20220403],
      [20220404, 20220405, 20220406, 20220407, 20220408, 20220409, 20220410],
    ];
    const seasonArray22 = [
      [20221010, 20221011, 20221012, 20221013, 20221014, 20221015, 20221016],
      [20221017, 20221018, 20221019, 20221020, 20221021, 20221022, 20221023],
      [20221024, 20221025, 20221026, 20221027, 20221028, 20221029, 20221030],
      [20221031, 20221101, 20221102, 20221103, 20221104, 20221105, 20221106],
      [20221107, 20221108, 20221109, 20221110, 20221111, 20221112, 20221113],
      [20221114, 20221115, 20221116, 20221117, 20221118, 20221119, 20221120],
      [20221121, 20221122, 20221123, 20221124, 20221125, 20221126, 20221127],
      [20221128, 20221129, 20221130, 20221201, 20221202, 20221203, 20221204],
      [20221205, 20221206, 20221207, 20221208, 20221209, 20221210, 20221211],
      [20221212, 20221213, 20221214, 20221215, 20221216, 20221217, 20221218],
      [20221219, 20221220, 20221221, 20221222, 20221223, 20221224, 20221225],
      [20221226, 20221227, 20221228, 20221229, 20221230, 20221231, 20230101],
      [20230102, 20230103, 20230104, 20230105, 20230106, 20230107, 20230108],
      [20230109, 20230110, 20230111, 20230112, 20230113, 20230114, 20230115],
      [20230116, 20230117, 20230118, 20230119, 20230120, 20230121, 20230122],
      [20230123, 20230124, 20230125, 20230126, 20230127, 20230128, 20230129],
      [20230130, 20230131, 20230201, 20230202, 20230203, 20230204, 20230205],
      [20230206, 20230207, 20230208, 20230209, 20230210, 20230211, 20230212],
      [20230213, 20230214, 20230215, 20230216, 20230217, 20230218, 20230219],
      [20230220, 20230221, 20230222, 20230223, 20230224, 20230225, 20230226],
      [20230227, 20230228, 20230301, 20230302, 20230303, 20230304, 20230305],
      [20230306, 20230307, 20230308, 20230309, 20230310, 20230311, 20230312],
      [20230313, 20230314, 20230315, 20230316, 20230317, 20230318, 20230319],
      [20230320, 20230321, 20230322, 20230323, 20230324, 20230325, 20230326],
      [20230327, 20230328, 20230329, 20230330, 20230331, 20230401, 20230402],
      [20230403, 20230404, 20230405, 20230406, 20230407, 20230408, 20230409]
    ];
    const seasonArray23 = [
      [20231009,20221010,20221011,20221012,20221013,20221014,20221015], // in 2023 update, when pulling from Survivor data, needed to manually add a prelim week here
      [20231016,20231017,20231018,20231019,20231020,20231021,20231022],
      [20231023,20231024,20231025,20231026,20231027,20231028,20231029],
      [20231030,20231031,20231101,20231102,20231103,20231104,20231105],
      [20231106,20231107,20231108,20231109,20231110,20231111,20231112],
      [20231113,20231114,20231115,20231116,20231117,20231118,20231119],
      [20231120,20231121,20231122,20231123,20231124,20231125,20231126],
      [20231127,20231128,20231129,20231130,20231201,20231202,20231203],
      [20231204,20231205,20231206,20231207,20231208,20231209,20231210],
      [20231211,20231212,20231213,20231214,20231215,20231216,20231217],
      [20231218,20231219,20231220,20231221,20231222,20231223,20231224],
      [20231225,20231226,20231227,20231228,20231229,20231230,20231231],
      [20240101,20240102,20240103,20240104,20240105,20240106,20240107],
      [20240108,20240109,20240110,20240111,20240112,20240113,20240114],
      [20240115,20240116,20240117,20240118,20240119,20240120,20240121],
      [20240122,20240123,20240124,20240125,20240126,20240127,20240128],
      [20240129,20240130,20240131,20240201,20240202,20240203,20240204],
      [20240205,20240206,20240207,20240208,20240209,20240210,20240211],
      [20240212,20240213,20240214,20240215,20240216,20240217,20240218],
      [20240219,20240220,20240221,20240222,20240223,20240224,20240225],
      [20240226,20240227,20240228,20240229,20240301,20240302,20240303],
      [20240304,20240305,20240306,20240307,20240308,20240309,20240310],
      [20240311,20240312,20240313,20240314,20240315,20240316,20240317],
      [20240318,20240319,20240320,20240321,20240322,20240323,20240324],
      [20240325,20240326,20240327,20240328,20240329,20240330,20240331],
      [20240401,20240402,20240403,20240404,20240405,20240406,20240407],
      [20240408,20240409,20240410,20240411,20240412,20240413,20240414],
      [20240415,20240416,20240417,20240418,20240419,20240420,20240421],
      [20240422,20240423,20240424,20240425,20240426,20240427,20240428],
      [20240429,20240430,20240501,20240502,20240503,20240504,20240505],
      [20240506,20240507,20240508,20240509,20240510,20240511,20240512],
      [20240513,20240514,20240515,20240516,20240517,20240518,20240519],
      [20240520,20240521,20240522,20240523,20240524,20240525,20240526],
      [20240527,20240528,20240529,20240530,20240531,20240601,20240602],
      [20240603,20240604,20240605,20240606,20240607,20240608,20240609],
      [20240610,20240611,20240612,20240613,20240614,20240615,20240616],
      [20240617,20240618,20240619,20240620,20240621,20240622,20240623],
    ]

    if (season == 2018) {
      return seasonArray18[week];
    } else if (season == 2019 && date < 20190902) {
      return offseasonArray19[1];
    } else if (season == 2019 && date < 20191022) {
      return offseasonArray19[week];
    } else if (season == 2019 && date > 20191021) {
      return seasonArray19[week];
    } else if (season == 2020) {
      return seasonArray20[week];
    } else if (season == 2021) {
      return seasonArray21[week];
    } else if (season == 2022) {
      return seasonArray22[week];
    } else if (season == 2023) {
      return seasonArray23[week];
    } else {
      const currentSeasonInt = parseInt(getCurrentNbaSeason().slice(0, 4));
      const [seasonStart, seasonEnd] = getSeasonStartEndDates(currentSeasonInt);
      const { intDateWeeks } = buildSeasonGameWeekArray(seasonStart, seasonEnd);
      return intDateWeeks[week];
    }
  }
};
