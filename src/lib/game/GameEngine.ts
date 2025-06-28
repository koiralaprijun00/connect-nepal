import type { Puzzle } from '@/types';
import { GuessResult, FeedbackType } from './GameState';
import { validateDistrictName } from '@/lib/puzzle';

export class GameEngine {
  private puzzle: Puzzle;
  private adjacencyMap: Record<string, string[]>;
  private guessedDistricts = new Set<string>();
  private guesses: GuessResult[] = [];

  constructor(puzzle: Puzzle, adjacencyMap: Record<string, string[]>) {
    this.puzzle = puzzle;
    this.adjacencyMap = adjacencyMap;
    this.guessedDistricts.clear();
    this.guesses = [];
  }

  makeGuess(district: string): GuessResult {
    console.log('GameEngine.makeGuess called with:', district);
    
    const normalizedDistrict = district.trim();
    const normalizedLower = normalizedDistrict.toLowerCase();

    // Check for duplicate
    if (this.guessedDistricts.has(normalizedLower)) {
      const result = this.createGuessResult(normalizedDistrict, false, 'duplicate', Infinity);
      this.guesses.push(result);
      return result;
    }

    // Check if trying to guess start/end districts
    if (normalizedLower === this.puzzle.startDistrict.toLowerCase()) {
      const result = this.createGuessResult(normalizedDistrict, false, 'invalid', Infinity);
      this.guesses.push(result);
      return result;
    }

    if (normalizedLower === this.puzzle.endDistrict.toLowerCase()) {
      const result = this.createGuessResult(normalizedDistrict, false, 'invalid', Infinity);
      this.guesses.push(result);
      return result;
    }

    // Validate district exists
    const validatedDistrict = validateDistrictName(normalizedDistrict);
    if (!validatedDistrict) {
      const result = this.createGuessResult(normalizedDistrict, false, 'invalid', Infinity);
      this.guesses.push(result);
      return result;
    }

    const validatedLower = validatedDistrict.toLowerCase();

    // Check if guess is correct
    const requiredIntermediates = this.puzzle.shortestPath
      .slice(1, -1)
      .map(d => d.toLowerCase());

    const isCorrect = requiredIntermediates.includes(validatedLower);
    const distanceFromPath = isCorrect ? 0 : this.calculateDistanceFromPath(validatedLower);
    
    const feedbackType = this.determineFeedbackType(isCorrect, distanceFromPath);
    
    const result = this.createGuessResult(validatedDistrict, isCorrect, feedbackType, distanceFromPath);

    this.guessedDistricts.add(validatedLower);
    this.guesses.push(result);
    
    console.log('GameEngine guess result:', result);
    return result;
  }

  undoLastGuess(): boolean {
    if (this.guesses.length === 0) return false;
    
    const lastGuess = this.guesses.pop()!;
    this.guessedDistricts.delete(lastGuess.district.toLowerCase());
    
    return true;
  }

  getHint(): string | null {
    const correctGuesses = new Set(
      this.guesses
        .filter(g => g.isCorrect)
        .map(g => g.district.toLowerCase())
    );

    const requiredIntermediates = this.puzzle.shortestPath.slice(1, -1);
    
    for (const district of requiredIntermediates) {
      if (!correctGuesses.has(district.toLowerCase())) {
        return district;
      }
    }
    
    return null;
  }

  isGameWon(): boolean {
    const correctGuesses = new Set(
      this.guesses
        .filter(g => g.isCorrect)
        .map(g => g.district.toLowerCase())
    );
    
    const requiredIntermediates = this.puzzle.shortestPath
      .slice(1, -1)
      .map(d => d.toLowerCase());
    
    return requiredIntermediates.every(district => correctGuesses.has(district));
  }

  getGuessHistory(): readonly GuessResult[] {
    return [...this.guesses];
  }

  getRequiredIntermediates(): string[] {
    return this.puzzle.shortestPath.slice(1, -1);
  }

  getProgress(): {
    totalRequired: number;
    correctGuesses: number;
    incorrectGuesses: number;
    completionPercentage: number;
  } {
    const correctGuesses = this.guesses.filter(g => g.isCorrect).length;
    const incorrectGuesses = this.guesses.filter(g => !g.isCorrect && g.feedback !== 'duplicate').length;
    const totalRequired = this.getRequiredIntermediates().length;
    
    return {
      totalRequired,
      correctGuesses,
      incorrectGuesses,
      completionPercentage: totalRequired > 0 ? (correctGuesses / totalRequired) * 100 : 0,
    };
  }

  // Private helper methods
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

  private calculateDistanceFromPath(district: string): number {
    const pathDistricts = this.puzzle.shortestPath.map(d => d.toLowerCase());
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

  private determineFeedbackType(isCorrect: boolean, distanceFromPath: number): FeedbackType {
    if (isCorrect) return 'perfect';
    if (distanceFromPath === 1) return 'close';
    if (distanceFromPath === 2) return 'warm';
    return 'cold';
  }
}