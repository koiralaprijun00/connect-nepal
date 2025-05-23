"use client";
import React from 'react';
import { Mountain, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CombinedHeaderPuzzleProps {
  startDistrict: string;
  endDistrict: string;
  mode?: string;
  difficulty?: string;
  timeRemaining?: number;
}

export function CombinedHeaderPuzzle({ 
  startDistrict, 
  endDistrict,
  mode,
  difficulty,
  timeRemaining 
}: CombinedHeaderPuzzleProps) {
  return (
    <div className="relative overflow-hidden py-6 mb-6 rounded-lg w-full bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Game Mode Indicator */}
        {mode && mode !== 'classic' && (
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-sm font-medium">
              {mode === 'timeAttack' ? 'Time Attack' : 
               mode === 'sequential' ? 'Sequential Mode' :
               mode === 'exploration' ? 'Exploration' :
               mode === 'challenge' ? 'Daily Challenge' : mode}
            </Badge>
            {difficulty && (
              <Badge variant={difficulty === 'hard' ? 'destructive' : difficulty === 'medium' ? 'default' : 'secondary'}>
                {difficulty.toUpperCase()}
              </Badge>
            )}
            {timeRemaining !== undefined && (
              <Badge variant={timeRemaining < 30 ? 'destructive' : 'default'}>
                ⏱️ {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </Badge>
            )}
          </div>
        )}

        {/* Main Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="text-4xl">🏔️</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
            Nepal Traversal
          </h1>
        </div>

        {/* Journey Display */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-foreground text-md font-medium">Find path from</span>
          <div className="px-4 py-2 rounded-lg text-xl font-bold text-white bg-gradient-to-r from-green-500 to-green-600 shadow-lg">
            {startDistrict.charAt(0).toUpperCase() + startDistrict.slice(1)}
          </div>
          <div className="text-2xl text-primary animate-pulse">→</div>
          <div className="px-4 py-2 rounded-lg text-xl font-bold text-white bg-gradient-to-r from-red-500 to-red-600 shadow-lg">
            {endDistrict.charAt(0).toUpperCase() + endDistrict.slice(1)}
          </div>
        </div>
      </div>
    </div>
  );
}
