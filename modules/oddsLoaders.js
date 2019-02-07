const knex = require('../db/knex');
const axios = require("axios");
const cheerio = require('cheerio');

const teamLookup = require("../modules/teamLookup");
const webScrapeHelpers = require("../modules/webScrapeHelpers");

const sportsbook = {
  full: 'https://www.sportsbook.ag/sbk/sportsbook4/nba-betting/getevents/200.sbk?&_='+now,
  firstH: 'https://www.sportsbook.ag/sbk/sportsbook4/nba-betting/getevents/3003.sbk?&_='+now,
  secondH: 'https://www.sportsbook.ag/sbk/sportsbook4/nba-betting/nba-game-lines-2nd-half-lines.sbk?fromMenu=true&_='+now,
  firstQ: 'https://www.sportsbook.ag/sbk/sportsbook4/nba-betting/getevents/3005.sbk?&_='+now,
  thirdQ: 'https://www.sportsbook.ag/sbk/sportsbook4/nba-betting/nba-game-lines-3rd-quarter-lines.sbk?fromMenu=true&_='+now,
  live: 'https://www.sportsbook.ag/sbk/sportsbook4/live-betting-betting/nba-live-betting-all-nba-live.sbk?fromMenu=true&_='+now
}
const bol = {
  full: 'https://mobile.betonline.ag/sports/offerings?s=Basketball&l=NBA&p=0&wt=&tsr=',
  firstH: 'https://mobile.betonline.ag/sports/offerings?s=Basketball&l=NBA&p=1&wt=&tsr=',
  secondH: 'https://mobile.betonline.ag/sports/offerings?s=Basketball&l=NBA&p=2&wt=s&tsr=',
  firstQ: 'https://mobile.betonline.ag/sports/offerings?s=Basketball&l=NBA&p=3&wt=s&tsr=',
  secondQ: 'https://mobile.betonline.ag/sports/offerings?s=Basketball&l=NBA&p=4&wt=&tsr=',
  thirdQ: 'https://mobile.betonline.ag/sports/offerings?s=Basketball&l=NBA&p=5&wt=s&tsr=',
  fourthQ: 'https://mobile.betonline.ag/sports/offerings?s=Basketball&l=NBA&p=6&wt=&tsr='
}


module.exports = {
  sportsbookFull: () => {
    axios.get(sportsbook.full)
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
  sportsbookThird: () => {
    axios.get(sportsbook.thirdQ).then(response => {
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
