import * as DB from '../../controllers/Db.Controller';
import { calcEndOfQuarterPace, calcQuarterPace, calcFgPct } from "./calculateRateStats";

const calcDiff = (current, previous) => parseInt(current) - (parseInt(previous) ?? 0);

const calcQuarterPoss = (hTotals, vTotals, prevTotals) => {
  // console.log('fga is ', calcDiff(parseInt(hTotals.fieldGoalsAttempted) + parseInt(vTotals.fieldGoalsAttempted), prevTotals?.t?.fga))

  const fga = calcDiff(parseInt(hTotals.fieldGoalsAttempted) + parseInt(vTotals.fieldGoalsAttempted), prevTotals?.t?.fga || 0);
  const to = calcDiff(parseInt(hTotals.turnovers) + parseInt(vTotals.turnovers), prevTotals?.t?.to || 0);
  const fta = calcDiff(parseInt(hTotals.freeThrowsAttempted) + parseInt(vTotals.freeThrowsAttempted), prevTotals?.t?.fta || 0);
  const offReb = calcDiff(parseInt(hTotals.reboundsOffensive) + parseInt(vTotals.reboundsOffensive), prevTotals?.t?.offReb || 0);

  return (fga + to + (0.44 * fta) - offReb);
};

// this method calculates the stats for a quarter, using the previous totals from earlier Qs
export const compileQuarterStats = (hTotals, vTotals, prevTotals, period, gameSecs) => {
  const quarterPoss = calcQuarterPoss(hTotals, vTotals, prevTotals)

  // console.log('hTotals is ', hTotals, ' vTotals is ', vTotals, ' prevTotals is ', prevTotals, ' period is ', period, ' gameSecs is ', gameSecs)

  // NOTE: ONCE YOU HAVE CONFIRMED PREVTOTALS ARE NOT GOING IN AS INTEGERS, YOU CAN REMOVE PARSEINTS
  return {
    h: {
      pts: calcDiff(hTotals.points, prevTotals?.h?.pts || 0),
      fgm: calcDiff(hTotals.fieldGoalsMade, prevTotals?.h?.fgm || 0),
      fga: calcDiff(hTotals.fieldGoalsAttempted, prevTotals?.h?.fga || 0),
      fgPct: calcFgPct(calcDiff(hTotals.fieldGoalsMade, prevTotals?.h?.fgm || 0), calcDiff(hTotals.fieldGoalsAttempted, prevTotals?.h?.fga || 0)),
      fta: calcDiff(hTotals.freeThrowsAttempted, prevTotals?.h?.fta || 0),
      to: calcDiff(hTotals.turnovers, prevTotals?.h?.to || 0),
      offReb: calcDiff(hTotals.reboundsOffensive, prevTotals?.h?.offReb || 0),
      fouls: calcDiff(hTotals.foulsPersonal, prevTotals?.h?.fouls || 0)
    },
    v: {
      pts: calcDiff(vTotals.points, prevTotals?.v?.pts || 0),
      fgm: calcDiff(vTotals.fieldGoalsMade, prevTotals?.v?.fgm || 0),
      fga: calcDiff(vTotals.fieldGoalsAttempted, prevTotals?.v?.fga || 0),
      fgPct: calcFgPct(calcDiff(vTotals.fieldGoalsMade, prevTotals?.v?.fgm || 0), calcDiff(vTotals.fieldGoalsAttempted, prevTotals?.v?.fga || 0)),
      fta: calcDiff(vTotals.freeThrowsAttempted, prevTotals?.v?.fta || 0),
      to: calcDiff(vTotals.turnovers, prevTotals?.v?.to | 0),
      offReb: calcDiff(vTotals.reboundsOffensive, prevTotals?.v?.offReb || 0),
      fouls: calcDiff(vTotals.foulsPersonal, prevTotals?.v?.fouls || 0)
    },
    t: {
      pts: calcDiff(parseInt(hTotals.points) + parseInt(vTotals.points), prevTotals?.t?.pts || 0),
      fgm: calcDiff(parseInt(hTotals.fieldGoalsMade) + parseInt(vTotals.fieldGoalsMade), prevTotals?.t?.fgm || 0),
      fga: calcDiff(parseInt(hTotals.fieldGoalsAttempted) + parseInt(vTotals.fieldGoalsAttempted), prevTotals?.t?.fga || 0),
      fgPct: calcFgPct(
        calcDiff(parseInt(hTotals.fieldGoalsMade) + parseInt(vTotals.fieldGoalsMade), prevTotals?.t?.fgm || 0),
        calcDiff(parseInt(hTotals.fieldGoalsAttempted) + parseInt(vTotals.fieldGoalsAttempted), prevTotals?.t?.fga || 0)
      ),
      fta: calcDiff(parseInt(hTotals.freeThrowsAttempted) + parseInt(vTotals.freeThrowsAttempted), prevTotals?.t?.fta || 0),
      to: calcDiff(parseInt(hTotals.turnovers) + parseInt(vTotals.turnovers), prevTotals?.t?.to || 0),
      offReb: calcDiff(parseInt(hTotals.reboundsOffensive) + parseInt(vTotals.reboundsOffensive), prevTotals?.t?.offReb || 0),
      fouls: calcDiff(parseInt(hTotals.foulsPersonal) + parseInt(vTotals.foulsPersonal), prevTotals?.t?.fouls || 0),
      poss: quarterPoss,
      pace: calcQuarterPace(quarterPoss, period, gameSecs)
    }
  };
};

export const getCurrentAndPrevQuarterStats = async (gid, hTeam, vTeam, period, gameSecs) => {
  try {
    const prevTotalsPull = await DB.BoxScores().where({gid}).select('totals');
    // console.log('prevTotalsPull in getCurrentAndPrevQuarterStats is ', prevTotalsPull[0].totals[0]);  
    const quarterTotals = compileQuarterStats(hTeam, vTeam, prevTotalsPull[0]?.totals[0], period, gameSecs);
    return {
      currentQuarter: quarterTotals,
      prevQuarters: prevTotalsPull[0]?.totals[0] || null
    }
  } catch (e) {
    console.log('error in quarterUpdFn is ', e, ' for gid ', gid)
  }
}