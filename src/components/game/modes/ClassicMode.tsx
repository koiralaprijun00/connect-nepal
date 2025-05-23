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
}

export function ClassicMode({
  puzzle,
  userPath,
  guessHistory,
  onGuess,
  onUndo,
  onHint,
  isGameWon,
  lastFeedback
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
        <div className="w-[70%]">
          <InteractiveNepalMap
            guessedPath={userPath}
            correctPath={puzzle.shortestPath}
            startDistrict={puzzle.startDistrict}
            endDistrict={puzzle.endDistrict}
            onDistrictClick={onGuess}
            showAdjacencies={false}
            showHints={false}
          />
        </div>
        <div className="w-[30%]">
          <GuessHistoryCard
            userPath={userPath}
            correctPath={puzzle.shortestPath}
            startDistrict={puzzle.startDistrict}
            endDistrict={puzzle.endDistrict}
          />
        </div>
      </div>
    </div>
  );
} 