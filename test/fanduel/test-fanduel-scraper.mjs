/**
 * Quick test of FanDuel scraper logic
 */
import axios from 'axios';

const PX_TOKEN = '_px3=f4d6d6e829599d8d296d806bc2ee91888009f75933ce8a220803917fc52770c2:FGl1MiwjVJ1oBYgyhy3YNGrXge4CFMo3iLy17FPREguJAxYtUxrhe1OqofRrY57w6PZA8tZ/hYiWf/tcl9qjzw==:1000:kSz7SVgZPXe0t+PqBpCeLY+CKiwolizek0jOBzZfqgUCLzsrOjEwiPdF4D1LzZsE2/MX4HRAzT75sWxNBVDDzgoWHVv8NtbdybRQ3zjta2xMFupn5Op3cT4Qn1yBex97NDsFb1JE07MMxp9zyraFZO1oHzSxuwKqXQrkmp6S3AkBNPqhZKBOlXnoxoTjjZYnIkc8YQj1hBqtKXXj6XNdUOCs/U83HpCAkONNxKKvUeNw7rfX3DYNhlGTmIE9DmPKbAFJhj/FaIeYTwTCUI3jiLVdXgexd9Q/J6PAAqDw408MSyFt1YJT+Ha8DtWDlmKhjSFNXXL1FAZDuunjhd9+mwmhrONsQ8XBUXEwxp/54n4=;_pxvid=843fb5c3-dd1a-11f0-a072-a881202bd65a;pxcts=843fc028-dd1a-11f0-a072-af1f9d103e49;';

const url = 'https://api.sportsbook.fanduel.com/sbapi/event-page?_ak=FhMFpcPWXMeyZxOx&eventId=35085635&tab=player-points&useCombinedTouchdownsVirtualMarket=true&usePulse=true&useQuickBets=true&useQuickBetsMLB=true';

const response = await axios.get(url, {
  headers: {
    'accept': 'application/json',
    'x-px-context': PX_TOKEN,
    'x-sportsbook-region': 'NJ',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  }
});

const markets = Object.values(response.data.attachments.markets);
const playerProps = markets.filter(m => m.runners?.some(r => r.isPlayerSelection));

console.log(`✅ Found ${playerProps.length} player prop markets\n`);

playerProps.slice(0, 5).forEach(m => {
  const over = m.runners.find(r => r.result?.type === 'OVER');
  const under = m.runners.find(r => r.result?.type === 'UNDER');
  if (!over || !under) return;
  console.log(`${m.marketName}`);
  console.log(`  Line: ${over.handicap}`);
  console.log(`  Over: ${over.winRunnerOdds.americanDisplayOdds.americanOddsInt} | Under: ${under.winRunnerOdds.americanDisplayOdds.americanOddsInt}\n`);
});
