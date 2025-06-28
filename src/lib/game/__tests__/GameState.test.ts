import { describe, it, expect } from 'vitest';
import { gameStateReducer, createInitialGameState, GameAction } from '../GameState';
import type { Puzzle, GuessResult, FeedbackMessage } from '@/types';

const mockPuzzle: Puzzle = {
  id: 'test-puzzle',
  startDistrict: 'kathmandu',
  endDistrict: 'chitwan',
  shortestPath: ['kathmandu', 'lalitpur', 'chitwan'],
};

describe('GameState', () => {
  describe('createInitialGameState', () => {
    it('should create initial state correctly', () => {
      const state = createInitialGameState(mockPuzzle);
      
      expect(state.puzzle).toBe(mockPuzzle);
      expect(state.guesses).toHaveLength(0);
      expect(state.status).toBe('playing');
      expect(state.feedback).toBeNull();
      expect(state.startTime).toBeGreaterThan(0);
    });
  });

  describe('gameStateReducer', () => {
    it('should handle MAKE_GUESS action', () => {
      const initialState = createInitialGameState(mockPuzzle);
      const guessResult: GuessResult = {
        district: 'lalitpur',
        isCorrect: true,
        feedback: 'perfect',
        timestamp: Date.now(),
        distanceFromPath: 0,
      };
      const feedback: FeedbackMessage = {
        type: 'perfect',
        message: 'Perfect guess!',
      };

      const action: GameAction = {
        type: 'MAKE_GUESS',
        result: guessResult,
        feedback,
      };

      const newState = gameStateReducer(initialState, action);
      
      expect(newState.guesses).toHaveLength(1);
      expect(newState.guesses[0]).toBe(guessResult);
      expect(newState.feedback).toBe(feedback);
      expect(newState.status).toBe('won'); // Single intermediate district
    });

    it('should handle UNDO_GUESS action', () => {
      const initialState = createInitialGameState(mockPuzzle);
      const stateWithGuess = {
        ...initialState,
        guesses: [{
          district: 'lalitpur',
          isCorrect: true,
          feedback: 'perfect' as const,
          timestamp: Date.now(),
          distanceFromPath: 0,
        }],
      };

      const action: GameAction = { type: 'UNDO_GUESS' };
      const newState = gameStateReducer(stateWithGuess, action);
      
      expect(newState.guesses).toHaveLength(0);
      expect(newState.feedback).toBeNull();
      expect(newState.status).toBe('playing');
    });

    it('should handle NEW_GAME action', () => {
      const initialState = createInitialGameState(mockPuzzle);
      const stateWithGuesses = {
        ...initialState,
        guesses: [/* some guesses */],
        status: 'won' as const,
      };

      const newPuzzle: Puzzle = {
        id: 'new-puzzle',
        startDistrict: 'pokhara',
        endDistrict: 'kathmandu',
        shortestPath: ['pokhara', 'kathmandu'],
      };

      const action: GameAction = { type: 'NEW_GAME', puzzle: newPuzzle };
      const newState = gameStateReducer(stateWithGuesses, action);
      
      expect(newState.puzzle).toBe(newPuzzle);
      expect(newState.guesses).toHaveLength(0);
      expect(newState.status).toBe('playing');
      expect(newState.feedback).toBeNull();
    });
  });
});