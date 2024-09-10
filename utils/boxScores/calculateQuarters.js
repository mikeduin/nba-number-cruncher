import * as DB from '../../controllers/Db.Controller';
import { calcEndOfQuarterPace, calcFgPct } from "./calculateRateStats";

const calcQuarterPoss = (hTotals, vTotals, prevTotals) => {
  const fga = ((parseInt(hTotals.fieldGoalsAttempted) + parseInt(vTotals.fieldGoalsAttempted)) - prevTotals.t.fga);
  const to = ((parseInt(hTotals.turnovers) + parseInt(vTotals.turnovers)) - prevTotals.t.to);
  const fta = ((parseInt(hTotals.freeThrowsAttempted) + parseInt(vTotals.freeThrowsAttempted)) - prevTotals.t.fta);
  const offReb = ((parseInt(hTotals.reboundsOffensive) + parseInt(vTotals.reboundsOffensive)) - prevTotals.t.offReb);

  return ((fga+to+(0.44*fta)-offReb));
};

export const compileQuarterStats = (hTotals, vTotals, prevTotals, period, gameSecs) => {
  const quarterPoss = calcQuarterPoss(hTotals, vTotals, prevTotals)

  // NOTE: ONCE YOU HAVE CONFIRMED PREVTOTALS ARE NOT GOING IN AS INTEGERS, YOU CAN REMOVE PARSEINTS
  return {
    h: {
      pts: parseInt(hTotals.points) - parseInt(prevTotals.h.pts),
      fgm: parseInt(hTotals.fieldGoalsMade) - parseInt(prevTotals.h.fgm),
      fga: parseInt(hTotals.fieldGoalsAttempted) - parseInt(prevTotals.h.fga),
      fgPct: calcFgPct((parseInt(hTotals.fieldGoalsMade)-prevTotals.h.fgm), (parseInt(hTotals.fieldGoalsAttempted) - prevTotals.h.fga)),
      fta: parseInt(hTotals.freeThrowsAttempted) - parseInt(prevTotals.h.fta),
      to: parseInt(hTotals.turnovers) - parseInt(prevTotals.h.to),
      offReb: parseInt(hTotals.reboundsOffensive) - parseInt(prevTotals.h.offReb),
      fouls: parseInt(hTotals.foulsPersonal) - parseInt(prevTotals.h.fouls)
    },
    v: {
      pts: parseInt(vTotals.points) - parseInt(prevTotals.v.pts),
      fgm: parseInt(vTotals.fieldGoalsMade) - parseInt(prevTotals.v.fieldGoalsMade),
      fga: parseInt(vTotals.fieldGoalsAttempted) - parseInt(prevTotals.v.fga),
      fgPct: calcFgPct((parseInt(vTotals.fieldGoalsMade)-prevTotals.v.fgm), (parseInt(vTotals.fieldGoalsAttempted) - prevTotals.v.fga)),
      fta: parseInt(vTotals.freeThrowsAttempted) - parseInt(prevTotals.v.fta),
      to: parseInt(vTotals.turnovers) - parseInt(prevTotals.v.to),
      offReb: parseInt(vTotals.reboundsOffensive) - parseInt(prevTotals.v.offReb),
      fouls: parseInt(vTotals.foulsPersonal) - parseInt(prevTotals.v.fouls)
    },
    t: {
      pts: (parseInt(hTotals.points) + parseInt(vTotals.points)) - parseInt(prevTotals.t.pts),
      fgm: (parseInt(hTotals.fieldGoalsMade) + parseInt(vTotals.fieldGoalsMade)) - parseInt(prevTotals.t.fgm),
      fga: (parseInt(hTotals.fieldGoalsAttempted) + parseInt(vTotals.fieldGoalsAttempted)) - parseInt(prevTotals.t.fga),
      fgPct: calcFgPct(
        ((parseInt(hTotals.fieldGoalsMade) + parseInt(vTotals.fieldGoalsMade)) - parseInt(prevTotals.t.fgm)),
        ((parseInt(hTotals.fieldGoalsAttempted) + parseInt(vTotals.fieldGoalsAttempted)) - parseInt(prevTotals.t.fga))
      ),
      fta: (parseInt(hTotals.freeThrowsAttempted) + parseInt(vTotals.freeThrowsAttempted)) - parseInt(prevTotals.t.fta),
      to: (parseInt(hTotals.turnovers) + parseInt(vTotals.turnovers)) - parseInt(prevTotals.t.to),
      offReb: (parseInt(hTotals.reboundsOffensive) + parseInt(vTotals.reboundsOffensive)) - parseInt(prevTotals.t.offReb),
      fouls: (parseInt(hTotals.foulsPersonal) + parseInt(vTotals.foulsPersonal)) - parseInt(prevTotals.t.fouls),
      poss: quarterPoss,
      pace: calcEndOfQuarterPace(quarterPoss, period)
    }
  }
};

export const getCurrentAndPrevQuarterStats = async (gid, hTeam, vTeam, period, gameSecs) => {
  try {
    const prevTotalsPull = await DB.BoxScores().where({gid}).select('totals');
    const quarterTotals = compileQuarterStats(hTeam, vTeam, prevTotalsPull[0].totals[0], period, gameSecs);
    return {
      currentQuarter: quarterTotals,
      prevQuarters: prevTotalsPull[0].totals[0]
    }
  } catch (e) {
    console.log('error in quarterUpdFn is ', e, ' for gid ', gid)
  }
}