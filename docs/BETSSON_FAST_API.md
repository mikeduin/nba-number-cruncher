# Betsson Fast API Scraper - Data Mapping Guide

## Speed Improvement
- **Old method**: Puppeteer full page scrape with Shadow DOM traversal: ~15-30 seconds
- **New method**: Puppeteer for token (4-5s) + Direct API calls (0.2s): ~5 seconds
- **Speed gain**: 3-6x faster

## API Endpoints

Base URL: `https://www.betsson.com/api/sb/v1/widgets/accordion/v1`

Query params:
- `eventId`: Betsson event ID (extract from URL)
- `marketTemplateIds`: Prop type template

### Market Templates Discovered

```javascript
{
  PLYPROPPOINTS: 'Points',
  PLYPROPREBOUNDS: 'Rebounds',
  PLYPROPASSISTS: 'Assists',
  PLYPROPTHRSMDE: 'Threes Made',
  PLYPROPTM: 'Blocks',
  PLYPROPFTM: 'Free Throws Made',
  PLYPROPPNTSASSTSRBNDS: 'Points + Rebounds + Assists',
  PLYPROPPNTSRBNDS: 'Points + Rebounds'
}
```

## Required Headers

```javascript
{
  'x-sb-type': 'b2b',
  'x-sb-device-type': 'Desktop',
  'x-sb-currency-code': 'EUR',
  'x-sb-language-code': 'en',
  'x-sb-content-id': '6a6d80b9-16ac-4387-a413-244d93a74deb',
  'marketcode': 'en',
  'x-sb-jurisdiction': 'Mga',
  'x-sb-channel': 'Web',
  'content-type': 'application/json',
  'accept': 'application/json',
  'brandid': '6a6d80b9-16ac-4387-a413-244d93a74deb',
  'sessiontoken': '<captured from page load>',  // Dynamic - must capture
  'user-agent': 'Mozilla/5.0...'
}
```

## Response Structure

### Top Level
```json
{
  "data": {
    "accordions": {
      "gi-XXXXXXX": {
        "markets": [ /* array of market objects */ ]
      }
    },
    "selections": {
      "s-YYYYYYYY": { /* selection/odds data */ }
    }
  }
}
```

### Market Object
```json
{
  "id": "m-FD74ED2B...",
  "eventId": "f--M5-fjk2rkyAutsiDU1vCA",
  "marketTemplateId": "PLYPROPPOINTS",
  "marketFriendlyName": "Player Total Points | Ryan Nembhard",
  "status": "Open",
  "deadline": "2025-12-27T22:12:00Z",
  "columnLayout": 2,
  "marketSpecifics": {
    "groupLabels": {
      "1": "Player Total Points",
      "2": "Ryan Nembhard"
    },
    "groupSortBy": [
      { "groupLevel": "3", "sort": 9.5 }  // This is the line value!
    ]
  }
}
```

### Key Fields for Mapping

**Player Name**: Extract from `marketFriendlyName` after the ` | ` delimiter
- Example: `"Player Total Points | Ryan Nembhard"` → `"Ryan Nembhard"`

**Prop Type**: Map from `marketTemplateId`
- `PLYPROPPOINTS` → `pts`
- `PLYPROPREBOUNDS` → `reb`
- `PLYPROPASSISTS` → `ast`
- etc.

**Line Value**: Extract from `marketSpecifics.groupSortBy` where `groupLevel === "3"`
- The `sort` field contains the prop line (e.g., 9.5 points)

**Odds/Selections**: Found in separate `data.selections` object
- Need to match selection IDs from market to selection data
- Selection contains `name` (Over/Under), `odds`, `status`

## Implementation Strategy

1. **Extract event ID from Betsson URL**
   ```javascript
   const eventIdMatch = gameUrl.match(/eventId=([^&]+)/);
   const eventId = eventIdMatch?.[1];
   ```

2. **Get session token (one-time per scrape)**
   ```javascript
   // Launch puppeteer briefly
   // Intercept /api/sb/v1/widgets/accordion/v1 request
   // Capture headers.sessiontoken
   // Close browser (~4-5 seconds)
   ```

3. **Make parallel API calls (fast)**
   ```javascript
   const templates = ['PLYPROPPOINTS', 'PLYPROPREBOUNDS', 'PLYPROPASSISTS', ...];
   const promises = templates.map(t => 
     axios.get(`${baseUrl}?eventId=${eventId}&marketTemplateIds=${t}`, { headers })
   );
   const results = await Promise.all(promises);
   // ~0.2-0.3 seconds for all 8 calls
   ```

4. **Parse and transform data**
   ```javascript
   const props = [];
   results.forEach(result => {
     const accordions = result.data?.data?.accordions || {};
     const selections = result.data?.data?.selections || {};
     
     Object.values(accordions).forEach(accordion => {
       accordion.markets?.forEach(market => {
         const playerName = market.marketFriendlyName.split(' | ')[1];
         const propType = mapTemplate(market.marketTemplateId);
         const line = market.marketSpecifics.groupSortBy
           .find(g => g.groupLevel === '3')?.sort;
         
         // Match selections for over/under odds
         const overSelection = selections[market.selectionIds?.[0]];
         const underSelection = selections[market.selectionIds?.[1]];
         
         props.push({
           player: playerName,
           propType: propType,
           propLine: line,
           overOdds: overSelection?.odds,
           underOdds: underSelection?.odds
         });
       });
     });
   });
   ```

## Testing

Run test with a live event URL:
```bash
node test-betsson-fast-scraper.js
```

Expected output:
- Token capture: ~4-5 seconds
- API calls: ~0.2-0.3 seconds  
- Total: ~5 seconds vs 15-30 seconds (old method)

## Next Steps

1. Test with live game during actual game time
2. Verify selection ID mapping to get correct over/under odds
3. Integrate into Scraper.Controller.ts scrapeBetsson() function
4. Update Props.Controller.ts to use new method
5. Remove Shadow DOM traversal code (no longer needed)
