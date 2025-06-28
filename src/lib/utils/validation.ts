/**
 * Validation utilities with proper error handling
 */

import { DISTRICTS_NEPAL } from '@/lib/puzzle';
import type { Puzzle } from '@/types';

export class ValidationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: string[];
  warnings: string[];
}

// District name validation with detailed feedback
export function validateDistrictName(input: string): ValidationResult<string> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!input || typeof input !== 'string') {
    errors.push('District name is required');
    return { isValid: false, errors, warnings };
  }
  
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    errors.push('District name cannot be empty');
    return { isValid: false, errors, warnings };
  }
  
  if (trimmed.length < 2) {
    errors.push('District name must be at least 2 characters');
    return { isValid: false, errors, warnings };
  }
  
  // Check for exact match (case insensitive)
  const exactMatch = DISTRICTS_NEPAL.find(d => 
    d.toLowerCase() === trimmed.toLowerCase()
  );
  
  if (exactMatch) {
    return { 
      isValid: true, 
      data: exactMatch, 
      errors, 
      warnings 
    };
  }
  
  // Check for partial matches
  const partialMatches = DISTRICTS_NEPAL.filter(d =>
    d.toLowerCase().includes(trimmed.toLowerCase())
  );
  
  if (partialMatches.length === 1) {
    warnings.push(`Did you mean "${partialMatches[0]}"?`);
    return { 
      isValid: true, 
      data: partialMatches[0], 
      errors, 
      warnings 
    };
  }
  
  if (partialMatches.length > 1) {
    warnings.push(`Multiple matches found: ${partialMatches.slice(0, 3).join(', ')}`);
  }
  
  errors.push('District not found');
  return { isValid: false, errors, warnings };
}

// Puzzle validation
export function validatePuzzle(puzzle: Puzzle): ValidationResult<Puzzle> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!puzzle) {
    errors.push('Puzzle is required');
    return { isValid: false, errors, warnings };
  }
  
  if (!puzzle.id || puzzle.id.trim().length === 0) {
    errors.push('Puzzle ID is required');
  }
  
  if (!puzzle.startDistrict || puzzle.startDistrict.trim().length === 0) {
    errors.push('Start district is required');
  }
  
  if (!puzzle.endDistrict || puzzle.endDistrict.trim().length === 0) {
    errors.push('End district is required');
  }
  
  if (puzzle.startDistrict === puzzle.endDistrict) {
    errors.push('Start and end districts cannot be the same');
  }
  
  if (!Array.isArray(puzzle.shortestPath)) {
    errors.push('Shortest path must be an array');
  } else {
    if (puzzle.shortestPath.length < 2) {
      errors.push('Shortest path must have at least 2 districts');
    }
    
    if (puzzle.shortestPath[0]?.toLowerCase() !== puzzle.startDistrict.toLowerCase()) {
      errors.push('Shortest path must start with the start district');
    }
    
    const lastIndex = puzzle.shortestPath.length - 1;
    if (puzzle.shortestPath[lastIndex]?.toLowerCase() !== puzzle.endDistrict.toLowerCase()) {
      errors.push('Shortest path must end with the end district');
    }
    
    // Check for duplicate districts in path
    const pathSet = new Set(puzzle.shortestPath.map(d => d.toLowerCase()));
    if (pathSet.size !== puzzle.shortestPath.length) {
      errors.push('Shortest path cannot contain duplicate districts');
    }
    
    // Validate each district in path
    for (const district of puzzle.shortestPath) {
      const validation = validateDistrictName(district);
      if (!validation.isValid) {
        errors.push(`Invalid district in path: ${district}`);
      }
    }
    
    // Check path length
    const intermediateCount = puzzle.shortestPath.length - 2;
    if (intermediateCount > 10) {
      warnings.push(`Path has ${intermediateCount} intermediate districts (recommended max: 10)`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    data: errors.length === 0 ? puzzle : undefined,
    errors,
    warnings,
  };
}

// Game state validation
export function validateGameAction(action: any): ValidationResult<any> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!action || typeof action !== 'object') {
    errors.push('Action must be an object');
    return { isValid: false, errors, warnings };
  }
  
  if (!action.type || typeof action.type !== 'string') {
    errors.push('Action must have a type');
    return { isValid: false, errors, warnings };
  }
  
  const validActionTypes = [
    'INITIALIZE_GAME',
    'MAKE_GUESS',
    'UNDO_GUESS',
    'NEW_GAME',
    'SET_FEEDBACK',
    'SET_STATUS'
  ];
  
  if (!validActionTypes.includes(action.type)) {
    errors.push(`Invalid action type: ${action.type}`);
  }
  
  return {
    isValid: errors.length === 0,
    data: errors.length === 0 ? action : undefined,
    errors,
    warnings,
  };
}

// Input sanitization
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/\s+/g, ' ') // Normalize whitespace
    .slice(0, 100); // Limit length
}

// Type guards
export function isPuzzle(obj: any): obj is Puzzle {
  return obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.startDistrict === 'string' &&
    typeof obj.endDistrict === 'string' &&
    Array.isArray(obj.shortestPath);
}

export function isValidDistrictArray(arr: any): arr is string[] {
  return Array.isArray(arr) && 
    arr.every(item => typeof item === 'string' && item.trim().length > 0);
}