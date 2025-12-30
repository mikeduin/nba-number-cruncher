/**
 * TypeScript interfaces for DraftKings API responses
 * Based on actual API response from https://sportsbook-nash.draftkings.com/sites/US-NJ-SB/api/sportscontent/controldata/event/eventSubcategory/v1/markets
 */

export interface DraftKingsMarketResponse {
  markets: DraftKingsMarket[];
  selections: DraftKingsSelection[];
  subscriptionPartials?: any[];
}

export interface DraftKingsMarket {
  id: string;
  eventId: string;
  sportId: string;
  leagueId: string;
  name: string; // e.g., "Jaren Jackson Jr. Points O/U"
  isSuspended?: boolean;
  subcategoryId: string;
  componentMapping: {
    primary: number;
    fallback: number;
  };
  marketType: DraftKingsMarketType;
  subscriptionKey: string;
  sortOrder: number;
  tags: string[]; // e.g., ["SGP", "YourBetEligible", "Cashout", "PlayerProps"]
  correlatedId?: string;
  statistics?: {
    live?: Array<{
      type: string;
      prefix: string;
      value: number;
    }>;
  };
  blurbId?: string;
  dynamicMetadata?: {
    boxScoreStatType?: string; // e.g., "BasketballPoints"
  };
}

export interface DraftKingsMarketType {
  id: string;
  betOfferTypeId: number;
  name: string; // e.g., "Points O/U", "Rebounds O/U", "Points + Rebounds + Assists O/U"
}

export interface DraftKingsSelection {
  id: string;
  marketId: string;
  label: string; // "Over" or "Under"
  displayOdds: {
    american: string; // e.g., "−110", "+120"
    decimal: string;
    fractional: string;
  };
  trueOdds: number;
  points: number; // The line value (e.g., 26.5)
  outcomeType: 'Over' | 'Under';
  participants: DraftKingsParticipant[];
  sortOrder: number;
  tags: string[]; // e.g., ["MainPointLine", "SGP"]
  metadata: Record<string, any>;
  milestoneValue?: number; // Used in milestone markets (not O/U)
}

export interface DraftKingsParticipant {
  id: string;
  name: string; // Player name, e.g., "Jaren Jackson Jr."
  type: 'Player' | 'Team';
  seoIdentifier: string;
  venueRole: 'HomePlayer' | 'AwayPlayer' | 'Home' | 'Away';
  isNationalTeam: boolean;
  countryCode?: string;
}

/**
 * Subcategory IDs for different prop types
 */
// DraftKings subcategory IDs are dynamic and vary by event
// We scan a range to discover which subcategories are active for each game
export const DRAFTKINGS_SUBCATEGORY_SCAN_RANGE = {
  MIN: 16400,
  MAX: 16500,
} as const;

/**
 * Parsed prop format used internally
 */
export interface DraftKingsParsedProp {
  player: string;
  propType: string; // e.g., "Points", "Rebounds", "Points + Rebounds + Assists"
  line: number;
  overOdds: string;
  underOdds: string;
  marketId: string;
  overSelectionId: string;
  underSelectionId: string;
  marketType: string;
  isSuspended: boolean;
}
