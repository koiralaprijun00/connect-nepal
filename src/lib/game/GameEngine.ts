import type { Puzzle } from '@/types';
import { GameState, GameAction, GuessResult, FeedbackMessage, FeedbackType, gameStateReducer, createInitialGameState } from './GameState';
import { GAME_CONFIG, FEEDBACK_MESSAGES } from '@/lib/constants/gameConfig';
import { memoize } from '@/lib/utils/performance';
import { validateDistrictName, ValidationError } from '@/lib/utils/validation';

export class GameEngine {
  private state: GameState;
  private adjacencyMap: Record<string, string[]>;
  private guessedDistricts = new Set<string>();

  // Memoized distance calculation for performance
  private calculateBFSDistance = memoize(
    (start: string, end: string, maxDepth: number): number => {
      if (start === end) return 0;
      
      const queue: [string, number][] = [[start, 0]];
      const visited = new Set([start]);
      
      while (queue.length > 0) {
        const [current, distance] = queue.shift()!;
        
        if (distance >= maxDepth) continue;
        
        for (const neighbor of this.adjacencyMap[current] || []) {
          if (visited.has(neighbor)) continue;
          if (neighbor === end) return distance + 1;
          
          visited.add(neighbor);
          queue.push([neighbor, distance + 1]);
        }
      }
      
      return maxDepth + 1;
    },
    50 // Cache up to 50 distance calculations
  );

  constructor(puzzle: Puzzle, adjacencyMap: Record<string, string[]>) {
    this.state = createInitialGameState(puzzle);
    this.adjacencyMap = adjacencyMap;
    this.guessedDistricts.clear();
  }

  makeGuess(district: string): GuessResult {
    try {
      const normalizedDistrict = district.trim();
      const normalizedLower = normalizedDistrict.toLowerCase();

      // Validate input
      if (!normalizedDistrict) {
        throw new ValidationError('District name cannot be empty', 'EMPTY_INPUT');
      }

      // Check for duplicate
      if (this.guessedDistricts.has(normalizedLower)) {
        const result = this.createGuessResult(normalizedDistrict, false, 'duplicate', Infinity);
        const feedback = this.createFeedback('duplicate', FEEDBACK_MESSAGES.DUPLICATE);
        this.dispatch({ type: 'MAKE_GUESS', result, feedback });
        return result;
      }

      // Check if trying to guess start/end districts
      if (normalizedLower === this.state.puzzle.startDistrict.toLowerCase()) {
        const result = this.createGuessResult(normalizedDistrict, false, 'invalid', Infinity);
        const feedback = this.createFeedback('invalid', FEEDBACK_MESSAGES.START_DISTRICT);
        this.dispatch({ type: 'MAKE_GUESS', result, feedback });
        return result;
      }

      if (normalizedLower === this.state.puzzle.endDistrict.toLowerCase()) {
        const result = this.createGuessResult(normalizedDistrict, false, 'invalid', Infinity);
        const feedback = this.createFeedback('invalid', FEEDBACK_MESSAGES.END_DISTRICT);
        this.dispatch({ type: 'MAKE_GUESS', result, feedback });
        return result;
      }

      // Validate district exists
      const validation = validateDistrictName(normalizedDistrict);
      if (!validation.isValid || !validation.data) {
        const result = this.createGuessResult(normalizedDistrict, false, 'invalid', Infinity);
        const feedback = this.createFeedback('invalid', FEEDBACK_MESSAGES.INVALID);
        this.dispatch({ type: 'MAKE_GUESS', result, feedback });
        return result;
      }

      const validatedDistrict = validation.data;
      const validatedLower = validatedDistrict.toLowerCase();

      // Check if guess is correct
      const requiredIntermediates = this.state.puzzle.shortestPath
        .slice(1, -1)
        .map(d => d.toLowerCase());

      const isCorrect = requiredIntermediates.includes(validatedLower);
      const distanceFromPath = isCorrect ? 0 : this.calculateDistanceFromPath(validatedLower);
      
      const feedbackType = this.determineFeedbackType(isCorrect, distanceFromPath);
      const feedbackMessage = this.generateFeedbackMessage(feedbackType, validatedDistrict);
      
      const result = this.createGuessResult(validatedDistrict, isCorrect, feedbackType, distanceFromPath);
      const feedback = this.createFeedback(feedbackType, feedbackMessage);

      this.guessedDistricts.add(validatedLower);
      this.dispatch({ type: 'MAKE_GUESS', result, feedback });
      
      return result;
    } catch (error) {
      console.error('Error making guess:', error);
      
      const result = this.createGuessResult(district, false, 'invalid', Infinity);
      const feedback = this.createFeedback('invalid', 'An error occurred processing your guess');
      this.dispatch({ type: 'MAKE_GUESS', result, feedback });
      
      return result;
    }
  }

  undoLastGuess(): boolean {
    if (this.state.guesses.length === 0) return false;
    
    const lastGuess = this.state.guesses[this.state.guesses.length - 1];
    this.guessedDistricts.delete(lastGuess.district.toLowerCase());
    this.dispatch({ type: 'UNDO_GUESS' });
    
    return true;
  }

  getHint(): string | null {
    const correctGuesses = new Set(
      this.state.guesses
        .filter(g => g.isCorrect)
        .map(g => g.district.toLowerCase())
    );

    const requiredIntermediates = this.state.puzzle.shortestPath.slice(1, -1);
    
    for (const district of requiredIntermediates) {
      if (!correctGuesses.has(district.toLowerCase())) {
        return district;
      }
    }
    
    return null;
  }

  isGameWon(): boolean {
    return this.state.status === 'won';
  }

  getState(): GameState {
    return this.state;
  }

  getGuessHistory(): readonly GuessResult[] {
    return this.state.guesses;
  }

  getRequiredIntermediates(): string[] {
    return this.state.puzzle.shortestPath.slice(1, -1);
  }

  getProgress(): {
    totalRequired: number;
    correctGuesses: number;
    incorrectGuesses: number;
    completionPercentage: number;
  } {
    const correctGuesses = this.state.guesses.filter(g => g.isCorrect).length;
    const incorrectGuesses = this.state.guesses.filter(g => !g.isCorrect && g.feedback !== 'duplicate').length;
    const totalRequired = this.getRequiredIntermediates().length;
    
    return {
      totalRequired,
      correctGuesses,
      incorrectGuesses,
      completionPercentage: totalRequired > 0 ? (correctGuesses / totalRequired) * 100 : 0,
    };
  }

  // Private helper methods
  private dispatch(action: GameAction): void {
    this.state = gameStateReducer(this.state, action);
  }

  private createGuessResult(
    district: string,
    isCorrect: boolean,
    feedback: FeedbackType,
    distanceFromPath: number
  ): GuessResult {
    return {
      district,
      isCorrect,
      feedback,
      timestamp: Date.now(),
      distanceFromPath,
    };
  }

  private createFeedback(type: FeedbackType | 'info' | 'hint' | 'error', message: string): FeedbackMessage {
    return { type, message };
  }

  private calculateDistanceFromPath(district: string): number {
    const pathDistricts = this.state.puzzle.shortestPath.map(d => d.toLowerCase());
    let minDistance = Infinity;

    for (const pathDistrict of pathDistricts) {
      const distance = this.calculateBFSDistance(district, pathDistrict, GAME_CONFIG.BFS_MAX_DEPTH);
      minDistance = Math.min(minDistance, distance);
    }

    return minDistance;
  }

  private determineFeedbackType(isCorrect: boolean, distanceFromPath: number): FeedbackType {
    if (isCorrect) return 'perfect';
    if (distanceFromPath === 1) return 'close';
    if (distanceFromPath === 2) return 'warm';
    return 'cold';
  }

  private generateFeedbackMessage(feedbackType: FeedbackType, district: string): string {
    switch (feedbackType) {
      case 'perfect':
        return FEEDBACK_MESSAGES.PERFECT.replace('{district}', district);
      case 'close':
        return FEEDBACK_MESSAGES.CLOSE;
      case 'warm':
        return FEEDBACK_MESSAGES.WARM;
      case 'cold':
        return FEEDBACK_MESSAGES.COLD;
      default:
        return FEEDBACK_MESSAGES.INVALID;
    }
  }
}