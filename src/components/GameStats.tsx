import React from 'react';

export function GameStats({
  score,
  timeElapsed,
  streak,
  guessCount,
  totalGuesses,
  difficulty,
  mode
}: {
  score: number;
  timeElapsed: number;
  streak: number;
  guessCount: number;
  totalGuesses: number;
  difficulty: string;
  mode: string;
}) {
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;
  const accuracy = totalGuesses > 0 ? Math.round((guessCount / totalGuesses) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
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
        <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
        <div className="text-sm text-muted-foreground">Accuracy</div>
      </div>
    </div>
  );
} 