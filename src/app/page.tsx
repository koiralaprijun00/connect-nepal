"use client";
import React, { useEffect, useState } from 'react';
import { getRandomPuzzle } from '@/lib/puzzle';
import { useOptimizedGame, GameStorage } from '@/hooks/useOptimizedGame';
import { GameModeSelector } from '@/components/game/GameModeSelector';
import { ClassicMode } from '@/components/game/modes/ClassicMode';
import { SequentialMode } from '@/components/game/modes/SequentialMode';
import { AchievementToast } from '@/components/AchievementToast';
import GameHeader from '@/components/game/GameHeader';

const GAME_MODES = [
  { id: 'classic', name: 'Classic', description: 'Find all districts in any order' },
  { id: 'sequential', name: 'Sequential', description: 'Build path step by step' }
];

export default function NepalTraversalPage() {
  const [initialPuzzle] = useState(() => getRandomPuzzle(true, 6));
  const { state, actions } = useOptimizedGame(initialPuzzle);
  const [showAchievement, setShowAchievement] = useState<any>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [achievements, setAchievements] = useState<string[]>([]);

  // Game over detection
  useEffect(() => {
    if (state.isGameWon && !showGameOver) {
      setTimeout(() => setShowGameOver(true), 1000);
    }
  }, [state.isGameWon, showGameOver]);

  // Achievement checking
  useEffect(() => {
    checkAchievements();
  }, [state.guessHistory, state.isGameWon]);

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
    actions.startNewGame(newPuzzle);
    setShowGameOver(false);
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
    return `Nepal Traversal ${state.mode}\nScore: ${state.currentScore}\n${emojiGrid}`;
  };

  const remaining = state.correctPath.length - state.userPath.filter(d =>
    state.correctPath.includes(d.toLowerCase())
  ).length;

  const renderGameMode = () => {
    const commonProps = {
      puzzle: state.puzzle,
      userPath: state.userPath,
      guessHistory: state.guessHistory,
      onGuess: actions.makeGuess,
      onUndo: actions.undoGuess,
      onHint: actions.useHint,
      isGameWon: state.isGameWon,
      lastFeedback: state.lastFeedback
    };
    switch (state.mode) {
      case 'sequential':
        return <SequentialMode {...commonProps} />;
      default:
        return <ClassicMode {...commonProps} />;
    }
  };

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
