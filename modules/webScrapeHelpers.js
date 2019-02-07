const cheerio = require('cheerio');

const nullChecker = (value) => {
  if (value === '-') {
    return null;
  } else {
    return value;
  }
};

module.exports = {
  parseSbHtml: (html) => {
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
  },
  sbLineParser: (line) => {
    let parsed = {};
    let parsed.year = nullChecker(line.id.slice(-2));
    let parsed.date = nullChecker(line.id.slice(-6, -2));
    let parsed.hSplit = nullChecker(line.homeTeam.split(' '));
    let parsed.hAbb = nullChecker(teamLookup.findTeam(hSplit[hSplit.length-1]).a);
    let parsed.aSplit = nullChecker(line.awayTeam.split(' '));
    let parsed.aAbb = nullChecker(teamLookup.findTeam(aSplit[aSplit.length-1]).a);
    let parsed.aParen = nullChecker(line.awaySpread.indexOf('('));
    let parsed.aSpread = nullChecker(line.awaySpread.slice(0, aParen));
    let parsed.aJuice = nullChecker(line.awaySpread.slice(aParen+1, line.awaySpread.length-1));
    let parsed.hParen = nullChecker(line.homeSpread.indexOf('('));
    let parsed.hSpread = nullChecker(line.homeSpread.slice(0, hParen));
    let parsed.hJuice = nullChecker(line.homeSpread.slice(hParen+1, line.homeSpread.length-1));
    let parsed.oParen = nullChecker(line.over.indexOf('('));
    let parsed.total = nullChecker(line.over.slice(2, oParen));
    let parsed.overJuice = nullChecker(line.over.slice(oParen+1, line.over.length-1));
    let parsed.underJuice = nullChecker(line.under.slice(oParen+1, line.over.length-1));
    let parsed.hMoney = nullChecker(line.homeMoney);
    let parsed.aMoney = nullChecker(line.awayMoney);

    let parsed.gcode = `20${year}${date}/${aAbb}${hAbb}`;
    let parsed.home_id = teamLookup.findTeam(hSplit[hSplit.length-1]).id;
    let parsed.away_id = teamLookup.findTeam(aSplit[aSplit.length-1]).id;
    return parsed;
  }
}
