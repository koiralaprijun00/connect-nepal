"use client";
import { useState, useEffect, useCallback } from 'react';
import type { Puzzle, SubmittedGuess } from '@/types';
import { getDailyPuzzle, calculateScore, parseGuessInput } from '@/lib/puzzle';

import { CombinedHeaderPuzzle } from '@/components/nepal-traversal/CombinedHeaderPuzzle';
import { MapDisplay } from '@/components/nepal-traversal/MapDisplay';
import { GuessInput } from '@/components/nepal-traversal/GuessInput';
import { GuessList } from '@/components/nepal-traversal/GuessList';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function NepalTraversalPage() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [currentPathForHint, setCurrentPathForHint] = useState<string[]>([]);
  const [submittedGuesses, setSubmittedGuesses] = useState<SubmittedGuess[]>([]);
  const [isSubmittingGuess, setIsSubmittingGuess] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  useEffect(() => {
    if (currentDate) {
      const dailyPuzzle = getDailyPuzzle(currentDate);
      setPuzzle(dailyPuzzle);
      setSubmittedGuesses([]);
      setCurrentPathForHint(dailyPuzzle.shortestPath.length > 0 ? [dailyPuzzle.shortestPath[0]] : []);
    }
  }, [currentDate]);

  const handleGuessSubmit = useCallback(async (guessInput: string) => {
    if (!puzzle) return;
    setIsSubmittingGuess(true);

    const parsedPath = parseGuessInput(guessInput);
    if (parsedPath.length === 0) {
      toast({ title: "Invalid Guess", description: "Please enter at least one district.", variant: "destructive" });
      setIsSubmittingGuess(false);
      return;
    }

    const { score, feedback } = calculateScore(parsedPath, puzzle.shortestPath);
    
    const newGuess: SubmittedGuess = {
      id: (submittedGuesses.length + 1).toString(),
      path: parsedPath,
      score,
      feedback,
    };

    setSubmittedGuesses(prev => [newGuess, ...prev]);
    setCurrentPathForHint(parsedPath); // Update path for map display

    if (score === 100) {
      toast({ title: "Congratulations!", description: feedback, variant: "default", duration: 5000 });
    } else {
      toast({ title: `Guess Submitted: ${score}%`, description: feedback, variant: "default" });
    }
    setIsSubmittingGuess(false);
  }, [puzzle, submittedGuesses, toast]);
  
  if (!puzzle || !currentDate) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col gap-4 p-4 md:p-6 min-h-screen animate-pulse">
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
    <div className="max-w-4xl mx-auto flex flex-col gap-4 p-4 md:p-6 min-h-screen bg-background selection:bg-primary/20">
      <CombinedHeaderPuzzle startDistrict={puzzle.startDistrict} endDistrict={puzzle.endDistrict} />

      <div className="grid md:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="flex flex-col gap-4">
          <MapDisplay 
            guessedPath={currentPathForHint} 
            correctPath={puzzle.shortestPath}
            startDistrict={puzzle.startDistrict}
            endDistrict={puzzle.endDistrict}
          />
        </div>
        {/* Right Column */}
        <div className="flex flex-col gap-4">
          <GuessInput onSubmit={handleGuessSubmit} isLoading={isSubmittingGuess} />
          <Card className="max-h-[calc(50vh-2rem)] overflow-auto shadow-lg">
            <GuessList guesses={submittedGuesses} />
          </Card>
        </div>
      </div>
      
      <footer className="text-center py-2 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Nepal Traversal. Puzzle changes daily.</p>
      </footer>
    </div>
  );
}
