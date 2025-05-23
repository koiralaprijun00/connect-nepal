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

// Enhanced Scoring System
export class GameScoring {
  private static readonly BASE_SCORE = 1000;
  private static readonly WRONG_GUESS_PENALTY = 50;
  private static readonly TIME_BONUS_PER_SECOND = 10;
  private static readonly PERFECT_BONUS = 200;
  private static readonly HINT_PENALTY = 100;

  static calculateScore(session: GameSession, elapsedSeconds: number, totalGuesses: number): number {
    let score = this.BASE_SCORE;
    const difficultyMultiplier = {
      easy: 1.0,
      medium: 1.5,
      hard: 2.0,
      any: 1.2
    }[session.difficulty];
    const correctLength = session.puzzle ? session.puzzle.shortestPath.length - 2 : 0;
    const wrongGuesses = totalGuesses - correctLength;
    score -= wrongGuesses * this.WRONG_GUESS_PENALTY;
    const timeBonus = Math.max(0, (300 - elapsedSeconds) * this.TIME_BONUS_PER_SECOND);
    score += timeBonus;
    if (wrongGuesses === 0) {
      score += this.PERFECT_BONUS;
    }
    score -= session.hintsUsed * this.HINT_PENALTY;
    score *= Math.pow(1.1, Math.min(session.streak, 10));
    score *= difficultyMultiplier;
    return Math.max(0, Math.round(score));
  }
}

// Progressive Difficulty System
export class DifficultyProgression {
  static getDailyDifficulty(daysSinceStart: number): PuzzleDifficulty {
    const cycle = daysSinceStart % 7;
    if (cycle < 3) return 'easy';
    if (cycle < 6) return 'medium';
    return 'hard';
  }

  static getDynamicGuessLimit(pathLength: number, difficulty: PuzzleDifficulty): number {
    const baseLimit = pathLength - 2; // Intermediate districts
    const difficultyMultiplier = {
      easy: 3,
      medium: 2,
      hard: 1.5,
      any: 2
    }[difficulty];
    return Math.max(3, Math.ceil(baseLimit * difficultyMultiplier));
  }
}

// Enhanced Feedback System
export class FeedbackSystem {
  static getFeedbackForGuess(
    guess: string,
    correctPath: string[],
    adjacencyMap: Record<string, string[]>
  ): { type: FeedbackType; message: string; distanceFromPath: number } {
    const normalizedGuess = guess.toLowerCase().trim();
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