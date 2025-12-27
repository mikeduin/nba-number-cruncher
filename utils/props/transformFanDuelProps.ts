/**
 * Transform FanDuel long-format props into wide-format matching player_props table
 * 
 * Input: Array of FanDuelProp (one per market)
 * Output: Map of player -> wide-format props (matching existing Betsson structure)
 */

import { FanDuelProp } from '../../types/FanDuel.js';

/**
 * Filter to only full-game props (exclude quarters, halves, etc.)
 */
export function filterFullGameProps(props: FanDuelProp[]): FanDuelProp[] {
  // Exclude props with these keywords in the market name
  const excludePatterns = [
    /1st.*qtr/i,
    /2nd.*qtr/i,
    /3rd.*qtr/i,
    /4th.*qtr/i,
    /first.*quarter/i,
    /second.*quarter/i,
    /third.*quarter/i,
    /fourth.*quarter/i,
    /first.*half/i,
    /second.*half/i,
    /1st.*half/i,
    /2nd.*half/i,
    /to score 10\+/i,  // Special FanDuel markets
    /to score 15\+/i,
    /to score 20\+/i,
    /to score 25\+/i,
    /to score 30\+/i,
  ];
  
  return props.filter(prop => {
    const marketLower = prop.marketName.toLowerCase();
    return !excludePatterns.some(pattern => pattern.test(marketLower));
  });
}

/**
 * Transform FanDuel props to wide format matching player_props table structure
 * 
 * @param props - Array of FanDuelProp from scraper
 * @returns Map of player name -> wide-format object
 */
export function transformFanDuelPropsToWideFormat(props: FanDuelProp[]): Map<string, any> {
  const playerPropsMap = new Map<string, any>();
  
  // Filter to only full-game props
  const fullGameProps = filterFullGameProps(props);
  
  for (const prop of fullGameProps) {
    const playerName = prop.playerName;
    
    // Initialize player entry if doesn't exist
    if (!playerPropsMap.has(playerName)) {
      playerPropsMap.set(playerName, {
        team: prop.team || null,
      });
    }
    
    const playerData = playerPropsMap.get(playerName);
    
    // Map prop type to column names
    // FanDuel uses "pts", "reb", "ast", etc. which match our DB columns
    const propType = prop.propType;
    
    // Add the line and odds
    playerData[propType] = prop.line;
    playerData[`${propType}_over`] = prop.overOdds;
    playerData[`${propType}_under`] = prop.underOdds;
    playerData[`${propType}_active`] = prop.marketStatus === 'OPEN';
  }
  
  return playerPropsMap;
}

/**
 * Map FanDuel prop types to match Betsson naming conventions
 * (if any differences exist)
 */
const PROP_TYPE_ALIASES: Record<string, string> = {
  'fg3m': 'fg3m',
  'threes': 'fg3m',
  '3-pointers': 'fg3m',
  // Add more mappings as needed
};

/**
 * Normalize a prop type to match database columns
 */
export function normalizePropType(propType: string): string {
  const normalized = propType.toLowerCase().trim();
  return PROP_TYPE_ALIASES[normalized] || normalized;
}
