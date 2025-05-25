"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { getRandomPuzzle, DISTRICT_ADJACENCY } from '@/lib/puzzle';
import { GameEngine, GuessResult } from '@/lib/enhancedGameLogic';
import { ClassicMode } from '@/components/game/modes/ClassicMode';
import GameHeader from '@/components/game/GameHeader';
import type { Puzzle } from '@/types';

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
  const [gameKey, setGameKey] = useState(0); // Force re-renders when needed

  // Game engine instance (persisted)
  const gameEngineRef = useRef<GameEngine | null>(null);

  // Initialize new game engine
  const initializeGameEngine = useCallback((puzzle: Puzzle) => {
    console.log('Initializing game engine with puzzle:', puzzle); // Debug log
    try {
      gameEngineRef.current = new GameEngine(puzzle, DISTRICT_ADJACENCY);
      setLastFeedback(null);
      setIsGameWon(false);
      setGameKey(prev => prev + 1); // Force re-render
      console.log('Game engine initialized successfully'); // Debug log
    } catch (error) {
      console.error('Failed to initialize game engine:', error);
      // Create a fallback engine
      gameEngineRef.current = new GameEngine(DEFAULT_PUZZLE, DISTRICT_ADJACENCY);
    }
  }, []);

  // Initialize client-side only
  useEffect(() => {
    setIsClient(true);
    // Generate initial puzzle after hydration
    try {
      const initialPuzzle = getRandomPuzzle(true, 6);
      console.log('Generated initial puzzle:', initialPuzzle); // Debug log
      setCurrentPuzzle(initialPuzzle);
      initializeGameEngine(initialPuzzle);
    } catch (error) {
      console.error('Failed to generate initial puzzle:', error);
      setCurrentPuzzle(DEFAULT_PUZZLE);
      initializeGameEngine(DEFAULT_PUZZLE);
    }
  }, [initializeGameEngine]);

  const handleNewGame = useCallback(() => {
    try {
      const newPuzzle = getRandomPuzzle(true, 6);
      console.log('Generated new puzzle:', newPuzzle); // Debug log
      setCurrentPuzzle(newPuzzle);
      initializeGameEngine(newPuzzle);
    } catch (error) {
      console.error('Failed to generate new puzzle:', error);
      // Fallback to default puzzle
      setCurrentPuzzle(DEFAULT_PUZZLE);
      initializeGameEngine(DEFAULT_PUZZLE);
    }
  }, [initializeGameEngine]);

  const handleGuess = useCallback((district: string) => {
    console.log('handleGuess called with:', district); // Debug log
    
    if (!gameEngineRef.current) {
      console.error('Game engine not initialized!');
      setLastFeedback({ type: 'error', message: 'Game engine not ready. Please try again.' });
      return;
    }
    
    try {
      const result = gameEngineRef.current.makeGuess(district);
      console.log('Guess result:', result); // Debug log
      
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
      console.log('Game won status:', newIsGameWon); // Debug log
      setIsGameWon(newIsGameWon);
      
      // Force re-render to update components
      setGameKey(prev => prev + 1);
      
    } catch (error) {
      console.error('Error making guess:', error);
      setLastFeedback({ type: 'error', message: 'Failed to process guess. Please try again.' });
    }
  }, []);

  const handleUndo = useCallback(() => {
    if (!gameEngineRef.current) return;
    
    try {
      const success = gameEngineRef.current.undoLastGuess();
      if (success) {
        setIsGameWon(gameEngineRef.current.isGameWon());
        setLastFeedback({ type: 'info', message: 'Last guess undone' });
        setGameKey(prev => prev + 1);
      } else {
        setLastFeedback({ type: 'error', message: 'Nothing to undo' });
      }
    } catch (error) {
      console.error('Error undoing guess:', error);
      setLastFeedback({ type: 'error', message: 'Failed to undo guess' });
    }
  }, []);

  const handleHint = useCallback(() => {
    if (!gameEngineRef.current) return;
    
    try {
      const hint = gameEngineRef.current.getHint();
      if (hint) {
        setLastFeedback({ type: 'hint', message: `💡 Try: ${hint}` });
      } else {
        setLastFeedback({ type: 'hint', message: '💡 No more hints available!' });
      }
    } catch (error) {
      console.error('Error getting hint:', error);
      setLastFeedback({ type: 'error', message: 'Failed to get hint' });
    }
  }, []);

  const handleShare = useCallback(() => {
    if (!gameEngineRef.current) return;
    
    try {
      const emojiGrid = gameEngineRef.current.getGuessHistory().map(g =>
        g.isCorrect ? '🟩' :
        g.distanceFromPath === 1 ? '🟧' :
        g.distanceFromPath === 2 ? '🟦' : '⬜️'
      ).join('');
      
      const shareText = `Nepal Traversal Classic\n${emojiGrid}`;
      
      if (navigator.share) {
        navigator.share({ text: shareText });
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText);
        setLastFeedback({ type: 'info', message: 'Results copied to clipboard!' });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      setLastFeedback({ type: 'error', message: 'Failed to share results' });
    }
  }, []);

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
          <p>Error: Game engine not initialized</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Reload Page
          </button>
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
    </div>
  );
}