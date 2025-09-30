// Test script for array parsing functions
const Papa = require('papaparse');

// Copy the helper functions from import page
function parseArrayField(value) {
  if (!value || value === 'null' || value === 'undefined') return [];
  
  // If it's already an array, return it
  if (Array.isArray(value)) return value;
  
  // Handle string representation
  if (typeof value === 'string') {
    const trimmed = value.trim();
    
    // Handle empty values
    if (!trimmed || trimmed === '[]' || trimmed === '[""]' || trimmed === "['']") {
      return [];
    }
    
    try {
      // Try JSON parsing first (for proper JSON arrays)
      return JSON.parse(trimmed);
    } catch (error) {
      // Try Python-style array parsing (for ['item1', 'item2'] format)
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        const content = trimmed.slice(1, -1); // Remove brackets
        if (!content.trim()) return [];
        
        // Split by comma and clean each item
        const items = content.split(',').map(item => {
          let cleaned = item.trim();
          // Remove both single and double quotes
          if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
              (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
            cleaned = cleaned.slice(1, -1);
          }
          return cleaned.trim();
        }).filter(item => item.length > 0);
        
        return items;
      }
      
      // Single value without brackets
      return [trimmed];
    }
  }
  
  return [];
}

function parseGenreField(value) {
  if (!value || value === 'null' || value === 'undefined') return [];
  
  if (typeof value === 'string') {
    // Split by comma and clean up
    return value.split(',').map(genre => genre.trim()).filter(genre => genre.length > 0);
  }
  
  return Array.isArray(value) ? value : [value];
}

// Test cases
const testCases = [
  // Python-style arrays
  "['Don Quijote de la Mancha', 'Sancho Panza']",
  "['World Literature Classic']",
  "['Winston Smith', 'Julia', 'Big Brother']",
  "['Time Magazine 100 Best Novels']",
  
  // JSON-style arrays
  '["Don Quijote de la Mancha", "Sancho Panza"]',
  '["World Literature Classic"]',
  
  // Genre strings
  "Fiction, Adventure",
  "Dystopian Fiction",
  "Classic Fiction",
  
  // Edge cases
  "[]",
  "['']",
  '[""]',
  "",
  null,
  undefined
];

console.log("Testing parseArrayField:");
testCases.forEach(testCase => {
  try {
    const result = parseArrayField(testCase);
    console.log(`Input: ${JSON.stringify(testCase)} -> Output: ${JSON.stringify(result)}`);
  } catch (error) {
    console.log(`Input: ${JSON.stringify(testCase)} -> ERROR: ${error.message}`);
  }
});

console.log("\nTesting parseGenreField:");
const genreTestCases = ["Fiction, Adventure", "Dystopian Fiction", "Classic Fiction"];
genreTestCases.forEach(testCase => {
  try {
    const result = parseGenreField(testCase);
    console.log(`Input: ${JSON.stringify(testCase)} -> Output: ${JSON.stringify(result)}`);
  } catch (error) {
    console.log(`Input: ${JSON.stringify(testCase)} -> ERROR: ${error.message}`);
  }
});

// Test CSV parsing
console.log("\nTesting CSV parsing:");
const csvData = `title,author,genre,characters,awards
"Don Quixote","Miguel de Cervantes","Fiction, Adventure","['Don Quijote de la Mancha', 'Sancho Panza']","['World Literature Classic']"
"1984","George Orwell","Dystopian Fiction","['Winston Smith', 'Julia', 'Big Brother']","['Time Magazine 100 Best Novels']"`;

Papa.parse(csvData, {
  header: true,
  complete: function(results) {
    console.log("Parsed CSV data:");
    results.data.forEach((row, index) => {
      if (row.title) { // Skip empty rows
        console.log(`\nRow ${index + 1}:`);
        console.log(`  Title: ${row.title}`);
        console.log(`  Author: ${row.author}`);
        console.log(`  Genre: ${JSON.stringify(parseGenreField(row.genre))}`);
        console.log(`  Characters: ${JSON.stringify(parseArrayField(row.characters))}`);
        console.log(`  Awards: ${JSON.stringify(parseArrayField(row.awards))}`);
      }
    });
  },
  error: function(error) {
    console.error("CSV parsing error:", error);
  }
});