import React from "react";
import { CheckCircle, XCircle, Trophy } from 'lucide-react';

interface GuessHistoryPanelProps {
  guessHistory: string[][];
  startDistrict: string;
  endDistrict: string;
  correctPath: string[];
}

export function GuessHistoryPanel({ guessHistory, startDistrict, endDistrict, correctPath }: GuessHistoryPanelProps) {
  const hasWon = guessHistory.some(guess => {
    const fullPath = [startDistrict, ...guess, endDistrict];
    return fullPath.length === correctPath.length &&
      fullPath.every((d, i) => d.trim().toLowerCase() === correctPath[i].trim().toLowerCase());
  });

  return (
    <div className="mt-6 p-4 rounded-lg border bg-muted text-muted-foreground shadow-sm">
      <div className="font-semibold mb-2">Past Guesses:</div>
      {hasWon && (
        <div className="mb-4 p-3 rounded-lg bg-green-100 border border-green-200 text-green-800 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-green-600" />
          <span className="font-medium">Congratulations! You found the shortest path!</span>
        </div>
      )}
      <div className="flex flex-col gap-2">
        {guessHistory.length === 0 ? (
          <div className="text-sm text-muted-foreground italic">
            Your guesses will appear here. Try to find the shortest path from {startDistrict} to {endDistrict}!
          </div>
        ) : (
          guessHistory.map((guess, idx) => {
            const fullPath = [startDistrict, ...guess, endDistrict];
            const isCorrect =
              fullPath.length === correctPath.length &&
              fullPath.every((d, i) => d.trim().toLowerCase() === correctPath[i].trim().toLowerCase());
            return (
              <div key={idx} className="flex items-center gap-2">
                {isCorrect ? (
                  <CheckCircle className="text-green-600 w-5 h-5" />
                ) : (
                  <XCircle className="text-red-500 w-5 h-5" />
                )}
                <span className="text-xs font-bold text-gray-500">{idx + 1}.</span>
                {guess.map((district, dIdx) => (
                  <span key={district + dIdx} className="px-2 py-1 rounded bg-blue-100 text-blue-800 font-semibold">
                    {district}
                  </span>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 