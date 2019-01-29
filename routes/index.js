var express = require("express");
var router = express.Router();
const axios = require("axios");
const knex = require("../db/knex");
const schedule = require('node-schedule');

const dbBuilders = require("../modules/dbBuilders");
const dbMappers = require("../modules/dbMappers");
const updateTeamStats = require("../modules/updateTeamStats");
const advancedTeamStats = "https://stats.nba.com/stats/leaguedashteamstats";
const teamObjStruct = require("../modules/teamObjStruct");

const updateRawDataTables = schedule.scheduleJob('* 2 * * *', function () {
  updateTeamStats.updateAllFullTeamBuilds();
  updateTeamStats.updateAllLineupBuilds();
  console.log('raw data tables were updated at 2 AM');
});

const mapRawData = schedule.scheduleJob('5 2 * * *', function (){
  dbMappers.mapNetRatings();
  console.log('raw data mapped at 2:05 AM')
})

/* GET home page. */
router.get("/", function(req, res, next) {


  // axios.get(advancedTeamStats, {
  //     params: dbBuilders.fetchLineupParams(20, 'Bench')
  //   })
  //   .then((response)=> {
  //     let teamData = response.data.resultSets[0].rowSet;
  //     dbBuilders.buildTeamDb('teams_bench_l20', teamData);
  //   })
  //   .catch((err)=>{
  //     console.log(err);
  //   });

  res.send({ Hi: "there" });
});

router.get("/api/getTeams", function(req, res, next) {
  // let teamsFull;
  // let teamObj = teamObjStruct.teamObj();
  //


  // return async () => {
  // console.log('hello');

  // const updateFullStats = () => {
  //   knex("teams_full")
  //     .select("team_id", "team_name", "net_rating")
  //     .orderBy("team_name")
  //     .then(teamsFullPull => {
  //       // let teamsFull = teamsFullPull;
  //       // console.log(teamsFull);
  //       // teamsFullPull.forEach(nbaTeam=>{
  //       //   teamObj[nbaTeam.team_name][net_rating][team].push(nbaTeam.net_rating);
  //       // })
  //       // console.log(teamsFullPull);
  //
  //       teamObj["Atlanta Hawks"].net_rating.team.push(
  //         teamsFullPull[0].net_rating
  //       );
  //       console.log(teamObj["Atlanta Hawks"].net_rating.team);
  //     });
  // };

  // const updateFullLastFiveStats = () => {
  //   knex("teams_full_l5")
  //     .select("team_id", "team_name", "net_rating")
  //     .orderBy("team_name")
  //     .then(teamsLastFivePull => {
  //       // let teamsFull = teamsFullPull;
  //       // console.log(teamsFull);
  //       // teamsFullPull.forEach(nbaTeam=>{
  //       //   teamObj[nbaTeam.team_name][net_rating][team].push(nbaTeam.net_rating);
  //       // })
  //       // console.log(teamsFullPull);
  //
  //       teamObj["Atlanta Hawks"].net_rating.team.push(
  //         teamsLastFivePull[0].net_rating
  //       );
  //       console.log(teamObj["Atlanta Hawks"].net_rating.team);
  //     });
  // };

  // async function execSeq () {
  //   const tasks = [updateFullStats, updateFullLastFiveStats];
  //
  //   for (const fn of tasks) {
  //     await fn()
  //   }
  //
  //   console.log('all done');
  // };
  //
  // execSeq();

  // await updateFullStats();
  // await updateFullLastFiveStats();

  // Promise.all([updateFullLastFiveStats, updateFullLastFiveStats]).then(res=>{
  //   console.log('promises done');
  // });

  // updateFullStats();
  // setTimeout(updateFullLastFiveStats(), 5000);
  // console.log('done');

  res.send({getTeams: 'reached'});

  // };
});

module.exports = router;
