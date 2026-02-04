import moment from 'moment-timezone';
import axios from 'axios';
import * as Db from './Db.Controller.js';
import { LEAGUE_SCHEDULE_URL, SEASON_DATES } from '../constants';
import { Month, SeasonNameFull, SeasonNameAbb } from '../types';
import { fetchBoxScore, parseGameData } from './BoxScore.Controller.js';
import { getBoxScoreFromDb, getExistingSeasonGames, updateGameBoxScore, updateScheduleGame } from '../repositories';
import {
  formBovadaUrl,
  getCurrentSeasonDisplayYear,
  getCurrentSeasonStartYearInt,
  getSeasonNameAbb,
  getSeasonNameFull,
} from '../utils';

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

      const seasonNameAbb = getSeasonNameAbb(gdte, currentSeasonDates.seasons.RegularSeason);
      const seasonNameFull = getSeasonNameFull(gdte, currentSeasonDates.seasons.RegularSeason);
      const gweek = seasonNameFull === SeasonNameFull.RegularSeason ? game.gweek : getPrePostGameWeek(gdte, currentSeasonDates.seasons[seasonNameFull].dashedDateWeeks);

      // if (month.mscd.mon === 'May') {
      //   console.log('gweek is ', gweek, ' for game ', gid);
      // }

      if (!existingGame.length) {
        console.log('game is not found in schedule, adding ', gid);

        if (etm === 'TBD') {
          console.log('start time is TBD for gid ', gid);
          return;
        }
    
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
            gweek,
            updated_at: new Date(),
          });
          console.log(game.gcode, " updated in DB");
        } else {
          console.log('game already exists in schedule with same time and date', game.gid);
          if (existingGame[0].gweek !== gweek) {
            await Db.Schedule().where({ gid: game.gid.slice(2) }).update({
              gweek,
              updated_at: new Date(),
            });
            console.log(game.gcode, " updated gweek in DB");
          }
        }
      }
    });
  });
}; 

export const updateScheduleNewUrl = async () => {
  const seasonYear = getCurrentSeasonStartYearInt();
  const currentSeasonDates = SEASON_DATES.find(season => season.yearInt === seasonYear);
  const schedulePull = await axios.get("https://cdn.nba.com/static/json/staticData/scheduleLeagueV2_1.json");
  const { gameDates } = schedulePull.data.leagueSchedule;
  const today = moment().format('MM/DD/YYYY');
  const todayGames = gameDates.find((date) => date.gameDate.slice(0, 10) === today)?.games;
  console.log('todayGames are ', todayGames);
  todayGames.forEach(async (game) => {
    const existingGame = await Db.Schedule().where({ gid: game.gameId.slice(2) }).select('gid');

    if (!existingGame.length) {
      console.log('game is not found in schedule, adding ', game.gameId);

      if (game.gameTimeUTC === 'TBD') {
        console.log('start time is TBD for game.gid ', game.gameId);
        return;
      }

      const gdte = moment(game.gameDate).format('YYYY-MM-DD')

      const seasonNameAbb = getSeasonNameAbb(gdte, currentSeasonDates.seasons.RegularSeason);
      const seasonNameFull = getSeasonNameFull(gdte, currentSeasonDates.seasons.RegularSeason);

      const hObj = {
        tid: game.homeTeam.teamId,
        re: null,
        ta: game.homeTeam.teamTricode,
        tn: game.homeTeam.teamName,
        tc: game.homeTeam.teamCity,
        s: null
      };
      const vObj = {
        tid: game.awayTeam.teamId,
        re: null,
        ta: game.awayTeam.teamTricode,
        tn: game.awayTeam.teamName,
        tc: game.awayTeam.teamCity,
        s: null
      };

      await Db.Schedule().insert(
        {
          gid: game.gameId,
          gcode: game.gameCode,
          gdte: moment(game.gameDate).format('YYYY-MM-DD'),
          an: game.arenaName,
          ac: game.arenaCity,
          as: game.arenaState,
          etm: moment(game.gameTimeUTC).subtract(3, 'hours'),
          gweek: game.weekNumber, // need to figure this out
          h: [hObj],
          v: [vObj],
          stt: game.gameStatusText,
          season_year: getCurrentSeasonStartYearInt(),
          season_name: seasonNameAbb, // need to figure this out
          display_year: getCurrentSeasonDisplayYear(),
          bovada_url: null, // need to figure this out
          updated_at: new Date()
        }
      );
      console.log(game.gameCode, " added to schedule in DB");
    } else {
      console.log('game already exists in schedule ', game.gameId);
    }
  });
}

export const prepareInactives = async (inactives, teamAbb: string, teamId: number) => {
  const season = getCurrentSeasonStartYearInt();

  const gamePlayers = await Db.Players()
    .where({season})
    .andWhere('team_abbreviation', teamAbb)
    .select('player_id', 'player_name', 'team_abbreviation', 'position', 'min_full', 'team_id');

  const preparedInactives = await Promise.all(inactives.map(async player => {
    const dbPlayer = gamePlayers.find(p => p.player_id === player.personId);
    let tradedPlayer;

    if (!dbPlayer) {
      console.log('no dbPlayer found for ', player.personId, player.firstName, player.familyName)
      tradedPlayer = await Db.Players().where({
        player_id: player.personId,
        season
      }).select('player_name', 'team_abbreviation', 'position', 'min_full', 'team_id');
    }

    const position = dbPlayer?.position ?? tradedPlayer?.[0]?.position;
    const min = dbPlayer?.min_full ?? tradedPlayer?.[0]?.min_full;

    return {
      ...player,
      position,
      fullName: `${player.firstName} ${player.familyName}`,
      min,
      teamId,
    }
  }));

  return preparedInactives;
}

export const checkForMissingInactives = async () => {
  const season = getCurrentSeasonStartYearInt();

  const gamesWithInactivesSet = await Db.Schedule().where({ 
    season_year: season, 
    inactives_set: true,
    inactives_final: false,
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
    const boxScore = await getBoxScoreFromDb(game.gid);

    if (!boxScore) {
      console.log('no boxScore found for gid ', game.gid);
      return;
    }

    const { h_tid, v_tid, player_stats: playerStats } = boxScore;

    const existingInactives = JSON.parse(game.inactives);
    const existingInactivesIds = existingInactives.h.map(player => player.personId).concat(existingInactives.v.map(player => player.personId));

    const playersWithNoMins = JSON.parse(playerStats).filter(player => 
      player.min === 0 && relevantPlayers
        .map(player => player.player_id)
        .includes(player.player_id));

    const prepInactive = (player) => ({
      personId: player.player_id,
      fullName: player.player_name,
      firstName: player.player_name.split(' ')[0],
      familyName: player.player_name.split(' ').slice(1).join(' '),
      teamId: player.team_id,
      min: relevantPlayers.find(p => p.player_id === player.player_id)?.min_full,
      position: relevantPlayers.find(p => p.player_id === player.player_id)?.position
    })

    const updatedInactives = {
      ...existingInactives,
      h: [
        ...existingInactives.h,
        ...playersWithNoMins
          .filter(player => player.team_id === h_tid && !existingInactivesIds.includes(player.player_id))
          .map(player => prepInactive(player))
      ],  
      v: [
        ...existingInactives.v,
        ...playersWithNoMins
        .filter(player => player.team_id === v_tid && !existingInactivesIds.includes(player.player_id))
          .map(player => prepInactive(player))
      ]
    }

    await updateScheduleGame(game.gid, {
      inactives: JSON.stringify(updatedInactives),
      inactives_final: true,
    });

    console.log('inactives have been finalized for gid ', game.gid);
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
    const hTid = game.h[0].tid;
    const vAbb = game.v[0].ta;
    const vTid = game.v[0].tid;

    const response = await fetchBoxScore(vAbb, hAbb, game.gid); // pull live NBA.com data, convert to JSON
    const boxScore = response.props.pageProps.game;

    const { homeTeam, awayTeam } = boxScore;

    const hInactives = await prepareInactives(homeTeam.inactives, hAbb, hTid);
    const vInactives = await prepareInactives(awayTeam.inactives, vAbb, vTid);

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
    game_stints: true,
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

const delay = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Reprocesses box scores for games that haven't been marked as final.
 * Useful for catching games that were missed or had processing errors.
 * 
 * @param {number} seasonYear - The season year to reprocess (e.g., 2024 for 2024-25 season)
 * @param {string} beforeDate - Only reprocess games before this date (format: 'YYYY-MM-DD')
 * @returns {Promise<object>} Results object with total, processed count, and any errors
 */
export const reprocessNonFinalGames = async (seasonYear: number, beforeDate: string) => {
  try {
    // Find all games from specified season before given date that aren't marked as final
    const nonFinalGames = await Db.Schedule()
      .where('season_year', seasonYear)
      .where('season_name', 'regular')
      .where('gdte', '<', beforeDate)
      .whereNot('stt', 'Final')
      .select('gid', 'gdte', 'h', 'v')
      .orderBy('gdte', 'asc');

    console.log(`Found ${nonFinalGames.length} non-final games to reprocess`);
    
    const results = {
      total: nonFinalGames.length,
      processed: 0,
      errors: []
    };

    for (const game of nonFinalGames) {
      const hAbb = game.h[0].ta;
      const vAbb = game.v[0].ta;
      const { gid } = game;

      try {
        console.log(`Processing game ${gid} (${vAbb} @ ${hAbb}) from ${game.gdte}`);
        const response = await fetchBoxScore(vAbb, hAbb, gid);
        const boxScore = response.props.pageProps.game;
        await parseGameData(boxScore, true);
        results.processed++;
        console.log(`✓ Successfully processed game ${gid}`);
        
        // Add delay to avoid rate limiting
        await delay(2000);
      } catch (e) {
        console.log(`✗ Error processing game ${gid}: ${e.message}`);
        results.errors.push({
          gid,
          date: game.gdte,
          matchup: `${vAbb} @ ${hAbb}`,
          error: e.message
        });
      }
    }

    console.log(`Reprocessing complete: ${results.processed}/${results.total} games processed`);
    if (results.errors.length > 0) {
      console.log(`Errors encountered for ${results.errors.length} games:`, results.errors);
    }
    
    return results;
  } catch (e) {
    console.log('Error in reprocessNonFinalGames:', e);
    throw e;
  }
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

