import React from 'react';
import type { Puzzle } from '@/types';
import { GuessResult } from '@/lib/gameLogic';
import { InteractiveNepalMap } from '@/components/InteractiveNepalMap';
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
  return (
    <div className="flex flex-col gap-4">
      <GuessInput
        onSubmit={([district]) => onGuess(district)}
        isLoading={false}
        startDistrict={puzzle.startDistrict}
        endDistrict={puzzle.endDistrict}
        latestGuessResult={lastFeedback ? {
          type: lastFeedback.type === 'perfect' ? 'success' : 'error',
          message: lastFeedback.message
        } : null}
        isGameWon={isGameWon}
      />
      <div className="flex flex-row gap-4">
        <div className="flex-1">
          <InteractiveNepalMap
            guessedPath={userPath}
            correctPath={puzzle.shortestPath}
            startDistrict={puzzle.startDistrict}
            endDistrict={puzzle.endDistrict}
          />
        </div>
        <div className="max-w-xs w-full">
          <GuessHistoryCard
            userPath={userPath}
            allCorrectIntermediates={allCorrectIntermediates}
            startDistrict={puzzle.startDistrict}
            endDistrict={puzzle.endDistrict}
          />
        </div>
      </div>
    </div>
  );
} 