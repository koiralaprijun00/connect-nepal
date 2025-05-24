"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  const [gameKey, setGameKey] = useState(0); // Force re-renders when needed

  // Game engine instance (persisted)
  const gameEngineRef = useRef<GameEngine | null>(null);

  // Initialize new game engine
  const initializeGameEngine = useCallback((puzzle: Puzzle) => {
    gameEngineRef.current = new GameEngine(puzzle, DISTRICT_ADJACENCY);
    setLastFeedback(null);
    setIsGameWon(false);
    setGameKey(prev => prev + 1); // Force re-render
  }, []);

  // Initialize client-side only
  useEffect(() => {
    setIsClient(true);
    // Generate initial puzzle after hydration
    const initialPuzzle = getRandomPuzzle(true, 6);
    setCurrentPuzzle(initialPuzzle);
    initializeGameEngine(initialPuzzle);
  }, [initializeGameEngine]);

  // Achievement checking
  useEffect(() => {
    if (!isClient || !gameEngineRef.current) return;
    checkAchievements();
  }, [isGameWon, isClient]);

  const checkAchievements = useCallback(() => {
    if (!gameEngineRef.current) return;
    
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
    
    const wrongGuesses = gameEngineRef.current.getGuessHistory().filter(g => !g.isCorrect).length;
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
  }, [isGameWon]);

  const handleNewGame = useCallback(() => {
    const newPuzzle = getRandomPuzzle(true, 6);
    setCurrentPuzzle(newPuzzle);
    initializeGameEngine(newPuzzle);
  }, [initializeGameEngine]);

  const handleGuess = useCallback((district: string) => {
    if (!gameEngineRef.current) return;
    
    const result = gameEngineRef.current.makeGuess(district);
    
    // Create proper feedback message based on result type
    let feedbackMessage = '';
    switch (result.feedback) {
      case 'perfect':
        feedbackMessage = `🎯 Perfect! ${district} is on the shortest path!`;
        break;
      case 'close':
        feedbackMessage = '🔥 Very close! Adjacent to the correct path.';
        break;
      case 'warm':
        feedbackMessage = '🌊 Getting warmer! 2 districts away.';
        break;
      case 'cold':
        feedbackMessage = '❄️ Too far from the correct path.';
        break;
      case 'duplicate':
        feedbackMessage = '🔄 You already guessed this district!';
        break;
      case 'invalid':
        feedbackMessage = '🚫 Invalid district name.';
        break;
      default:
        feedbackMessage = 'Try again!';
    }
    
    setLastFeedback({ type: result.feedback, message: feedbackMessage });
    
    // Check win condition
    const newIsGameWon = gameEngineRef.current.isGameWon();
    setIsGameWon(newIsGameWon);
    
    // Force re-render to update components
    setGameKey(prev => prev + 1);
  }, []);

  const handleUndo = useCallback(() => {
    if (!gameEngineRef.current) return;
    
    const success = gameEngineRef.current.undoLastGuess();
    if (success) {
      setIsGameWon(gameEngineRef.current.isGameWon());
      setLastFeedback({ type: 'info', message: 'Last guess undone' });
      setGameKey(prev => prev + 1);
    }
  }, []);

  const handleHint = useCallback(() => {
    if (!gameEngineRef.current) return;
    
    const hint = gameEngineRef.current.getHint();
    if (hint) {
      setLastFeedback({ type: 'hint', message: `💡 Try: ${hint}` });
    } else {
      setLastFeedback({ type: 'hint', message: '💡 No more hints available!' });
    }
  }, []);

  const generateShareText = useCallback(() => {
    if (!gameEngineRef.current) return '';
    
    const emojiGrid = gameEngineRef.current.getGuessHistory().map(g =>
      g.isCorrect ? '🟩' :
      g.distanceFromPath === 1 ? '🟧' :
      g.distanceFromPath === 2 ? '🟦' : '⬜️'
    ).join('');
    
    return `Nepal Traversal Classic\n${emojiGrid}`;
  }, []);

  const handleShare = useCallback(() => {
    if (!gameEngineRef.current) return;
    
    const shareText = generateShareText();
    if (navigator.share) {
      navigator.share({ text: shareText });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
    }
  }, [generateShareText]);

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
  if (!engine) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="text-center text-red-500">
          Error: Game engine not initialized
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <GameHeader
          startDistrict={currentPuzzle.startDistrict}
          endDistrict={currentPuzzle.endDistrict}
          mode="classic"
        />
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            disabled={!isGameWon}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📤 Share
          </button>
          <button
            onClick={handleNewGame}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg"
          >
            🎮 New Game
          </button>
        </div>
      </div>

      <ClassicMode
        key={gameKey} // Force re-render when game state changes
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

      {showAchievement && (
        <AchievementToast
          achievement={showAchievement}
          onClose={() => setShowAchievement(null)}
        />
      )}
    </div>
  );
}
