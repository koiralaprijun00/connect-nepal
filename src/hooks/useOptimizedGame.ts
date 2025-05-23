import { useReducer, useCallback, useMemo } from 'react';
import { FeedbackSystem, GuessResult, GameSession } from '@/lib/gameLogic';
import { DISTRICT_ADJACENCY, findAllShortestPaths } from '@/lib/puzzle';
import type { Puzzle } from '@/types';

// Memoized path cache to avoid recalculating BFS
class PathCache {
  private static cache = new Map<string, string[]>();
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
  static clear(): void {
    this.cache.clear();
  }
}

interface GameState {
  puzzle: Puzzle;
  guessHistory: GuessResult[];
  gameSession: GameSession;
  hints: { used: boolean; count: number };
  mode: string;
  lastFeedback: { type: string; message: string } | null;
}

type GameAction =
  | { type: 'MAKE_GUESS'; district: string; guessResult: GuessResult }
  | { type: 'UNDO_GUESS' }
  | { type: 'USE_HINT' }
  | { type: 'NEW_GAME'; puzzle: Puzzle }
  | { type: 'SET_MODE'; mode: string }
  | { type: 'SET_FEEDBACK'; feedback: { type: string; message: string } | null };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'MAKE_GUESS':
      return {
        ...state,
        guessHistory: [...state.guessHistory, action.guessResult],
        lastFeedback: { type: action.guessResult.feedback, message: action.guessResult.feedback },
      };
    case 'UNDO_GUESS':
      return {
        ...state,
        guessHistory: state.guessHistory.slice(0, -1),
        lastFeedback: null,
      };
    case 'USE_HINT':
      return {
        ...state,
        hints: { used: true, count: state.hints.count + 1 },
        gameSession: { ...state.gameSession, hintsUsed: state.gameSession.hintsUsed + 1 },
        lastFeedback: { type: 'hint', message: 'Hint used! (Not implemented)' },
      };
    case 'NEW_GAME': {
      const now = Date.now();
      return {
        ...state,
        puzzle: action.puzzle,
        guessHistory: [],
        gameSession: {
          ...state.gameSession,
          startTime: now,
          score: 0,
          hintsUsed: 0,
          perfectRuns: 0,
          puzzle: action.puzzle,
        },
        hints: { used: false, count: 0 },
        lastFeedback: null,
      };
    }
    case 'SET_MODE':
      return { ...state, mode: action.mode };
    case 'SET_FEEDBACK':
      return { ...state, lastFeedback: action.feedback };
    default:
      return state;
  }
}

export function useOptimizedGame(initialPuzzle: Puzzle) {
  const [state, dispatch] = useReducer(gameReducer, {
    puzzle: initialPuzzle,
    guessHistory: [],
    gameSession: {
      startTime: Date.now(),
      score: 0,
      streak: 0,
      difficulty: 'medium',
      hintsUsed: 0,
      perfectRuns: 0,
      puzzle: initialPuzzle,
    },
    hints: { used: false, count: 0 },
    mode: 'classic',
    lastFeedback: null,
  });

  // Derive userPath from guessHistory
  const userPath = useMemo(() => state.guessHistory.map(g => g.district), [state.guessHistory]);

  // Get all possible shortest paths between start and end
  const allValidPaths = useMemo(() => {
    return findAllShortestPaths(state.puzzle.startDistrict, state.puzzle.endDistrict, DISTRICT_ADJACENCY);
  }, [state.puzzle.startDistrict, state.puzzle.endDistrict]);

  // Get all unique intermediate districts (for feedback and display)
  const allCorrectIntermediates = useMemo(() => {
    return new Set(
      allValidPaths.flatMap(path => path.slice(1, -1).map(d => d.trim().toLowerCase()))
    );
  }, [allValidPaths]);

  // FIXED WIN CONDITION: Player completes ANY one valid path
  const isGameWon = useMemo(() => {
    const userPathSet = new Set(userPath.map(d => d.trim().toLowerCase()));
    // Check if user has guessed all intermediates for ANY complete path
    return allValidPaths.some(path => {
      const intermediates = path.slice(1, -1).map(d => d.trim().toLowerCase());
      return intermediates.every(district => userPathSet.has(district));
    });
  }, [allValidPaths, userPath]);

  // For single-path feedback (used by some components)
  const correctPath = useMemo(() =>
    state.puzzle.shortestPath.slice(1, -1).map(d => d.trim().toLowerCase()),
    [state.puzzle.shortestPath]
  );

  // Guess handler with error handling
  const makeGuess = useCallback((district: string) => {
    try {
      const feedback = FeedbackSystem.getFeedbackForGuess(
        district,
        state.puzzle.shortestPath.slice(1, -1),
        DISTRICT_ADJACENCY,
        state.puzzle.startDistrict,
        state.puzzle.endDistrict
      );
      const isCorrect = feedback.type === 'perfect';
      const guessResult: GuessResult = {
        district,
        isCorrect,
        feedback: feedback.type,
        timestamp: Date.now(),
        distanceFromPath: feedback.distanceFromPath,
      };
      dispatch({ type: 'MAKE_GUESS', district, guessResult });
      dispatch({ type: 'SET_FEEDBACK', feedback: { type: feedback.type, message: feedback.message } });
    } catch (error) {
      console.error('Error making guess:', error);
      // Fallback feedback for error cases
      const errorResult: GuessResult = {
        district,
        isCorrect: false,
        feedback: 'invalid',
        timestamp: Date.now(),
        distanceFromPath: Infinity,
      };
      dispatch({ type: 'MAKE_GUESS', district, guessResult: errorResult });
    }
  }, [state.puzzle]); // Removed userPath.length dependency

  const undoGuess = useCallback(() => {
    dispatch({ type: 'UNDO_GUESS' });
  }, []);

  const useHint = useCallback(() => {
    dispatch({ type: 'USE_HINT' });
  }, []);

  const startNewGame = useCallback((puzzle: Puzzle) => {
    PathCache.clear();
    dispatch({ type: 'NEW_GAME', puzzle });
  }, []);

  const setMode = useCallback((mode: string) => {
    dispatch({ type: 'SET_MODE', mode });
  }, []);

  return {
    state: {
      ...state,
      isGameWon,
      correctPath,
      allCorrectIntermediates,
      userPath,
    },
    actions: {
      makeGuess,
      undoGuess,
      useHint,
      startNewGame,
      setMode,
    },
  };
}

// Local storage optimization for achievements, etc.
export class GameStorage {
  private static prefix = 'nepal_traversal_';
  static get(key: string): any {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }
  static set(key: string, value: any): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch {
      // Handle storage quota exceeded
    }
  }
  static remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.prefix + key);
  }
  static setBatch(items: Record<string, any>): void {
    Object.entries(items).forEach(([key, value]) => {
      this.set(key, value);
    });
  }
  static getBatch(keys: string[]): Record<string, any> {
    const result: Record<string, any> = {};
    keys.forEach(key => {
      result[key] = this.get(key);
    });
    return result;
  }
} 