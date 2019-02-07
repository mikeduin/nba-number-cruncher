const knex = require('../db/knex');
const axios = require("axios");
const cheerio = require('cheerio');

const teamLookup = require("../modules/teamLookup");
const webScrapeHelpers = require("../modules/webScrapeHelpers");
const apiRefs = require('../modules/apiRefs');

module.exports = {
  sportsbookFull: () => {
    axios.get(apiRefs.sportsbook().full)
      .then(response => {
        if(response.status === 200) {
        let lines = webScrapeHelpers.parseSbHtml(response.data);
          console.log(lines);
          lines.forEach(line => {
            let parsed = webScrapeHelpers.sbLineParser(line);
            knex('odds_sportsbook').where({sb_id: line.id}).then(res => {
              if (!res[0]) {
                knex('odds_sportsbook').insert({
                  sb_id: line.id,
                  gcode: gcode,
                  home_team: line.homeTeam,
                  home_id: home_id,
                  home_spread_full: hSpread,
                  home_spread_full_juice: hJuice,
                  home_money_full: hMoney,
                  away_team: line.awayTeam,
                  away_id: away_id,
                  away_spread_full: aSpread,
                  away_spread_full_juice: aJuice,
                  away_money_full: aMoney,
                  total_full: total,
                  total_full_over_juice: overJuice,
                  total_full_under_juice: underJuice
                }, '*').then(game => {
                  console.log(game[0].gcode, ' added for full game');
                })
              } else {
                knex('odds_sportsbook').where({sb_id: line.id}).update({
                  home_spread_full: hSpread,
                  home_spread_full_juice: hJuice,
                  home_money_full: hMoney,
                  away_spread_full: aSpread,
                  away_spread_full_juice: aJuice,
                  away_money_full: aMoney,
                  total_full: total,
                  total_full_over_juice: overJuice,
                  total_full_under_juice: underJuice
                }, '*').then(game => {
                  console.log(game[0].gcode, ' updated for full game');
                })
              }
            })
          })
        }
      }, (error) => console.log(err) );
  },
  sportsbookFirstH: () => {
    axios.get(apiRefs.sportsbook().firstH).then(response => {
      if (response.status === 200) {
        let lines = webScrapeHelpers.parseSbHtml(response.data);
        lines.forEach(line => {
          let parsed = webScrapeHelpers.sbLineParser(line);
          knex('odds_sportsbook').where({sb_id: line.id}).update({
            home_spread_1h: hspread,
            home_spread_1h_juice: hJuice,
            home_money_1h: hMoney,
            away_spread_1h: aSpread,
            away_spread_1h_juice: aJuice,
            away_money_1h: aMoney,
            total_1h: total,
            total_1h_over_juice: overJuice,
            total_1h_under_juice: underJuice
          }, '*').then(game => {
            console.log(game[0].gcode, ' updated for 1H');
          })
        })
      }
    })
  },
  sportsbookSecondH: () => {
    axios.get(apiRefs.sportsbook().secondH).then(response => {
      if (response.status === 200) {
        let lines = webScrapeHelpers.parseSbHtml(response.data);
        lines.forEach(line => {
          let parsed = webScrapeHelpers.sbLineParser(line);
          knex('odds_sportsbook').where({sb_id: line.id}).update({
            home_spread_2h: hspread,
            home_spread_2h_juice: hJuice,
            home_money_2h: hMoney,
            away_spread_2h: aSpread,
            away_spread_2h_juice: aJuice,
            away_money_2h: aMoney,
            total_2h: total,
            total_2h_over_juice: overJuice,
            total_2h_under_juice: underJuice
          }, '*').then(game => {
            console.log(game[0].gcode, ' updated for 2H');
          })
        })
      }
    })
  },
  sportsbookFirstQ: () => {
    axios.get(apiRefs.sportsbook().firstQ).then(response => {
      if (response.status === 200) {
        let lines = webScrapeHelpers.parseSbHtml(response.data);
        lines.forEach(line => {
          let parsed = webScrapeHelpers.sbLineParser(line);
          knex('odds_sportsbook').where({sb_id: line.id}).update({
            home_spread_1q: hspread,
            home_spread_1q_juice: hJuice,
            home_money_1q: hMoney,
            away_spread_1q: aSpread,
            away_spread_1q_juice: aJuice,
            away_money_1q: aMoney,
            total_1q: total,
            total_1q_over_juice: overJuice,
            total_1q_under_juice: underJuice
          }, '*').then(game => {
            console.log(game[0].gcode, ' updated for 1Q');
          })
        })
      }
    })
  },
  sportsbookThirdQ: () => {
    axios.get(apiRefs.sportsbook().thirdQ).then(response => {
      if (response.status === 200) {
        let lines = webScrapeHelpers.parseSbHtml(response.data);
        lines.forEach(line => {
          let parsed = webScrapeHelpers.sbLineParser(line);
          knex('odds_sportsbook').where({sb_id: line.id}).update({
            home_spread_3q: hspread,
            home_spread_3q_juice: hJuice,
            home_money_3q: hMoney,
            away_spread_3q: aSpread,
            away_spread_3q_juice: aJuice,
            away_money_3q: aMoney,
            total_3q: total,
            total_3q_over_juice: overJuice,
            total_3q_under_juice: underJuice
          }, '*').then(game => {
            console.log(game[0].gcode, ' updated for 3Q');
          })
        })
      }
    })
  }
}
