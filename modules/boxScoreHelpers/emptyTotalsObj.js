const emptyTotalsObj = () => {
  return [{
    h: {
      pts: 0,
      fgm: 0,
      fga: 0,
      fgPct: 0,
      fta: 0,
      to: 0,
      offReb: 0,
      fouls: 0
    },
    v: {
      pts: 0,
      fgm: 0,
      fga: 0,
      fgPct: 0,
      fta:0,
      to: 0,
      offReb: 0,
      fouls: 0
    },
    t: {
      pts: 0,
      fgm: 0,
      fga: 0,
      fgPct: 0,
      fta: 0,
      to: 0,
      offReb: 0,
      fouls: 0,
      poss: 0,
      pace: 0
    }
  }]
}

module.exports = emptyTotalsObj;

// Delete this below once functionality confirmed

// let first_q_Obj = {
//   h: {
//     pts: hTeam.totals.points,
//     fgm: hTeam.totals.fgm,
//     fga: hTeam.totals.fga,
//     fgPct: calcFgPct(hTeam.totals.fgm, hTeam.totals.fga),
//     fta: hTeam.totals.fta,
//     to: hTeam.totals.turnovers,
//     offReb: hTeam.totals.offReb,
//     fouls: hTeam.totals.pFouls
//   },
//   v: {
//     pts: vTeam.totals.points,
//     fgm: vTeam.totals.fgm,
//     fga: vTeam.totals.fga,
//     fgPct: calcFgPct(vTeam.totals.fgm, vTeam.totals.fga),
//     fta: vTeam.totals.fta,
//     to: vTeam.totals.turnovers,
//     offReb: vTeam.totals.offReb,
//     fouls: vTeam.totals.pFouls
//   },
//   t: {
//     pts: hTeam.totals.points + vTeam.totals.points,
//     fgm: hTeam.totals.fgm + vTeam.totals.fgm,
//     fga: hTeam.totals.fga + vTeam.totals.fga,
//     fgPct: calcFgPct((hTeam.totals.fgm + vTeam.totals.fgm), (hTeam.totals.fga + vTeam.totals.fga)),
//     fta: hTeam.totals.fta + vTeam.totals.fta,
//     to: hTeam.totals.turnovers + vTeam.totals.turnovers,
//     offReb: hTeam.totals.offReb + vTeam.totals.offReb,
//     fouls: hTeam.totals.pFouls + vTeam.totals.pFouls,
//     poss: poss,
//     pace: ((poss*4)/2)
//   }
// };

/// This is the old DB dbBuilders
// knex("box_scores").where({gid: gid}).then(entry => {
//   if (!entry[0]) {
//     knex("box_scores").insert({
//       gid: gid,
//       h_1q_pts: hTeam.totals.points,
//       h_1q_fga: hTeam.totals.fga,
//       h_1q_fgm: hTeam.totals.fgm,
//       h_1q_fg_pct: hFgPct,
//       h_1q_fta: hTeam.totals.fta,
//       h_1q_to: hTeam.totals.turnovers,
//       h_1q_off_reb: hTeam.totals.offReb,
//       h_1q_fouls: hTeam.totals.pFouls,
//       v_1q_pts: vTeam.totals.points,
//       v_1q_fga: vTeam.totals.fga,
//       v_1q_fgm: vTeam.totals.fgm,
//       v_1q_fg_pct: vFgPct,
//       v_1q_fta: vTeam.totals.fta,
//       v_1q_to: vTeam.totals.turnovers,
//       v_1q_off_reb: vTeam.totals.offReb,
//       v_1q_fouls: vTeam.totals.pFouls,
//       h_total_pts: hTeam.totals.points,
//       h_total_fga: hTeam.totals.fga,
//       h_total_fgm: hTeam.totals.fgm,
//       h_total_fg_pct: hFgPct,
//       h_total_fta: hTeam.totals.fta,
//       h_total_to: hTeam.totals.turnovers,
//       h_total_off_reb: hTeam.totals.offReb,
//       h_total_fouls: hTeam.totals.pFouls,
//       v_total_pts: vTeam.totals.points,
//       v_total_fga: vTeam.totals.fga,
//       v_total_fgm: vTeam.totals.fgm,
//       v_total_fg_pct: vFgPct,
//       v_total_fta: vTeam.totals.fta,
//       v_total_to: vTeam.totals.turnovers,
//       v_total_off_reb: vTeam.totals.offReb,
//       v_total_fouls: vTeam.totals.pFouls,
//       period_updated: 1,
//       updated_at: new Date()
//     }, '*').then(inserted => {
//       console.log('inserted is ', inserted);
//       res.send({
//         msg: `Q1 end`,
//         clock: clock,
//         period: period,
//         thru_period: 1,
//         poss: poss,
//         hStats: hStats,
//         vStats: vStats,
//         insertedStats: inserted
//       })
//     })
//   } else {
//     console.log('1Q period has already been entered');
//     return;
//   }
// })
