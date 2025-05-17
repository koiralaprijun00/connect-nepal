import React from "react";
import { CheckCircle, XCircle, Trophy } from 'lucide-react';

interface GuessHistoryPanelProps {
  guessHistory: string[][];
  startDistrict: string;
  endDistrict: string;
  correctPath: string[];
}

export function GuessHistoryPanel({ guessHistory, startDistrict, endDistrict, correctPath }: GuessHistoryPanelProps) {
  // Reconstruct the user's full path so far
  const userIntermediatePath = guessHistory.map(g => g[0]);
  const userFullPath = [startDistrict, ...userIntermediatePath, endDistrict];
  const hasWon = userIntermediatePath.length === correctPath.slice(1, -1).length &&
    userFullPath.every((d, i) => d.trim().toLowerCase() === correctPath[i].trim().toLowerCase());

  return (
    <div className="p-4 rounded-lg border bg-muted text-muted-foreground shadow-sm">
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
          <div className="flex items-center gap-2">
            {hasWon ? (
              <CheckCircle className="text-green-600 w-5 h-5" />
            ) : (
              <span className="text-xs font-bold text-gray-500">{guessHistory.length}.</span>
            )}
            {userIntermediatePath.map((district, dIdx) => (
              <span key={district + dIdx} className="px-2 py-1 rounded bg-blue-100 text-blue-800 font-semibold">
                {district}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 