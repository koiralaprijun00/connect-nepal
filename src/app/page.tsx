"use client";
import React, { useEffect, useState } from 'react';
import { getRandomPuzzle } from '@/lib/puzzle';
import { useOptimizedGame, GameStorage } from '@/hooks/useOptimizedGame';
import { GameModeSelector } from '@/components/game/GameModeSelector';
import { ClassicMode } from '@/components/game/modes/ClassicMode';
import { AchievementToast } from '@/components/AchievementToast';
import GameHeader from '@/components/game/GameHeader';
import type { Puzzle } from '@/types';

const GAME_MODES = [
  { id: 'classic', name: 'Classic', description: 'Find all districts in any order' }
];

// Default puzzle to prevent hydration issues
const DEFAULT_PUZZLE: Puzzle = {
  id: 'default',
  startDistrict: 'kathmandu',
  endDistrict: 'chitwan',
  shortestPath: ['kathmandu', 'dhading', 'chitwan']
};

export default function NepalTraversalPage() {
  const [isClient, setIsClient] = useState(false);
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle>(DEFAULT_PUZZLE);
  const { state, actions } = useOptimizedGame(currentPuzzle);
  const [showAchievement, setShowAchievement] = useState<any>(null);
  const [achievements, setAchievements] = useState<string[]>([]);

  // Initialize client-side only
  useEffect(() => {
    setIsClient(true);
    // Generate initial puzzle after hydration
    const initialPuzzle = getRandomPuzzle(true, 6);
    setCurrentPuzzle(initialPuzzle);
    actions.startNewGame(initialPuzzle);
  }, []);

  // Achievement checking
  useEffect(() => {
    if (!isClient) return;
    checkAchievements();
  }, [state.guessHistory, state.isGameWon, isClient]);

  const checkAchievements = () => {
    const newAchievements = [];
    const unlockedAchievements = GameStorage.get('achievements') || [];
    if (state.isGameWon && !unlockedAchievements.includes('speed_demon')) {
      newAchievements.push({
        id: 'speed_demon',
        emoji: '⚡',
        label: 'Puzzle Master',
        description: 'Completed a puzzle!',
      });
    }
    const wrongGuesses = state.guessHistory.filter(g => !g.isCorrect).length;
    if (state.isGameWon && wrongGuesses === 0 && !unlockedAchievements.includes('perfect_path')) {
      newAchievements.push({
        id: 'perfect_path',
        emoji: '🎯',
        label: 'Perfect Path',
        description: 'No wrong guesses!'
      });
    }
    if (newAchievements.length > 0) {
      const updatedAchievements = [...unlockedAchievements, ...newAchievements.map(a => a.id)];
      GameStorage.set('achievements', updatedAchievements);
      setAchievements(updatedAchievements);
      setShowAchievement(newAchievements[0]);
    }
  };

  const handleNewGame = () => {
    const newPuzzle = getRandomPuzzle(true, 6);
    setCurrentPuzzle(newPuzzle);
    actions.startNewGame(newPuzzle);
  };

  const handleShare = () => {
    const shareText = generateShareText();
    if (navigator.share) {
      navigator.share({ text: shareText });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
    }
  };

  const generateShareText = () => {
    const emojiGrid = state.guessHistory.map(g =>
      g.isCorrect ? '🟩' :
      g.distanceFromPath === 1 ? '🟧' :
      g.distanceFromPath === 2 ? '🟦' : '⬜️'
    ).join('');
    return `Nepal Traversal ${state.mode}\n${emojiGrid}`;
  };

  const renderGameMode = () => {
    const commonProps = {
      puzzle: state.puzzle,
      userPath: state.userPath,
      guessHistory: state.guessHistory,
      onGuess: actions.makeGuess,
      onUndo: actions.undoGuess,
      onHint: actions.useHint,
      isGameWon: state.isGameWon,
      lastFeedback: state.lastFeedback,
      allCorrectIntermediates: state.allCorrectIntermediates,
    };
    return <ClassicMode {...commonProps} />;
  };

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <GameHeader
            startDistrict={DEFAULT_PUZZLE.startDistrict}
            endDistrict={DEFAULT_PUZZLE.endDistrict}
            mode="classic"
          />
          <div className="px-8 py-3 bg-muted rounded-lg font-semibold animate-pulse">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <GameHeader
          startDistrict={state.puzzle.startDistrict}
          endDistrict={state.puzzle.endDistrict}
          mode={state.mode}
        />
        <button
          onClick={handleNewGame}
          className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg"
        >
          🎮 New Game
        </button>
      </div>
      <GameModeSelector
        currentMode={state.mode}
        modes={GAME_MODES}
        onModeChange={actions.setMode}
      />
      {renderGameMode()}
      {showAchievement && (
        <AchievementToast
          achievement={showAchievement}
          onClose={() => setShowAchievement(null)}
        />
      )}
    </div>
  );
}
