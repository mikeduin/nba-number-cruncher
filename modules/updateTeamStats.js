const knex = require('../db/knex');
const axios = require('axios');
const teamStatsUrl = 'https://stats.nba.com/stats/leaguedashteamstats';
const dbBuilders = require("../modules/dbBuilders");

// const headers = {
//   Accept: "application/json, text/plain, */*",
//   "Accept-Encoding": "gzip, deflate, br",
//   "Accept-Language": "en-US,en;q=0.9",
//   "Cache-Control": "no-cache",
//   Connection: "keep-alive",
//   Cookie: "s_vi=[CS]v1|2EF1106705034120-4000119140000CF1[CE]; s_ecid=MCMID%7C82746756903599269423879246292079630549; ug=5de220cf0460d10a3f9da90019e29115; _ga=GA1.2.435732171.1575100624; _gcl_au=1.1.1101947039.1575100625; AAMC_nba_0=REGION%7C9; aam_uuid=82760881203063886413880631783446783722; s_cc=true; AMCVS_7FF852E2556756057F000101%40AdobeOrg=1; AMCVS_248F210755B762187F000101%40AdobeOrg=1; cto_lwid=64010c90-3a2d-4785-9346-bea001329dd3; cto_bundle=qAyF3V9RVll5SG1yQVp2S0s2S3V4OVQyVElTMTJlN2JzcUNnbGRGVSUyQk9MZHhQMEJhNVMlMkJrcmVyR3ZuWGZFbzk4VzBXRTRQNEpGZ25pUlBiNmY1RXlOUnJ6T2pPVkx2b0dFY2FLTW40YnhFQnJYb2NQbXlab3pXVzJydlRKU0VjZ3FQJTJCSUNXVm1QMk5uTWVGVnh6MnRIT0J1NkElM0QlM0Q; _parsely_session={%22sid%22:3%2C%22surl%22:%22https://www.nba.com/%22%2C%22sref%22:%22%22%2C%22sts%22:1576096008262%2C%22slts%22:1575467706556}; _parsely_visitor={%22id%22:%2204018e81-cdc8-4cae-b3cc-b18c91c3de45%22%2C%22session_count%22:3%2C%22last_session_ts%22:1576096008262}; sp_cmd=/mms/get_site_js?v=1&account_id=113&abp=true&referrer=https%3A%2F%2Fwww.nba.com%2F&session_referrer=&session_message_count=1&jv=2.0.1012&cdc=window._sp_.msg._internal.cdc1&href=https%3A%2F%2Fwww.nba.com%2F; _parsely_slot_click={%22url%22:%22https://www.nba.com/%22%2C%22x%22:470%2C%22y%22:18%2C%22xpath%22:%22//*[@id=%5C%22block-mainnavigation%5C%22]/nav[1]/div[2]/ul[1]/li[6]/a[1]%22%2C%22href%22:%22http://stats.nba.com/%22}; AMCV_7FF852E2556756057F000101%40AdobeOrg=2121618341%7CMCIDTS%7C18242%7CMCMID%7C82744343818462379213878978594758179498%7CMCAAMLH-1576700820%7C9%7CMCAAMB-1576700820%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1576103220s%7CNONE%7CMCAID%7C2EF1106705034120-4000119140000CF1; AMCV_248F210755B762187F000101%40AdobeOrg=1585540135%7CMCIDTS%7C18242%7CMCMID%7C82746756903599269423879246292079630549%7CMCAAMLH-1576700821%7C9%7CMCAAMB-1576700821%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1576103221s%7CNONE%7CMCAID%7CNONE%7CvVersion%7C4.4.0; ugs=1; _gid=GA1.2.1569402193.1576096023; _gat=1; ak_bmsc=F0F9EDCC3F531EFDA0CD401EC6F7681317427305762800002651F15D94503A69~plEM6Xxa+BpRgt6E7u2lPIS4PParwhw985TW8IZZikCoKgC+pcvvLktChiw5cwcz7f1PlpNLJDlIp7IKY+t/IsBF0PC4G0q35wrG0RSQL/XSFAwOILhM3RSU2Uds4+gNUzk1NADwnchQVD4uonQVY3c7M+I3VPdNupGoBvbCJdrs8qSjyhI1WZu+8zco3qAEFeSTSXMuDny71dDCcE1ggUI3FaX8xLzExVINbkcmbf7NRJyPLgfrbM1LOhgROaHKt7; gpv_pn=stats%3Ateams%3Atraditional; s_sq=%5B%5BB%5D%5D; QSI_HistorySession=https%3A%2F%2Fstats.nba.com%2F~1575467719757%7Chttps%3A%2F%2Fstats.nba.com%2Fplayers%2Ftraditional%2F%3FDateFrom%3D12%252F03%252F2019%26DateTo%3D12%252F03%252F2019%26PerMode%3DTotals%26sort%3DPTS%26dir%3D-1~1575467757860%7Chttps%3A%2F%2Fstats.nba.com%2Fplayers%2Fadvanced%2F~1575467762402%7Chttps%3A%2F%2Fstats.nba.com%2Fplayers%2Fadvanced%2F%3Fsort%3DGP%26dir%3D-1~1575467779819%7Chttps%3A%2F%2Fstats.nba.com%2F~1576096023483%7Chttps%3A%2F%2Fstats.nba.com%2Fteams%2Ftraditional%2F%3FDateFrom%3D12%252F10%252F2019%26DateTo%3D12%252F10%252F2019%26PerMode%3DTotals%26sort%3DPTS%26dir%3D-1~1576096040183; s_tp=820; s_ppv=stats%253Ateams%253Atraditional%2C88%2C88%2C718; s_tps=6; s_pvs=5",
//   DNT: 1,
//   Host: "stats.nba.com",
//   Referer: "https://stats.nba.com/teams/advanced/?sort=W&dir=-1",
//   "Sec-Fetch-Mode": "cors",
//   "Sec-Fetch-Site": "same-origin",
//   "x-nba-stats-origin": "stats",
//   "x-nba-stats-token": true,
//   "X-NewRelic-ID": "VQECWF5UChAHUlNTBwgBVw==",
//   "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Mobile Safari/537.36"
// }

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
