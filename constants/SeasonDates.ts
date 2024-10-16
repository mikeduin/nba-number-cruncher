import { SeasonNameFull, YearlySeasonDates } from "../types"

// remember that dashedDateWeeks and intDateWeeks correspond to literal game weeks in schedule
// so, gameweek 1 in NBA schedule will be index[1] in arrays
// use buildSeasonGameWeekArray to get the correct week arrays

export const SEASON_DATES: YearlySeasonDates[] = [
  {
    yearInt: 2024,
    yearDisplay: '2024-25',
    systemStart: '2024-07-01',
    systemEnd: '2025-06-30',
    seasons: {
      [SeasonNameFull.SummerLeague]: {
        start: '2024-07-12',
        end: '2024-07-22',
        systemStart: '2024-07-08',
        systemEnd: '2024-08-01',
        dashedDateWeeks: [],
        intDateWeeks: []
      },
      [SeasonNameFull.Preseason]: {
        start: '2024-10-04', // first day of games
        end: '2024-10-18', // last day of games
        systemStart: '2024-09-23', // start of Week 0
        systemEnd: '2024-10-20', // last Sunday of Preseason
        dashedDateWeeks: [
          [
            '2024-09-23',
            '2024-09-24',
            '2024-09-25',
            '2024-09-26',
            '2024-09-27',
            '2024-09-28',
            '2024-09-29'
          ],
          [
            '2024-09-30',
            '2024-10-01',
            '2024-10-02',
            '2024-10-03',
            '2024-10-04',
            '2024-10-05',
            '2024-10-06'
          ],
          [
            '2024-10-07',
            '2024-10-08',
            '2024-10-09',
            '2024-10-10',
            '2024-10-11',
            '2024-10-12',
            '2024-10-13'
          ],
          [
            '2024-10-14',
            '2024-10-15',
            '2024-10-16',
            '2024-10-17',
            '2024-10-18',
            '2024-10-19',
            '2024-10-20'
          ]
        ],
        intDateWeeks: [
          [
            20240923, 20240924,
            20240925, 20240926,
            20240927, 20240928,
            20240929
          ],
          [
            20240930, 20241001,
            20241002, 20241003,
            20241004, 20241005,
            20241006
          ],
          [
            20241007, 20241008,
            20241009, 20241010,
            20241011, 20241012,
            20241013
          ],
          [
            20241014, 20241015,
            20241016, 20241017,
            20241018, 20241019,
            20241020
          ]
        ]
      }, 
      [SeasonNameFull.RegularSeason]: {
        start: '2024-10-22',
        end: '2025-04-13',
        systemStart: '2024-10-21',
        systemEnd: '2025-04-14', // one day after season ends
        dashedDateWeeks: [
          [
            '2024-10-14',
            '2024-10-15',
            '2024-10-16',
            '2024-10-17',
            '2024-10-18',
            '2024-10-19',
            '2024-10-20'
          ],
          [
            '2024-10-21',
            '2024-10-22',
            '2024-10-23',
            '2024-10-24',
            '2024-10-25',
            '2024-10-26',
            '2024-10-27'
          ],
          [
            '2024-10-28',
            '2024-10-29',
            '2024-10-30',
            '2024-10-31',
            '2024-11-01',
            '2024-11-02',
            '2024-11-03'
          ],
          [
            '2024-11-04',
            '2024-11-05',
            '2024-11-06',
            '2024-11-07',
            '2024-11-08',
            '2024-11-09',
            '2024-11-10'
          ],
          [
            '2024-11-11',
            '2024-11-12',
            '2024-11-13',
            '2024-11-14',
            '2024-11-15',
            '2024-11-16',
            '2024-11-17'
          ],
          [
            '2024-11-18',
            '2024-11-19',
            '2024-11-20',
            '2024-11-21',
            '2024-11-22',
            '2024-11-23',
            '2024-11-24'
          ],
          [
            '2024-11-25',
            '2024-11-26',
            '2024-11-27',
            '2024-11-28',
            '2024-11-29',
            '2024-11-30',
            '2024-12-01'
          ],
          [
            '2024-12-02',
            '2024-12-03',
            '2024-12-04',
            '2024-12-05',
            '2024-12-06',
            '2024-12-07',
            '2024-12-08'
          ],
          [
            '2024-12-09',
            '2024-12-10',
            '2024-12-11',
            '2024-12-12',
            '2024-12-13',
            '2024-12-14',
            '2024-12-15'
          ],
          [
            '2024-12-16',
            '2024-12-17',
            '2024-12-18',
            '2024-12-19',
            '2024-12-20',
            '2024-12-21',
            '2024-12-22'
          ],
          [
            '2024-12-23',
            '2024-12-24',
            '2024-12-25',
            '2024-12-26',
            '2024-12-27',
            '2024-12-28',
            '2024-12-29'
          ],
          [
            '2024-12-30',
            '2024-12-31',
            '2025-01-01',
            '2025-01-02',
            '2025-01-03',
            '2025-01-04',
            '2025-01-05'
          ],
          [
            '2025-01-06',
            '2025-01-07',
            '2025-01-08',
            '2025-01-09',
            '2025-01-10',
            '2025-01-11',
            '2025-01-12'
          ],
          [
            '2025-01-13',
            '2025-01-14',
            '2025-01-15',
            '2025-01-16',
            '2025-01-17',
            '2025-01-18',
            '2025-01-19'
          ],
          [
            '2025-01-20',
            '2025-01-21',
            '2025-01-22',
            '2025-01-23',
            '2025-01-24',
            '2025-01-25',
            '2025-01-26'
          ],
          [
            '2025-01-27',
            '2025-01-28',
            '2025-01-29',
            '2025-01-30',
            '2025-01-31',
            '2025-02-01',
            '2025-02-02'
          ],
          [
            '2025-02-03',
            '2025-02-04',
            '2025-02-05',
            '2025-02-06',
            '2025-02-07',
            '2025-02-08',
            '2025-02-09'
          ],
          [
            '2025-02-10',
            '2025-02-11',
            '2025-02-12',
            '2025-02-13',
            '2025-02-14',
            '2025-02-15',
            '2025-02-16'
          ],
          [
            '2025-02-17',
            '2025-02-18',
            '2025-02-19',
            '2025-02-20',
            '2025-02-21',
            '2025-02-22',
            '2025-02-23'
          ],
          [
            '2025-02-24',
            '2025-02-25',
            '2025-02-26',
            '2025-02-27',
            '2025-02-28',
            '2025-03-01',
            '2025-03-02'
          ],
          [
            '2025-03-03',
            '2025-03-04',
            '2025-03-05',
            '2025-03-06',
            '2025-03-07',
            '2025-03-08',
            '2025-03-09'
          ],
          [
            '2025-03-10',
            '2025-03-11',
            '2025-03-12',
            '2025-03-13',
            '2025-03-14',
            '2025-03-15',
            '2025-03-16'
          ],
          [
            '2025-03-17',
            '2025-03-18',
            '2025-03-19',
            '2025-03-20',
            '2025-03-21',
            '2025-03-22',
            '2025-03-23'
          ],
          [
            '2025-03-24',
            '2025-03-25',
            '2025-03-26',
            '2025-03-27',
            '2025-03-28',
            '2025-03-29',
            '2025-03-30'
          ],
          [
            '2025-03-31',
            '2025-04-01',
            '2025-04-02',
            '2025-04-03',
            '2025-04-04',
            '2025-04-05',
            '2025-04-06'
          ],
          [
            '2025-04-07',
            '2025-04-08',
            '2025-04-09',
            '2025-04-10',
            '2025-04-11',
            '2025-04-12',
            '2025-04-13'
          ]
        ],
        intDateWeeks: [
          [
            20241014, 20241015,
            20241016, 20241017,
            20241018, 20241019,
            20241020
          ],
          [
            20241021, 20241022,
            20241023, 20241024,
            20241025, 20241026,
            20241027
          ],
          [
            20241028, 20241029,
            20241030, 20241031,
            20241101, 20241102,
            20241103
          ],
          [
            20241104, 20241105,
            20241106, 20241107,
            20241108, 20241109,
            20241110
          ],
          [
            20241111, 20241112,
            20241113, 20241114,
            20241115, 20241116,
            20241117
          ],
          [
            20241118, 20241119,
            20241120, 20241121,
            20241122, 20241123,
            20241124
          ],
          [
            20241125, 20241126,
            20241127, 20241128,
            20241129, 20241130,
            20241201
          ],
          [
            20241202, 20241203,
            20241204, 20241205,
            20241206, 20241207,
            20241208
          ],
          [
            20241209, 20241210,
            20241211, 20241212,
            20241213, 20241214,
            20241215
          ],
          [
            20241216, 20241217,
            20241218, 20241219,
            20241220, 20241221,
            20241222
          ],
          [
            20241223, 20241224,
            20241225, 20241226,
            20241227, 20241228,
            20241229
          ],
          [
            20241230, 20241231,
            20250101, 20250102,
            20250103, 20250104,
            20250105
          ],
          [
            20250106, 20250107,
            20250108, 20250109,
            20250110, 20250111,
            20250112
          ],
          [
            20250113, 20250114,
            20250115, 20250116,
            20250117, 20250118,
            20250119
          ],
          [
            20250120, 20250121,
            20250122, 20250123,
            20250124, 20250125,
            20250126
          ],
          [
            20250127, 20250128,
            20250129, 20250130,
            20250131, 20250201,
            20250202
          ],
          [
            20250203, 20250204,
            20250205, 20250206,
            20250207, 20250208,
            20250209
          ],
          [
            20250210, 20250211,
            20250212, 20250213,
            20250214, 20250215,
            20250216
          ],
          [
            20250217, 20250218,
            20250219, 20250220,
            20250221, 20250222,
            20250223
          ],
          [
            20250224, 20250225,
            20250226, 20250227,
            20250228, 20250301,
            20250302
          ],
          [
            20250303, 20250304,
            20250305, 20250306,
            20250307, 20250308,
            20250309
          ],
          [
            20250310, 20250311,
            20250312, 20250313,
            20250314, 20250315,
            20250316
          ],
          [
            20250317, 20250318,
            20250319, 20250320,
            20250321, 20250322,
            20250323
          ],
          [
            20250324, 20250325,
            20250326, 20250327,
            20250328, 20250329,
            20250330
          ],
          [
            20250331, 20250401,
            20250402, 20250403,
            20250404, 20250405,
            20250406
          ],
          [
            20250407, 20250408,
            20250409, 20250410,
            20250411, 20250412,
            20250413
          ]
        ]
      },
      [SeasonNameFull.Postseason]: {
        start: '',
        end: '',
        systemStart: '',
        systemEnd: '',
        dashedDateWeeks: [],
        intDateWeeks: []
      }
    }
  }
]