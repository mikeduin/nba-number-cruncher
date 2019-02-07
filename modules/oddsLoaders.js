const knex = require('../db/knex');
const axios = require("axios");
const cheerio = require('cheerio');

const teamLookup = require("../modules/teamLookup");

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

const nullChecker = (value) => {
  if (value === '-') {
    return null;
  } else {
    return value;
  }
};

const parseSbHtml = (html) => {
  const $ = cheerio.load(html);
  let lines = [];
  // must leave cheerio fn in old ES syntax
  $('.eventbox').each(function(i, elem) {
    lines[i] = {
      id: $(this).attr('id'),
      time: $(this).find('.hour').text(),
      awayTeam: $(this).find('.team-title').eq(0).text(),
      over: $(this).find('.money').eq(0).find('.market').text(),
      awaySpread: $(this).find('.spread').eq(0).find('.market').text(),
      awayMoney: $(this).find('.total').eq(0).find('.market').text(),
      homeTeam: $(this).find('.team-title').eq(1).text(),
      under: $(this).find('.money').eq(1).find('.market').text(),
      homeSpread: $(this).find('.spread').eq(1).find('.market').text(),
      homeMoney: $(this).find('.total').eq(1).find('.market').text()
    };
  });
  return lines;
}

module.exports = {
  sportsbookFull: () => {
    axios.get(sportsbook.full)
      .then(response => {
          if(response.status === 200) {
          let lines = parseSbHtml(response.data);

              console.log(lines);
              lines.forEach(line => {
                let year = nullChecker(line.id.slice(-2));
                let date = nullChecker(line.id.slice(-6, -2));
                let hSplit = nullChecker(line.homeTeam.split(' '));
                let hAbb = nullChecker(teamLookup.findTeam(hSplit[hSplit.length-1]).a);
                let aSplit = nullChecker(line.awayTeam.split(' '));
                let aAbb = nullChecker(teamLookup.findTeam(aSplit[aSplit.length-1]).a);
                let aParen = nullChecker(line.awaySpread.indexOf('('));
                let aSpread = nullChecker(line.awaySpread.slice(0, aParen));
                let aJuice = nullChecker(line.awaySpread.slice(aParen+1, line.awaySpread.length-1));
                let hParen = nullChecker(line.homeSpread.indexOf('('));
                let hSpread = nullChecker(line.homeSpread.slice(0, hParen));
                let hJuice = nullChecker(line.homeSpread.slice(hParen+1, line.homeSpread.length-1));
                let oParen = nullChecker(line.over.indexOf('('));
                let total = nullChecker(line.over.slice(2, oParen));
                let overJuice = nullChecker(line.over.slice(oParen+1, line.over.length-1));
                let underJuice = nullChecker(line.under.slice(oParen+1, line.over.length-1));
                let hMoney = nullChecker(line.homeMoney);
                let aMoney = nullChecker(line.awayMoney);

                let gcode = `20${year}${date}/${aAbb}${hAbb}`;
                let home_id = teamLookup.findTeam(hSplit[hSplit.length-1]).id;
                let away_id = teamLookup.findTeam(aSplit[aSplit.length-1]).id;
                // console.log(home_id, ' ', away_id);

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
                    })
                  }
                })
              })
          }
      }, (error) => console.log(err) );
  },
  sportsbookThird: () => {
    axios.get(sportsbook.third).then(response => {

    })
  }
}
