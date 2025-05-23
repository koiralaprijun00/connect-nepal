import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Undo, Target, Clock, Zap } from 'lucide-react';

// Enhanced Progress Display
export function GameProgressDisplay({ 
  foundDistricts, 
  totalDistricts, 
  currentScore, 
  timeElapsed, 
  streak,
  difficulty 
}: {
  foundDistricts: number;
  totalDistricts: number;
  currentScore: number;
  timeElapsed: number;
  streak: number;
  difficulty: string;
}) {
  const progress = (foundDistricts / totalDistricts) * 100;
  return (
    <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Progress</CardTitle>
          <Badge variant={difficulty === 'hard' ? 'destructive' : difficulty === 'medium' ? 'default' : 'secondary'}>
            {difficulty.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Districts Found</span>
            <span>{foundDistricts}/{totalDistricts}</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold text-primary">{currentScore}</span>
            </div>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold text-blue-500">
                {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Time</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold text-orange-500">{streak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Streak</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Guess Input with Better Feedback
export function EnhancedGuessInput({
  onGuess,
  onUndo,
  onHint,
  canUndo,
  hintsRemaining,
  isLoading,
  lastFeedback,
  suggestedDistricts
}: {
  onGuess: (district: string) => void;
  onUndo: () => void;
  onHint: () => void;
  canUndo: boolean;
  hintsRemaining: number;
  isLoading: boolean;
  lastFeedback?: { type: string; message: string } | null;
  suggestedDistricts: string[];
}) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const filteredSuggestions = suggestedDistricts
    .filter(d => d.toLowerCase().includes(input.toLowerCase()))
    .slice(0, 5);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onGuess(input.trim());
      setInput('');
      setShowSuggestions(false);
    }
  };
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Feedback Display */}
        {lastFeedback && (
          <div className={`p-3 rounded-lg border-l-4 ${
            lastFeedback.type === 'perfect' ? 'bg-green-50 border-green-500 text-green-800' :
            lastFeedback.type === 'close' ? 'bg-orange-50 border-orange-500 text-orange-800' :
            lastFeedback.type === 'warm' ? 'bg-blue-50 border-blue-500 text-blue-800' :
            'bg-red-50 border-red-500 text-red-800'
          }`}>
            <p className="font-medium">{lastFeedback.message}</p>
          </div>
        )}
        {/* Input Section */}
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && input.trim()) {
                  handleSubmit(e);
                }
              }}
              placeholder="Type a district name..."
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isLoading}
            />
            {/* Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {filteredSuggestions.map((district) => (
                  <button
                    key={district}
                    type="button"
                    onClick={() => {
                      setInput(district);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left p-2 hover:bg-gray-100 transition-colors"
                  >
                    {district}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button type="submit" onClick={handleSubmit} disabled={isLoading || !input.trim()}>
              Guess
            </Button>
            <Button type="button" onClick={onUndo} disabled={!canUndo} variant="secondary">
              <Undo className="h-4 w-4 mr-1" /> Undo
            </Button>
            <Button type="button" onClick={onHint} disabled={hintsRemaining <= 0} variant="outline">
              <Lightbulb className="h-4 w-4 mr-1" /> Hint ({hintsRemaining})
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Guess History with Rich Feedback
export function EnhancedGuessHistory({ 
  guesses, 
  correctPath 
}: { 
  guesses: Array<{
    district: string;
    isCorrect: boolean;
    feedback: string;
    distanceFromPath: number;
    timestamp: number;
  }>;
  correctPath: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Guess History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-64 overflow-y-auto">
        {guesses.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Your guesses will appear here
          </p>
        ) : (
          guesses.map((guess, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                guess.isCorrect 
                  ? 'bg-green-50 border-green-200' 
                  : guess.distanceFromPath === 1
                  ? 'bg-orange-50 border-orange-200'
                  : guess.distanceFromPath === 2
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="text-2xl">
                {guess.isCorrect ? '🎯' : 
                 guess.distanceFromPath === 1 ? '🔥' :
                 guess.distanceFromPath === 2 ? '🌊' : '❄️'}
              </div>
              <div className="flex-1">
                <div className="font-medium">{guess.district}</div>
                <div className="text-sm text-muted-foreground">
                  {guess.feedback}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                #{index + 1}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// Game Mode Selector
export function GameModeSelector({ 
  currentMode, 
  onModeChange, 
  availableModes 
}: {
  currentMode: string;
  onModeChange: (mode: string) => void;
  availableModes: Array<{ id: string; name: string; description: string; }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Mode</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {availableModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`w-full text-left p-3 rounded-lg border transition-colors ${
              currentMode === mode.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background hover:bg-muted border-border'
            }`}
          >
            <div className="font-medium">{mode.name}</div>
            <div className="text-sm opacity-75">{mode.description}</div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
} 