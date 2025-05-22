# 🎯 Automatic Puzzle Generation Guide

Your Nepal Traversal game now supports **automatic puzzle generation**! No more manual puzzle creation.

## 🚀 Quick Start

### Option 1: Use Auto-Generated Puzzles in Game
```typescript
// In your main page component, change:
const newPuzzle = getRandomPuzzle(); 
// To:
const newPuzzle = getRandomPuzzle(true); // true = use auto-generated puzzles
```

### Option 2: Generate Specific Difficulty
```typescript
import { generatePuzzleWithDifficulty } from '@/lib/puzzle';

// Generate an easy puzzle (1-2 intermediate districts)
const easyPuzzle = generatePuzzleWithDifficulty({ difficulty: 'easy' });

// Generate a medium puzzle (3-5 intermediate districts)  
const mediumPuzzle = generatePuzzleWithDifficulty({ difficulty: 'medium' });

// Generate a hard puzzle (6+ intermediate districts)
const hardPuzzle = generatePuzzleWithDifficulty({ difficulty: 'hard' });
```

## 📊 Available Functions

### `generatePuzzleWithDifficulty(options)`
Generate a single puzzle with specific constraints.

**Options:**
- `difficulty`: `'easy' | 'medium' | 'hard' | 'any'`
- `minIntermediate`: Minimum intermediate districts (default: 1)
- `maxIntermediate`: Maximum intermediate districts (default: 10)
- `excludeRegions`: Array of region names to exclude
- `maxAttempts`: Maximum generation attempts (default: 1000)

**Examples:**
```typescript
// Easy puzzle
const puzzle1 = generatePuzzleWithDifficulty({ difficulty: 'easy' });

// Custom constraints
const puzzle2 = generatePuzzleWithDifficulty({ 
  minIntermediate: 2, 
  maxIntermediate: 4,
  excludeRegions: ['kath', 'pok'] // Exclude Kathmandu, Pokhara areas
});
```

### `generatePuzzleSet(count)`
Generate multiple puzzles with variety.

```typescript
// Generate 10 puzzles with mixed difficulties
const puzzles = generatePuzzleSet(10);
```

### `generateAllPuzzles()`
Replace your manual puzzle array entirely.

```typescript
// Generate a balanced set: 3 easy + 3 medium + 2 hard
const allPuzzles = generateAllPuzzles();
```

## 🎮 Integration Examples

### 1. Replace Manual Puzzles Entirely
```typescript
// In src/lib/puzzle.ts, replace:
const PUZZLES: Puzzle[] = [
  // Your manual puzzles...
];

// With:
const PUZZLES: Puzzle[] = generateAllPuzzles();
```

### 2. Mix Manual and Auto-Generated
```typescript
const manualPuzzles = [
  // Your favorite hand-crafted puzzles
];

const autoPuzzles = generatePuzzleSet(5);
const PUZZLES = [...manualPuzzles, ...autoPuzzles];
```

### 3. Dynamic Generation in Game
```typescript
// In your page component:
const [puzzle, setPuzzle] = useState<Puzzle | null>(null);

const startNewGame = useCallback((difficulty?: 'easy' | 'medium' | 'hard') => {
  let newPuzzle;
  if (difficulty) {
    newPuzzle = generatePuzzleWithDifficulty({ difficulty });
  } else {
    newPuzzle = getRandomPuzzle(true); // Auto-generated
  }
  setPuzzle(newPuzzle);
}, []);
```

## 🎯 Difficulty Levels

| Difficulty | Intermediate Districts | Example |
|------------|----------------------|---------|
| **Easy** | 1-2 | kathmandu → lalitpur → chitwan |
| **Medium** | 3-5 | jhapa → morang → sunsari → dhankuta → panchthar |
| **Hard** | 6+ | kathmandu → nuwakot → rasuwa → gorkha → baglung → myagdi → dolpa |

## 🛠️ Advanced Usage

### Daily Puzzle with Auto-Generation
```typescript
export function getDailyPuzzle(date: Date): Puzzle {
  const seed = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  Math.random = () => (seed % 1000) / 1000; // Seeded random
  
  const difficulties = ['easy', 'medium', 'hard'] as const;
  const difficulty = difficulties[seed % 3];
  
  return generatePuzzleWithDifficulty({ difficulty }) || getRandomPuzzle();
}
```

### Puzzle Validation
All auto-generated puzzles are automatically validated:
- ✅ **Shortest path verification** using BFS algorithm
- ✅ **Adjacency validation** against district connections
- ✅ **Difficulty constraints** enforcement
- ✅ **Reachability check** between start and end districts

### Debug Generated Puzzles
```typescript
import { logPuzzleInfo } from '@/lib/puzzle';

const puzzle = generatePuzzleWithDifficulty({ difficulty: 'medium' });
if (puzzle) {
  logPuzzleInfo(puzzle);
  // Output:
  // generated_medium_1234567890_456: rupandehi → gulmi
  //   Path: rupandehi → palpa → gulmi
  //   Intermediate districts: 1 (Easy)
}
```

## 🚀 Benefits of Auto-Generation

1. **Infinite Variety**: Never run out of puzzles
2. **Balanced Difficulty**: Automatic difficulty classification
3. **Geographic Diversity**: Covers all regions of Nepal
4. **Valid Paths**: Always uses actual shortest paths
5. **No Manual Work**: No need to research district connections
6. **Scalable**: Generate hundreds of puzzles instantly

## 🎯 Migration Guide

To switch from manual to auto-generated puzzles:

1. **Backup your current puzzles** (in case you want to keep some)
2. **Choose your integration approach** (full replacement or hybrid)
3. **Update your `getRandomPuzzle()` calls** to pass `true`
4. **Test the difficulty balance** and adjust parameters if needed

## 🐛 Troubleshooting

**Q: Generation returns null?**
- Increase `maxAttempts` in options
- Reduce difficulty constraints
- Check if `excludeRegions` is too restrictive

**Q: Puzzles too easy/hard?**
- Adjust `minIntermediate` and `maxIntermediate`
- Use specific difficulty levels instead of 'any'

**Q: Want consistent daily puzzles?**
- Use seeded random generation based on date
- Cache generated puzzles for the day

---

🎮 **Ready to go?** Start by changing `getRandomPuzzle()` to `getRandomPuzzle(true)` in your main game component! 