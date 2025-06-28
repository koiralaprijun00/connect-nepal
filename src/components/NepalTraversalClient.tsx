"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { getRandomPuzzle, DISTRICT_ADJACENCY } from '@/lib/puzzle';
import { useGameState } from '@/hooks/useGameState';
import { ClassicMode } from '@/components/game/modes/ClassicMode';
import GameHeader from '@/components/game/GameHeader';
import { GameErrorBoundary } from '@/components/ErrorBoundary';
import type { Puzzle } from '@/types';

// Default puzzle to prevent hydration issues
const DEFAULT_PUZZLE: Puzzle = {
  id: 'default',
  startDistrict: 'kathmandu',
  endDistrict: 'chitwan',
  shortestPath: ['kathmandu', 'dhading', 'chitwan']
};

export function NepalTraversalClient() {
  const [isClient, setIsClient] = useState(false);
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle>(DEFAULT_PUZZLE);
  
  // Use the new game state hook
  const { state, engine, actions, derived } = useGameState(currentPuzzle, DISTRICT_ADJACENCY);

  // Initialize client-side only
  useEffect(() => {
    setIsClient(true);
    // Generate initial puzzle after hydration
    try {
      const initialPuzzle = getRandomPuzzle(true, 6);
      setCurrentPuzzle(initialPuzzle);
    } catch (error) {
      console.error('Failed to generate initial puzzle:', error);
      setCurrentPuzzle(DEFAULT_PUZZLE);
    }
  }, []);

  const handleNewGame = useCallback(() => {
    try {
      const newPuzzle = getRandomPuzzle(true, 6);
      setCurrentPuzzle(newPuzzle);
      actions.newGame(newPuzzle);
    } catch (error) {
      console.error('Failed to generate new puzzle:', error);
      // Fallback to default puzzle
      setCurrentPuzzle(DEFAULT_PUZZLE);
      actions.newGame(DEFAULT_PUZZLE);
    }
  }, [actions]);

  const handleShare = useCallback(() => {
    try {
      const emojiGrid = state.guesses.map(g =>
        g.isCorrect ? '🟩' :
        g.distanceFromPath === 1 ? '🟧' :
        g.distanceFromPath === 2 ? '🟦' : '⬜️'
      ).join('');
      
      const shareText = `Nepal Traversal Classic\n${emojiGrid}`;
      
      if (navigator.share) {
        navigator.share({ text: shareText });
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText);
        // Could dispatch feedback here if needed
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [state.guesses]);

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <GameHeader
            startDistrict={DEFAULT_PUZZLE.startDistrict}
            endDistrict={DEFAULT_PUZZLE.endDistrict}
            mode="classic"
          />
          <div className="px-8 py-3 bg-muted rounded-lg font-semibold animate-pulse">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <GameErrorBoundary>
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <GameHeader
            startDistrict={currentPuzzle.startDistrict}
            endDistrict={currentPuzzle.endDistrict}
            mode="classic"
          />
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              disabled={!derived.isGameWon}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📤 Share
            </button>
            <button
              onClick={handleNewGame}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg"
            >
              🎮 New Game
            </button>
          </div>
        </div>

        <ClassicMode
          puzzle={currentPuzzle}
          userPath={derived.userPath}
          guessHistory={state.guesses}
          onGuess={actions.makeGuess}
          onUndo={actions.undoGuess}
          onHint={actions.getHint}
          isGameWon={derived.isGameWon}
          lastFeedback={state.feedback}
          allCorrectIntermediates={derived.correctIntermediates}
          canUndo={derived.canUndo}
        />
      </div>
    </GameErrorBoundary>
  );
}