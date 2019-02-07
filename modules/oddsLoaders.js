const knex = require('../db/knex');
const axios = require("axios");
const cheerio = require('cheerio');

const webScrapeHelpers = require("../modules/webScrapeHelpers");
const apiRefs = require('../modules/apiRefs');

let sbFull = apiRefs.sportsbook().full;

module.exports = {
  sportsbookFull: () => {
    console.log('gets to sb');
    axios.get(sbFull)
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
                  gcode: parsed.gcode,
                  home_team: line.homeTeam,
                  home_id: parsed.home_id,
                  home_spread_full: parsed.hSpread,
                  home_spread_full_juice: parsed.hJuice,
                  home_money_full: parsed.hMoney,
                  away_team: line.awayTeam,
                  away_id: parsed.away_id,
                  away_spread_full: parsed.aSpread,
                  away_spread_full_juice: parsed.aJuice,
                  away_money_full: parsed.aMoney,
                  total_full: parsed.total,
                  total_full_over_juice: parsed.overJuice,
                  total_full_under_juice: parsed.underJuice
                }, '*').then(game => {
                  console.log(game[0].gcode, ' added for full game');
                })
              } else {
                knex('odds_sportsbook').where({sb_id: line.id}).update({
                  home_spread_full: parsed.hSpread,
                  home_spread_full_juice: parsed.hJuice,
                  home_money_full: parsed.hMoney,
                  away_spread_full: parsed.aSpread,
                  away_spread_full_juice: parsed.aJuice,
                  away_money_full: parsed.aMoney,
                  total_full: parsed.total,
                  total_full_over_juice: parsed.overJuice,
                  total_full_under_juice: parsed.underJuice
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
            home_spread_1h: parsed.hspread,
            home_spread_1h_juice: parsed.hJuice,
            home_money_1h: parsed.hMoney,
            away_spread_1h: parsed.aSpread,
            away_spread_1h_juice: parsed.aJuice,
            away_money_1h: parsed.aMoney,
            total_1h: parsed.total,
            total_1h_over_juice: parsed.overJuice,
            total_1h_under_juice: parsed.underJuice
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
            home_spread_2h: parsed.hspread,
            home_spread_2h_juice: parsed.hJuice,
            home_money_2h: parsed.hMoney,
            away_spread_2h: parsed.aSpread,
            away_spread_2h_juice: parsed.aJuice,
            away_money_2h: parsed.aMoney,
            total_2h: parsed.total,
            total_2h_over_juice: parsed.overJuice,
            total_2h_under_juice: parsed.underJuice
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
            home_spread_1q: parsed.hspread,
            home_spread_1q_juice: parsed.hJuice,
            home_money_1q: parsed.hMoney,
            away_spread_1q: parsed.aSpread,
            away_spread_1q_juice: parsed.aJuice,
            away_money_1q: parsed.aMoney,
            total_1q: parsed.total,
            total_1q_over_juice: parsed.overJuice,
            total_1q_under_juice: parsed.underJuice
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
            home_spread_3q: parsed.hspread,
            home_spread_3q_juice: parsed.hJuice,
            home_money_3q: parsed.hMoney,
            away_spread_3q: parsed.aSpread,
            away_spread_3q_juice: parsed.aJuice,
            away_money_3q: parsed.aMoney,
            total_3q: parsed.total,
            total_3q_over_juice: parsed.overJuice,
            total_3q_under_juice: parsed.underJuice
          }, '*').then(game => {
            console.log(game[0].gcode, ' updated for 3Q');
          })
        })
      }
    })
  }
}
