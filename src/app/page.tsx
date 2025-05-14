
"use client";
import { useState, useEffect, useCallback } from 'react';
import type { Puzzle, SubmittedGuess, HintType as AppHintType } from '@/types';
import { generateHint, type HintGeneratorInput, type HintGeneratorOutput } from '@/ai/flows/hint-generator';
import { getDailyPuzzle, calculateScore, parseGuessInput } from '@/lib/puzzle';

import { CombinedHeaderPuzzle } from '@/components/nepal-traversal/CombinedHeaderPuzzle';
import { MapDisplay } from '@/components/nepal-traversal/MapDisplay';
import { GuessInput } from '@/components/nepal-traversal/GuessInput';
import { GuessList } from '@/components/nepal-traversal/GuessList';
import { HintSystem } from '@/components/nepal-traversal/HintSystem';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function NepalTraversalPage() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [currentPathForHint, setCurrentPathForHint] = useState<string[]>([]);
  const [submittedGuesses, setSubmittedGuesses] = useState<SubmittedGuess[]>([]);
  const [aiHint, setAiHint] = useState<HintGeneratorOutput | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
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
      setAiHint(null);
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

  const handleHintRequest = useCallback(async (hintType?: AppHintType) => {
    if (!puzzle) return;
    setIsHintLoading(true);
    setAiHint(null);

    try {
      const hintInput: HintGeneratorInput = {
        currentGuess: currentPathForHint, // Use currentPathForHint which reflects the latest guess for map
        shortestPath: puzzle.shortestPath,
        hintType: hintType,
      };
      const hintResult = await generateHint(hintInput);
      setAiHint(hintResult);
      toast({ title: "Hint Generated!", description: `AI provided a ${hintResult.hintType.toLowerCase().replace(/_/g, " ")} hint.`, variant: "default" });
    } catch (error) {
      console.error("Error generating hint:", error);
      toast({ title: "Hint Error", description: "Could not generate a hint at this time.", variant: "destructive" });
      setAiHint(null);
    } finally {
      setIsHintLoading(false);
    }
  }, [puzzle, currentPathForHint, toast]);
  
  if (!puzzle || !currentDate) {
    return (
      <div className="max-w-lg mx-auto flex flex-col gap-6 p-4 md:p-6 min-h-screen animate-pulse">
        <Skeleton className="h-20 w-full rounded-lg mb-4" /> {/* CombinedHeaderPuzzle */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-6">
            <Skeleton className="h-64 w-full rounded-lg" /> {/* MapDisplay */}
            <Skeleton className="h-40 w-full rounded-lg" /> {/* GuessInput */}
          </div>
          <div className="flex flex-col gap-6">
            <Skeleton className="h-48 w-full rounded-lg" /> {/* HintSystem */}
            <Skeleton className="h-40 w-full rounded-lg" /> {/* GuessList */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6 p-4 md:p-6 min-h-screen bg-background selection:bg-primary/20">
      <CombinedHeaderPuzzle startDistrict={puzzle.startDistrict} endDistrict={puzzle.endDistrict} />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          <MapDisplay 
            guessedPath={currentPathForHint} 
            correctPath={puzzle.shortestPath}
            startDistrict={puzzle.startDistrict}
            endDistrict={puzzle.endDistrict}
          />
          <GuessInput onSubmit={handleGuessSubmit} isLoading={isSubmittingGuess} />
        </div>
        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <HintSystem
            onHintRequest={handleHintRequest}
            hint={aiHint?.hint}
            hintType={aiHint?.hintType}
            isLoading={isHintLoading}
            currentGuess={currentPathForHint}
            shortestPath={puzzle.shortestPath}
          />
          <GuessList guesses={submittedGuesses} />
        </div>
      </div>
      
      <footer className="text-center py-4 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Nepal Traversal. Puzzle changes daily.</p>
      </footer>
    </div>
  );
}
