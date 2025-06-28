import type { Puzzle } from '@/types';

export interface GuessResult {
  district: string;
  isCorrect: boolean;
  feedback: FeedbackType;
  timestamp: number;
  distanceFromPath: number;
  pathPosition?: number;
}

export type FeedbackType = 'perfect' | 'close' | 'warm' | 'cold' | 'invalid' | 'duplicate';

export type GameStatus = 'loading' | 'playing' | 'won' | 'error';

export interface FeedbackMessage {
  type: FeedbackType | 'info' | 'hint' | 'error';
  message: string;
}

export interface GameState {
  readonly puzzle: Puzzle;
  readonly guesses: readonly GuessResult[];
  readonly status: GameStatus;
  readonly feedback: FeedbackMessage | null;
  readonly startTime: number;
}

export type GameAction =
  | { type: 'INITIALIZE_GAME'; puzzle: Puzzle }
  | { type: 'MAKE_GUESS'; result: GuessResult; feedback: FeedbackMessage }
  | { type: 'UNDO_GUESS' }
  | { type: 'NEW_GAME'; puzzle: Puzzle }
  | { type: 'SET_FEEDBACK'; feedback: FeedbackMessage | null }
  | { type: 'SET_STATUS'; status: GameStatus };

export function createInitialGameState(puzzle: Puzzle): GameState {
  return {
    puzzle,
    guesses: [],
    status: 'playing',
    feedback: null,
    startTime: Date.now(),
  };
}

export function gameStateReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INITIALIZE_GAME':
      return createInitialGameState(action.puzzle);

    case 'MAKE_GUESS':
      const newGuesses = [...state.guesses, action.result];
      const isGameWon = checkGameWon(newGuesses, state.puzzle);
      
      return {
        ...state,
        guesses: newGuesses,
        feedback: action.feedback,
        status: isGameWon ? 'won' : 'playing',
      };

    case 'UNDO_GUESS':
      if (state.guesses.length === 0) return state;
      return {
        ...state,
        guesses: state.guesses.slice(0, -1),
        feedback: null,
        status: 'playing',
      };

    case 'NEW_GAME':
      return createInitialGameState(action.puzzle);

    case 'SET_FEEDBACK':
      return {
        ...state,
        feedback: action.feedback,
      };

    case 'SET_STATUS':
      return {
        ...state,
        status: action.status,
      };

    default:
      return state;
  }
}

// Helper function to check if game is complete
function checkGameWon(guesses: readonly GuessResult[], puzzle: Puzzle): boolean {
  const correctGuesses = new Set(
    guesses
      .filter(g => g.isCorrect)
      .map(g => g.district.toLowerCase())
  );
  
  const requiredIntermediates = puzzle.shortestPath
    .slice(1, -1) // Remove start and end
    .map(d => d.toLowerCase());
  
  return requiredIntermediates.every(district => correctGuesses.has(district));
}