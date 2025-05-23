import React from 'react';

interface GameStatsProps {
  score: number;
  timeElapsed: number;
  streak: number;
  remaining: number;
  accuracy?: number;
}

export function GameStats({ score, timeElapsed, streak, remaining, accuracy }: GameStatsProps) {
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-lg">
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">{score}</div>
        <div className="text-sm text-muted-foreground">Score</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
        <div className="text-sm text-muted-foreground">Time</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-500">{streak}</div>
        <div className="text-sm text-muted-foreground">Streak</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{remaining}</div>
        <div className="text-sm text-muted-foreground">Remaining</div>
      </div>
      {typeof accuracy === 'number' && (
        <div className="text-center col-span-2 md:col-span-1">
          <div className="text-2xl font-bold text-purple-600">{accuracy}%</div>
          <div className="text-sm text-muted-foreground">Accuracy</div>
        </div>
      )}
    </div>
  );
} 