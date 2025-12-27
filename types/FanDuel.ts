/**
 * TypeScript interfaces for FanDuel API responses
 * Based on actual API response from https://api.sportsbook.fanduel.com/sbapi/event-page
 */

export interface FanDuelEventPageResponse {
  layout: FanDuelLayout;
  attachments: FanDuelAttachments;
}

export interface FanDuelLayout {
  defaultTab: number;
  tabsDisplayOrder: number[];
  tabs: Record<string, FanDuelTab>;
}

export interface FanDuelTab {
  id: number;
  title: string;
  cards: Array<{ id: number }>;
  isSameGameMulti: boolean;
  description: string | null;
}

export interface FanDuelAttachments {
  markets: Record<string, FanDuelMarket>;
  events?: Record<string, any>;
  players?: Record<string, FanDuelPlayer>;
  selections?: Record<string, FanDuelSelection>;
}

export interface FanDuelMarket {
  marketId: string;
  eventTypeId: number;
  competitionId: number;
  eventId: number;
  marketName: string;
  marketTime: string; // ISO date string
  marketType: string; // e.g., "PLAYER_A_1ST_QUARTER_POINTS"
  bspMarket: boolean;
  sgmMarket: boolean;
  inPlay: boolean;
  numberOfRunners: number;
  numberOfActiveRunners: number;
  numberOfWinners: number;
  sortPriority: number;
  bettingType: string; // e.g., "MOVING_HANDICAP"
  marketStatus: string; // "OPEN", "SUSPENDED", "CLOSED"
  runners: FanDuelRunner[];
  canTurnInPlay: boolean;
  associatedMarkets?: Array<{
    eventId: number;
    eventTypeId: number;
    externalMarketId: string;
  }>;
  shouldDisplayStatsInRunner: boolean;
  eachwayAvailable: boolean;
  legTypes: string[];
}

export interface FanDuelRunner {
  selectionId: number;
  handicap: number; // The prop line (e.g., 28.5)
  runnerName: string; // e.g., "DeMar DeRozan Over"
  sortPriority: number;
  result: {
    type: 'OVER' | 'UNDER';
  };
  runnerStatus: string; // "ACTIVE", "SUSPENDED"
  logo?: string; // Player headshot URL
  secondaryLogo?: string; // Team logo URL
  isPlayerSelection: boolean;
  winRunnerOdds: {
    americanDisplayOdds: {
      americanOdds: number;
      americanOddsInt: number; // The one we want! (e.g., -154, +118)
    };
    trueOdds: {
      decimalOdds: {
        decimalOdds: number;
      };
      fractionalOdds: {
        numerator: number;
        denominator: number;
      };
    };
  };
  previousWinRunnerOdds: any[];
}

export interface FanDuelPlayer {
  id: string;
  name: string;
}

export interface FanDuelSelection {
  id: string;
  name: string; // "Over" or "Under"
}

/**
 * Our standardized prop structure after parsing FanDuel data
 */
export interface FanDuelProp {
  // Game identification
  gid?: number;
  gdte?: string;
  eventId: number;
  
  // Player identification
  playerId?: number;
  playerName: string;
  team?: string;
  
  // Market identification
  marketId: string;
  marketType: string;
  marketName: string;
  
  // Prop details
  propType: string; // Standardized: "pts", "reb", "ast", etc.
  propDisplay: string; // Display name: "Points", "Rebounds", "Assists", etc.
  line: number;
  
  // Odds
  overOdds: number;
  underOdds: number;
  
  // Selection IDs (for tracking)
  overSelectionId: number;
  underSelectionId: number;
  
  // Market status
  marketStatus: string;
  inPlay: boolean;
  marketTime: string;
  
  // Raw data for debugging
  rawMarketData?: string;
}
