import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface GuessHistoryCardProps {
  userPath: string[];
  correctPath: string[];
  startDistrict: string;
  endDistrict: string;
}

export const GuessHistoryCard: React.FC<GuessHistoryCardProps> = ({ userPath, correctPath, startDistrict, endDistrict }) => {
  // Only intermediate districts are correct
  const correctSet = new Set(correctPath.slice(1, -1).map(d => d.trim().toLowerCase()));
  return (
    <div className="p-4 rounded-lg border bg-muted text-muted-foreground shadow-sm h-full max-h-[500px] overflow-y-auto">
      <div className="text-base font-semibold mb-2">Your Guesses</div>
      <div className="flex flex-col gap-2">
        {userPath.length === 0 ? (
          <div className="text-sm text-muted-foreground italic">
            Your guesses will appear here. Try to find the shortest path from {startDistrict} to {endDistrict}!
          </div>
        ) : (
          userPath.map((district, idx) => {
            const isCorrect = correctSet.has(district.trim().toLowerCase());
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
}; 