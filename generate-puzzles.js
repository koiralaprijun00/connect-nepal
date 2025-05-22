// Simple puzzle generator script for testing
// Run with: node generate-puzzles.js

// Since we can't import ES modules directly, we'll use a simpler approach
// This demonstrates the concept - in practice you'd integrate this into your build process

const fs = require('fs');
const path = require('path');

// Mock data for demonstration (in real usage, this would come from your modules)
const sampleDistricts = [
  'kathmandu', 'bhaktapur', 'lalitpur', 'chitwan', 'pokhara', 'dhading',
  'rupandehi', 'palpa', 'gulmi', 'baglung', 'myagdi', 'mustang',
  'jhapa', 'morang', 'sunsari', 'dhankuta', 'panchthar', 'ilam'
];

function generateRandomPuzzleDemo() {
  const start = sampleDistricts[Math.floor(Math.random() * sampleDistricts.length)];
  let end = start;
  while (end === start) {
    end = sampleDistricts[Math.floor(Math.random() * sampleDistricts.length)];
  }
  
  // Mock path generation (in real usage, this would use your BFS algorithm)
  const pathLength = Math.floor(Math.random() * 5) + 3; // 3-7 districts
  const mockPath = [start];
  for (let i = 1; i < pathLength - 1; i++) {
    let next = sampleDistricts[Math.floor(Math.random() * sampleDistricts.length)];
    while (mockPath.includes(next)) {
      next = sampleDistricts[Math.floor(Math.random() * sampleDistricts.length)];
    }
    mockPath.push(next);
  }
  mockPath.push(end);
  
  const intermediateCount = mockPath.length - 2;
  const difficulty = intermediateCount <= 2 ? 'easy' : intermediateCount <= 4 ? 'medium' : 'hard';
  
  return {
    id: `auto_generated_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    startDistrict: start,
    endDistrict: end,
    shortestPath: mockPath,
    difficulty: difficulty,
    intermediateCount: intermediateCount
  };
}

console.log('🎯 Auto-Generated Nepal Traversal Puzzles\n');
console.log('=' .repeat(50));

// Generate a set of puzzles
for (let i = 1; i <= 8; i++) {
  const puzzle = generateRandomPuzzleDemo();
  
  console.log(`Puzzle ${i} (${puzzle.difficulty.toUpperCase()}):`);
  console.log(`  From: ${puzzle.startDistrict}`);
  console.log(`  To: ${puzzle.endDistrict}`);
  console.log(`  Path: ${puzzle.shortestPath.join(' → ')}`);
  console.log(`  Intermediate districts: ${puzzle.intermediateCount}`);
  console.log(`  ID: ${puzzle.id}`);
  console.log('');
}

console.log('💡 To use real puzzle generation in your app:');
console.log('   1. Import { generatePuzzleWithDifficulty } from "./src/lib/puzzle"');
console.log('   2. Call generatePuzzleWithDifficulty({ difficulty: "easy" })');
console.log('   3. Replace your manual PUZZLES array with auto-generated ones'); 