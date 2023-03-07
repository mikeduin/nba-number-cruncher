const axios = require("axios");
const cheerio = require("cheerio"); 

const fetchBoxScore = async (vAbb, hAbb, gid) => {
  try {
    const gameUrl = `https://www.nba.com/game/${vAbb.toLowerCase()}-vs-${hAbb.toLowerCase()}-00${gid}/box-score.json`;
    const { data } = await axios.get(gameUrl);
    const $ = cheerio.load(data); 
    const boxScoreData = $('#__NEXT_DATA__').text(); 
    return JSON.parse(boxScoreData);
  } catch (e) {
    console.log('error trying to fetchBoxScore is ', e);
  }
}

module.exports = fetchBoxScore;