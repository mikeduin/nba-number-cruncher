const axios = require('axios');
const knex = require('../db/knex');
const _ = require('lodash');

module.exports = {
  buildSubData: async (gid) => {
    const pbpUrl = `https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2018/scores/pbp/00${gid}_full_pbp.json`;
    const gameDetailUrl = `https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2018/scores/gamedetail/00${gid}_gamedetail.json`;

    const gDetail = await axios.get(gameDetailUrl);

    const gcode = gDetail.data.g.gcode;
    const gdte = gDetail.data.g.gdte;
    const date = gcode.slice(0, 8);

    const mini = await axios.get(`https://data.nba.net/prod/v1/${date}/00${gid}_mini_boxscore.json`);

    const hTid = parseInt(mini.data.basicGameData.hTeam.teamId);
    const vTid = parseInt(mini.data.basicGameData.vTeam.teamId);

    const hPlayers = gDetail.data.g.hls.pstsg.filter(player => player.min > 0).map(player => player.pid);
    const vPlayers = gDetail.data.g.vls.pstsg.filter(player => player.min > 0).map(player => player.pid);

    let starters = hPlayers.slice(0, 5).concat(vPlayers.slice(0, 5));
    let gameStints = {};

    starters.forEach(player => {
      gameStints[`pid_${player}`] = [[0]];
    });

    let pbp = await axios.get(pbpUrl);

    let lastPlayers = _.uniq(pbp.data.g.pd[pbp.data.g.pd.length-1].pla
      .filter(play => play.pid > 0)
      .map(filtered => filtered.pid));

    let lastPlayersAdj = _.pull(lastPlayers, hTid, vTid);

    const periods = pbp.data.g.pd.length;

    const startPeriodSec = (i) => {
      if (i < 4) {
        return (i*720);
      } else {
        return (2880 + ((i-4)*300));
      };
    };

    pbp.data.g.pd.forEach((period, i) => {
      let subEvents = period.pla.filter(play => play.etype === 8);

      subEvents.forEach(event => {
        let secs = 0;

        if (i < 4) {
          secs = ( startPeriodSec(i) + ((11-parseInt(event.cl.slice(0, 2)))*60) + (60-parseInt(event.cl.slice(3, 5))));
        } else {
          secs = ( startPeriodSec(i) + ((4-parseInt(event.cl.slice(0, 2)))*60) + (60-parseInt(event.cl.slice(3, 5))) )
        };

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

    // Compare players in 4th (/last) Q to ensure no one entered during pre-4Q and never came out
    lastPlayersAdj.forEach(player => {
      if (
        gameStints[`pid_${player}`][(gameStints[`pid_${player}`].length)-1].length === 2
        &&
        gameStints[`pid_${player}`][(gameStints[`pid_${player}`].length)-1][1] < startPeriodSec(periods-1)
      ) {
        gameStints[`pid_${player}`].push([startPeriodSec(periods-1)])
      };
    })

    // Add final checkouts at end of game for players with open last arrays
    _.forOwn(gameStints, (value, key) => {
      if (value[value.length-1].length === 1) {
        value[value.length-1].push(startPeriodSec(periods));
      };
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
    })

    vPlayers.forEach(player => {
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
      });
    })
  }
}
