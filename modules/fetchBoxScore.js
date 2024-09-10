import axios from "axios";
import cheerio from "cheerio";

const fetchBoxScore = async (vAbb, hAbb, gid) => {
  try {
    const gameUrl = `https://www.nba.com/game/${vAbb.toLowerCase()}-vs-${hAbb.toLowerCase()}-00${gid}/box-score.json`;
    const { data } = await axios.get(gameUrl);
    const $ = cheerio.load(data);
    const boxScoreData = $('#__NEXT_DATA__').text();
    const parsedBoxScore = JSON.parse(boxScoreData);

    return parsedBoxScore;
  } catch (error) {
    console.error('Error fetching box score:', error);
    return null;
  }
};

export default fetchBoxScore;