import React from 'react';
import type { Puzzle } from '@/types';
import { GuessResult } from '@/lib/enhancedGameLogic';
import { GuessInput } from '@/components/nepal-traversal/GuessInput';
import { GuessHistoryCard } from '@/components/nepal-traversal/GuessHistoryCard';

interface ClassicModeProps {
  puzzle: Puzzle;
  userPath: string[];
  guessHistory: GuessResult[];
  onGuess: (district: string) => void;
  onUndo: () => void;
  onHint: () => void;
  isGameWon: boolean;
  lastFeedback: { type: string; message: string } | null;
  allCorrectIntermediates: Set<string>;
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
  allCorrectIntermediates
}: ClassicModeProps) {
  // Determine if undo is available
  const canUndo = guessHistory.length > 0;
  
  return (
    <div className="flex flex-col gap-4">
      <GuessInput
        onSubmit={([district]) => {
          console.log('GuessInput onSubmit called with:', district); // Debug log
          onGuess(district);
        }}
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
      
      <div className="flex flex-row gap-4">
        <div className="max-w-xs w-full">
          <GuessHistoryCard
            userPath={userPath}
            allCorrectIntermediates={allCorrectIntermediates}
            startDistrict={puzzle.startDistrict}
            endDistrict={puzzle.endDistrict}
          />
        </div>
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