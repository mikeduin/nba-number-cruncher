import { getCurrentSeasonStartYearInt } from "../schedule/";

export const getLeagueScheduleUrl = () => `https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/${getCurrentSeasonStartYearInt()}/league/00_full_schedule_week.json`;
export const LEAGUE_SCHEDULE_V2_URL = 'https://cdn.nba.com/static/json/staticData/scheduleLeagueV2_1.json';