import React from 'react';

export function GameOverModal({
  isWon,
  score,
  timeElapsed,
  accuracy,
  shareText,
  onNewGame,
  onShare
}: {
  isWon: boolean;
  score: number;
  timeElapsed: number;
  accuracy: number;
  shareText: string;
  onNewGame: () => void;
  onShare: () => void;
}) {
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">
            {isWon ? '🎉' : '💪'}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {isWon ? 'Congratulations!' : 'Good Try!'}
          </h2>
          <p className="text-muted-foreground">
            {isWon ? 'You found the shortest path!' : 'Better luck next time!'}
          </p>
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span>Final Score:</span>
            <span className="font-bold text-primary">{score}</span>
          </div>
          <div className="flex justify-between">
            <span>Time:</span>
            <span className="font-bold">{minutes}:{seconds.toString().padStart(2, '0')}</span>
          </div>
          <div className="flex justify-between">
            <span>Accuracy:</span>
            <span className="font-bold">{accuracy}%</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onShare}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            📱 Share Result
          </button>
          <button
            onClick={onNewGame}
            className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            🎮 New Game
          </button>
        </div>
      </div>
    </div>
  );
} 