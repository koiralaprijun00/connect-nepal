"use client";
import type { SubmittedGuess } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListChecks, AlertTriangle, CheckCircle2 } from "lucide-react";

interface GuessListProps {
  guesses: SubmittedGuess[];
}

export function GuessList({ guesses }: GuessListProps) {
  const getFeedbackIcon = (score: number) => {
    if (score === 100) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (score > 50) return <ListChecks className="h-5 w-5 text-yellow-500" />;
    return <AlertTriangle className="h-5 w-5 text-red-500" />;
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Guess History</CardTitle>
        {guesses.length === 0 && (
          <CardDescription>You haven't made any guesses yet. Give it a try!</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {guesses.length > 0 && (
          <ul className="space-y-4">
            {guesses.map((guess) => (
              <li key={guess.id} className="p-4 border rounded-lg shadow-sm bg-background hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Guess #{guess.id}</p>
                  <Badge variant={guess.score === 100 ? "default" : guess.score > 0 ? "secondary" : "destructive"} className="text-sm">
                    {guess.score}% Correct
                  </Badge>
                </div>
                <p className="text-md font-semibold text-foreground mb-1">
                  Path: <span className="font-normal">{guess.path.join(' → ')}</span>
                </p>
                {guess.feedback && (
                  <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground">
                    {getFeedbackIcon(guess.score)}
                    <p>{guess.feedback}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
