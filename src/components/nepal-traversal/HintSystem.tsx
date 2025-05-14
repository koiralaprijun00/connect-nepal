"use client";
import type { HintType as AIHintType } from "@/types"; // Renamed to avoid conflict
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Zap, Rows, MessageSquareQuote } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";


interface HintSystemProps {
  onHintRequest: (hintType?: AIHintType) => void;
  hint?: string;
  hintType?: AIHintType;
  isLoading: boolean;
  currentGuess: string[];
  shortestPath: string[];
}

export function HintSystem({ onHintRequest, hint, hintType, isLoading, currentGuess, shortestPath }: HintSystemProps) {
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setProgressValue(0); // Reset progress
      const interval = setInterval(() => {
        setProgressValue(prev => (prev >= 90 ? 90 : prev + 10)); // Simulate progress, stop at 90
      }, 200);
      return () => clearInterval(interval);
    } else {
      setProgressValue(hint ? 100 : 0); // If hint loaded, set to 100, else 0
    }
  }, [isLoading, hint]);
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center gap-2">
          <Lightbulb className="h-7 w-7" />
          Need a Boost?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Stuck? Request a hint to help you find the way. Our AI will provide the most useful hint for your current progress.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => onHintRequest('NEXT_DISTRICT_OUTLINE')} 
            disabled={isLoading}
            variant="outline"
          >
            <Zap className="mr-2 h-4 w-4" /> Next Outline
          </Button>
          <Button 
            onClick={() => onHintRequest('ALL_DISTRICT_OUTLINES')} 
            disabled={isLoading}
            variant="outline"
          >
            <Rows className="mr-2 h-4 w-4" /> All Outlines
          </Button>
          <Button 
            onClick={() => onHintRequest('DISTRICT_INITIALS')} 
            disabled={isLoading}
            variant="outline"
          >
            A.. B.. C..
          </Button>
          <Button 
            onClick={() => onHintRequest()} 
            variant="secondary" 
            disabled={isLoading}
            className="bg-amber-400 hover:bg-amber-500 text-secondary-foreground"
          >
            <MessageSquareQuote className="mr-2 h-4 w-4" /> Smart Hint
          </Button>
        </div>
        
        {isLoading && (
          <div className="space-y-2 pt-2">
            <p className="text-sm text-muted-foreground animate-pulse">Generating your personalized hint...</p>
            <Progress value={progressValue} className="w-full" />
          </div>
        )}

        {hint && !isLoading && (
          <Alert variant="default" className="mt-4 bg-accent/10 border-accent/50">
            <Lightbulb className="h-5 w-5 text-accent" />
            <AlertTitle className="text-accent">Here's your hint ({hintType?.replace(/_/g, ' ').toLowerCase()}):</AlertTitle>
            <AlertDescription className="text-accent-foreground">
              {hint}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
