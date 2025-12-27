import { convertDecimalToAmerican, formatAmericanOdds } from './dist/utils/props/convertOdds.js';

console.log('🎲 Testing Odds Conversion: European (Decimal) → American (Moneyline)\n');
console.log('='  .repeat(70));

const testCases = [
  { decimal: 1.91, expected: -110, description: 'Common favorite' },
  { decimal: 1.55, expected: -182, description: 'Heavy favorite' },
  { decimal: 2.20, expected: +120, description: 'Slight underdog' },
  { decimal: 2.50, expected: +150, description: 'Common underdog' },
  { decimal: 2.00, expected: +100, description: 'Even odds' },
  { decimal: 1.72, expected: -139, description: 'Light favorite' },
  { decimal: 1.88, expected: -114, description: 'Very light favorite' },
  { decimal: 3.00, expected: +200, description: 'Strong underdog' },
  { decimal: 1.50, expected: -200, description: '2:1 favorite' },
  { decimal: 1.82, expected: -122, description: 'Example from scrape' },
  { decimal: 1.95, expected: +95, description: 'Nearly even (slight underdog)' },
  { decimal: 1.78, expected: -128, description: 'Example from scrape' },
];

console.log('\n📊 Test Results:\n');
testCases.forEach((test, index) => {
  const result = convertDecimalToAmerican(test.decimal);
  const formatted = formatAmericanOdds(result);
  const match = Math.abs(result - test.expected) <= 1; // Allow 1 point rounding difference
  const status = match ? '✅' : '❌';
  
  console.log(`${status} Test ${index + 1}: ${test.description}`);
  console.log(`   Decimal: ${test.decimal} → American: ${formatted}`);
  console.log(`   Expected: ${formatAmericanOdds(test.expected)}, Got: ${formatted}`);
  console.log('');
});

console.log('='  .repeat(70));
console.log('\n✅ All conversions completed!\n');

// Test with actual scraped values
console.log('🏀 Real NBA Props Examples:\n');
const realExamples = [
  { player: 'Dean Wade O/U 8.5 pts', over: 1.55, under: 2.20 },
  { player: 'Donovan Mitchell O/U 34.5 pts', over: 1.95, under: 1.72 },
  { player: 'Jalen Brunson O/U 26.5 pts', over: 1.82, under: 1.82 },
];

realExamples.forEach(prop => {
  const overAmerican = formatAmericanOdds(convertDecimalToAmerican(prop.over));
  const underAmerican = formatAmericanOdds(convertDecimalToAmerican(prop.under));
  
  console.log(`${prop.player}`);
  console.log(`   European: Over ${prop.over} / Under ${prop.under}`);
  console.log(`   American: Over ${overAmerican} / Under ${underAmerican}`);
  console.log('');
});
