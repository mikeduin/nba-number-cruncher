import { NbaApiMeasureType, NbaApiSeasonType } from '../../types';
import { getCurrentSeasonDisplayYear } from '../schedule';

export const getBoxScoreRequestParams = (gid: number, period: number) => {
  return {
    GameID: `00${gid}`,
    LeagueID: '00',
    endPeriod: period,
    endRange: 28800,
    rangeType: 1,
    startPeriod: period,
    startRange: 0,
  }
}

export const getGameLogsRequestParams = (playerId: string, measureType: NbaApiMeasureType) => {
  return {
    LastNGames: 10,
    LeagueID: '00',
    MeasureType: measureType,
    PerMode: 'Totals',
    Period: 0, // full game
    PlayerID: playerId,
    Season: getCurrentSeasonDisplayYear(),
    // SeasonType: 'Regular Season',
    PaceAdjust: 'N',
  }
}

export const getPlayerIndexRequestParams = () => {
  return {
    LeagueID: '00',
    Season: getCurrentSeasonDisplayYear(),
    SeasonType: NbaApiSeasonType.RegularSeason,
    TeamID: 0
  }
}

export const getStatRequestParams = (games, period, seasonType, statsType, starterBench = null) => {
  return {
    LastNGames: games,
    LeagueID: "00",
    MeasureType: statsType,
    Month: 0,
    OpponentTeamID: 0,
    PORound: 0,
    PaceAdjust: "N",
    PerMode: "PerGame",
    Period: period,
    PlusMinus: "N",
    Rank: "N",
    Season: getCurrentSeasonDisplayYear(),
    SeasonType: seasonType,
    StarterBench: starterBench,
    TeamID: 0,
    TwoWay: 0,
  };
}
