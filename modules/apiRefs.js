let now = Date.now();

module.exports = {
  sportsbook: () => {
    return {
      full: 'https://www.sportsbook.ag/sbk/sportsbook4/nba-betting/getevents/200.sbk?&_='+now,
      firstH: 'https://www.sportsbook.ag/sbk/sportsbook4/nba-betting/getevents/3003.sbk?&_='+now,
      secondH: 'https://www.sportsbook.ag/sbk/sportsbook4/nba-betting/nba-game-lines-2nd-half-lines.sbk?fromMenu=true&_='+now,
      firstQ: 'https://www.sportsbook.ag/sbk/sportsbook4/nba-betting/getevents/3005.sbk?&_='+now,
      secondQ: '',
      thirdQ: 'https://www.sportsbook.ag/sbk/sportsbook4/nba-betting/nba-game-lines-3rd-quarter-lines.sbk?fromMenu=true&_='+now,
      fourthQ: '',
      live: 'https://www.sportsbook.ag/sbk/sportsbook4/live-betting-betting/nba-live-betting-all-nba-live.sbk?fromMenu=true&_='+now
    }
  },
  bol: () => {
    return {
      full: 'https://mobile.betonline.ag/sports/offerings?s=Basketball&l=NBA&p=0&wt=&tsr=',
      firstH: 'https://mobile.betonline.ag/sports/offerings?s=Basketball&l=NBA&p=1&wt=&tsr=',
      secondH: 'https://mobile.betonline.ag/sports/offerings?s=Basketball&l=NBA&p=2&wt=s&tsr=',
      firstQ: 'https://mobile.betonline.ag/sports/offerings?s=Basketball&l=NBA&p=3&wt=s&tsr=',
      secondQ: 'https://mobile.betonline.ag/sports/offerings?s=Basketball&l=NBA&p=4&wt=&tsr=',
      thirdQ: 'https://mobile.betonline.ag/sports/offerings?s=Basketball&l=NBA&p=5&wt=s&tsr=',
      fourthQ: 'https://mobile.betonline.ag/sports/offerings?s=Basketball&l=NBA&p=6&wt=&tsr='
    }
  }
}
