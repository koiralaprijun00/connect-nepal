import React from "react";
import { CheckCircle, XCircle} from 'lucide-react';
import { findAllShortestPaths } from '@/lib/puzzle';

interface GuessHistoryPanelProps {
  guessHistory: string[][];
  startDistrict: string;
  endDistrict: string;
  correctPath: string[];
}

export function GuessHistoryPanel({ guessHistory, startDistrict, endDistrict, correctPath }: GuessHistoryPanelProps) {
  // Set of all unique intermediate districts from all valid shortest paths
  const allShortestPaths = findAllShortestPaths(startDistrict, endDistrict);
  const allIntermediates = new Set(
    allShortestPaths.flatMap(path => path.slice(1, -1).map(d => d.trim().toLowerCase()))
  );

  return (
    <div className="p-4 rounded-lg border bg-muted text-muted-foreground shadow-sm">
      <div className="flex flex-col gap-2">
        {guessHistory.length === 0 ? (
          <div className="text-sm text-muted-foreground italic">
            Your guesses will appear here. Try to find the shortest path from {startDistrict} to {endDistrict}!
          </div>
        ) : (
          guessHistory.map((guess, idx) => {
            const district = guess[0];
            const isCorrect = allIntermediates.has(district.trim().toLowerCase());
            return (
              <div key={idx} className="flex items-center gap-2">
                {isCorrect ? (
                  <CheckCircle className="text-green-600 w-5 h-5" />
                ) : (
                  <XCircle className="text-red-500 w-5 h-5" />
                )}
                <span className="text-xs font-bold text-gray-500">{idx + 1}.</span>
                <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 font-semibold">
                  {district}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 