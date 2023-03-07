const axios = require('axios');
const knex = require('../db/knex');
const _ = require('lodash');
const startPeriodSec = require('./startPeriodSec');
const checkPeriodStart = require('./checkPeriodStart');
const getGameSecs = require('./getGameSecs');
const teamLookup = require('./teamLookup');

function Schedule() {return knex('schedule')}

module.exports = {
  buildSubData: async (gid) => {
    const pbpUrl = `https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2022/scores/pbp/00${gid}_full_pbp.json`;
    const gameDetailUrl = `https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2022/scores/gamedetail/00${gid}_gamedetail.json`;

    const gDetail = await axios.get(gameDetailUrl);
    const gcode = gDetail.data.g.gcode;
    const gdte = gDetail.data.g.gdte;
    const date = gcode.slice(0, 8);

    const gameInDb = await Schedule().where({gid});

    // const mini = await axios.get(`https://data.nba.net/prod/v1/${date}/00${gid}_mini_boxscore.json`); // BROKEN
    // const hTid = parseInt(mini.data.basicGameData.hTeam.teamId);
    // const vTid = parseInt(mini.data.basicGameData.vTeam.teamId);

    const hTid = gameInDb[0].h_tid;
    const vTid = gameInDb[0].a_tid;

    const hPlayers = gDetail.data.g.hls.pstsg.filter(player => player.totsec > 0).map(player => player.pid);
    const vPlayers = gDetail.data.g.vls.pstsg.filter(player => player.totsec > 0).map(player => player.pid);
    const allPlayers = hPlayers.concat(vPlayers);
    let starters = hPlayers.slice(0, 5).concat(vPlayers.slice(0, 5));
    let gameStints = {};
    starters.forEach(player => {
      gameStints[`pid_${player}`] = [[0]];
    });

    let pbp = await axios.get(pbpUrl);

    // Need to compile active players for each Q in case player enters early, leaves outside of Q, and never comes back
    let periodPlayers = [];
    const periods = pbp.data.g.pd.length;
    pbp.data.g.pd.forEach((period, i) => {
      let subEvents = period.pla.filter(play => play.etype === 8);

      let iPlayers = _.uniq(period.pla
        .filter(play => allPlayers.includes(parseInt(play.epid)) || allPlayers.includes(parseInt(play.pid))))
        .reduce((players, filteredPlays) => {
          players.push(parseInt(filteredPlays.pid));
          players.push(parseInt(filteredPlays.epid));
          return _.uniq(players).filter(player => !isNaN(player));
        }, []);

      periodPlayers.push(_.pull(iPlayers, hTid, vTid));

      subEvents.forEach(event => {
        let secs = getGameSecs(i, event.cl)

        // SUBSTITUTION REFERENCE IN PLAY-BY-PLAY LOGS:
        // player entering = event.epid
        // player exiting = event.pid

        // HANDLE ENTERING PLAYER
        // first check to see if player has entered game yet by seeing if they exist in gameStints
        if (Object.keys(gameStints).indexOf(`pid_${event.epid}`) !== -1) {
          // then check to see if player has not been logged as exiting due to subbing between quarters
          // do this by checking to ensure last gameStint array has length of 2
          if (
            gameStints[`pid_${event.epid}`][(gameStints[`pid_${event.epid}`].length)-1].length === 1
          ) {
            // if length of 1, push value from beg of Q to complete last entry weekArray
            // CHANGE THIS TO END OF LAST Q FOR WHICH THEY'D ENTERED
            gameStints[`pid_${event.epid}`][(gameStints[`pid_${event.epid}`].length)-1].push(startPeriodSec(i));
            // then push current second value to new array to add new entry
            gameStints[`pid_${event.epid}`].push([secs]);
          } else {
            // if player exists in gameStints and last exit has been logged, push new entry array
            gameStints[`pid_${event.epid}`].push([secs]);
          }
        } else {
          // if player has not entered game, create key / push first entry array
          gameStints[`pid_${event.epid}`] = [[secs]];
        };

        // HANDLE EXITING PLAYER
        // first check to see if player exists in gameStints; if not, they entered in between quarters
        if (Object.keys(gameStints).indexOf(`pid_${event.pid}`) !== -1) {
          if (gameStints
            [`pid_${event.pid}`]
            [(gameStints[`pid_${event.pid}`].length)-1].length === 1
          ) {
            gameStints
            [`pid_${event.pid}`]
            [(gameStints[`pid_${event.pid}`].length)-1].push(secs);
          } else {
            gameStints[`pid_${event.pid}`].push([startPeriodSec(i), secs]);
          }
        } else {
          // player not yet in gameStints, add entry/exit for current period
          gameStints[`pid_${event.pid}`] = [[startPeriodSec(i), secs]];
        };
      })
    })

    let tempPlayer = 0;
    // Compare players in last Q to ensure no one entered during pre-4Q/OT and never came out
    try {
      periodPlayers[periodPlayers.length-1].forEach(player => {
        tempPlayer = player;
        // Tackle case of player entering for first time pre-last period and never leaving game
        if (Object.keys(gameStints).indexOf(`pid_${player}`) === -1) {
          // get second value for beginning of last period
          gameStints[`pid_${player}`] = [[startPeriodSec(periodPlayers.length-1)]];
        };
        let lastExitSecs = gameStints[`pid_${player}`][(gameStints[`pid_${player}`].length)-1][1];
        let lastExitPer = checkPeriodStart(lastExitSecs);
        if (
          // If they have complete checkin/checkout array ...
          gameStints[`pid_${player}`][(gameStints[`pid_${player}`].length)-1].length === 2
          &&
          // And their last exit time is before the start of the last period ...
          lastExitSecs < startPeriodSec(periods-1)
        ) {
          // Set next entry time to next quarter they played in
          for (var i = lastExitPer + 1; i < periodPlayers.length; i++) {
            if (periodPlayers[i].indexOf(player)) {
              gameStints[`pid_${player}`].push([startPeriodSec(i)]);
              break;
            }
          };
        };
      })
    } catch (e) {
      console.log(e);
      console.log('game ID is ', gid, ' player causing error is ', tempPlayer);
    };

    // Add final checkouts at end of game for players with open last arrays
      allPlayers.forEach(player => {
        // First look for players whose last time array has no check-out
        if (gameStints[`pid_${player}`][(gameStints[`pid_${player}`].length)-1].length == 1) {
          // Then, starting with the last period, and moving backwards through the game
          for (var i = periodPlayers.length-1; i > -1; i--) {
            // If that player's player ID is found in the last period
            if (periodPlayers[i].indexOf(player) !== -1) {
              // Push the start value of the next period in as their last exit time
              // Note that in the case of the last period of game, this value is equivalent to end of game
              gameStints[`pid_${player}`][(gameStints[`pid_${player}`].length)-1].push(startPeriodSec(i+1));
              break;
            };
          }
        }
      });

    hPlayers.forEach(player => {
      let stints = gameStints[`pid_${player}`];

      knex("player_game_stints").insert({
        player_id: player,
        team_id: hTid,
        gid: gid,
        gcode: gcode,
        gdte: gdte,
        game_stints: stints,
        updated_at: new Date()
      }, '*').then(inserted => {
        console.log('pid ', inserted[0].player_id, ' game stints updated for gid ', gid);
      });
    });

    vPlayers.forEach((player, i) => {
      let stints = gameStints[`pid_${player}`];

      knex("player_game_stints").insert({
        player_id: player,
        team_id: vTid,
        gid: gid,
        gcode: gcode,
        gdte: gdte,
        game_stints: stints,
        updated_at: new Date()
      }, '*').then(inserted => {
        console.log('pid ', inserted[0].player_id, ' game stints updated for gid ', gid);
        if (i === vPlayers.length - 1) {
          knex("schedule").where({ gid: gid }).update({
            game_stints: true,
            updated_at: new Date()
          }).then((res) => {
            console.log(gid, ' game stint updates have concluded');
          })
        }
      });
    })
  }
}
