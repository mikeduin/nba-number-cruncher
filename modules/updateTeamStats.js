const knex = require('../db/knex');
const axios = require('axios');
const teamStatsUrl = 'https://stats.nba.com/stats/leaguedashteamstats';
const dbBuilders = require("../modules/dbBuilders");

const headers = {
  Accept: "application/json, text/plain, */*",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
  Cookie: "s_vi=[CS]v1|2F09731885035D13-6000118A0000E636[CE]; s_ecid=MCMID%7C29726662480201866704609363997235898166; s_cc=true; _gcl_au=1.1.782122134.1578296882; OptanonConsent=isIABGlobal=true&datestamp=Mon+Jan+06+2020+08%3A48%3A02+GMT%2B0100+(Central+European+Standard+Time)&version=5.9.0; AAMC_nba_0=REGION%7C6; aam_uuid=29766421465153726544609962341955566454; AMCVS_248F210755B762187F000101%40AdobeOrg=1; s_gpv=uk%3Astats%3Aplayers%3Amain; tp=4068; gr=ukuw; sp_cmd=/mms/get_site_js?v=1&account_id=113&abp=true&referrer=https%3A%2F%2Fwww.nba.com%2Fgr%2FreflectIntl.html%3Fgr%3Dukuw%26page%3Dwww%26dur%3Dses&session_referrer=https%3A%2F%2Fwww.nba.com%2Fgr%2FreflectIntl.html%3Fgr%3Dukuw%26page%3Dwww%26dur%3Dses&session_message_count=0&jv=2.0.1012&cdc=window._sp_.msg._internal.cdc1&href=https%3A%2F%2Fwww.nba.com%2F%3F58; AMCVS_7FF852E2556756057F000101%40AdobeOrg=1; AMCV_7FF852E2556756057F000101%40AdobeOrg=2121618341%7CMCAID%7C2F09731885035D13-6000118A0000E636%7CMCIDTS%7C18271%7CMCMID%7C29726662480201866704609363997235898166%7CMCAAMLH-1579216688%7C6%7CMCAAMB-1579216688%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1578619088s%7CNONE; AMCV_248F210755B762187F000101%40AdobeOrg=1585540135%7CMCMID%7C29726662480201866704609363997235898166%7CMCIDTS%7C18271%7CMCAAMLH-1579216688%7C6%7CMCAAMB-1579216688%7Cj8Odv6LonN4r3an7LhD3WZrU1bUpAkFkkiY1ncBR96t2PTI%7CMCOPTOUT-1578619088s%7CNONE%7CvVersion%7C4.4.0%7CMCAID%7C2F09731885035D13-6000118A0000E636; aam_uuid=29766421465153726544609962341955566454; ug=5e12e6310637ae0a3f953300150394da; ugs=1; _ga=GA1.2.1902845207.1578611891; _gid=GA1.2.1181026821.1578611891; _gat=1; ak_bmsc=39B71BF0178E1C02E1D96EA19F0B38265C7A364315290000BAB4175ED3B83F62~pljy1oDYdQcqF7aPxpK7twhpu6x4fcmdFpo3gI0Ph8Rt2MD5n1WWzoNeEDFzxPlZnlYpFvr30gCWzSDv64UfoM9VGs1coSpe+Tw0EVcrOq0D27gbq6qGXpcWLaFHSKTvYXGKjxGvDAL5z+XZHn5Vg6yOvGXCTX31aJxwEYXeQ5KD/hWeG8I1nqKeHPNohGBAe7UGuhpeogbX1iTcRM/13tyyLRAOptuAB2WZV5G0RbJ5c=; QSI_HistorySession=https%3A%2F%2Fstats.nba.com%2F~1578611891283%7Chttps%3A%2F%2Fstats.nba.com%2Fplayers%2Ftraditional%2F%3FDateFrom%3D01%252F08%252F2020%26DateTo%3D01%252F08%252F2020%26PerMode%3DTotals%26sort%3DPTS%26dir%3D-1~1578611900007%7Chttps%3A%2F%2Fstats.nba.com%2Fteams%2Ftraditional%2F~1578611905259; gpv_pn=stats%3Ateams%3Atraditional; bm_sv=70DACE9E96FC7CFA633C4D6C3489754B~AnX691GCRa+T6DhqLzpQprKkLG1fYI3QVTMw+A/vhAr3TzDQO3gG3Pxn5RNioVaxmd42fEp/ZdbCTvu3l7RWBPdlEE6BtKOR2dv1uT+2kSmySQDxKQvHNfSNRgyFentzm9rO+oUuSMu+CqJv4Suk9w==; s_tp=1717; s_ppv=stats%253Ateams%253Atraditional%2C31%2C31%2C531; s_tps=7; s_pvs=14; s_sq=nbag-n-league%252Cnbag-n-league-all-platforms%3D%2526c.%2526a.%2526activitymap.%2526page%253Dstats%25253Ateams%25253Atraditional%2526link%253DAdvanced%2526region%253DBODY%2526pageIDType%253D1%2526.activitymap%2526.a%2526.c%2526pid%253Dstats%25253Ateams%25253Atraditional%2526pidt%253D1%2526oid%253Dhttps%25253A%25252F%25252Fstats.nba.com%25252Fteams%25252Fadvanced%25252F%2526ot%253DA%26nbastatsprod%3D%2526c.%2526a.%2526activitymap.%2526page%253Dus%25253Astats%25253Ateams%25253Atraditional%2526link%253DAdvanced%2526region%253DBODY%2526pageIDType%253D1%2526.activitymap%2526.a%2526.c%2526pid%253Dus%25253Astats%25253Ateams%25253Atraditional%2526pidt%253D1%2526oid%253Dhttps%25253A%25252F%25252Fstats.nba.com%25252Fteams%25252Fadvanced%25252F%2526ot%253DA",
  DNT: 1,
  Host: "stats.nba.com",
  Referer: "https://stats.nba.com/teams/advanced/?sort=W&dir=-1",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
  "x-nba-stats-origin": "stats",
  "x-nba-stats-token": true,
  "X-NewRelic-ID": "VQECWF5UChAHUlNTBwgBVw==",
  "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Mobile Safari/537.36"
}

const updateBaseTeamBuild = (games, db, period) => {
  // console.log('updating base team build for ', games, db, period);
  axios.get(teamStatsUrl, {
    params: dbBuilders.fetchBaseTeamParams(games, period),
    headers: headers
  })
    .then(response => {
      // console.log('response is ', response);
      let teamData = response.data.resultSets[0].rowSet;
      // Change this to .buildBaseTeamDb for initial builds
      // dbBuilders.buildBaseTeamDb(db, teamData);
      dbBuilders.updateBaseTeamDb(db, teamData);
    });
};


const updateFullTeamBuild = (games, db, period) => {
  // console.log('updating full team build for ', games, db, period);
  axios.get(teamStatsUrl, {
    params: dbBuilders.fetchAdvancedTeamParams(games, period),
    headers: headers
  })
    .then(response => {
      let teamData = response.data.resultSets[0].rowSet;
      // Change this to .buildTeabDb for initial builds
      // dbBuilders.buildAdvancedTeamDb(db, teamData);
      dbBuilders.updateAdvancedTeamDb(db, teamData);
    });
};

const updatePartialTeamBuild = (games, db, lineup) => {
  axios.get(teamStatsUrl, {
    params: dbBuilders.fetchLineupParams(games, lineup),
    headers: headers
  })
    .then(response => {
      let teamData = response.data.resultSets[0].rowSet;
      // Change this to .buildTeabDb for initial builds
      // dbBuilders.buildAdvancedTeamDb(db, teamData);
      dbBuilders.updateAdvancedTeamDb(db, teamData);
    })
};

module.exports = {
  updateFullTeamBuilds: () => {
    updateBaseTeamBuild(0, 'teams_full_base', 0);
    updateFullTeamBuild(0, 'teams_full', 0);
    updateFullTeamBuild(5, 'teams_full_l5', 0);
    updateFullTeamBuild(10, 'teams_full_l10', 0);
    updateFullTeamBuild(15, 'teams_full_l15', 0);
    updateFullTeamBuild(20, 'teams_full_l20', 0);
  },
  updateQ1Builds: () => {
    updateFullTeamBuild(0, 'teams_q1', 1);
    updateFullTeamBuild(5, 'teams_q1_l5', 1);
    updateFullTeamBuild(10, 'teams_q1_l10', 1);
    updateFullTeamBuild(15, 'teams_q1_l15', 1);
  },
  updateQ2Builds: () => {
    updateFullTeamBuild(0, 'teams_q2', 2);
    updateFullTeamBuild(5, 'teams_q2_l5', 2);
    updateFullTeamBuild(10, 'teams_q2_l10', 2);
    updateFullTeamBuild(15, 'teams_q2_l15', 2);
  },
  updateQ3Builds: () => {
    updateFullTeamBuild(0, 'teams_q3', 3);
    updateFullTeamBuild(5, 'teams_q3_l5', 3);
    updateFullTeamBuild(10, 'teams_q3_l10', 3);
    updateFullTeamBuild(15, 'teams_q3_l15', 3);
  },
  updateQ4Builds: () => {
    updateFullTeamBuild(0, 'teams_q4', 4);
    updateFullTeamBuild(5, 'teams_q4_l5', 4);
    updateFullTeamBuild(10, 'teams_q4_l10', 4);
    updateFullTeamBuild(15, 'teams_q4_l15', 4);
  },
  updateStarterBuilds: () => {
    updatePartialTeamBuild(0, 'teams_starters', 'Starters');
    updatePartialTeamBuild(5, 'teams_starters_l5', 'Starters');
    updatePartialTeamBuild(10, 'teams_starters_l10', 'Starters');
    updatePartialTeamBuild(15, 'teams_starters_l15', 'Starters');
    updatePartialTeamBuild(20, 'teams_starters_l20', 'Starters');
  },
  updateBenchBuilds: () => {
    updatePartialTeamBuild(0, 'teams_bench', 'Bench');
    updatePartialTeamBuild(5, 'teams_bench_l5', 'Bench');
    updatePartialTeamBuild(10, 'teams_bench_l10', 'Bench');
    updatePartialTeamBuild(15, 'teams_bench_l15', 'Bench');
    updatePartialTeamBuild(20, 'teams_bench_l20', 'Bench');
  },

}
