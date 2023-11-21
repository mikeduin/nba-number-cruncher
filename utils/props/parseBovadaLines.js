module.exports = (inputString) => {
    // Define a regular expression to capture the three parts
    const regex = /([^-]+) - ([^(]+) \(([^)]+)\)/;

    // Use the match method to extract the matched groups
    const match = inputString.match(regex);
  
    // Check if there's a match
    if (match) {
      // Extract the matched groups
      const market = match[1].trim(); // Text before the '-'
      const player = match[2].trim(); // Text between '-' and the first '('
      const team = match[3].trim(); // Text between the parentheses
  
      // Return an object with the three parts
      return {
        market,
        player,
        team
      };
    } else {
      // Return null if there's no match
      return null;
    }
}