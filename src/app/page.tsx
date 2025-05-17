"use client";
import { useState, useEffect, useCallback } from 'react';
import type { Puzzle, SubmittedGuess } from '@/types';
import { getRandomPuzzle, calculateScore, parseGuessInput } from '@/lib/puzzle';

import { CombinedHeaderPuzzle } from '@/components/nepal-traversal/CombinedHeaderPuzzle';
import { MapDisplay } from '@/components/nepal-traversal/MapDisplay';
import { GuessInput } from '@/components/nepal-traversal/GuessInput';
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { GuessHistoryPanel } from '@/components/nepal-traversal/GuessHistoryPanel';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function NepalTraversalPage() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [currentPathForHint, setCurrentPathForHint] = useState<string[]>([]);
  const [submittedGuesses, setSubmittedGuesses] = useState<SubmittedGuess[]>([]);
  const [isSubmittingGuess, setIsSubmittingGuess] = useState(false);
  const [latestGuessResult, setLatestGuessResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [guessHistory, setGuessHistory] = useState<string[][]>([]);

  const startNewGame = useCallback(() => {
    const newPuzzle = getRandomPuzzle();
    setPuzzle(newPuzzle);
    setSubmittedGuesses([]);
    setCurrentPathForHint(newPuzzle.shortestPath.length > 0 ? [newPuzzle.shortestPath[0]] : []);
    setGuessHistory([]);
    setLatestGuessResult(null);
  }, []);

  useEffect(() => {
    startNewGame();
  }, []);

  const handleGuessSubmit = useCallback(
    async (intermediateDistricts: string[]) => {
      if (!puzzle) return;
      setIsSubmittingGuess(true);

      // Build the full path: [start, ...intermediate, end]
      const fullPath = [puzzle.startDistrict, ...intermediateDistricts, puzzle.endDistrict];
      if (intermediateDistricts.some(d => !d)) {
        setLatestGuessResult({ type: 'error', message: 'Please enter valid districts.' });
        setIsSubmittingGuess(false);
        return;
      }

      const { score, feedback } = calculateScore(fullPath, puzzle.shortestPath);
      const newGuess: SubmittedGuess = {
        id: (submittedGuesses.length + 1).toString(),
        path: fullPath,
        score,
        feedback,
      };
      setSubmittedGuesses(prev => [newGuess, ...prev]);
      setCurrentPathForHint(fullPath); // Update path for map display

      if (score === 100) {
        setLatestGuessResult({ type: 'success', message: 'Congratulations! You found the shortest path!' });
      } else {
        setLatestGuessResult({ type: 'error', message: 'That is not the shortest path. Try again!' });
      }

      // Add the guess to guessHistory
      setGuessHistory(prev => [...prev, intermediateDistricts]);

      setIsSubmittingGuess(false);
    },
    [puzzle, submittedGuesses]
  );
  
  if (!puzzle) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col gap-4 p-4 min-h-screen animate-pulse">
        <Skeleton className="h-20 w-full rounded-lg mb-4" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4 p-4 min-h-screen bg-background selection:bg-primary/20">
      <div className="flex justify-between items-start">
        <CombinedHeaderPuzzle startDistrict={puzzle.startDistrict} endDistrict={puzzle.endDistrict} />
        <Button 
          onClick={startNewGame}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          New Game
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Main game */}
        <div className="flex flex-col gap-4">
          <MapDisplay 
            guessedPath={currentPathForHint} 
            correctPath={puzzle.shortestPath}
            startDistrict={puzzle.startDistrict}
            endDistrict={puzzle.endDistrict}
          />
          <GuessInput 
            onSubmit={handleGuessSubmit} 
            isLoading={isSubmittingGuess}
            startDistrict={puzzle.startDistrict}
            endDistrict={puzzle.endDistrict}
            latestGuessResult={latestGuessResult}
          />
          <Card className="max-h-[calc(50vh-2rem)] overflow-auto shadow-lg">
          </Card>
        </div>
        {/* Right Column: Past guesses */}
        <div>
          <GuessHistoryPanel 
            guessHistory={guessHistory}
            startDistrict={puzzle.startDistrict}
            endDistrict={puzzle.endDistrict}
            correctPath={puzzle.shortestPath}
          />
        </div>
      </div>
      <footer className="text-center py-2 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Nepal Traversal. Play as many puzzles as you want!</p>
      </footer>
    </div>
  );
}
