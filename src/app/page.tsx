"use client";
import React, { useReducer, useEffect, useCallback } from 'react';
import type { Puzzle } from '@/types';
import { getRandomPuzzle, findAllShortestPaths } from '@/lib/puzzle';
import { DISTRICT_ADJACENCY } from '@/lib/puzzle';
import {
  GameState,
  GameSession,
  GuessResult,
  GameScoring,
  DifficultyProgression,
  FeedbackSystem,
} from '@/lib/gameLogic';
import { GameProgressDisplay, EnhancedGuessInput, EnhancedGuessHistory } from '../components/EnhancedGameUI';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
// Import new game mode components
import {
  GameModeSelector,
  GAME_MODES,
  SequentialModeGame,
  TimeAttackMode,
  ExplorationMode,
  DailyChallenge,
  GameMode
} from '@/components/GameModes';
// Import InteractiveNepalMap
import { InteractiveNepalMap } from '@/components/InteractiveNepalMap';

// --- Reducer Types ---
type GameReducerAction =
  | { type: 'MAKE_GUESS'; district: string; guessResult: GuessResult }
  | { type: 'UNDO_GUESS' }
  | { type: 'USE_HINT' }
  | { type: 'NEW_GAME'; puzzle: Puzzle }
  | { type: 'SET_MODE'; mode: GameMode }
  | { type: 'SET_FEEDBACK'; feedback: { type: string; message: string } | null }
  | { type: 'SET_TIME_ELAPSED'; timeElapsed: number };

interface GameReducerState {
  puzzle: Puzzle;
  userPath: string[];
  guessHistory: GuessResult[];
  gameSession: GameSession;
  hints: { used: boolean; count: number };
  mode: GameMode;
  lastFeedback: { type: string; message: string } | null;
  timeElapsed: number;
}

function createInitialState(): GameReducerState {
  const puzzle = getRandomPuzzle(true, 6);
  const now = Date.now();
  return {
    puzzle,
    userPath: [],
    guessHistory: [],
    gameSession: {
      startTime: now,
      score: 0,
      streak: 0,
      difficulty: 'medium',
      hintsUsed: 0,
      perfectRuns: 0,
      puzzle,
    },
    hints: { used: false, count: 0 },
    mode: 'classic',
    lastFeedback: null,
    timeElapsed: 0,
  };
}

function gameReducer(state: GameReducerState, action: GameReducerAction): GameReducerState {
  switch (action.type) {
    case 'MAKE_GUESS':
      return {
        ...state,
        userPath: [...state.userPath, action.district],
        guessHistory: [...state.guessHistory, action.guessResult],
        lastFeedback: { type: action.guessResult.feedback, message: action.guessResult.feedback },
      };
    case 'UNDO_GUESS':
      return {
        ...state,
        userPath: state.userPath.slice(0, -1),
        guessHistory: state.guessHistory.slice(0, -1),
        lastFeedback: null,
      };
    case 'USE_HINT':
      return {
        ...state,
        hints: { used: true, count: state.hints.count + 1 },
        gameSession: { ...state.gameSession, hintsUsed: state.gameSession.hintsUsed + 1 },
        lastFeedback: { type: 'hint', message: 'Hint used! (Not implemented)' },
      };
    case 'NEW_GAME': {
      const now = Date.now();
      return {
        ...state,
        puzzle: action.puzzle,
        userPath: [],
        guessHistory: [],
        gameSession: {
          ...state.gameSession,
          startTime: now,
          score: 0,
          hintsUsed: 0,
          puzzle: action.puzzle,
        },
        hints: { used: false, count: 0 },
        lastFeedback: null,
        timeElapsed: 0,
      };
    }
    case 'SET_MODE':
      return { ...state, mode: action.mode };
    case 'SET_FEEDBACK':
      return { ...state, lastFeedback: action.feedback };
    case 'SET_TIME_ELAPSED':
      return { ...state, timeElapsed: action.timeElapsed };
    default:
      return state;
  }
}

// Utility to get daily puzzle index based on date
function getDailyPuzzleIndex(total: number): number {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();
  // Simple hash: (YYYYMMDD) % total
  return (y * 10000 + m * 100 + d) % total;
}

// Utility to get and set daily streak in localStorage
function getDailyStreak(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem('daily-streak') || '0', 10);
}
function setDailyStreak(streak: number) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('daily-streak', streak.toString());
}
function getLastDailyDate(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('last-daily-date') || '';
}
function setLastDailyDate(date: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('last-daily-date', date);
}

// --- Achievements ---
const ACHIEVEMENTS = [
  {
    id: 'speed-demon',
    label: 'Speed Demon',
    description: 'Complete a puzzle in under 1 minute',
    emoji: '⚡',
    check: (state: any) => state.timeElapsed > 0 && state.timeElapsed <= 60,
  },
  {
    id: 'perfect-path',
    label: 'Perfect Path',
    description: 'No wrong guesses in a puzzle',
    emoji: '🎯',
    check: (state: any) => state.guessHistory.every((g: any) => g.isCorrect),
  },
  {
    id: 'streak-master',
    label: 'Streak Master',
    description: '7 consecutive wins',
    emoji: '🔥',
    check: (state: any) => state.gameSession.streak >= 7,
  },
  {
    id: 'explorer',
    label: 'Explorer',
    description: 'Play 10 different puzzles',
    emoji: '🧭',
    check: () => (typeof window !== 'undefined' ? (parseInt(localStorage.getItem('puzzles-played') || '0', 10) >= 10) : false),
  },
  {
    id: 'daily-streak',
    label: 'Daily Streak',
    description: '5 daily challenges in a row',
    emoji: '🌞',
    check: () => (typeof window !== 'undefined' ? (parseInt(localStorage.getItem('daily-streak') || '0', 10) >= 5) : false),
  },
];

function getUnlockedAchievements() {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('achievements') || '[]');
}
function unlockAchievement(id: string) {
  if (typeof window === 'undefined') return;
  const unlocked = new Set(getUnlockedAchievements());
  unlocked.add(id);
  localStorage.setItem('achievements', JSON.stringify(Array.from(unlocked)));
}

// Utility to generate shareable result string
function generateShareText(state: any, mode: string, streak: number) {
  const correctPath = state.puzzle.shortestPath.slice(1, -1);
  const guesses = state.guessHistory;
  const emojiGrid = guesses.map((g: GuessResult) =>
    g.isCorrect ? '🟩' : g.distanceFromPath === 1 ? '🟧' : g.distanceFromPath === 2 ? '🟦' : '⬜️'
  ).join('');
  return `Nepal Traversal ${mode === 'challenge' ? 'Daily' : mode.charAt(0).toUpperCase() + mode.slice(1)}\nStreak: ${streak}\n${emojiGrid}\nScore: ${state.gameSession.score} | Time: ${state.timeElapsed}s`;
}

export default function NepalTraversalPage() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);

  // --- Daily Challenge State ---
  const [dailyCompleted, setDailyCompleted] = React.useState(false);
  const [dailyStreak, setDailyStreakState] = React.useState(getDailyStreak());
  const [showDaily, setShowDaily] = React.useState(false);

  // Get daily puzzle index
  const allPuzzles = React.useMemo(() => {
    // You may want to import all puzzles from your puzzle list
    // For now, use getRandomPuzzle to simulate
    return Array.from({ length: 20 }, (_, i) => getRandomPuzzle(true, 6));
  }, []);
  const dailyIndex = getDailyPuzzleIndex(allPuzzles.length);
  const dailyPuzzle = allPuzzles[dailyIndex];
  const todayStr = new Date().toISOString().slice(0, 10);

  // Check if daily already completed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const lastDate = getLastDailyDate();
    setDailyCompleted(lastDate === todayStr);
    setDailyStreakState(getDailyStreak());
  }, [todayStr]);

  // Handle daily challenge completion
  const handleDailyComplete = useCallback(() => {
    if (typeof window === 'undefined') return;
    const lastDate = getLastDailyDate();
    if (lastDate !== todayStr) {
      setLastDailyDate(todayStr);
      setDailyCompleted(true);
      const newStreak = getDailyStreak() + 1;
      setDailyStreak(newStreak);
      setDailyStreakState(newStreak);
    }
  }, [todayStr]);

  // Start daily challenge
  const startDailyChallenge = useCallback(() => {
    dispatch({ type: 'NEW_GAME', puzzle: dailyPuzzle });
    dispatch({ type: 'SET_MODE', mode: 'challenge' });
    setShowDaily(true);
  }, [dailyPuzzle]);

  // --- Timer ---
  useEffect(() => {
    if (!state.puzzle) return;
    const interval = setInterval(() => {
      dispatch({ type: 'SET_TIME_ELAPSED', timeElapsed: Math.floor((Date.now() - state.gameSession.startTime) / 1000) });
    }, 1000);
    return () => clearInterval(interval);
  }, [state.puzzle, state.gameSession.startTime]);

  // --- Scoring: mark daily as complete if in challenge mode and won ---
  useEffect(() => {
    if (state.mode === 'challenge' && state.puzzle) {
      const correctPath = state.puzzle.shortestPath.slice(1, -1);
      const isGameWon = correctPath.every(d => state.userPath.map(x => x.trim().toLowerCase()).includes(d.trim().toLowerCase()));
      if (isGameWon && !dailyCompleted) {
        handleDailyComplete();
      }
    }
  }, [state.mode, state.puzzle, state.userPath, dailyCompleted, handleDailyComplete]);

  // --- Dynamic Guess Limit ---
  const guessLimit = state.puzzle
    ? DifficultyProgression.getDynamicGuessLimit(state.puzzle.shortestPath.length, state.gameSession.difficulty)
    : 6;

  // --- Handle Guess ---
  const handleGuess = useCallback((district: string) => {
    if (!state.puzzle || state.userPath.length >= guessLimit) return;
    const correctPath = state.puzzle.shortestPath.slice(1, -1);
    const feedback = FeedbackSystem.getFeedbackForGuess(district, correctPath, DISTRICT_ADJACENCY);
    const isCorrect = feedback.type === 'perfect';
    const guessResult: GuessResult = {
      district,
      isCorrect,
      feedback: feedback.type,
      timestamp: Date.now(),
      distanceFromPath: feedback.distanceFromPath,
    };
    dispatch({ type: 'MAKE_GUESS', district, guessResult });
    dispatch({ type: 'SET_FEEDBACK', feedback: { type: feedback.type, message: feedback.message } });
  }, [state.puzzle, state.userPath.length, guessLimit]);

  // --- Undo Guess ---
  const handleUndo = useCallback(() => {
    dispatch({ type: 'UNDO_GUESS' });
  }, []);

  // --- Hint ---
  const handleHint = useCallback(() => {
    dispatch({ type: 'USE_HINT' });
  }, []);

  // --- New Game ---
  const handleNewGame = useCallback(() => {
    const puzzle = getRandomPuzzle(true, 6);
    dispatch({ type: 'NEW_GAME', puzzle });
  }, []);

  // --- Mode Change ---
  const handleModeChange = useCallback((mode: GameMode) => {
    dispatch({ type: 'SET_MODE', mode });
  }, []);

  // --- Achievements ---
  const [unlockedAchievements, setUnlockedAchievements] = React.useState<string[]>(getUnlockedAchievements());

  // Track puzzles played for explorer achievement
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const played = parseInt(localStorage.getItem('puzzles-played') || '0', 10);
    localStorage.setItem('puzzles-played', (played + 1).toString());
  }, [state.puzzle]);

  // Check and unlock achievements after win
  useEffect(() => {
    if (!state.puzzle) return;
    const correctPath = state.puzzle.shortestPath.slice(1, -1);
    const isGameWon = correctPath.every(d => state.userPath.map(x => x.trim().toLowerCase()).includes(d.trim().toLowerCase()));
    if (isGameWon) {
      ACHIEVEMENTS.forEach(ach => {
        if (!unlockedAchievements.includes(ach.id) && ach.check(state)) {
          unlockAchievement(ach.id);
        }
      });
      setUnlockedAchievements(getUnlockedAchievements());
    }
  }, [state.userPath, state.puzzle, state.timeElapsed]);

  // --- Social Sharing ---
  const [shareStatus, setShareStatus] = React.useState<string | null>(null);

  const handleShare = useCallback(() => {
    const text = generateShareText(state, state.mode, state.gameSession.streak);
    if (navigator.share) {
      navigator.share({ text }).then(() => setShareStatus('Shared!')).catch(() => setShareStatus('Share cancelled'));
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => setShareStatus('Copied to clipboard!'));
    } else {
      setShareStatus('Copy not supported');
    }
    setTimeout(() => setShareStatus(null), 2000);
  }, [state]);

  // --- UI ---
  if (!state.puzzle) {
    return <div>Loading...</div>;
  }

  function renderGameMode() {
    switch (state.mode) {
      case 'sequential':
        return (
          <SequentialModeGame
            puzzle={state.puzzle}
            onGuess={handleGuess}
            currentPath={state.userPath}
            gameStatus={'playing'}
          />
        );
      case 'timeAttack':
        return (
          <TimeAttackMode
            onTimeUp={handleNewGame}
            currentPuzzle={1}
            puzzlesCompleted={0}
            totalScore={state.gameSession.score}
          />
        );
      case 'exploration':
        return (
          <ExplorationMode
            allPossiblePaths={[]}
            discoveredPaths={new Set()}
            currentGuesses={state.userPath}
            onPathDiscovered={() => {}}
          />
        );
      case 'challenge':
        return (
          <>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold">Daily Challenge</span>
              <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">Streak: {dailyStreak}</span>
              {dailyCompleted && <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-semibold">Completed!</span>}
            </div>
            <DailyChallenge
              challengeData={{
                id: todayStr,
                title: 'Daily Puzzle',
                constraint: 'One attempt per day',
                puzzle: state.puzzle,
                deadline: new Date(new Date().setHours(24, 0, 0, 0))
              }}
              userAttempt={dailyCompleted ? { score: state.gameSession.score, completedAt: new Date(), rank: 1 } : undefined}
              leaderboard={[]}
              onSubmitAttempt={() => {}}
            />
          </>
        );
      case 'classic':
      default:
        // Check if game is won
        const correctPath = state.puzzle!.shortestPath.slice(1, -1);
        const isGameWon = correctPath.every(d => state.userPath.map(x => x.trim().toLowerCase()).includes(d.trim().toLowerCase()));
        return (
          <>
            <GameProgressDisplay
              foundDistricts={state.userPath.length}
              totalDistricts={state.puzzle!.shortestPath.length - 2}
              currentScore={state.gameSession.score}
              timeElapsed={state.timeElapsed}
              streak={state.gameSession.streak}
              difficulty={state.gameSession.difficulty}
            />
            {/* Achievements display */}
            <div className="flex flex-wrap gap-2 mb-2">
              {ACHIEVEMENTS.filter(a => unlockedAchievements.includes(a.id)).map(a => (
                <span key={a.id} title={a.description} className="flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-semibold">
                  <span>{a.emoji}</span> {a.label}
                </span>
              ))}
            </div>
            <InteractiveNepalMap
              guessedPath={state.userPath}
              correctPath={state.puzzle!.shortestPath}
              startDistrict={state.puzzle!.startDistrict}
              endDistrict={state.puzzle!.endDistrict}
              onDistrictClick={handleGuess}
              showAdjacencies={false}
              showHints={false}
            />
            <EnhancedGuessInput
              onGuess={handleGuess}
              onUndo={handleUndo}
              onHint={handleHint}
              canUndo={state.userPath.length > 0}
              hintsRemaining={3 - state.hints.count}
              isLoading={false}
              lastFeedback={state.lastFeedback}
              suggestedDistricts={Object.keys(DISTRICT_ADJACENCY)}
            />
            <EnhancedGuessHistory
              guesses={state.guessHistory}
              correctPath={state.puzzle!.shortestPath.slice(1, -1)}
            />
            {/* Social Share Button */}
            {isGameWon && (
              <div className="flex flex-col items-center mt-4">
                <button
                  onClick={handleShare}
                  className="px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
                >
                  Share Result
                </button>
                {shareStatus && <span className="mt-2 text-green-700 text-sm">{shareStatus}</span>}
              </div>
            )}
          </>
        );
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 px-2 py-4 min-h-screen bg-background selection:bg-primary/20">
      <div className="w-full mb-2 flex flex-col gap-2">
        <GameModeSelector
          selectedMode={state.mode}
          onModeSelect={handleModeChange}
          className="w-full"
        />
        <div className="flex gap-2 items-center">
          <button
            className="px-3 py-2 rounded bg-yellow-200 text-yellow-900 font-semibold text-sm shadow hover:bg-yellow-300 transition"
            onClick={startDailyChallenge}
            disabled={dailyCompleted}
          >
            {dailyCompleted ? 'Daily Completed' : 'Play Daily Challenge'}
          </button>
          <span className="text-xs text-muted-foreground">Streak: {dailyStreak}</span>
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full">
        {renderGameMode()}
      </div>
      <div className="w-full flex justify-center mt-2">
        <Button onClick={handleNewGame} className="w-full max-w-xs text-lg py-3 rounded-lg shadow-md">New Game</Button>
      </div>
      {/* Mobile-specific spacing for keyboard and safe area */}
      <div className="h-8 md:h-0" />
    </div>
  );
}
