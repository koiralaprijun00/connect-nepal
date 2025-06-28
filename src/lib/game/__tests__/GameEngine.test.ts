import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../GameEngine';
import type { Puzzle } from '@/types';

const mockAdjacencyMap = {
  kathmandu: ['lalitpur', 'bhaktapur'],
  lalitpur: ['kathmandu', 'bhaktapur'],
  bhaktapur: ['kathmandu', 'lalitpur'],
  chitwan: ['makwanpur'],
  makwanpur: ['chitwan', 'lalitpur'],
};

const mockPuzzle: Puzzle = {
  id: 'test-puzzle',
  startDistrict: 'kathmandu',
  endDistrict: 'chitwan',
  shortestPath: ['kathmandu', 'lalitpur', 'makwanpur', 'chitwan'],
};

describe('GameEngine', () => {
  let gameEngine: GameEngine;

  beforeEach(() => {
    gameEngine = new GameEngine(mockPuzzle, mockAdjacencyMap);
  });

  describe('makeGuess', () => {
    it('should accept correct intermediate district', () => {
      const result = gameEngine.makeGuess('lalitpur');
      
      expect(result.isCorrect).toBe(true);
      expect(result.feedback).toBe('perfect');
      expect(result.district).toBe('lalitpur');
    });

    it('should reject invalid district', () => {
      const result = gameEngine.makeGuess('invalid-district');
      
      expect(result.isCorrect).toBe(false);
      expect(result.feedback).toBe('invalid');
    });

    it('should detect duplicate guesses', () => {
      gameEngine.makeGuess('lalitpur');
      const result = gameEngine.makeGuess('lalitpur');
      
      expect(result.feedback).toBe('duplicate');
    });

    it('should provide distance-based feedback', () => {
      const result = gameEngine.makeGuess('bhaktapur');
      
      expect(result.isCorrect).toBe(false);
      expect(['close', 'warm', 'cold']).toContain(result.feedback);
    });
  });

  describe('game completion', () => {
    it('should detect win condition', () => {
      gameEngine.makeGuess('lalitpur');
      gameEngine.makeGuess('makwanpur');
      
      expect(gameEngine.isGameWon()).toBe(true);
    });

    it('should not be won with partial correct guesses', () => {
      gameEngine.makeGuess('lalitpur');
      
      expect(gameEngine.isGameWon()).toBe(false);
    });
  });

  describe('undo functionality', () => {
    it('should undo last guess', () => {
      gameEngine.makeGuess('lalitpur');
      expect(gameEngine.getGuessHistory()).toHaveLength(1);
      
      const success = gameEngine.undoLastGuess();
      expect(success).toBe(true);
      expect(gameEngine.getGuessHistory()).toHaveLength(0);
    });

    it('should return false when no guesses to undo', () => {
      const success = gameEngine.undoLastGuess();
      expect(success).toBe(false);
    });
  });

  describe('hints', () => {
    it('should provide next required district as hint', () => {
      const hint = gameEngine.getHint();
      expect(['lalitpur', 'makwanpur']).toContain(hint);
    });

    it('should provide remaining districts after some correct guesses', () => {
      gameEngine.makeGuess('lalitpur');
      const hint = gameEngine.getHint();
      expect(hint).toBe('makwanpur');
    });

    it('should return null when all districts guessed', () => {
      gameEngine.makeGuess('lalitpur');
      gameEngine.makeGuess('makwanpur');
      const hint = gameEngine.getHint();
      expect(hint).toBeNull();
    });
  });
});