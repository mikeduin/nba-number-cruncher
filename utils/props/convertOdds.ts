/**
 * Converts European (decimal) odds to American (moneyline) odds
 * 
 * European odds format: 1.91, 2.50, etc.
 * American odds format: -110, +150, etc.
 * 
 * Formula:
 * - If decimal odds >= 2.00: American odds = (decimal - 1) * 100 (positive)
 * - If decimal odds < 2.00: American odds = -100 / (decimal - 1) (negative)
 * 
 * @param decimalOdds - European decimal odds (e.g., 1.91, 2.50)
 * @returns American moneyline odds (e.g., -110, +150)
 * 
 * Examples:
 * - 1.91 -> -110 (favorite)
 * - 2.50 -> +150 (underdog)
 * - 2.00 -> +100 (even)
 * - 1.50 -> -200 (heavy favorite)
 */
export const convertDecimalToAmerican = (decimalOdds: number): number => {
  if (decimalOdds === 1) {
    // Edge case: no odds (shouldn't happen in real betting)
    return 0;
  }
  
  if (decimalOdds >= 2.00) {
    // Underdog/positive odds
    // American = (Decimal - 1) * 100
    const americanOdds = (decimalOdds - 1) * 100;
    return Math.round(americanOdds);
  } else {
    // Favorite/negative odds
    // American = -100 / (Decimal - 1)
    const americanOdds = -100 / (decimalOdds - 1);
    return Math.round(americanOdds);
  }
};

/**
 * Converts American (moneyline) odds to European (decimal) odds
 * 
 * @param americanOdds - American moneyline odds (e.g., -110, +150)
 * @returns European decimal odds (e.g., 1.91, 2.50)
 * 
 * Formula:
 * - If American odds are positive: Decimal = (American / 100) + 1
 * - If American odds are negative: Decimal = (100 / |American|) + 1
 */
export const convertAmericanToDecimal = (americanOdds: number): number => {
  if (americanOdds > 0) {
    // Positive American odds (underdog)
    return (americanOdds / 100) + 1;
  } else if (americanOdds < 0) {
    // Negative American odds (favorite)
    return (100 / Math.abs(americanOdds)) + 1;
  } else {
    // Even odds
    return 2.0;
  }
};

/**
 * Formats American odds with proper sign
 * @param odds - American odds number
 * @returns Formatted string with + or - sign
 */
export const formatAmericanOdds = (odds: number): string => {
  if (odds > 0) {
    return `+${odds}`;
  } else {
    return odds.toString();
  }
};
