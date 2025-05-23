// Enhanced Game State Management with Scoring
import type { Puzzle } from '@/types';
import type { PuzzleDifficulty } from './puzzle';
import { DISTRICT_ADJACENCY } from './puzzle';

export interface GameState {
  puzzle: Puzzle | null;
  userPath: string[];
  guessHistory: GuessResult[];
  gameSession: GameSession;
  hints: HintState;
  mode: GameMode;
}

export interface GuessResult {
  district: string;
  isCorrect: boolean;
  feedback: FeedbackType;
  timestamp: number;
  distanceFromPath: number;
}

export interface GameSession {
  startTime: number;
  score: number;
  streak: number;
  difficulty: PuzzleDifficulty;
  hintsUsed: number;
  perfectRuns: number;
  puzzle?: Puzzle;
}

export type FeedbackType = 'perfect' | 'close' | 'warm' | 'cold' | 'invalid';
export type GameMode = 'classic' | 'sequential' | 'timeAttack' | 'exploration';

export interface HintState {
  used: boolean;
  count: number;
}

// Enhanced Feedback System
export class FeedbackSystem {
  static getFeedbackForGuess(
    guess: string,
    correctPath: string[],
    adjacencyMap: Record<string, string[]>,
    startDistrict?: string,
    endDistrict?: string
  ): { type: FeedbackType; message: string; distanceFromPath: number } {
    const normalizedGuess = guess.toLowerCase().trim();
    // Block start/end guesses
    if (startDistrict && normalizedGuess === startDistrict.toLowerCase()) {
      return {
        type: 'invalid',
        message: 'You cannot guess the start district.',
        distanceFromPath: Infinity
      };
    }
    if (endDistrict && normalizedGuess === endDistrict.toLowerCase()) {
      return {
        type: 'invalid',
        message: 'You cannot guess the end district.',
        distanceFromPath: Infinity
      };
    }
    const pathSet = new Set(correctPath.map(d => d.toLowerCase()));
    if (pathSet.has(normalizedGuess)) {
      return {
        type: 'perfect',
        message: '🎯 Perfect! This district is on the shortest path!',
        distanceFromPath: 0
      };
    }
    if (!adjacencyMap[normalizedGuess]) {
      return {
        type: 'invalid',
        message: '🚫 This is not a valid district name.',
        distanceFromPath: Infinity
      };
    }
    let minDistance = Infinity;
    for (const pathDistrict of correctPath) {
      const distance = this.calculateDistance(normalizedGuess, pathDistrict.toLowerCase(), adjacencyMap);
      minDistance = Math.min(minDistance, distance);
    }
    if (minDistance === 1) {
      return {
        type: 'close',
        message: '🔥 Very close! This district is adjacent to the correct path.',
        distanceFromPath: 1
      };
    } else if (minDistance === 2) {
      return {
        type: 'warm',
        message: '🌊 Getting warmer! You\'re 2 districts away from the path.',
        distanceFromPath: 2
      };
    } else {
      return {
        type: 'cold',
        message: '❄️ Too far from the correct path. Try a different region.',
        distanceFromPath: minDistance
      };
    }
  }

  private static calculateDistance(
    start: string,
    end: string,
    adjacencyMap: Record<string, string[]>,
    maxDepth: number = 3
  ): number {
    if (start === end) return 0;
    const queue: [string, number][] = [[start, 0]];
    const visited = new Set([start]);
    while (queue.length > 0) {
      const [current, distance] = queue.shift()!;
      if (distance >= maxDepth) continue;
      for (const neighbor of adjacencyMap[current] || []) {
        if (visited.has(neighbor)) continue;
        if (neighbor === end) return distance + 1;
        visited.add(neighbor);
        queue.push([neighbor, distance + 1]);
      }
    }
    return maxDepth + 1;
  }
}

// Game Mode Variants
export class GameModes {
  static getSequentialModeRules() {
    return {
      description: "Build the path step by step from start to end",
      validation: (currentPath: string[], correctPath: string[]) => {
        for (let i = 0; i < currentPath.length; i++) {
          if (currentPath[i].toLowerCase() !== correctPath[i + 1]?.toLowerCase()) {
            return false;
          }
        }
        return true;
      },
      hint: "Next district must be adjacent to your current position"
    };
  }

  static getTimeAttackRules(timeLimit: number = 300) {
    return {
      description: `Complete the puzzle within ${timeLimit} seconds`,
      timeLimit,
      scoring: (baseScore: number, timeRemaining: number) => {
        return baseScore + (timeRemaining * 5);
      }
    };
  }

  static getExplorationRules() {
    return {
      description: "Discover as many valid paths as possible",
      validation: (allGuesses: string[], allValidPaths: string[][]) => {
        const validGuesses = allGuesses.filter(guess => 
          allValidPaths.some(path => 
            path.some(district => district.toLowerCase() === guess.toLowerCase())
          )
        );
        return validGuesses.length / allValidPaths.flat().length;
      }
    };
  }
} 