const knex = require('../db/knex');
const axios = require('axios');
const advancedPlayerStats = 'https://stats.nba.com/stats/leaguedashplayerstats';
const dbBuilders = require("../modules/dbBuilders");

const headers = {
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "max-age=0",
  Connection: "keep-alive",
  Cookie: "_gcl_au=1.1.1076469237.1547338828; s_cc=true; AAMC_nba_0=REGION%7C9; aam_uuid=42521841561448812973329937712222256037; TSid=Gabc4e1a-24387997-1221388457052-1; authid=1578831676-usr-0b9308b2d18ab3921189f147c37911e1; umbel_browser_id=350b8ca6-d332-4c4d-94de-e25c359995b6; umbel1-v0=profile.email%3Dprobablyalok%2540gmail.com%26profile.zip%3D10033%26profile.gender%3DM%26profile.address%3D%257B%2522country%2522%253A%2522US%2522%257D%26app.user_agent%3DMozilla%252F5.0%2520%28Macintosh%253B%2520Intel%2520Mac%2520OS%2520X%252010_11_3%29%2520AppleWebKit%252F537.36%2520%28KHTML%252C%2520like%2520Gecko%29%2520Chrome%252F71.0.3578.98%2520Safari%252F537.36; umbel1-q0=2019-01-13T00%253A21%253A17.683Z%3D%257B%2522name%2522%253A%2522profile.email%2522%252C%2522value%2522%253A%2522probablyalok%2540gmail.com%2522%257D%262019-01-13T00%253A21%253A17.685Z%3D%257B%2522name%2522%253A%2522profile.zip%2522%252C%2522value%2522%253A%252210033%2522%257D%262019-01-13T00%253A21%253A17.688Z%3D%257B%2522name%2522%253A%2522profile.address%2522%252C%2522value%2522%253A%2522%257B%255C%2522country%255C%2522%253A%255C%2522US%255C%2522%257D%2522%257D%262019-01-13T00%253A21%253A17.691Z%3D%257B%2522name%2522%253A%2522app.user_agent%2522%252C%2522value%2522%253A%2522Mozilla%252F5.0%2520%28Macintosh%253B%2520Intel%2520Mac%2520OS%2520X%252010_11_3%29%2520AppleWebKit%252F537.36%2520%28KHTML%252C%2520like%2520Gecko%29%2520Chrome%252F71.0.3578.98%2520Safari%252F537.36%2522%257D; _ga=GA1.2.950097934.1547349068; check=true; AMCVS_248F210755B762187F000101%40AdobeOrg=1; ug=5c39b4bc034b530a3f8ac200176c4d2a; AMCVS_7FF852E2556756057F000101%40AdobeOrg=1; cto_lwid=ffe95734-376b-43b7-81d2-8a627e583fb2; _omappvp=ps6qzYdwb5kUdTFMNPxKET2mfqvtQuf50RlIWnQdFCpTXNrpqRluS3s9aKRuTiieMKeNEYhKeIVsQnRYYO6ELpDMBwcR5nu4; omSeen-gmc7mlm8fei83nwi8ymf=1549040279647; om-gmc7mlm8fei83nwi8ymf=1549040281410; omSeen-jpzjbslxn3mv8rdnzqvj=1549040283765; omSeen-hoifu0f3jpjdzmukguz1=1550057656485; s_sq=%5B%5BB%5D%5D; mbox=PC#fa218bfbc3a541c9a58e9ebc0d990c9a.28_133#1613828011|session#7e72c1e82cfd47e58ed7c8d85ef16c12#1550585071; AMCV_248F210755B762187F000101%40AdobeOrg=1687686476%7CMCIDTS%7C17946%7CMCMID%7C42552914832906446543330780587838981530%7CMCAAMLH-1551188012%7C9%7CMCAAMB-1551188012%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1550590412s%7CNONE%7CMCAID%7CNONE%7CvVersion%7C3.0.0; nbaMembershipInfo=%7B%22tid%22%3A%22abc4e1a-24387997-1221388457052-1%22%2C%22email%22%3A%22probablyalok@gmail.com%22%2C%22firstName%22%3A%22Alok%22%2C%22entitlements%22%3A%5B%22lpbp%22%2C%22lpbfp%22%2C%22lprdo%22%5D%2C%22identityType%22%3A%22EMAIL%22%7D; personalize=%7B%22teams%22%3A%5B%221610612750%22%2C%221610612761%22%2C%221610612742%22%2C%221610612754%22%2C%221610612740%22%2C%221610612751%22%2C%221610612762%22%2C%221610612763%22%2C%221610612758%22%2C%221610612744%22%2C%221610612755%22%2C%221610612766%22%2C%221610612756%22%2C%221610612737%22%2C%221610612759%22%5D%7D; s_ppvl=nba%253Agames%253A20190202%253Aatlphx%2C57%2C57%2C598%2C1257%2C598%2C1280%2C800%2C2%2CP; s_ppv=nba%253Agames%253A20190202%253Aatlphx%2C100%2C34%2C1835%2C1257%2C598%2C1280%2C800%2C2%2CP; AMCV_7FF852E2556756057F000101%40AdobeOrg=817868104%7CMCIDTS%7C17946%7CMCMID%7C42550336135170178093330535919586846693%7CMCAAMLH-1551568956%7C9%7CMCAAMB-1551568967%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1550971356s%7CNONE%7CMCAID%7CNONE%7CvVersion%7C3.0.0%7CMCCIDH%7C87181809; s_tps=50974; s_pvs=99660; _parsely_visitor={%22id%22:%22554b1e6f-fa74-4875-aaf2-2679b57a075a%22%2C%22session_count%22:44%2C%22last_session_ts%22:1551015124514}; ak_bmsc=83A19A9079C58EB7D56D6FEC520440DA3FF3F216EC520000FAFD755CB41E3711~plOlYjggyQEpH25TJuXqGMyH7BR/gpoLRFPh7AKpSiEuAfjkynz6KRuka1Z49ZKJ/BaIyn6B2n6d0Jk67UMFHHxHedKZ2knFh5x+B3hQusM74uz+TeSVZTmK3YiFopFiaFntrNe8lj1pb6K9X1fg2J3+oncwgpMHE8MxccbCW9scG7o1rWiv2W1/oyUeTbzicj9JeSGUXqYw5EaHkHsEKoFwsOHCR9yHkEBOtUz6SjZBQ=; bm_sv=AD2D0362E0238ADDFEDE8D4A690F40F6~0TzIQe0tL+cDo0NBYg3qBHsvaONIUmfBOLhq5WZcm8Uyt8DKTF1fxs23QnKe5i6R3MaX4RuSLMGsHCCoiZxoHLB0wcjGJfiOdai7jzgqRHXZxL/B9m+5n97AF/p62+6fH508TWAuJKFSpck8E+R2/w==",
  DNT: 1,
  Host: "stats.nba.com",
  "Upgrade-Insecure-Requests": 1,
  "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Mobile Safari/537.36"
}

const updatePlayerStats = (games, db) => {
  axios.get(advancedPlayerStats, {params: dbBuilders.fetchAdvancedPlayerParams(games), headers: headers})
    .then(response => {
      let playerData = response.data.resultSets[0].rowSet;
      dbBuilders.updatePlayerDb(db, playerData);
    });
};

module.exports = {
  updatePlayerStatBuilds: () => {
    updatePlayerStats(0, 'players_full');
    updatePlayerStats(5, 'players_l5');
    updatePlayerStats(10, 'players_l10');
    updatePlayerStats(5, 'players_l15');
  }
}
