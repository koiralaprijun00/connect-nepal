import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface GuessHistoryCardProps {
  userPath: string[];
  allCorrectIntermediates: Set<string>;
  startDistrict: string;
  endDistrict: string;
}

export const GuessHistoryCard: React.FC<GuessHistoryCardProps> = ({ 
  userPath, 
  allCorrectIntermediates, 
  startDistrict, 
  endDistrict 
}) => {
  // Separate correct and incorrect guesses
  const correctGuesses = userPath.filter(district => 
    allCorrectIntermediates.has(district.trim().toLowerCase())
  );
  
  const incorrectGuesses = userPath.filter(district => 
    !allCorrectIntermediates.has(district.trim().toLowerCase())
  );

  return (
    <div className="p-4 rounded-lg border bg-muted text-muted-foreground shadow-sm h-full max-h-[500px] overflow-y-auto">
      <div className="text-base font-semibold mb-4">Your Guesses</div>
      
      {userPath.length === 0 ? (
        <div className="text-sm text-muted-foreground italic">
          Your guesses will appear here. Try to find the shortest path from {startDistrict} to {endDistrict}!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Correct Guesses Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span>Correct ({correctGuesses.length})</span>
            </div>
            
            <div className="space-y-2">
              {correctGuesses.length === 0 ? (
                <div className="text-xs text-gray-500 italic">
                  No correct guesses yet
                </div>
              ) : (
                correctGuesses.map((district, idx) => (
                  <div key={`correct-${idx}`} className="flex items-center gap-2">
                    <CheckCircle className="text-green-600 w-4 h-4 flex-shrink-0" />
                    <span className="px-2 py-1 rounded bg-green-100 text-green-800 font-semibold text-sm">
                      {district}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Incorrect Guesses Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
              <XCircle className="w-4 h-4" />
              <span>Incorrect ({incorrectGuesses.length})</span>
            </div>
            
            <div className="space-y-2">
              {incorrectGuesses.length === 0 ? (
                <div className="text-xs text-gray-500 italic">
                  No incorrect guesses yet
                </div>
              ) : (
                incorrectGuesses.map((district, idx) => (
                  <div key={`incorrect-${idx}`} className="flex items-center gap-2">
                    <XCircle className="text-red-500 w-4 h-4 flex-shrink-0" />
                    <span className="text-sm text-red-700 font-medium">
                      {district}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Summary Stats */}
      {userPath.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-300">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Total Guesses: {userPath.length}</span>
            <span>Accuracy: {userPath.length > 0 ? Math.round((correctGuesses.length / userPath.length) * 100) : 0}%</span>
          </div>
        </div>
      )}
    </div>
  );
};