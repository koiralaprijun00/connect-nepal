import React from 'react';
import type { Puzzle } from '@/types';
import { GuessResult } from '@/lib/gameLogic';
import { InteractiveNepalMap } from '@/components/InteractiveNepalMap';

interface SequentialModeProps {
  puzzle: Puzzle;
  userPath: string[];
  guessHistory: GuessResult[];
  timeElapsed: number;
  onGuess: (district: string) => void;
  onUndo: () => void;
  onHint: () => void;
  isGameWon: boolean;
  lastFeedback: { type: string; message: string } | null;
}

export function SequentialMode({
  puzzle,
  userPath,
  guessHistory,
  timeElapsed,
  onGuess,
  onUndo,
  onHint,
  isGameWon,
  lastFeedback
}: SequentialModeProps) {
  // Only allow the next correct district as a guess
  const nextStep = puzzle.shortestPath[userPath.length + 1];
  return (
    <div className="flex flex-col gap-4">
      <InteractiveNepalMap
        guessedPath={userPath}
        correctPath={puzzle.shortestPath}
        startDistrict={puzzle.startDistrict}
        endDistrict={puzzle.endDistrict}
        onDistrictClick={d => d.toLowerCase() === nextStep?.toLowerCase() && onGuess(d)}
        showAdjacencies={false}
        showHints={false}
      />
    </div>
  );
} 