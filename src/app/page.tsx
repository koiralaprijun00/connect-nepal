"use client";
import React, { useEffect, useState } from 'react';
import { getRandomPuzzle } from '@/lib/puzzle';
import { useOptimizedGame, GameStorage } from '@/hooks/useOptimizedGame';
import { GameHeader } from '@/components/game/GameHeader';
import { GameModeSelector } from '@/components/game/GameModeSelector';
import { GameStats } from '@/components/game/GameStats';
import { ClassicMode } from '@/components/game/modes/ClassicMode';
import { SequentialMode } from '@/components/game/modes/SequentialMode';
import { TimeAttackMode } from '@/components/game/modes/TimeAttackMode';
import { DailyChallenge } from '@/components/game/modes/DailyChallenge';
import { AchievementToast } from '@/components/AchievementToast';
import { GameOverModal } from '@/components/GameOverModal';

const GAME_MODES = [
  { id: 'classic', name: 'Classic', description: 'Find all districts in any order' },
  { id: 'sequential', name: 'Sequential', description: 'Build path step by step' },
  { id: 'timeAttack', name: 'Time Attack', description: 'Race against the clock' },
  { id: 'challenge', name: 'Daily Challenge', description: 'Special daily puzzle' }
];

export default function NepalTraversalPage() {
  const [initialPuzzle] = useState(() => getRandomPuzzle(true, 6));
  const { state, actions } = useOptimizedGame(initialPuzzle);
  const [showAchievement, setShowAchievement] = useState<any>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [achievements, setAchievements] = useState<string[]>([]);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - state.gameSession.startTime) / 1000);
      actions.updateTime(elapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, [state.gameSession.startTime, actions]);

  // Game over detection
  useEffect(() => {
    if (state.isGameWon && !showGameOver) {
      setTimeout(() => setShowGameOver(true), 1000);
    }
  }, [state.isGameWon, showGameOver]);

  // Achievement checking
  useEffect(() => {
    checkAchievements();
  }, [state.guessHistory, state.timeElapsed, state.isGameWon]);

  const checkAchievements = () => {
    const newAchievements = [];
    const unlockedAchievements = GameStorage.get('achievements') || [];
    if (state.isGameWon && state.timeElapsed <= 60 && !unlockedAchievements.includes('speed_demon')) {
      newAchievements.push({
        id: 'speed_demon',
        emoji: '⚡',
        label: 'Speed Demon',
        description: 'Completed puzzle in under 1 minute!'
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
    return `Nepal Traversal ${state.mode}\nScore: ${state.currentScore} | Time: ${state.timeElapsed}s\n${emojiGrid}`;
  };

  const remaining = state.correctPath.length - state.userPath.filter(d =>
    state.correctPath.includes(d.toLowerCase())
  ).length;

  const renderGameMode = () => {
    const commonProps = {
      puzzle: state.puzzle,
      userPath: state.userPath,
      guessHistory: state.guessHistory,
      timeElapsed: state.timeElapsed,
      onGuess: actions.makeGuess,
      onUndo: actions.undoGuess,
      onHint: actions.useHint,
      isGameWon: state.isGameWon,
      lastFeedback: state.lastFeedback
    };
    switch (state.mode) {
      case 'sequential':
        return <SequentialMode {...commonProps} />;
      case 'timeAttack':
        return <TimeAttackMode {...commonProps} />;
      case 'challenge':
        return <DailyChallenge {...commonProps} />;
      default:
        return <ClassicMode {...commonProps} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <GameHeader
        puzzle={state.puzzle}
        mode={state.mode}
        difficulty={state.gameSession.difficulty}
        timeElapsed={state.timeElapsed}
      />
      <GameModeSelector
        currentMode={state.mode}
        modes={GAME_MODES}
        onModeChange={actions.setMode}
      />
      <GameStats
        score={state.currentScore}
        timeElapsed={state.timeElapsed}
        streak={state.gameSession.streak}
        remaining={remaining}
        accuracy={Math.round((state.guessHistory.filter(g => g.isCorrect).length / Math.max(1, state.guessHistory.length)) * 100)}
      />
      {renderGameMode()}
      <div className="flex justify-center">
        <button
          onClick={handleNewGame}
          className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg"
        >
          🎮 New Game
        </button>
      </div>
      {showAchievement && (
        <AchievementToast
          achievement={showAchievement}
          onClose={() => setShowAchievement(null)}
        />
      )}
      {showGameOver && (
        <GameOverModal
          isWon={state.isGameWon}
          score={state.currentScore}
          timeElapsed={state.timeElapsed}
          accuracy={Math.round((state.guessHistory.filter(g => g.isCorrect).length / Math.max(1, state.guessHistory.length)) * 100)}
          shareText={generateShareText()}
          onNewGame={handleNewGame}
          onShare={handleShare}
        />
      )}
    </div>
  );
}
