import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { Puzzle } from '@/types';

interface GameHeaderProps {
  puzzle: Puzzle;
  mode: string;
  difficulty: string;
  timeElapsed: number;
}

export function GameHeader({ puzzle, mode, difficulty, timeElapsed }: GameHeaderProps) {
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;
  return (
    <div className="relative overflow-hidden py-6 mb-6 rounded-lg w-full bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Game Mode Indicator */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-sm font-medium">
            {mode === 'timeAttack' ? 'Time Attack' : 
             mode === 'sequential' ? 'Sequential Mode' :
             mode === 'exploration' ? 'Exploration' :
             mode === 'challenge' ? 'Daily Challenge' : 'Classic'}
          </Badge>
          <Badge variant={difficulty === 'hard' ? 'destructive' : difficulty === 'medium' ? 'default' : 'secondary'}>
            {difficulty.toUpperCase()}
          </Badge>
          <Badge variant={timeElapsed < 30 ? 'destructive' : 'default'}>
            ⏱️ {minutes}:{seconds.toString().padStart(2, '0')}
          </Badge>
        </div>
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
            {puzzle.startDistrict.charAt(0).toUpperCase() + puzzle.startDistrict.slice(1)}
          </div>
          <div className="text-2xl text-primary animate-pulse">→</div>
          <div className="px-4 py-2 rounded-lg text-xl font-bold text-white bg-gradient-to-r from-red-500 to-red-600 shadow-lg">
            {puzzle.endDistrict.charAt(0).toUpperCase() + puzzle.endDistrict.slice(1)}
          </div>
        </div>
      </div>
    </div>
  );
} 