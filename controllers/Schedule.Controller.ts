import moment from 'moment-timezone';
import axios from 'axios';
import * as Db from './Db.Controller.js';
import { LEAGUE_SCHEDULE_URL, SEASON_DATES } from '../constants';
import { Month, SeasonNameFull, SeasonNameAbb } from '../types';
import { fetchBoxScore } from './BoxScore.Controller.js';
import { getBoxScore, getExistingSeasonGames, updateGameBoxScore, updateScheduleGame } from '../repositories';
import {
  formBovadaUrl,
  getCurrentSeasonDisplayYear,
  getCurrentSeasonStartYearInt,
  getSeasonNameAbb,
  getSeasonNameFull,
} from '../utils';
import { update } from 'lodash';

const getPrePostGameWeek = (gameDate: string, dashedDateWeeks: string[][]) => {
  return dashedDateWeeks.findIndex((week: string[]) => week.includes(gameDate));
}

const buildTeamObject = (team) => {
  return {
    tid: team.tid,
    re: team.re,
    ta: team.ta,
    tn: team.tn,
    tc: team.tc,
    s: team.s
  };
}

/**
 * Retrieves the active games for a given date.
 * 
 * This function queries the database for games scheduled on the specified date
 * that have not yet reached the 'Final' status. It then filters the games to 
 * return only those whose start time is less than or equal to the current time.
 * 
 * @param {string} date - The date for which to retrieve active games, in the format 'YYYY-MM-DD'.
 * @returns {Promise<Array>} A promise that resolves to an array of active games.
 */
export const getActiveGames = async (date: string) => {
  const todayGames = await Db.Schedule()
    .where({
      gdte: date,
    })
    .whereNot({
      stt: 'Final'
    });

  return todayGames.filter(game => moment(game.etm).diff(moment()) <= 0);
};

export const buildSeasonGameWeekArray = (seasonStart: string, seasonEnd: string) => {
  // Remember that in dashedDates and intDates, array indices correspond to LITERAL GAME WEEKS.
  // So dashedDates[1] will be the first week of the schedule, and dashedDates[0] will be the week BEFORE games begin
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

export const updateSchedule = async (monthFilter?: Month, seasonStageFilter?: SeasonNameAbb) => {
  const seasonYear = getCurrentSeasonStartYearInt();
  const currentSeasonDates = SEASON_DATES.find(season => season.yearInt === seasonYear);
  const schedulePull = await axios.get(LEAGUE_SCHEDULE_URL(seasonYear));
  const leagueSchedule = schedulePull.data.lscd;

  const parsedSchedule = monthFilter
    ? leagueSchedule.filter((month) => month.mscd.mon === monthFilter)
    : leagueSchedule;

  parsedSchedule.forEach(month => {
    month.mscd.g.forEach(async game => {
      const { gid, gcode, gdte, an, ac, as, etm, stt, v, h } = game;

      // if game does not exist, insert game
      const existingGame = await Db.Schedule().where({ gid: gid.slice(2) }).select('gid', 'gdte', 'etm'); // need to pull fields to check gdte and etm later

      if (!existingGame.length) {
        console.log('game is not found in schedule, adding ', gid);

        if (etm === 'TBD') {
          console.log('start time is TBD for gid ', gid);
          return;
        }

        const seasonNameAbb = game.gweek ? SeasonNameAbb.RegularSeason : getSeasonNameAbb(gdte, currentSeasonDates.seasons.RegularSeason);
        const seasonNameFull = game.gweek ? SeasonNameFull.RegularSeason : getSeasonNameFull(gdte, currentSeasonDates.seasons.RegularSeason);
        const gweek = game.gweek ?? getPrePostGameWeek(gdte, currentSeasonDates.seasons[seasonNameFull].dashedDateWeeks);
    
        const hObj = buildTeamObject(h);
        const vObj = buildTeamObject(v);
  
        if (!seasonStageFilter || seasonStageFilter === seasonNameAbb) {
          await Db.Schedule().insert(
            {
              gid,
              gcode,
              gdte,
              an,
              ac,
              as,
              etm: moment(etm).subtract(3, 'hours'),
              gweek,
              h: [hObj],
              v: [vObj],
              stt: stt,
              season_year: seasonYear,
              season_name: seasonNameAbb,
              display_year: getCurrentSeasonDisplayYear(),
              bovada_url: formBovadaUrl(game),
              updated_at: new Date()
            }
          );
          console.log(game.gcode, " added to schedule in DB");
        }
      } else {
        const gameDateOrTimeChanged = game.gdte !== existingGame[0].gdte
          || moment(game.etm).subtract(3, 'hours').format("hh:mm:ss a") !== moment(existingGame[0].etm).format("hh:mm:ss a");

        if (gameDateOrTimeChanged) {
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

export const prepareInactives = async (inactives, teamAbbs: string[]) => {
  const gamePlayers = await Db.Players()
    .where({season: getCurrentSeasonStartYearInt()})
    .whereIn('team_abbreviation', [ ...teamAbbs ])
    .select('player_id', 'player_name', 'team_abbreviation', 'position', 'min_full')

  const preparedInactives = inactives.map(player => {
    const dbPlayer = gamePlayers.find(p => p.player_id === player.personId);
    if (!dbPlayer) {console.log('no dbPlayer found for ', player.personId, player.firstName, player.familyName)}
    return {
      ...player,
      position: dbPlayer?.position,
      fullName: `${player.firstName} ${player.familyName}`,
      min: dbPlayer?.min_full
    }
  })

  return preparedInactives;
}

export const checkForMissingInactives = async () => {
  const season = getCurrentSeasonStartYearInt();

  const gamesWithInactivesSet = await Db.Schedule().where({ 
    gdte: '2024-12-25', // temp
    season_year: season, 
    inactives_set: true
  }).select('gid', 'h', 'v', 'inactives');

  gamesWithInactivesSet.forEach(async game => {
    const hAbb = game.h[0].ta;
    const vAbb = game.v[0].ta;

    // get the players on each team who average more than 6 MPG
    const relevantPlayers = await Db.Players()
      .where({season})
      .where('min_full', '>', 6)
      .whereIn('team_abbreviation', [hAbb, vAbb])
      .select('player_id', 'min_full', 'position');

    // get boxScore from DB  
    const boxScore = await getBoxScore(game.gid);

    if (!boxScore) {
      console.log('no boxScore found for gid ', game.gid);
      return;
    }

    const { h_tid, v_tid, player_stats: playerStats } = boxScore;

    const existingInactives = JSON.parse(game.inactives);

    const playersWithNoMins = JSON.parse(playerStats).filter(player => 
      player.min === 0 && relevantPlayers
        .map(player => player.player_id)
        .includes(player.player_id));

    const prepInactive = (player) => ({
      personId: player.player_id,
      fullName: player.player_name,
      teamId: player.team_id,
      min: relevantPlayers.find(p => p.player_id === player.player_id)?.min_full,
      position: relevantPlayers.find(p => p.player_id === player.player_id)?.position
    })

    const updatedInactives = {
      ...existingInactives,
      h: [
        ...existingInactives.h,
        ...playersWithNoMins
          .filter(player => player.team_id === h_tid)
          .map(player => prepInactive(player))
      ],  
      v: [
        ...existingInactives.v,
        ...playersWithNoMins
          .filter(player => player.team_id === v_tid)
          .map(player => prepInactive(player))
      ]
    }

    await updateScheduleGame(game.gid, {inactives: JSON.stringify(updatedInactives)});
  })
}


// This method is used to mass-update inactives that have not previously been set in the schedule
export const updatePastScheduleForInactives = async () => {
  const season = getCurrentSeasonStartYearInt();
  const inactiveGames = await Db.Schedule().where({ 
    season_year: season, 
    inactives_set: false,
    stt: 'Final'
  }).select('gid', 'h', 'v');
  
  inactiveGames.forEach(async game => {
    const hAbb = game.h[0].ta;
    const vAbb = game.v[0].ta;

    const response = await fetchBoxScore(vAbb, hAbb, game.gid); // pull live NBA.com data, convert to JSON
    const boxScore = response.props.pageProps.game;

    const { homeTeam, awayTeam } = boxScore;

    const hInactives = await prepareInactives(homeTeam.inactives, [hAbb]);
    const vInactives = await prepareInactives(awayTeam.inactives, [vAbb]);

    const inactives = {
      h: hInactives,
      v: vInactives
    };

    await Db.Schedule().where({gid: game.gid}).update({
      inactives,
      inactives_set: true,
    });

    console.log('inactives have been set for gid ', game.gid);
  })
}

// add column for inactives_finalized, then run above op

export const updatePastScheduleForResults = async () => {
  const season = getCurrentSeasonStartYearInt();
  const gamesWithNoResults = await Db.Schedule().where({ 
    season_year: season, 
    result: null,
    stt: 'Final'
  }).select('gid', 'h', 'v');

  gamesWithNoResults.forEach(async game => {
    const hAbb = game.h[0].ta;
    const vAbb = game.v[0].ta;

    const response = await fetchBoxScore(vAbb, hAbb, game.gid); // pull live NBA.com data, convert to JSON
    const boxScore = response.props.pageProps.game;

    const { homeTeam, awayTeam } = boxScore;

    const hScore = homeTeam.score;
    const vScore = awayTeam.score;

    const result = `${vAbb} ${vScore} @ ${hAbb} ${hScore}`

    await Db.Schedule().where({gid: game.gid}).update({result});

    console.log('result have been set for gid ', game.gid);
  })
}



// DELETE THIS BELOW AFTER 2024 POSTSEASON PROCESSES CORRECTLY
// Or ... add to db Utils to use in future? What did I use this for?

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

//           let hObj = buildTeamObject(game.h);
//           let vObj = buildTeamObject(game.v);

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
//                 display_year: getCurrentSeasonDisplayYear(),
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

