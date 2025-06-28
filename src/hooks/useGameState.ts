import { useReducer, useMemo, useCallback } from 'react';
import { GameEngine } from '@/lib/game/GameEngine';
import { GameState, gameStateReducer, createInitialGameState } from '@/lib/game/GameState';
import type { Puzzle } from '@/types';

interface UseGameStateReturn {
  state: GameState;
  engine: GameEngine;
  actions: {
    makeGuess: (district: string) => void;
    undoGuess: () => void;
    getHint: () => string | null;
    newGame: (puzzle: Puzzle) => void;
  };
  derived: {
    userPath: string[];
    correctIntermediates: Set<string>;
    isGameWon: boolean;
    canUndo: boolean;
  };
}

export function useGameState(
  initialPuzzle: Puzzle,
  adjacencyMap: Record<string, string[]>
): UseGameStateReturn {
  const [state, dispatch] = useReducer(gameStateReducer, createInitialGameState(initialPuzzle));
  
  // Create game engine instance - memoized to prevent recreation
  const engine = useMemo(() => {
    const gameEngine = new GameEngine(state.puzzle, adjacencyMap);
    
    // Sync engine state with reducer state
    for (const guess of state.guesses) {
      gameEngine.makeGuess(guess.district);
    }
    
    return gameEngine;
  }, [state.puzzle, adjacencyMap]); // Only recreate when puzzle changes

  // Memoized derived state
  const derived = useMemo(() => ({
    userPath: state.guesses.map(g => g.district),
    correctIntermediates: new Set(
      state.puzzle.shortestPath.slice(1, -1).map(d => d.toLowerCase())
    ),
    isGameWon: state.status === 'won',
    canUndo: state.guesses.length > 0,
  }), [state.guesses, state.puzzle.shortestPath, state.status]);

  // Memoized actions
  const actions = useMemo(() => ({
    makeGuess: (district: string) => {
      const result = engine.makeGuess(district);
      // Engine handles its own state, we just need to sync
      const newState = engine.getState();
      dispatch({ type: 'INITIALIZE_GAME', puzzle: newState.puzzle });
    },
    
    undoGuess: () => {
      const success = engine.undoLastGuess();
      if (success) {
        const newState = engine.getState();
        dispatch({ type: 'INITIALIZE_GAME', puzzle: newState.puzzle });
      }
    },
    
    getHint: () => engine.getHint(),
    
    newGame: (puzzle: Puzzle) => {
      dispatch({ type: 'NEW_GAME', puzzle });
    },
  }), [engine]);

  return {
    state,
    engine,
    actions,
    derived,
  };
}