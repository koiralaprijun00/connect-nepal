import type { Puzzle } from '@/types';
import { GameState, GameAction, GuessResult, FeedbackMessage, FeedbackType, gameStateReducer, createInitialGameState } from './GameState';

export class GameEngine {
  private state: GameState;
  private adjacencyMap: Record<string, string[]>;
  private guessedDistricts = new Set<string>();

  constructor(puzzle: Puzzle, adjacencyMap: Record<string, string[]>) {
    this.state = createInitialGameState(puzzle);
    this.adjacencyMap = adjacencyMap;
    this.guessedDistricts.clear();
  }

  makeGuess(district: string): GuessResult {
    const normalizedDistrict = district.trim();
    const normalizedLower = normalizedDistrict.toLowerCase();

    // Check for duplicate
    if (this.guessedDistricts.has(normalizedLower)) {
      const result: GuessResult = {
        district: normalizedDistrict,
        isCorrect: false,
        feedback: 'duplicate',
        timestamp: Date.now(),
        distanceFromPath: Infinity,
      };

      const feedback: FeedbackMessage = {
        type: 'duplicate',
        message: '🔄 You already guessed this district!',
      };

      this.dispatch({ type: 'MAKE_GUESS', result, feedback });
      return result;
    }

    // Validate district
    if (!this.adjacencyMap[normalizedLower]) {
      const result: GuessResult = {
        district: normalizedDistrict,
        isCorrect: false,
        feedback: 'invalid',
        timestamp: Date.now(),
        distanceFromPath: Infinity,
      };

      const feedback: FeedbackMessage = {
        type: 'invalid',
        message: '🚫 Invalid district name.',
      };

      this.dispatch({ type: 'MAKE_GUESS', result, feedback });
      return result;
    }

    // Check if guess is correct
    const requiredIntermediates = this.state.puzzle.shortestPath
      .slice(1, -1)
      .map(d => d.toLowerCase());

    const isCorrect = requiredIntermediates.includes(normalizedLower);
    const distanceFromPath = isCorrect ? 0 : this.calculateDistanceFromPath(normalizedLower);
    
    const feedback = this.generateFeedback(isCorrect, distanceFromPath, normalizedDistrict);
    
    const result: GuessResult = {
      district: normalizedDistrict,
      isCorrect,
      feedback: feedback.type as FeedbackType,
      timestamp: Date.now(),
      distanceFromPath,
    };

    this.guessedDistricts.add(normalizedLower);
    this.dispatch({ type: 'MAKE_GUESS', result, feedback });
    
    return result;
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

  private dispatch(action: GameAction): void {
    this.state = gameStateReducer(this.state, action);
  }

  private calculateDistanceFromPath(district: string): number {
    const pathDistricts = this.state.puzzle.shortestPath.map(d => d.toLowerCase());
    let minDistance = Infinity;

    for (const pathDistrict of pathDistricts) {
      const distance = this.calculateBFSDistance(district, pathDistrict, 4);
      minDistance = Math.min(minDistance, distance);
    }

    return minDistance;
  }

  private calculateBFSDistance(start: string, end: string, maxDepth: number): number {
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
  }

  private generateFeedback(isCorrect: boolean, distanceFromPath: number, district: string): FeedbackMessage {
    if (isCorrect) {
      return {
        type: 'perfect',
        message: `🎯 Perfect! ${district} is on the shortest path!`,
      };
    }

    if (distanceFromPath === 1) {
      return {
        type: 'close',
        message: '🔥 Very close! Adjacent to the correct path.',
      };
    } else if (distanceFromPath === 2) {
      return {
        type: 'warm',
        message: '🌊 Getting warmer! 2 districts away.',
      };
    } else {
      return {
        type: 'cold',
        message: '❄️ Too far from the correct path.',
      };
    }
  }
}