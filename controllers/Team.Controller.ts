import axios from 'axios';
import * as Db from './Db.Controller.js';
import { LEAGUE_SCHEDULE_V2_URL } from '../utils';

export const updateTeamInfo = async () => {
  const schedulePull = await axios.get(LEAGUE_SCHEDULE_V2_URL);
  const leagueSchedule = schedulePull.data.leagueSchedule;
  const existingTeams = await Db.Teams();

  leagueSchedule.gameDates.forEach(date => {
    date.games.forEach(async game => {
      const { homeTeam, awayTeam } = game;
      [homeTeam, awayTeam].forEach(async team => {
        const { teamId: tid, teamName: name, teamCity: city, teamTricode: abb } = team;

        const existingTeam = existingTeams.find(t => t.tid === tid);

        if (!existingTeam && tid !== 0) {
          console.log('team is not found in schedule, adding ', tid, city, name);

          await Db.Teams().insert({
            tid,
            city,
            name,
            abb,
            isNBAFranchise: false,
            fullName: `${city} ${name}`,
          });
        } else {
          console.log('team is found in schedule', tid, city, name);
        }
      })
    })
  })
};