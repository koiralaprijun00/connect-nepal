import React from 'react';
import type { Puzzle } from '@/types';
import { GuessResult, FeedbackMessage } from '@/lib/game/GameState';
import { GuessInput } from '@/components/nepal-traversal/GuessInput';
import { GuessHistoryCard } from '@/components/nepal-traversal/GuessHistoryCard';
import NepalMap from '@/components/nepal-map/NepalMap';

interface ClassicModeProps {
  puzzle: Puzzle;
  userPath: string[];
  guessHistory: readonly GuessResult[];
  onGuess: (district: string) => void;
  onUndo: () => void;
  onHint: () => string | null;
  isGameWon: boolean;
  lastFeedback: FeedbackMessage | null;
  allCorrectIntermediates: Set<string>;
  canUndo: boolean;
}

export function ClassicMode({
  puzzle,
  userPath,
  guessHistory,
  onGuess,
  onUndo,
  onHint,
  isGameWon,
  lastFeedback,
  allCorrectIntermediates,
  canUndo
}: ClassicModeProps) {
  // Get correct and incorrect guesses for map
  const correctGuesses = guessHistory
    .filter(g => g.isCorrect)
    .map(g => g.district);
  
  const incorrectGuesses = guessHistory
    .filter(g => !g.isCorrect && g.feedback !== 'duplicate')
    .map(g => g.district);

  // Handle hint with feedback
  const handleHint = () => {
    const hint = onHint();
    // The hint logic is handled by the game engine
    // Feedback will be managed by the game state
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Main game content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left side: Game inputs and history */}
        <div className="flex flex-col gap-4 lg:w-1/3">
          <GuessInput
            onSubmit={([district]) => onGuess(district)}
            onUndo={onUndo}
            isLoading={false}
            startDistrict={puzzle.startDistrict}
            endDistrict={puzzle.endDistrict}
            latestGuessResult={lastFeedback ? {
              type: lastFeedback.type === 'perfect' ? 'success' : 'error',
              message: lastFeedback.message
            } : null}
            isGameWon={isGameWon}
            canUndo={canUndo}
          />
          
          <GuessHistoryCard
            userPath={userPath}
            allCorrectIntermediates={allCorrectIntermediates}
            startDistrict={puzzle.startDistrict}
            endDistrict={puzzle.endDistrict}
          />
        </div>
        
        {/* Right side: Nepal Map */}
        <div className="flex-1 lg:w-2/3">
          <NepalMap
            startDistrict={puzzle.startDistrict}
            endDistrict={puzzle.endDistrict}
            correctGuesses={correctGuesses}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Display the answer (shortest path) for testing - can be removed in production */}
      <div className="mb-2 p-2 bg-yellow-50 border border-yellow-300 rounded text-yellow-900 text-sm font-mono flex flex-wrap items-center gap-2">
        <span className="font-bold">Answer:</span>
        {puzzle.shortestPath.map((district, idx) => (
          <React.Fragment key={district}>
            <span>{district}</span>
            {idx < puzzle.shortestPath.length - 1 && <span className="mx-1">→</span>}
          </React.Fragment>
        ))}
      </div>
      
      {/* Game won celebration */}
      {isGameWon && (
        <div className="p-4 bg-green-50 border border-green-300 rounded-lg text-green-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            <div>
              <div className="font-bold text-lg">Congratulations!</div>
              <div className="text-sm">You found the shortest path in {guessHistory.length} guesses!</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}