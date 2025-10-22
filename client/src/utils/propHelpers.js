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
      pts: acc.pts + period.pts,
      "pts+reb+ast": acc.pts + period.pts + acc.reb + period.reb + acc.ast + period.ast,
      "pts+reb": acc.pts + period.pts + acc.reb + period.reb, 
      "pts+ast": acc.pts + period.pts + acc.ast + period.ast,
      "reb+ast": acc.reb + period.reb + acc.ast + period.ast
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

export function transformSummaryScore(input) {
  if (!input) return '';
  const [beforeAt, afterAt] = input.split('@');
  const trimmedBeforeAt = beforeAt.trim();
  const trimmedAfterAt = afterAt.trim();
  return `${trimmedBeforeAt}\n${trimmedAfterAt}`;
}

export function renderInactives(inactives, teamId) {
  if (!inactives) return '';
  const parseInactives = JSON.parse(inactives);
  const allInactives = [ ... parseInactives.h, ... parseInactives.v].sort((a, b) => a.familyName.localeCompare(b.familyName));

  const teamInactives = allInactives.filter(inactive => inactive.teamId === teamId && inactive.min > 8);

  return teamInactives.map(inactive => inactive.familyName).join(`\n`);
}