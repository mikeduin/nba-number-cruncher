import axios from 'axios';
import { updateTeamDbBaseStats, updateTeamDbAdvancedStats } from "../modules/dbBuilders.js";
import { formApiCallParams } from "../utils/nbaApi/formApiCallParams.js";
import { requestHeaders } from "../utils/nbaApi/requestHeaders.js";

const teamStatsUrl = 'https://stats.nba.com/stats/leaguedashteamstats';

const updateBaseTeamBuild = (games, db, period) => {
  axios.get(teamStatsUrl, {
    params: formApiCallParams(games, period, "Regular Season", "Base"),
    headers: requestHeaders()
  })
    .then(response => {
      const { resultSets } = response.data
      const headers = resultSets[0].headers;
      const teamData = resultSets[0].rowSet;
      updateTeamDbBaseStats(db, teamData, headers);
    });
};

const updateFullTeamBuild = (games, db, period) => {
  axios.get(teamStatsUrl, {
    params: formApiCallParams(games, period, "Regular Season", "Advanced"),
    headers: requestHeaders()
  })
    .then(response => {
      const { resultSets } = response.data
      const headers = resultSets[0].headers;
      const teamData = resultSets[0].rowSet;
      updateTeamDbAdvancedStats(db, teamData, headers);
    });
};

const updatePartialTeamBuild = (games, db, lineup) => {
  axios.get(teamStatsUrl, {
    params: formApiCallParams(games, 0, "Regular Season", "Advanced", lineup),
    headers: requestHeaders()
  })
    .then(response => {
      const { resultSets } = response.data
      const headers = resultSets[0].headers;
      const teamData = resultSets[0].rowSet;
      updateTeamDbAdvancedStats(db, teamData, headers);
    })
};

export const updateFullTeamBuilds = () => {
  updateBaseTeamBuild(0, 'teams_full_base', 0);
  updateFullTeamBuild(0, 'teams_full', 0);
  updateFullTeamBuild(5, 'teams_full_l5', 0);
  updateFullTeamBuild(10, 'teams_full_l10', 0);
  updateFullTeamBuild(15, 'teams_full_l15', 0);
  updateFullTeamBuild(20, 'teams_full_l20', 0);
};

export const updateQ1Builds = () => {
  updateFullTeamBuild(0, 'teams_q1', 1);
  updateFullTeamBuild(5, 'teams_q1_l5', 1);
  updateFullTeamBuild(10, 'teams_q1_l10', 1);
  updateFullTeamBuild(15, 'teams_q1_l15', 1);
};

export const updateQ2Builds = () => {
  updateFullTeamBuild(0, 'teams_q2', 2);
  updateFullTeamBuild(5, 'teams_q2_l5', 2);
  updateFullTeamBuild(10, 'teams_q2_l10', 2);
  updateFullTeamBuild(15, 'teams_q2_l15', 2);
};

export const updateQ3Builds = () => {
  updateFullTeamBuild(0, 'teams_q3', 3);
  updateFullTeamBuild(5, 'teams_q3_l5', 3);
  updateFullTeamBuild(10, 'teams_q3_l10', 3);
  updateFullTeamBuild(15, 'teams_q3_l15', 3);
};

export const updateQ4Builds = () => {
  updateFullTeamBuild(0, 'teams_q4', 4);
  updateFullTeamBuild(5, 'teams_q4_l5', 4);
  updateFullTeamBuild(10, 'teams_q4_l10', 4);
  updateFullTeamBuild(15, 'teams_q4_l15', 4);
};

export const updateStarterBuilds = () => {
  updatePartialTeamBuild(0, 'teams_starters', 'Starters');
  updatePartialTeamBuild(5, 'teams_starters_l5', 'Starters');
  updatePartialTeamBuild(10, 'teams_starters_l10', 'Starters');
  updatePartialTeamBuild(15, 'teams_starters_l15', 'Starters');
  updatePartialTeamBuild(20, 'teams_starters_l20', 'Starters');
};

export const updateBenchBuilds = () => {
  updatePartialTeamBuild(0, 'teams_bench', 'Bench');
  updatePartialTeamBuild(5, 'teams_bench_l5', 'Bench');
  updatePartialTeamBuild(10, 'teams_bench_l10', 'Bench');
  updatePartialTeamBuild(15, 'teams_bench_l15', 'Bench');
  updatePartialTeamBuild(20, 'teams_bench_l20', 'Bench');
};
