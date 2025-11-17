

export const BOX_SCORE_STATS_URL = 'https://stats.nba.com/stats/boxscoretraditionalv3';
export const GAME_BOX_SCORE_URL = (vAbb: string, hAbb: string, gid: number) => `https://www.nba.com/game/${vAbb.toLowerCase()}-vs-${hAbb.toLowerCase()}-00${gid}/box-score.json`;
export const GAME_DETAIL_URL = (season: number, gid: number) => `https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/${season}/scores/gamedetail/00${gid}_gamedetail.json`;
export const GAME_LOGS_URL = 'https://stats.nba.com/stats/playergamelogs';
export const LEAGUE_SCHEDULE_URL = (season: number) => `https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/${season}/league/00_full_schedule_week.json`; 
// export const LEAGUE_SCHEDULE_V2_URL = 'https://cdn.nba.com/static/json/staticData/scheduleLeagueV2_1.json'; // don't think this works anymore
export const PLAY_BY_PLAY_URL = (season: number, gid: number) => `https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/${season}/scores/pbp/00${gid}_full_pbp.json`;
export const PLAY_BY_PLAY_2025_URL = (gid: number) => `https://cdn.nba.com/static/json/liveData/playbyplay/playbyplay_00${gid}.json`;
export const PLAYER_INDEX_URL = 'https://stats.nba.com/stats/playerindex';
export const PLAYER_STATS_URL = 'https://stats.nba.com/stats/leaguedashplayerstats';
export const TEAM_STATS_URL = 'https://stats.nba.com/stats/leaguedashteamstats';
