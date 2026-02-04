import https from 'https';

const DRAFT_KINGS_GAMES_URL = 'https://sportsbook-nash.draftkings.com/sites/US-SB/api/sportscontent/controldata/league/leagueSubcategory/v1/markets?isBatchable=false&templateVars=42648%2C4511&eventsQuery=%24filter%3DleagueId%20eq%20%2742648%27%20AND%20clientMetadata%2FSubcategories%2Fany%28s%3A%20s%2FId%20eq%20%274511%27%29&marketsQuery=%24filter%3DclientMetadata%2FsubCategoryId%20eq%20%274511%27%20AND%20tags%2Fall%28t%3A%20t%20ne%20%27SportcastBetBuilder%27%29&include=Events&entity=events';

function fetchDraftKingsGames() {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'x-client-feature': 'leagueSubcategory',
        'x-client-name': 'web',
        'x-client-page': 'league',
        'x-client-version': '2551.1.1.9',
        'x-client-widget-name': 'cms',
        'x-client-widget-version': '1.7.0'
      }
    };

    https.get(DRAFT_KINGS_GAMES_URL, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

// Test the API
console.log('Fetching DraftKings games...\n');

fetchDraftKingsGames()
  .then(data => {
    if (!data.events || data.events.length === 0) {
      console.log('No events found');
      return;
    }

    console.log(`Found ${data.events.length} games:\n`);
    
    const games = data.events.map(event => {
      const away = event.participants.find(p => p.venueRole === 'Away');
      const home = event.participants.find(p => p.venueRole === 'Home');
      
      return {
        eventId: event.id,
        awayTeam: away?.metadata?.shortName || away?.name,
        homeTeam: home?.metadata?.shortName || home?.name,
        startDate: event.startEventDate,
        name: event.name
      };
    });

    games.forEach((game, idx) => {
      console.log(`${idx + 1}. Event ID: ${game.eventId}`);
      console.log(`   Teams: ${game.awayTeam} @ ${game.homeTeam}`);
      console.log(`   Name: ${game.name}`);
      console.log(`   Start: ${game.startDate}`);
      console.log('');
    });

    // Show example matching logic
    console.log('\n=== Example Matching Logic ===');
    console.log('To match with schedule table:');
    console.log('1. Parse awayTeam (e.g., "DET") and homeTeam (e.g., "LAL")');
    console.log('2. Query schedule WHERE v = "DET" AND h = "LAL"');
    console.log('3. Also check date matches (startEventDate vs gdte)');
    console.log('4. UPDATE schedule SET draftkings_event_id = <eventId>');
  })
  .catch(err => {
    console.error('Error fetching games:', err.message);
  });
