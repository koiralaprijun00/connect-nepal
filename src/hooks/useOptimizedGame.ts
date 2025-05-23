import { useReducer, useCallback, useMemo } from 'react';
import { FeedbackSystem, GameScoring, DifficultyProgression, GuessResult, GameSession } from '@/lib/gameLogic';
import { DISTRICT_ADJACENCY } from '@/lib/puzzle';
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
  userPath: string[];
  guessHistory: GuessResult[];
  gameSession: GameSession;
  hints: { used: boolean; count: number };
  mode: string;
  lastFeedback: { type: string; message: string } | null;
  timeElapsed: number;
}

type GameAction =
  | { type: 'MAKE_GUESS'; district: string; guessResult: GuessResult }
  | { type: 'UNDO_GUESS' }
  | { type: 'USE_HINT' }
  | { type: 'NEW_GAME'; puzzle: Puzzle }
  | { type: 'SET_MODE'; mode: string }
  | { type: 'SET_FEEDBACK'; feedback: { type: string; message: string } | null }
  | { type: 'SET_TIME_ELAPSED'; timeElapsed: number };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'MAKE_GUESS':
      return {
        ...state,
        userPath: [...state.userPath, action.district],
        guessHistory: [...state.guessHistory, action.guessResult],
        lastFeedback: { type: action.guessResult.feedback, message: action.guessResult.feedback },
      };
    case 'UNDO_GUESS':
      return {
        ...state,
        userPath: state.userPath.slice(0, -1),
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
        userPath: [],
        guessHistory: [],
        gameSession: {
          ...state.gameSession,
          startTime: now,
          score: 0,
          hintsUsed: 0,
          puzzle: action.puzzle,
        },
        hints: { used: false, count: 0 },
        lastFeedback: null,
        timeElapsed: 0,
      };
    }
    case 'SET_MODE':
      return { ...state, mode: action.mode };
    case 'SET_FEEDBACK':
      return { ...state, lastFeedback: action.feedback };
    case 'SET_TIME_ELAPSED':
      return { ...state, timeElapsed: action.timeElapsed };
    default:
      return state;
  }
}

export function useOptimizedGame(initialPuzzle: Puzzle) {
  const [state, dispatch] = useReducer(gameReducer, {
    puzzle: initialPuzzle,
    userPath: [],
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
    timeElapsed: 0,
  });

  // Memoized correct path
  const correctPath = useMemo(() =>
    state.puzzle.shortestPath.slice(1, -1).map(d => d.trim().toLowerCase()),
    [state.puzzle.shortestPath]
  );

  // Efficient isGameWon
  const isGameWon = useMemo(() => {
    const userPathSet = new Set(state.userPath.map(d => d.trim().toLowerCase()));
    return correctPath.every(d => userPathSet.has(d));
  }, [correctPath, state.userPath]);

  // Efficient currentScore
  const currentScore = useMemo(() =>
    GameScoring.calculateScore(
      state.gameSession,
      state.timeElapsed,
      state.guessHistory.length
    ),
    [state.gameSession, state.timeElapsed, state.guessHistory.length]
  );

  // Guess handler
  const makeGuess = useCallback((district: string) => {
    const feedback = FeedbackSystem.getFeedbackForGuess(
      district,
      state.puzzle.shortestPath.slice(1, -1),
      DISTRICT_ADJACENCY
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
  }, [state.puzzle, state.userPath.length]);

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

  const updateTime = useCallback((timeElapsed: number) => {
    dispatch({ type: 'SET_TIME_ELAPSED', timeElapsed });
  }, []);

  return {
    state: {
      ...state,
      isGameWon,
      currentScore,
      correctPath,
    },
    actions: {
      makeGuess,
      undoGuess,
      useHint,
      startNewGame,
      setMode,
      updateTime,
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