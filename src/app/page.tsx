"use client";
import React, { useEffect, useRef, useState } from 'react';
import { getRandomPuzzle, DISTRICT_ADJACENCY } from '@/lib/puzzle';
import { GameEngine, GuessResult } from '@/lib/enhancedGameLogic';
import { ClassicMode } from '@/components/game/modes/ClassicMode';
import { AchievementToast } from '@/components/AchievementToast';
import GameHeader from '@/components/game/GameHeader';
import type { Puzzle } from '@/types';
import { GameStorage } from '@/hooks/useOptimizedGame';

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
  const [lastFeedback, setLastFeedback] = useState<{ type: string; message: string } | null>(null);
  const [isGameWon, setIsGameWon] = useState(false);
  const [showAchievement, setShowAchievement] = useState<any>(null);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [, forceUpdate] = useState(0); // Forcing re-render

  // Game engine instance (persisted)
  const gameEngineRef = useRef<GameEngine | null>(null);

  // Initialize client-side only
  useEffect(() => {
    setIsClient(true);
    // Generate initial puzzle after hydration
    const initialPuzzle = getRandomPuzzle(true, 6);
    setCurrentPuzzle(initialPuzzle);
    gameEngineRef.current = new GameEngine(initialPuzzle, DISTRICT_ADJACENCY);
    setLastFeedback(null);
    setIsGameWon(false);
    forceUpdate(n => n + 1);
  }, []);

  // When puzzle changes, reset engine
  useEffect(() => {
    if (!isClient) return;
    gameEngineRef.current = new GameEngine(currentPuzzle, DISTRICT_ADJACENCY);
    setLastFeedback(null);
    setIsGameWon(false);
    forceUpdate(n => n + 1);
  }, [currentPuzzle, isClient]);

  // Achievement checking
  useEffect(() => {
    if (!isClient) return;
    checkAchievements();
  }, [isGameWon, isClient]);

  const checkAchievements = () => {
    const newAchievements = [];
    const unlockedAchievements = GameStorage.get('achievements') || [];
    if (isGameWon && !unlockedAchievements.includes('speed_demon')) {
      newAchievements.push({
        id: 'speed_demon',
        emoji: '⚡',
        label: 'Puzzle Master',
        description: 'Completed a puzzle!',
      });
    }
    const wrongGuesses = gameEngineRef.current?.getGuessHistory().filter(g => !g.isCorrect).length || 0;
    if (isGameWon && wrongGuesses === 0 && !unlockedAchievements.includes('perfect_path')) {
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
    // gameEngine will be reset by useEffect
  };

  const handleGuess = (district: string) => {
    if (!gameEngineRef.current) return;
    const result = gameEngineRef.current.makeGuess(district);
    setLastFeedback({ type: result.feedback, message: result.feedback });
    setIsGameWon(gameEngineRef.current.isGameWon());
    forceUpdate(n => n + 1);
  };

  const handleUndo = () => {
    if (!gameEngineRef.current) return;
    gameEngineRef.current.undoLastGuess();
    setIsGameWon(gameEngineRef.current.isGameWon());
    forceUpdate(n => n + 1);
  };

  const handleHint = () => {
    if (!gameEngineRef.current) return;
    const hint = gameEngineRef.current.getHint();
    setLastFeedback(hint ? { type: 'hint', message: `💡 Try: ${hint}` } : { type: 'hint', message: 'No more hints!' });
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
    const emojiGrid = gameEngineRef.current?.getGuessHistory().map(g =>
      g.isCorrect ? '🟩' :
      g.distanceFromPath === 1 ? '🟧' :
      g.distanceFromPath === 2 ? '🟦' : '⬜️'
    ).join('') || '';
    return `Nepal Traversal Classic\n${emojiGrid}`;
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

  const engine = gameEngineRef.current;
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <GameHeader
          startDistrict={currentPuzzle.startDistrict}
          endDistrict={currentPuzzle.endDistrict}
          mode="classic"
        />
        <button
          onClick={handleNewGame}
          className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg"
        >
          🎮 New Game
        </button>
      </div>
      {engine && (
        <ClassicMode
          puzzle={currentPuzzle}
          userPath={engine.getGuessHistory().map(g => g.district)}
          guessHistory={engine.getGuessHistory() as GuessResult[]}
          onGuess={handleGuess}
          onUndo={handleUndo}
          onHint={handleHint}
          isGameWon={isGameWon}
          lastFeedback={lastFeedback}
          allCorrectIntermediates={new Set(engine.getRequiredIntermediates())}
        />
      )}
      {showAchievement && (
        <AchievementToast
          achievement={showAchievement}
          onClose={() => setShowAchievement(null)}
        />
      )}
    </div>
  );
}
