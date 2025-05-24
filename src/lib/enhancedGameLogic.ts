import type { Puzzle } from '@/types';

export interface GuessResult {
  district: string;
  isCorrect: boolean;
  feedback: FeedbackType;
  timestamp: number;
  distanceFromPath: number;
  pathPosition?: number; // Which position in the path this district belongs to
}

export type FeedbackType = 'perfect' | 'close' | 'warm' | 'cold' | 'invalid' | 'duplicate';

// Memoized BFS with path caching for performance
class PathfindingCache {
  private static pathCache = new Map<string, string[]>();
  private static allPathsCache = new Map<string, string[][]>();
  
  static getCacheKey(start: string, end: string): string {
    return `${start.toLowerCase()}-->${end.toLowerCase()}`;
  }
  
  static getShortestPath(start: string, end: string, adjacencyMap: Record<string, string[]>): string[] | null {
    const key = this.getCacheKey(start, end);
    if (this.pathCache.has(key)) {
      return this.pathCache.get(key)!;
    }
    
    const path = this.computeBFS(start, end, adjacencyMap);
    if (path) {
      this.pathCache.set(key, path);
    }
    return path;
  }
  
  static getAllShortestPaths(start: string, end: string, adjacencyMap: Record<string, string[]>): string[][] {
    const key = this.getCacheKey(start, end);
    if (this.allPathsCache.has(key)) {
      return this.allPathsCache.get(key)!;
    }
    
    const paths = this.computeAllBFS(start, end, adjacencyMap);
    this.allPathsCache.set(key, paths);
    return paths;
  }
  
  private static computeBFS(start: string, end: string, adjacencyMap: Record<string, string[]>): string[] | null {
    const s = start.trim().toLowerCase();
    const e = end.trim().toLowerCase();
    
    if (s === e) return [s];
    if (!adjacencyMap[s] || !adjacencyMap[e]) return null;

    const queue: string[][] = [[s]];
    const visited = new Set<string>([s]);

    while (queue.length > 0) {
      const path = queue.shift()!;
      const current = path[path.length - 1];
      
      for (const neighbor of adjacencyMap[current] || []) {
        if (visited.has(neighbor)) continue;
        
        const newPath = [...path, neighbor];
        if (neighbor === e) return newPath;
        
        queue.push(newPath);
        visited.add(neighbor);
      }
    }
    return null;
  }
  
  private static computeAllBFS(start: string, end: string, adjacencyMap: Record<string, string[]>): string[][] {
    const s = start.trim().toLowerCase();
    const e = end.trim().toLowerCase();
    
    if (s === e) return [[s]];
    if (!adjacencyMap[s] || !adjacencyMap[e]) return [];

    const result: string[][] = [];
    const queue: string[][] = [[s]];
    let shortestLength = Infinity;

    while (queue.length > 0 && queue[0].length <= shortestLength) {
      const path = queue.shift()!;
      const current = path[path.length - 1];
      
      if (current === e) {
        if (path.length < shortestLength) {
          shortestLength = path.length;
          result.length = 0; // Clear longer paths
        }
        if (path.length === shortestLength) {
          result.push([...path]);
        }
        continue;
      }
      
      for (const neighbor of adjacencyMap[current] || []) {
        if (!path.includes(neighbor)) { // Prevent cycles
          queue.push([...path, neighbor]);
        }
      }
    }
    return result;
  }
  
  static clear(): void {
    this.pathCache.clear();
    this.allPathsCache.clear();
  }
}

// Enhanced Feedback System with better logic
export class FeedbackSystem {
  static getFeedbackForGuess(
    guess: string,
    puzzle: Puzzle,
    adjacencyMap: Record<string, string[]>,
    previousGuesses: Set<string> = new Set()
  ): { type: FeedbackType; message: string; distanceFromPath: number; pathPosition?: number } {
    const normalizedGuess = guess.trim().toLowerCase();
    
    // Check for duplicate guess
    if (previousGuesses.has(normalizedGuess)) {
      return {
        type: 'duplicate',
        message: '🔄 You already guessed this district!',
        distanceFromPath: Infinity
      };
    }
    
    // Block start/end district guesses
    if (normalizedGuess === puzzle.startDistrict.toLowerCase()) {
      return {
        type: 'invalid',
        message: '🚫 Cannot guess the start district.',
        distanceFromPath: Infinity
      };
    }
    
    if (normalizedGuess === puzzle.endDistrict.toLowerCase()) {
      return {
        type: 'invalid',
        message: '🚫 Cannot guess the end district.',
        distanceFromPath: Infinity
      };
    }
    
    // Validate district exists
    if (!adjacencyMap[normalizedGuess]) {
      return {
        type: 'invalid',
        message: '🚫 Invalid district name.',
        distanceFromPath: Infinity
      };
    }
    
    // Get all valid shortest paths
    const allValidPaths = PathfindingCache.getAllShortestPaths(
      puzzle.startDistrict, 
      puzzle.endDistrict, 
      adjacencyMap
    );
    
    // Check if guess is correct (in any valid path)
    for (const path of allValidPaths) {
      const intermediates = path.slice(1, -1); // Remove start and end
      const position = intermediates.findIndex(d => d === normalizedGuess);
      if (position !== -1) {
        return {
          type: 'perfect',
          message: `🎯 Perfect! ${guess} is on the shortest path!`,
          distanceFromPath: 0,
          pathPosition: position + 1 // 1-indexed position
        };
      }
    }
    
    // Calculate minimum distance to any valid path
    const minDistance = this.calculateMinimumDistanceToPath(normalizedGuess, allValidPaths, adjacencyMap);
    
    // Provide distance-based feedback
    if (minDistance === 1) {
      return {
        type: 'close',
        message: '🔥 Very close! Adjacent to the correct path.',
        distanceFromPath: 1
      };
    } else if (minDistance === 2) {
      return {
        type: 'warm',
        message: '🌊 Getting warmer! 2 districts away.',
        distanceFromPath: 2
      };
    } else {
      return {
        type: 'cold',
        message: '❄️ Too far from the correct path.',
        distanceFromPath: minDistance
      };
    }
  }
  
  private static calculateMinimumDistanceToPath(
    district: string,
    allValidPaths: string[][],
    adjacencyMap: Record<string, string[]>
  ): number {
    let minDistance = Infinity;
    
    for (const path of allValidPaths) {
      for (const pathDistrict of path) {
        const distance = this.calculateBFSDistance(district, pathDistrict, adjacencyMap, 4);
        minDistance = Math.min(minDistance, distance);
      }
    }
    
    return minDistance;
  }
  
  private static calculateBFSDistance(
    start: string,
    end: string,
    adjacencyMap: Record<string, string[]>,
    maxDepth: number
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

// Improved Game State Management
export class GameEngine {
  private puzzle: Puzzle;
  private adjacencyMap: Record<string, string[]>;
  private guessHistory: GuessResult[] = [];
  private guessedDistricts = new Set<string>();
  private allValidPaths: string[][];
  private requiredIntermediates: Set<string>;
  
  constructor(puzzle: Puzzle, adjacencyMap: Record<string, string[]>) {
    this.puzzle = puzzle;
    this.adjacencyMap = adjacencyMap;
    this.allValidPaths = PathfindingCache.getAllShortestPaths(
      puzzle.startDistrict,
      puzzle.endDistrict,
      adjacencyMap
    );
    
    // Precompute all required intermediate districts
    this.requiredIntermediates = new Set();
    for (const path of this.allValidPaths) {
      const intermediates = path.slice(1, -1);
      intermediates.forEach(d => this.requiredIntermediates.add(d));
    }
  }
  
  makeGuess(district: string): GuessResult {
    const feedback = FeedbackSystem.getFeedbackForGuess(
      district,
      this.puzzle,
      this.adjacencyMap,
      this.guessedDistricts
    );
    
    const guessResult: GuessResult = {
      district: district.trim(),
      isCorrect: feedback.type === 'perfect',
      feedback: feedback.type,
      timestamp: Date.now(),
      distanceFromPath: feedback.distanceFromPath,
      pathPosition: feedback.pathPosition
    };
    
    this.guessHistory.push(guessResult);
    this.guessedDistricts.add(district.trim().toLowerCase());
    
    return guessResult;
  }
  
  // Improved win condition: Check if any complete path is satisfied
  isGameWon(): boolean {
    const correctGuesses = new Set(
      this.guessHistory
        .filter(g => g.isCorrect)
        .map(g => g.district.toLowerCase())
    );
    
    // Check if player has guessed all intermediates for any complete path
    return this.allValidPaths.some(path => {
      const intermediates = path.slice(1, -1);
      return intermediates.every(district => correctGuesses.has(district));
    });
  }
  
  getProgress(): {
    totalRequired: number;
    correctGuesses: number;
    incorrectGuesses: number;
    completionPercentage: number;
  } {
    const correctGuesses = this.guessHistory.filter(g => g.isCorrect).length;
    const incorrectGuesses = this.guessHistory.filter(g => !g.isCorrect && g.feedback !== 'duplicate').length;
    
    return {
      totalRequired: this.requiredIntermediates.size,
      correctGuesses,
      incorrectGuesses,
      completionPercentage: (correctGuesses / this.requiredIntermediates.size) * 100
    };
  }
  
  getAllValidPaths(): string[][] {
    return [...this.allValidPaths]; // Return copy to prevent mutation
  }
  
  getRequiredIntermediates(): string[] {
    return Array.from(this.requiredIntermediates);
  }
  
  getGuessHistory(): GuessResult[] {
    return [...this.guessHistory]; // Return copy
  }
  
  undoLastGuess(): boolean {
    if (this.guessHistory.length === 0) return false;
    
    const lastGuess = this.guessHistory.pop()!;
    this.guessedDistricts.delete(lastGuess.district.toLowerCase());
    return true;
  }
  
  reset(): void {
    this.guessHistory = [];
    this.guessedDistricts.clear();
  }
  
  // Get hint: return next district that hasn't been guessed
  getHint(): string | null {
    const correctGuesses = new Set(
      this.guessHistory
        .filter(g => g.isCorrect)
        .map(g => g.district.toLowerCase())
    );
    
    // Find first unguessed district from the primary path
    const primaryPath = this.allValidPaths[0];
    if (primaryPath) {
      const intermediates = primaryPath.slice(1, -1);
      for (const district of intermediates) {
        if (!correctGuesses.has(district)) {
          return district;
        }
      }
    }
    
    return null;
  }
} 