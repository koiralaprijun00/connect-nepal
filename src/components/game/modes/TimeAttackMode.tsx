import React from 'react';
import type { Puzzle } from '@/types';
import { GuessResult } from '@/lib/gameLogic';
import { EnhancedGuessInput, EnhancedGuessHistory } from '@/components/EnhancedGameUI';
import { InteractiveNepalMap } from '@/components/InteractiveNepalMap';

interface TimeAttackModeProps {
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

export function TimeAttackMode({
  puzzle,
  userPath,
  guessHistory,
  timeElapsed,
  onGuess,
  onUndo,
  onHint,
  isGameWon,
  lastFeedback
}: TimeAttackModeProps) {
  // Optionally, display time left (e.g., 5 min = 300s)
  const timeLimit = 300;
  const timeLeft = Math.max(0, timeLimit - timeElapsed);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center text-lg font-semibold text-blue-700">
        Time Left: {minutes}:{seconds.toString().padStart(2, '0')}
      </div>
      <InteractiveNepalMap
        guessedPath={userPath}
        correctPath={puzzle.shortestPath}
        startDistrict={puzzle.startDistrict}
        endDistrict={puzzle.endDistrict}
        onDistrictClick={onGuess}
        showAdjacencies={false}
        showHints={false}
      />
      <EnhancedGuessInput
        onGuess={onGuess}
        onUndo={onUndo}
        onHint={onHint}
        canUndo={userPath.length > 0}
        hintsRemaining={3}
        isLoading={false}
        lastFeedback={lastFeedback}
        suggestedDistricts={puzzle.shortestPath}
      />
      <EnhancedGuessHistory
        guesses={guessHistory}
        correctPath={puzzle.shortestPath.slice(1, -1)}
      />
    </div>
  );
} 