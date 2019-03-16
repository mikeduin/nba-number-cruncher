// Storing test/random use functions here to clean up other code

// <-- Use this to quickly initialize total data into a box score --> //
// setTimeout(()=> {
//   let totalsObj = {
//     "h": {"to": 4, "fga": 49, "fgm": 20, "fta": 16, "pts": 57, "fgPct": "40.8", "fouls": 12, "offReb": 7}, "t": {"to": 10, "fga": 93, "fgm": 45, "fta": 26, "pts": 120, "pace": 101.2224, "poss": 50.6112, "fgPct": "48.4", "fouls": 21, "offReb": 11}, "v": {"to": 6, "fga": 44, "fgm": 25, "fta": 10, "pts": 63, "fgPct": "56.8", "fouls": 5, "offReb": 4}
//   };
//   let q1 = {h:
// {fgPct: "40.9",
// fga: 22,
// fgm: 9,
// fouls: 3,
// fta: 7,
// offReb: 3,
// pts: 27,
// to: 2},
// t:
// {fgPct: "52.2",
// fga: 46,
// fgm: 24,
// fouls: 7,
// fta: 8,
// offReb: 4,
// pace: 97.2087652173913,
// poss: 46.5792,
// pts: 61,
// to: 3},
// v:
// {fgPct: "62.5",
// fga: 24,
// fgm: 15,
// fouls: 4,
// fta: 1,
// offReb: 1,
// pts: 34,
// to: 1}
// };
//   let q2 = {
//     "h": {"to": 4, "fga": 20, "fgm": 7, "fta": 7, "pts": 22, "fgPct": "35.0", "fouls": 4, "offReb": 1}, "t": {"to": 9, "fga": 43, "fgm": 18, "fta": 13, "pts": 51, "pace": 101.2224, "poss": 50.6112, "fgPct": "41.9", "fouls": 9, "offReb": 5}, "v": {"to": 5, "fga": 23, "fgm": 11, "fta": 6, "pts": 29, "fgPct": "47.8", "fouls": 5, "offReb": 4}
//   };
//   knex("box_scores_v2").insert({
//     gid: 21801033,
//     h_tid: 1610612746,
//     v_tid: 1610612741,
//     period_updated: 2,
//     clock_last_updated: 1440,
//     totals: [totalsObj],
//     q1: [q1],
//     q2: [q2],
//     updated_at: new Date()
//   }).then(()=> {
//     console.log('game inserted into db')
//   })
// }, 10000)


// <-- Use this to pull in box score data --> //
// setInterval(async () => {
//   const boxScore = await axios.get(`https://data.nba.net/prod/v1/20190313/0021801019_boxscore.json`);
//   const { period, clock, isGameActivated, startTimeUTC } = boxScore.data.basicGameData;
//
//   let gameSecs = getGameSecs((parseInt(period.current)-1), clock);
//
//   if (boxScore.data.stats) {
//     let { hTeam, vTeam, activePlayers } = boxScore.data.stats;
//     const poss = await boxScoreHelpers.calcGamePoss(hTeam.totals, vTeam.totals)
//     const hFgPct = boxScoreHelpers.calcFgPct(hTeam.totals.fgm, hTeam.totals.fga);
//     const vFgPct = boxScoreHelpers.calcFgPct(vTeam.totals.fgm, vTeam.totals.fga);
//
//     const totalsObj = boxScoreHelpers.compileGameStats(hTeam.totals, vTeam.totals, poss, period.current, gameSecs);
//
//     console.log('totalsObj is ', totalsObj);
//   }
//
// }, 2000)

// <-- Use this to pull game box score from DB --> //
// setTimeout(async () => {
//   let box = await knex("box_scores_v2").where({gid: 21801020});
//
//   console.log(box[0].q2);
// }, 1000)
