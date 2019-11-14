const knex = require('../db/knex');
const axios = require('axios');
const teamStatsUrl = 'https://stats.nba.com/stats/leaguedashteamstats';
const dbBuilders = require("../modules/dbBuilders");

const headers = {
  Accept: "application/json, text/plain, */*",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-US,en;q=0.9",
  // "Cache-Control": "max-age=0",
  Connection: "keep-alive",
  Cookie: "s_vi=[CS]v1|2EE15F5485031A39-400011816000788C[CE]; s_ecid=MCMID%7C87135652433164854512395084724145927721; ug=5dc2beaa0583900a3f804a0014456d07; _ga=GA1.2.2014293384.1573043883; _gcl_au=1.1.1532531481.1573043884; AAMC_nba_0=REGION%7C9; aam_uuid=87110376411338023562391995402030762006; cto_lwid=2358ee52-e4a2-4e9c-8503-c1edc9c88a9f; aam_uuid=87110376411338023562391995402030762006; authid=1604598363-usr-57e7f57847a17399e7303d9f3da01414; TSid=Gabc4e1a-24387997-1221388457052-1; nbaMembershipInfo=%7B%22tid%22%3A%22abc4e1a-24387997-1221388457052-1%22%2C%22email%22%3A%22probablyalok@gmail.com%22%2C%22firstName%22%3A%22Alok%22%2C%22entitlements%22%3A%5B%22lpbp%22%2C%22nbatvd2c%22%2C%22lprdo%22%5D%2C%22identityType%22%3A%22EMAIL%22%7D; AMCV_7FF852E2556756057F000101%40AdobeOrg=817868104%7CMCAID%7C2EE15F5485031A39-400011816000788C%7CMCIDTS%7C18207%7CMCMID%7C87138879232078231562394845538024510550%7CMCAAMLH-1573710386%7C9%7CMCAAMB-1573710391%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1573112786s%7CNONE%7CMCCIDH%7C87181809; ugs=1; _gid=GA1.2.1553508335.1573686533; s_cc=true; AMCVS_7FF852E2556756057F000101%40AdobeOrg=1; AMCVS_248F210755B762187F000101%40AdobeOrg=1; cto_bundle=wRMx4181SWZOM0l3NkJTeWNUdyUyQnhFYTRqZTRoanY5ZmE3MnAyT1ZqTSUyQlhZQldPaXA3MkNqMDB1TEdnUmNnU0hmRDRlNSUyRkE5TVhzT2RYQXRsakhmQXpDZERFTko5ZzVDUWE0RHQ5JTJCMDFIVmNkbnRLdktpN1huVVRXUXJqYnY4TWp6V3dnQlZPMGRNM2g5ZHF6Q0N1UVY0bGt4ZyUzRCUzRA; _parsely_session={%22sid%22:4%2C%22surl%22:%22https://www.nba.com/%22%2C%22sref%22:%22%22%2C%22sts%22:1573730897616%2C%22slts%22:1573686516984}; _parsely_visitor={%22id%22:%22ba9a136c-e9b2-46c9-af65-e0d3a10e718e%22%2C%22session_count%22:4%2C%22last_session_ts%22:1573730897616}; sp_cmd=/mms/get_site_js?v=1&account_id=113&abp=true&referrer=&session_referrer=&session_message_count=0&jv=2.0.1012&cdc=window._sp_.msg._internal.cdc1&href=https%3A%2F%2Fwww.nba.com%2F; personalize=%7B%22teams%22%3A%5B%221610612750%22%2C%221610612761%22%2C%221610612742%22%2C%221610612754%22%2C%221610612740%22%2C%221610612751%22%2C%221610612762%22%2C%221610612763%22%2C%221610612757%22%2C%221610612758%22%2C%221610612744%22%2C%221610612755%22%2C%221610612766%22%2C%221610612756%22%2C%221610612737%22%2C%221610612759%22%5D%7D; _parsely_slot_click={%22url%22:%22https://www.nba.com/%22%2C%22x%22:470%2C%22y%22:18%2C%22xpath%22:%22//*[@id=%5C%22block-mainnavigation%5C%22]/nav[1]/div[2]/ul[1]/li[6]/a[1]%22%2C%22href%22:%22http://stats.nba.com/%22}; AMCV_248F210755B762187F000101%40AdobeOrg=1585540135%7CMCIDTS%7C18214%7CMCMID%7C87135652433164854512395084724145927721%7CMCAAMLH-1574335706%7C9%7CMCAAMB-1574335706%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1573738106s%7CNONE%7CMCAID%7CNONE%7CvVersion%7C4.4.0; _gat=1; ak_bmsc=3723C75AD8A5B466F9EDDBDA36DDFFAC17C5330FC45700006B3ACD5D59E2645F~plPQ9t0a1pwLG/SFLoTRYPAYE+wXVs494eFRYy7XrBejOQjAZGc5mg7eGz6nbSFyn9WTnh4XEnplSc2wh01HzDReyYKFxVxJsh90J+GfPcmB7EuJmbny4Pr/ZEO6eyOH0L8j/tmSSfoVEZiSw9QR424eYraTRCgKA598TyDOakWEqAGuc3qmQ0CKIyrs4nFTuEZXCATarTY5k/fkewqerMGry8pjJNsxSLR39uPZl1ta2adNLMDVOQXvBdldAP0/V6; gpv_pn=stats%3Ateams%3Aadvanced; s_sq=%5B%5BB%5D%5D; s_tp=1641; s_ppv=stats%253Ateams%253Aadvanced%2C43%2C43%2C713; s_tps=21; s_pvs=20; AMCV_7FF852E2556756057F000101%40AdobeOrg=2121618341%7CMCAID%7C2EE15F5485031A39-400011816000788C%7CMCIDTS%7C18215%7CMCMID%7C87138879232078231562394845538024510550%7CMCAAMLH-1574335746%7C9%7CMCAAMB-1574335746%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1573738146s%7CNONE",
  DNT: 1,
  Host: "stats.nba.com",
  Referer: "https://stats.nba.com/teams/advanced/?sort=W&dir=-1",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
  "x-nba-stats-origin": "stats",
  "x-nba-stats-token": true,
  "X-NewRelic-ID": "VQECWF5UChAHUlNTBwgBVw==",
  "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Mobile Safari/537.36"
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
