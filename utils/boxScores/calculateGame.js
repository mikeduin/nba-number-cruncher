import { calcFgPct, calcGamePace } from "./calculateRateStats";
  
export const compileGameStats = (hTotals, vTotals, poss, period, gameSecs) => {
  return {
    h: {
      pts: parseInt(hTotals.points),
      fgm: parseInt(hTotals.fieldGoalsMade),
      fga: parseInt(hTotals.fieldGoalsAttempted),
      fgPct: calcFgPct(hTotals.fieldGoalsMade, hTotals.fieldGoalsAttempted),
      fta: parseInt(hTotals.freeThrowsAttempted),
      to: parseInt(hTotals.turnovers),
      offReb: parseInt(hTotals.reboundsOffensive),
      fouls: parseInt(hTotals.foulsPersonal)
    },
    v: {
      pts: parseInt(vTotals.points),
      fgm: parseInt(vTotals.fieldGoalsMade),
      fga: parseInt(vTotals.fieldGoalsAttempted),
      fgPct: calcFgPct(vTotals.fieldGoalsMade, vTotals.fieldGoalsAttempted),
      fta: parseInt(vTotals.freeThrowsAttempted),
      to: parseInt(vTotals.turnovers),
      offReb: parseInt(vTotals.reboundsOffensive),
      fouls: parseInt(vTotals.foulsPersonal)
    },
    t: {
      pts: parseInt(hTotals.points) + parseInt(vTotals.points),
      fgm: parseInt(hTotals.fieldGoalsMade) + parseInt(vTotals.fieldGoalsMade),
      fga: parseInt(hTotals.fieldGoalsAttempted) + parseInt(vTotals.fieldGoalsAttempted),
      fgPct: calcFgPct((parseInt(hTotals.fieldGoalsMade) + parseInt(vTotals.fieldGoalsMade)), (parseInt(hTotals.fieldGoalsAttempted) + parseInt(vTotals.fieldGoalsAttempted))),
      fta: parseInt(hTotals.freeThrowsAttempted) + parseInt(vTotals.freeThrowsAttempted),
      to: parseInt(hTotals.turnovers) + parseInt(vTotals.turnovers),
      offReb: parseInt(hTotals.reboundsOffensive) + parseInt(vTotals.reboundsOffensive),
      fouls: parseInt(hTotals.foulsPersonal) + parseInt(vTotals.foulsPersonal),
      poss: poss,
      pace: calcGamePace(poss, parseInt(period), gameSecs)
    }
  }
};
