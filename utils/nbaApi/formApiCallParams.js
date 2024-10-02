import { getCurrentNbaSeason } from '../schedule';

export const formApiCallParams = (games, period, seasonType, statsType, starterBench = null) => {
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
    Season: getCurrentNbaSeason(),
    SeasonType: seasonType,
    StarterBench: starterBench,
    TeamID: 0,
    TwoWay: 0,
  };
}