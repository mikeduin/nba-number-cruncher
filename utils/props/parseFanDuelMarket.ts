/**
 * FanDuel Market Parser Utilities
 * 
 * Parses FanDuel market names and extracts standardized prop types
 * Example: "DeMar DeRozan - 1st Qtr Points" -> { player: "DeMar DeRozan", propType: "pts", period: "q1" }
 */

/**
 * Map of FanDuel market type strings to our standardized prop types
 */
export const FANDUEL_PROP_TYPE_MAP: Record<string, string> = {
  // Points
  'POINTS': 'pts',
  'PLAYER_POINTS': 'pts',
  'PLAYER_A_POINTS': 'pts',
  '1ST_QUARTER_POINTS': 'pts_q1',
  'PLAYER_A_1ST_QUARTER_POINTS': 'pts_q1',
  '2ND_QUARTER_POINTS': 'pts_q2',
  '3RD_QUARTER_POINTS': 'pts_q3',
  '4TH_QUARTER_POINTS': 'pts_q4',
  'FIRST_HALF_POINTS': 'pts_h1',
  
  // Rebounds
  'REBOUNDS': 'reb',
  'PLAYER_REBOUNDS': 'reb',
  'PLAYER_A_REBOUNDS': 'reb',
  
  // Assists
  'ASSISTS': 'ast',
  'PLAYER_ASSISTS': 'ast',
  'PLAYER_A_ASSISTS': 'ast',
  
  // 3-Pointers
  '3_POINTERS_MADE': 'fg3m',
  'THREES_MADE': 'fg3m',
  
  // Steals
  'STEALS': 'stl',
  
  // Blocks
  'BLOCKS': 'blk',
  
  // Turnovers
  'TURNOVERS': 'tov',
  
  // Combos
  'POINTS_REBOUNDS_ASSISTS': 'pts+reb+ast',
  'PLAYER_POINTS_REBOUNDS_ASSISTS': 'pts+reb+ast',
  'POINTS_ASSISTS': 'pts+ast',
  'POINTS_REBOUNDS': 'pts+reb',
  'REBOUNDS_ASSISTS': 'reb+ast',
};

/**
 * Parse a FanDuel market name to extract player name and prop type
 * 
 * Examples:
 * "DeMar DeRozan - 1st Qtr Points" -> { player: "DeMar DeRozan", propDisplay: "1st Qtr Points" }
 * "Domantas Sabonis - Rebounds" -> { player: "Domantas Sabonis", propDisplay: "Rebounds" }
 * "De'Aaron Fox - Points + Assists" -> { player: "De'Aaron Fox", propDisplay: "Points + Assists" }
 */
export interface ParsedMarketName {
  player: string;
  propDisplay: string;
}

export function parseFanDuelMarketName(marketName: string): ParsedMarketName | null {
  // FanDuel format: "Player Name - Prop Type"
  // Use greedy match and match the LAST " - " to handle hyphens in player names
  // e.g., "Shai Gilgeous-Alexander - Points" should split at the " - " with spaces
  const match = marketName.match(/^(.+)\s+-\s+(.+)$/);
  
  if (!match) {
    console.warn(`Could not parse FanDuel market name: ${marketName}`);
    return null;
  }
  
  return {
    player: match[1].trim(),
    propDisplay: match[2].trim()
  };
}

/**
 * Map FanDuel market type to standardized prop type
 * 
 * @param marketType - FanDuel's marketType field (e.g., "PLAYER_A_1ST_QUARTER_POINTS")
 * @param marketName - Fallback: human-readable market name if marketType not recognized
 * @returns Standardized prop type (e.g., "pts", "pts_q1", "pts+reb+ast")
 */
export function mapFanDuelPropType(marketType: string, marketName?: string): string {
  // Try direct mapping first
  if (FANDUEL_PROP_TYPE_MAP[marketType]) {
    return FANDUEL_PROP_TYPE_MAP[marketType];
  }
  
  // Fallback: parse from market name
  if (marketName) {
    const parsed = parseFanDuelMarketName(marketName);
    if (!parsed) return 'unknown';
    
    const propLower = parsed.propDisplay.toLowerCase();
    
    // Quarter-specific
    if (propLower.includes('1st') && propLower.includes('qtr')) return 'pts_q1';
    if (propLower.includes('2nd') && propLower.includes('qtr')) return 'pts_q2';
    if (propLower.includes('3rd') && propLower.includes('qtr')) return 'pts_q3';
    if (propLower.includes('4th') && propLower.includes('qtr')) return 'pts_q4';
    
    // Half-specific
    if (propLower.includes('first half') || propLower.includes('1st half')) return 'pts_h1';
    if (propLower.includes('second half') || propLower.includes('2nd half')) return 'pts_h2';
    
    // Combos
    if (propLower.includes('points') && propLower.includes('rebounds') && propLower.includes('assists')) {
      return 'pts+reb+ast';
    }
    if (propLower.includes('points') && propLower.includes('assists')) return 'pts+ast';
    if (propLower.includes('points') && propLower.includes('rebounds')) return 'pts+reb';
    if (propLower.includes('rebounds') && propLower.includes('assists')) return 'reb+ast';
    
    // Individual stats
    if (propLower.includes('points')) return 'pts';
    if (propLower.includes('rebounds')) return 'reb';
    if (propLower.includes('assists')) return 'ast';
    if (propLower.includes('3-pointers') || propLower.includes('threes')) return 'fg3m';
    if (propLower.includes('steals')) return 'stl';
    if (propLower.includes('blocks')) return 'blk';
    if (propLower.includes('turnovers')) return 'tov';
  }
  
  console.warn(`Unknown FanDuel prop type: ${marketType} / ${marketName}`);
  return 'unknown';
}

/**
 * Standardize prop type for database storage
 * Ensures consistency across all sportsbooks
 */
export function standardizePropType(propType: string): string {
  const normalized = propType.toLowerCase().trim();
  
  // Already standardized
  if (normalized.match(/^(pts|reb|ast|stl|blk|tov|fg3m)(_[qh]\d)?$/)) {
    return normalized;
  }
  
  // Combo stats
  if (normalized.includes('+')) {
    const parts = normalized.split('+').map(p => p.trim()).sort();
    return parts.join('+');
  }
  
  return normalized;
}

/**
 * Extract human-readable prop name for display
 * "pts_q1" -> "1st Quarter Points"
 * "pts+reb+ast" -> "Points + Rebounds + Assists"
 */
export function getPropDisplayName(propType: string): string {
  const displayMap: Record<string, string> = {
    'pts': 'Points',
    'pts_q1': '1st Quarter Points',
    'pts_q2': '2nd Quarter Points',
    'pts_q3': '3rd Quarter Points',
    'pts_q4': '4th Quarter Points',
    'pts_h1': 'First Half Points',
    'pts_h2': 'Second Half Points',
    'reb': 'Rebounds',
    'ast': 'Assists',
    'stl': 'Steals',
    'blk': 'Blocks',
    'tov': 'Turnovers',
    'fg3m': '3-Pointers Made',
    'pts+reb+ast': 'Points + Rebounds + Assists',
    'pts+ast': 'Points + Assists',
    'pts+reb': 'Points + Rebounds',
    'reb+ast': 'Rebounds + Assists'
  };
  
  return displayMap[propType] || propType;
}
