# Nepal District Traversal Game

A geography-based puzzle game where players navigate through Nepal's districts to find the shortest path between two locations.

## Game Overview

The game challenges players to find the shortest path between two districts in Nepal by guessing the intermediate districts one by one. It's similar to Wordle but for geography!

## Game Rules

- Players are given a start district and an end district
- The goal is to find the shortest path by guessing intermediate districts
- Each puzzle has a maximum of **10 intermediate districts** between the start and end points
- Players input districts one at a time in the correct order
- Feedback is provided for correct/incorrect guesses
- Win by finding all districts in the correct shortest path

## Puzzle Design

All puzzles are designed to be **geographically realistic**:
- Paths follow logical regional connections within Nepal
- No unrealistic cross-country jumps between distant regions
- Routes consider the natural geographical layout of Nepal's districts
- Current puzzles range from 2-5 intermediate districts for optimal gameplay

### Current Puzzle Distribution
- **2 intermediate districts**: 1 puzzle
- **3 intermediate districts**: 6 puzzles  
- **5 intermediate districts**: 1 puzzle

All puzzles are validated to ensure geographical realism and stay within the 10-district limit.

## Technical Details

### Puzzle Configuration

- All puzzles are validated to ensure they don't exceed 10 intermediate districts
- Puzzles are designed with geographical adjacency in mind
- Puzzles cycle daily and can be selected randomly
- Automatic validation prevents geographically unrealistic routes

### Development

Built with:
- Next.js
- TypeScript
- Tailwind CSS
- Firebase (backend services)

### Puzzle Creation

To create new puzzles, use the `createPuzzle` utility function:

```typescript
import { createPuzzle } from '@/lib/puzzle';

const newPuzzle = createPuzzle(
  'puzzle_id',
  'start_district',
  'end_district',
  ['start_district', 'intermediate1', 'intermediate2', 'end_district']
);
```

The function automatically validates that:
- The puzzle doesn't exceed 10 intermediate districts
- Start and end districts match the path
- All district names are properly formatted

## Getting Started

To get started with development, take a look at `src/app/page.tsx`.

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/koiralaprijun00/connect-nepal?utm_source=oss&utm_medium=github&utm_campaign=koiralaprijun00%2Fconnect-nepal&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)
