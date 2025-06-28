/**
 * Game Configuration Constants
 * Centralized configuration for game behavior and limits
 */

export const GAME_CONFIG = {
  // Puzzle constraints
  MAX_INTERMEDIATE_DISTRICTS: 10,
  MIN_INTERMEDIATE_DISTRICTS: 1,
  
  // Difficulty settings
  DIFFICULTY_THRESHOLDS: {
    EASY_MAX: 2,
    MEDIUM_MAX: 5,
    HARD_MAX: 10,
  } as const,
  
  // Performance settings
  MAX_PUZZLE_GENERATION_ATTEMPTS: 1000,
  BFS_MAX_DEPTH: 4,
  AUTOCOMPLETE_LIMIT: 8,
  AUTOCOMPLETE_MIN_CHARS: 3,
  
  // UI settings
  DEBOUNCE_DELAY: 150,
  ANIMATION_DURATION: 200,
  TOAST_DURATION: 5000,
  
  // Game mechanics
  HINT_PENALTY_SCORE: 50,
  TIME_BONUS_MULTIPLIER: 5,
  
  // Storage keys
  STORAGE_PREFIX: 'nepal_traversal_',
  STORAGE_KEYS: {
    GAME_STATS: 'game_stats',
    USER_PREFERENCES: 'user_preferences',
    ACHIEVEMENT_PROGRESS: 'achievement_progress',
  } as const,
} as const;

export const FEEDBACK_MESSAGES = {
  PERFECT: '🎯 Perfect! {district} is on the shortest path!',
  CLOSE: '🔥 Very close! Adjacent to the correct path.',
  WARM: '🌊 Getting warmer! 2 districts away.',
  COLD: '❄️ Too far from the correct path.',
  DUPLICATE: '🔄 You already guessed this district!',
  INVALID: '🚫 Invalid district name.',
  START_DISTRICT: '🚫 Cannot guess the start district.',
  END_DISTRICT: '🚫 Cannot guess the end district.',
  HINT_USED: '💡 Try: {hint}',
  NO_HINTS: '💡 No more hints available!',
  GAME_WON: '🎉 Congratulations! You found the shortest path!',
  UNDO_SUCCESS: 'Last guess undone',
  UNDO_FAILED: 'Nothing to undo',
  SHARE_SUCCESS: 'Results copied to clipboard!',
  SHARE_FAILED: 'Failed to share results',
} as const;

export type FeedbackMessageKey = keyof typeof FEEDBACK_MESSAGES;