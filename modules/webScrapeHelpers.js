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
    parsed.year = nullChecker(line.id.slice(-2));
    parsed.date = nullChecker(line.id.slice(-6, -2));
    parsed.hSplit = nullChecker(line.homeTeam.split(' '));
    parsed.hAbb = nullChecker(teamLookup.findTeam(hSplit[hSplit.length-1]).a);
    parsed.aSplit = nullChecker(line.awayTeam.split(' '));
    parsed.aAbb = nullChecker(teamLookup.findTeam(aSplit[aSplit.length-1]).a);
    parsed.aParen = nullChecker(line.awaySpread.indexOf('('));
    parsed.aSpread = nullChecker(line.awaySpread.slice(0, aParen));
    parsed.aJuice = nullChecker(line.awaySpread.slice(aParen+1, line.awaySpread.length-1));
    parsed.hParen = nullChecker(line.homeSpread.indexOf('('));
    parsed.hSpread = nullChecker(line.homeSpread.slice(0, hParen));
    parsed.hJuice = nullChecker(line.homeSpread.slice(hParen+1, line.homeSpread.length-1));
    parsed.oParen = nullChecker(line.over.indexOf('('));
    parsed.total = nullChecker(line.over.slice(2, oParen));
    parsed.overJuice = nullChecker(line.over.slice(oParen+1, line.over.length-1));
    parsed.underJuice = nullChecker(line.under.slice(oParen+1, line.over.length-1));
    parsed.hMoney = nullChecker(line.homeMoney);
    parsed.aMoney = nullChecker(line.awayMoney);

    parsed.gcode = `20${year}${date}/${aAbb}${hAbb}`;
    parsed.home_id = teamLookup.findTeam(hSplit[hSplit.length-1]).id;
    parsed.away_id = teamLookup.findTeam(aSplit[aSplit.length-1]).id;
    return parsed;
  }
}
