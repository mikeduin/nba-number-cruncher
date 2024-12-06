import { gameTimeToMinutes } from "./gameTimeHelpers";

// takes in array of periods from BoxScoresByQuarter

export const sumQuarterStats = (periods) => {
  return periods.reduce((acc, period) => {
    return {
      min: acc.min + gameTimeToMinutes(period.min),
      fgm: acc.fgm + period.fgm,
      fga: acc.fga + period.fga,
      fg3m: acc.fg3m + period.fg3m,
      fg3a: acc.fg3a + period.fg3a,
      ftm: acc.ftm + period.ftm,
      fta: acc.fta + period.fta,
      reb: acc.reb + period.reb,
      ast: acc.ast + period.ast,
      stl: acc.stl + period.stl,
      blk: acc.blk + period.blk,
      tov: acc.tov + period.tov,
      fouls: acc.fouls + period.fouls,
      pts: acc.pts + period.pts
    }
  }, {
    min: 0,
    fgm: 0,
    fga: 0,
    fg3m: 0,
    fg3a: 0,
    ftm: 0,
    fta: 0,
    reb: 0,
    ast: 0,
    stl: 0,
    blk: 0,
    tov: 0,
    fouls: 0,
    pts: 0
  }) 
}