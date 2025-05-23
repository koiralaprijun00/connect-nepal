import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Timer, Target, Zap, Map, Award, Users } from 'lucide-react';

// Game Mode Types
type GameMode = 'classic' | 'sequential' | 'timeAttack' | 'exploration' | 'challenge';

interface GameModeConfig {
  id: GameMode;
  name: string;
  description: string;
  icon: React.ReactNode;
  rules: string[];
  scoring: 'standard' | 'time' | 'exploration' | 'challenge';
}

// Game Mode Configurations
export const GAME_MODES: GameModeConfig[] = [
  {
    id: 'classic',
    name: 'Classic Mode',
    description: 'Find all intermediate districts in any order',
    icon: <Target className="h-5 w-5" />,
    rules: [
      'Guess districts one at a time',
      'Order doesn\'t matter',
      'Find all districts in the shortest path',
      'Limited guesses based on difficulty'
    ],
    scoring: 'standard'
  },
  {
    id: 'sequential',
    name: 'Sequential Path',
    description: 'Build the path step by step from start to end',
    icon: <Map className="h-5 w-5" />,
    rules: [
      'Must guess districts in correct order',
      'Each guess must be adjacent to previous',
      'One mistake ends the game',
      'Bonus points for perfect sequence'
    ],
    scoring: 'standard'
  },
  {
    id: 'timeAttack',
    name: 'Time Attack',
    description: 'Race against the clock to complete puzzles',
    icon: <Timer className="h-5 w-5" />,
    rules: [
      '3 minutes per puzzle',
      'Bonus points for time remaining',
      'Multiple puzzles in succession',
      'Increasing difficulty over time'
    ],
    scoring: 'time'
  },
  {
    id: 'exploration',
    name: 'Exploration Mode',
    description: 'Discover all possible paths between districts',
    icon: <Zap className="h-5 w-5" />,
    rules: [
      'Find multiple valid paths',
      'Discover alternative routes',
      'Score based on path diversity',
      'No guess limit'
    ],
    scoring: 'exploration'
  },
  {
    id: 'challenge',
    name: 'Daily Challenge',
    description: 'Special constraints and objectives',
    icon: <Award className="h-5 w-5" />,
    rules: [
      'Special daily puzzle',
      'Unique constraints (avoid regions, etc.)',
      'Leaderboard competition',
      'One attempt per day'
    ],
    scoring: 'challenge'
  }
];

// Game Mode Selector Component
export function GameModeSelector({ 
  selectedMode, 
  onModeSelect,
  className 
}: {
  selectedMode: GameMode;
  onModeSelect: (mode: GameMode) => void;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {GAME_MODES.map((mode) => (
        <Card
          key={mode.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedMode === mode.id 
              ? 'ring-2 ring-primary bg-primary/5' 
              : 'hover:bg-muted/50'
          }`}
          onClick={() => onModeSelect(mode.id)}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              {mode.icon}
              {mode.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {mode.description}
            </p>
            <div className="space-y-1">
              {mode.rules.slice(0, 2).map((rule, index) => (
                <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                  {rule}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Sequential Mode Component
export function SequentialModeGame({
  puzzle,
  onGuess,
  currentPath,
  gameStatus
}: {
  puzzle: any;
  onGuess: (district: string) => void;
  currentPath: string[];
  gameStatus: 'playing' | 'won' | 'lost';
}) {
  const [currentPosition, setCurrentPosition] = useState(0);
  const correctPath = puzzle?.shortestPath || [];
  const expectedNext = correctPath[currentPosition + 1];
  
  const handleGuess = (district: string) => {
    const isCorrect = district.toLowerCase() === expectedNext?.toLowerCase();
    if (isCorrect) {
      setCurrentPosition(prev => prev + 1);
    }
    onGuess(district);
  };
  
  const progress = (currentPosition / (correctPath.length - 2)) * 100;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5" />
          Sequential Path Building
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Path Progress</span>
            <span>{currentPosition}/{correctPath.length - 2} districts</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* Current Path Visualization */}
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="secondary">{puzzle?.startDistrict}</Badge>
          {currentPath.map((district, index) => (
            <React.Fragment key={index}>
              <span>→</span>
              <Badge variant="default">{district}</Badge>
            </React.Fragment>
          ))}
          {gameStatus === 'playing' && (
            <>
              <span>→</span>
              <Badge variant="outline">?</Badge>
            </>
          )}
          <span>→</span>
          <Badge variant="destructive">{puzzle?.endDistrict}</Badge>
        </div>
        
        {/* Next District Hint */}
        {gameStatus === 'playing' && expectedNext && (
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Next district must be adjacent to: <strong>{currentPath[currentPath.length - 1] || puzzle?.startDistrict}</strong>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Time Attack Mode Component
export function TimeAttackMode({
  timeLimit = 180,
  onTimeUp,
  currentPuzzle,
  puzzlesCompleted,
  totalScore
}: {
  timeLimit?: number;
  onTimeUp: () => void;
  currentPuzzle: number;
  puzzlesCompleted: number;
  totalScore: number;
}) {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isActive, setIsActive] = useState(true);
  
  useEffect(() => {
    if (!isActive || timeRemaining <= 0) {
      if (timeRemaining <= 0) {
        onTimeUp();
      }
      return;
    }
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isActive, timeRemaining, onTimeUp]);
  
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timePercentage = (timeRemaining / timeLimit) * 100;
  
  return (
    <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-red-500" />
            Time Attack
          </div>
          <Badge variant={timeRemaining < 30 ? 'destructive' : 'secondary'}>
            Puzzle {currentPuzzle}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="text-center">
          <div className={`text-4xl font-bold ${timeRemaining < 30 ? 'text-red-500 animate-pulse' : 'text-orange-600'}`}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
          <Progress 
            value={timePercentage} 
            className={`h-2 mt-2 ${timeRemaining < 30 ? '[&>div]:bg-red-500' : '[&>div]:bg-orange-500'}`}
          />
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{puzzlesCompleted}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{totalScore}</div>
            <div className="text-sm text-muted-foreground">Total Score</div>
          </div>
        </div>
        
        {/* Time Bonus Indicator */}
        {timeRemaining > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-2">
            <div className="text-sm text-green-700 text-center">
              Time Bonus: +{Math.floor(timeRemaining * 2)} points
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Exploration Mode Component
export function ExplorationMode({
  allPossiblePaths,
  discoveredPaths,
  currentGuesses,
  onPathDiscovered
}: {
  allPossiblePaths: string[][];
  discoveredPaths: Set<string>;
  currentGuesses: string[];
  onPathDiscovered: (pathId: string) => void;
}) {
  const discoveryPercentage = (discoveredPaths.size / allPossiblePaths.length) * 100;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Path Exploration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Discovery Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Paths Discovered</span>
            <span>{discoveredPaths.size}/{allPossiblePaths.length}</span>
          </div>
          <Progress value={discoveryPercentage} className="h-3" />
        </div>
        
        {/* Path List */}
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {allPossiblePaths.map((path, index) => {
            const pathId = path.join('-');
            const isDiscovered = discoveredPaths.has(pathId);
            
            return (
              <div
                key={pathId}
                className={`p-2 rounded border text-sm ${
                  isDiscovered 
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-muted/50 border-muted text-muted-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">Path {index + 1}:</span>
                  {isDiscovered ? (
                    <span>{path.join(' → ')}</span>
                  ) : (
                    <span>{'? → '.repeat(path.length - 1) + '?'}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Exploration Hints */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-medium text-blue-800 mb-1">Exploration Tips:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Try districts adjacent to known paths</li>
            <li>• Look for alternative routes through different regions</li>
            <li>• Some paths may share common districts</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// Daily Challenge Component
export function DailyChallenge({
  challengeData,
  userAttempt,
  leaderboard,
  onSubmitAttempt
}: {
  challengeData: {
    id: string;
    title: string;
    constraint: string;
    puzzle: any;
    deadline: Date;
  };
  userAttempt?: {
    score: number;
    completedAt: Date;
    rank: number;
  };
  leaderboard: Array<{
    rank: number;
    player: string;
    score: number;
    time: number;
  }>;
  onSubmitAttempt: (score: number) => void;
}) {
  const timeUntilReset = challengeData.deadline.getTime() - Date.now();
  const hoursRemaining = Math.floor(timeUntilReset / (1000 * 60 * 60));
  
  return (
    <div className="space-y-4">
      {/* Challenge Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              {challengeData.title}
            </div>
            <Badge variant="outline">
              {hoursRemaining}h remaining
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-purple-100 border border-purple-200 rounded-lg p-3 mb-3">
            <h4 className="font-medium text-purple-800 mb-1">Special Constraint:</h4>
            <p className="text-sm text-purple-700">{challengeData.constraint}</p>
          </div>
          
          {userAttempt && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-green-800 font-medium">Your Score: {userAttempt.score}</span>
                <Badge variant="secondary">Rank #{userAttempt.rank}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.slice(0, 10).map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center justify-between p-2 rounded ${
                  entry.rank <= 3 ? 'bg-yellow-50 border border-yellow-200' : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    entry.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                    entry.rank === 2 ? 'bg-gray-300 text-gray-800' :
                    entry.rank === 3 ? 'bg-orange-400 text-orange-900' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {entry.rank}
                  </div>
                  <span className="font-medium">{entry.player}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{entry.score}</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.floor(entry.time / 60)}:{(entry.time % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export type { GameMode, GameModeConfig }; 