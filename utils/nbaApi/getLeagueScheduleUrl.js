import { getCurrentNbaSeasonInt } from "../schedule/";

export const getLeagueScheduleUrl = () => `https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/${getCurrentNbaSeasonInt()}/league/00_full_schedule_week.json`;