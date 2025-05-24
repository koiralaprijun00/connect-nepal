import React from 'react';
import { useMemo, useCallback, useRef, useEffect, useReducer, useState } from 'react';
import type { Puzzle } from '@/types';

// Memoized path computation
export class PathCache {
  private static cache = new Map<string, string[]>();
  
  // Key format: 'start->end' (all lowercase)
  static getKey(start: string, end: string): string {
    return `${start.toLowerCase()}->${end.toLowerCase()}`;
  }
  static get(start: string, end: string): string[] | null {
    const key = this.getKey(start, end);
    return this.cache.get(key) || null;
  }
  static set(start: string, end: string, path: string[]): void {
    const key = this.getKey(start, end);
    this.cache.set(key, path);
  }
  static getShortestPath(start: string, end: string, adjacencyMap: Record<string, string[]>): string[] | null {
    const key = this.getKey(start, end);
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    const path = this.computeBFS(start, end, adjacencyMap);
    if (path) {
      this.cache.set(key, path);
    }
    return path;
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
      const last = path[path.length - 1];
      
      for (const neighbor of adjacencyMap[last] || []) {
        if (visited.has(neighbor)) continue;
        const newPath = [...path, neighbor];
        if (neighbor === e) return newPath;
        queue.push(newPath);
        visited.add(neighbor);
      }
    }
    return null;
  }
}

// Optimized district filtering with debouncing
export function useDistrictFilter(districts: string[], query: string, delay: number = 150) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [filteredDistricts, setFilteredDistricts] = useState<string[]>([]);
  
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (!query.trim()) {
        setFilteredDistricts([]);
        return;
      }
      
      const filtered = districts
        .filter(district => 
          district.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 10); // Limit results for performance
        
      setFilteredDistricts(filtered);
    }, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [districts, query, delay]);
  
  return filteredDistricts;
}

// Memoized puzzle validation
export const usePuzzleValidation = (puzzle: Puzzle | null) => {
  return useMemo(() => {
    if (!puzzle) return null;
    
    // Validate puzzle structure
    const isValid = puzzle.shortestPath.length >= 2 &&
                    puzzle.shortestPath[0].toLowerCase() === puzzle.startDistrict.toLowerCase() &&
                    puzzle.shortestPath[puzzle.shortestPath.length - 1].toLowerCase() === puzzle.endDistrict.toLowerCase();
    
    const intermediateCount = puzzle.shortestPath.length - 2;
    const difficulty = intermediateCount <= 2 ? 'easy' : 
                      intermediateCount <= 5 ? 'medium' : 'hard';
    
    return {
      isValid,
      intermediateCount,
      difficulty,
      totalDistricts: puzzle.shortestPath.length
    };
  }, [puzzle]);
};

// Optimized guess validation with memoization
export const useGuessValidation = (puzzle: Puzzle | null, adjacencyMap: Record<string, string[]>) => {
  const allValidPaths = useMemo(() => {
    if (!puzzle) return [];
    
    // Use cached computation
    const paths = PathCache.getShortestPath(puzzle.startDistrict, puzzle.endDistrict, adjacencyMap);
    return paths ? [paths] : [];
  }, [puzzle, adjacencyMap]);
  
  const validateGuess = useCallback((guess: string): {
    isCorrect: boolean;
    feedback: string;
    distanceFromPath: number;
  } => {
    if (!puzzle || allValidPaths.length === 0) {
      return { isCorrect: false, feedback: 'Invalid puzzle state', distanceFromPath: Infinity };
    }
    
    const normalizedGuess = guess.toLowerCase().trim();
    const correctIntermediates = puzzle.shortestPath
      .slice(1, -1)
      .map(d => d.toLowerCase());
    
    const isCorrect = correctIntermediates.includes(normalizedGuess);
    
    if (isCorrect) {
      return {
        isCorrect: true,
        feedback: '🎯 Perfect! This district is on the correct path.',
        distanceFromPath: 0
      };
    }
    
    // Calculate distance from path for better feedback
    const distanceFromPath = calculateMinDistanceFromPath(normalizedGuess, puzzle.shortestPath, adjacencyMap);
    
    let feedback: string;
    if (distanceFromPath === 1) {
      feedback = '🔥 Close! Adjacent to the correct path.';
    } else if (distanceFromPath === 2) {
      feedback = '🌊 Warm! Two districts away from the path.';
    } else if (distanceFromPath <= 3) {
      feedback = '❄️ Cold. Try a different region.';
    } else {
      feedback = '🚫 Very far from the correct path.';
    }
    
    return { isCorrect: false, feedback, distanceFromPath };
  }, [puzzle, allValidPaths, adjacencyMap]);
  
  return { validateGuess, allValidPaths };
};

// Helper function to calculate minimum distance from path
function calculateMinDistanceFromPath(
  district: string, 
  correctPath: string[], 
  adjacencyMap: Record<string, string[]>
): number {
  let minDistance = Infinity;
  
  for (const pathDistrict of correctPath) {
    const distance = calculateDistanceBFS(district, pathDistrict.toLowerCase(), adjacencyMap, 4);
    minDistance = Math.min(minDistance, distance);
  }
  
  return minDistance;
}

function calculateDistanceBFS(
  start: string, 
  end: string, 
  adjacencyMap: Record<string, string[]>, 
  maxDepth: number
): number {
  if (start === end) return 0;
  if (!adjacencyMap[start] || !adjacencyMap[end]) return maxDepth + 1;
  
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

// Optimized game state reducer
export interface GameAction {
  type: 'MAKE_GUESS' | 'UNDO_GUESS' | 'USE_HINT' | 'NEW_GAME' | 'UPDATE_SCORE';
  payload?: any;
}

export interface OptimizedGameState {
  puzzle: Puzzle | null;
  guesses: Array<{
    district: string;
    isCorrect: boolean;
    feedback: string;
    timestamp: number;
    distanceFromPath: number;
  }>;
  score: number;
  hintsUsed: number;
  startTime: number;
  gameStatus: 'playing' | 'won' | 'lost';
  streak: number;
  isGameWon: boolean;
}

export function gameReducer(state: OptimizedGameState, action: GameAction): OptimizedGameState {
  switch (action.type) {
    case 'MAKE_GUESS':
      const { district, isCorrect, feedback, distanceFromPath } = action.payload;
      const newGuess = {
        district,
        isCorrect,
        feedback,
        timestamp: Date.now(),
        distanceFromPath
      };
      
      const newGuesses = [...state.guesses, newGuess];
      const correctGuesses = newGuesses.filter(g => g.isCorrect);
      const requiredCount = state.puzzle ? state.puzzle.shortestPath.length - 2 : 0;
      const gameWon = correctGuesses.length === requiredCount;
      
      return {
        ...state,
        guesses: newGuesses,
        gameStatus: gameWon ? 'won' : state.gameStatus,
        streak: gameWon ? state.streak + 1 : state.streak,
        isGameWon: gameWon
      };
    
    case 'UNDO_GUESS':
      return {
        ...state,
        guesses: state.guesses.slice(0, -1)
      };
    
    case 'USE_HINT':
      return {
        ...state,
        hintsUsed: state.hintsUsed + 1,
        score: state.score - 50 // Hint penalty
      };
    
    case 'NEW_GAME':
      return {
        ...state,
        puzzle: action.payload.puzzle,
        guesses: [],
        hintsUsed: 0,
        startTime: Date.now(),
        gameStatus: 'playing',
        isGameWon: false
      };
    
    case 'UPDATE_SCORE':
      return {
        ...state,
        score: action.payload.score
      };
    
    default:
      return state;
  }
}

// Custom hook for optimized game management
export function useOptimizedGame(adjacencyMap: Record<string, string[]>) {
  const [state, dispatch] = useReducer(gameReducer, {
    puzzle: null,
    guesses: [],
    score: 0,
    hintsUsed: 0,
    startTime: Date.now(),
    gameStatus: 'playing' as const,
    streak: 0,
    isGameWon: false
  });
  
  const { validateGuess } = useGuessValidation(state.puzzle, adjacencyMap);
  
  // Add isGameWon using Set for O(1) lookup
  const isGameWon = useMemo(() => {
    if (!state.puzzle) return false;
    const correctPath = state.puzzle.shortestPath.slice(1, -1).map(d => d.trim().toLowerCase());
    const userPathSet = new Set(state.guesses.map(g => g.district.trim().toLowerCase()));
    return correctPath.every(d => userPathSet.has(d));
  }, [state.puzzle, state.guesses]);
  
  const makeGuess = useCallback((district: string) => {
    const result = validateGuess(district);
    dispatch({
      type: 'MAKE_GUESS',
      payload: { district, ...result }
    });
  }, [validateGuess]);
  
  const undoGuess = useCallback(() => {
    if (state.guesses.length > 0) {
      dispatch({ type: 'UNDO_GUESS' });
    }
  }, [state.guesses.length]);
  
  const useHint = useCallback((hintType: string) => {
    dispatch({ type: 'USE_HINT', payload: { hintType } });
  }, []);
  
  const startNewGame = useCallback((puzzle: Puzzle) => {
    dispatch({ type: 'NEW_GAME', payload: { puzzle } });
  }, []);
  
  const updateScore = useCallback((score: number) => {
    dispatch({ type: 'UPDATE_SCORE', payload: { score } });
  }, []);
  
  return {
    state: {
      ...state,
      isGameWon,
    },
    actions: {
      makeGuess,
      undoGuess,
      useHint,
      startNewGame,
      updateScore
    }
  };
}

// Lazy loading for large datasets
export function useLazyPuzzleGeneration() {
  const [puzzleCache, setPuzzleCache] = useState<Map<string, Puzzle>>(new Map());

  const generatePuzzle = useCallback(async (difficulty: string): Promise<Puzzle | null> => {
    const cacheKey = `${difficulty}-${Date.now()}`;

    if (puzzleCache.has(cacheKey)) {
      return puzzleCache.get(cacheKey)!;
    }

    // Simulate async puzzle generation (could be Web Worker)
    return new Promise((resolve) => {
      setTimeout(() => {
        const puzzle = generatePuzzleWithDifficulty({ difficulty: difficulty as any });
        if (puzzle) {
          setPuzzleCache(prev => new Map(prev).set(cacheKey, puzzle));
        }
        resolve(puzzle);
      }, 0);
    });
  }, [puzzleCache]);

  return { generatePuzzle, cacheSize: puzzleCache.size };
}

// Dummy function for puzzle generation (replace with your actual logic)
function generatePuzzleWithDifficulty({ difficulty }: { difficulty: string }): Puzzle | null {
  // Implement your puzzle generation logic here
  return null;
} 