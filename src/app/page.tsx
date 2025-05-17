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
  const [userPath, setUserPath] = useState<string[]>([]);
  const [isSubmittingGuess, setIsSubmittingGuess] = useState(false);
  const [latestGuessResult, setLatestGuessResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [guessHistory, setGuessHistory] = useState<string[][]>([]);

  const startNewGame = useCallback(() => {
    const newPuzzle = getRandomPuzzle();
    setPuzzle(newPuzzle);
    setUserPath([]);
    setGuessHistory([]);
    setLatestGuessResult(null);
  }, []);

  useEffect(() => {
    startNewGame();
  }, []);

  const correctPath: string[] = puzzle ? puzzle.shortestPath.slice(1, -1) : [];
  const normalize = (arr: string[]): string[] => arr.map((d: string) => d.trim().toLowerCase()).sort();
  const requiredSet = new Set(correctPath.map(d => d.trim().toLowerCase()));
  const correctGuessesSet = new Set(userPath.filter(d => requiredSet.has(d.trim().toLowerCase())).map(d => d.trim().toLowerCase()));
  const isGameWon = correctGuessesSet.size === requiredSet.size;

  useEffect(() => {
    if (isGameWon) {
      setLatestGuessResult({ type: 'success', message: 'Congratulations! You found the shortest path!' });
    }
  }, [isGameWon]);

  const handleGuessSubmit = useCallback(
    async ([district]: string[]) => {
      if (!puzzle) return;
      setIsSubmittingGuess(true);

      if (userPath.includes(district.trim())) {
        setLatestGuessResult({ type: 'error', message: `You already entered '${district.trim()}'. Try a different district.` });
        setIsSubmittingGuess(false);
        return;
      }
      const newPath = [...userPath, district.trim()];
      setUserPath(newPath);
      setGuessHistory(prev => [...prev, [district.trim()]]);
      // Recalculate correct guesses set
      const newCorrectGuessesSet = new Set(newPath.filter(d => requiredSet.has(d.trim().toLowerCase())).map(d => d.trim().toLowerCase()));
      if (!isGameWon) {
        setLatestGuessResult({ type: 'success', message: `Correct! Keep going (${newCorrectGuessesSet.size}/${requiredSet.size})` });
      }
      setIsSubmittingGuess(false);
    },
    [puzzle, userPath, requiredSet, isGameWon]
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
            guessedPath={userPath} 
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
            isGameWon={isGameWon}
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
    </div>
  );
}
