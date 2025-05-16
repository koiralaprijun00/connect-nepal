"use client";
import type { SubmittedGuess } from "@/types";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListChecks, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GuessListProps {
  guesses: SubmittedGuess[];
}

export function GuessList({ guesses }: GuessListProps) {
  const getFeedbackIcon = (score: number) => {
    if (score === 100) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (score > 50) return <ListChecks className="h-4 w-4 text-yellow-500" />;
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };
  
  return (
    <>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-primary">Guess History</CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <ScrollArea className="h-full pr-2">
          {guesses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No guesses yet. Start exploring!
            </p>
          ) : (
            <ul className="space-y-2">
              {guesses.map((guess) => (
                <li 
                  key={guess.id} 
                  className="p-2 border rounded-md shadow-sm bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Guess #{guess.id}
                    </p>
                    <Badge 
                      variant={
                        guess.score === 100 
                          ? "default" 
                          : guess.score > 0 
                            ? "secondary" 
                            : "destructive"
                      } 
                      className="text-xs"
                    >
                      {guess.score}% Correct
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Path: <span className="font-normal">{guess.path.join(' → ')}</span>
                  </p>
                  {guess.feedback && (
                    <div className="flex items-start gap-2 mt-1 text-xs text-muted-foreground">
                      {getFeedbackIcon(guess.score)}
                      <p>{guess.feedback}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </>
  );
}
