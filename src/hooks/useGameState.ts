import { useReducer, useMemo, useCallback, useRef, useEffect } from 'react';
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
  
  // Use ref to maintain engine instance across renders
  const engineRef = useRef<GameEngine | null>(null);
  
  // Initialize or update engine when puzzle changes
  useEffect(() => {
    engineRef.current = new GameEngine(state.puzzle, adjacencyMap);
  }, [state.puzzle, adjacencyMap]);

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
      if (!engineRef.current) return;
      
      console.log('Making guess:', district);
      const result = engineRef.current.makeGuess(district);
      console.log('Guess result:', result);
      
      const feedback = {
        type: result.feedback,
        message: generateFeedbackMessage(result.feedback, result.district)
      };
      
      dispatch({ 
        type: 'MAKE_GUESS', 
        result, 
        feedback 
      });
    },
    
    undoGuess: () => {
      if (!engineRef.current) return;
      
      const success = engineRef.current.undoLastGuess();
      if (success) {
        dispatch({ type: 'UNDO_GUESS' });
      }
    },
    
    getHint: () => {
      if (!engineRef.current) return null;
      return engineRef.current.getHint();
    },
    
    newGame: (puzzle: Puzzle) => {
      dispatch({ type: 'NEW_GAME', puzzle });
    },
  }), []);

  return {
    state,
    engine: engineRef.current!,
    actions,
    derived,
  };
}

// Helper function to generate feedback messages
function generateFeedbackMessage(feedbackType: string, district: string): string {
  switch (feedbackType) {
    case 'perfect':
      return `🎯 Perfect! ${district} is on the shortest path!`;
    case 'close':
      return '🔥 Very close! Adjacent to the correct path.';
    case 'warm':
      return '🌊 Getting warmer! 2 districts away.';
    case 'cold':
      return '❄️ Too far from the correct path.';
    case 'duplicate':
      return '🔄 You already guessed this district!';
    case 'invalid':
      return '🚫 Invalid district name.';
    default:
      return 'Try again!';
  }
}