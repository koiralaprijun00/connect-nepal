import { DISTRICTS_NEPAL, validateDistrictName } from '@/lib/puzzle';

// District state types
export type DistrictState = 'default' | 'start' | 'end' | 'correct' | 'incorrect' | 'hint' | 'path';

// Color configuration for different district states
export interface DistrictColorConfig {
  fill: string;
  stroke: string;
  strokeWidth: string;
  hover: {
    fill: string;
    stroke: string;
  };
}

// District color configurations
export const DISTRICT_COLORS: Record<DistrictState, DistrictColorConfig> = {
  default: {
    fill: 'fill-gray-200',
    stroke: 'stroke-gray-400',
    strokeWidth: 'stroke-1',
    hover: {
      fill: 'hover:fill-gray-300',
      stroke: 'hover:stroke-gray-500',
    },
  },
  start: {
    fill: 'fill-green-500',
    stroke: 'stroke-green-700',
    strokeWidth: 'stroke-2',
    hover: {
      fill: 'hover:fill-green-600',
      stroke: 'hover:stroke-green-800',
    },
  },
  end: {
    fill: 'fill-red-500',
    stroke: 'stroke-red-700',
    strokeWidth: 'stroke-2',
    hover: {
      fill: 'hover:fill-red-600',
      stroke: 'hover:stroke-red-800',
    },
  },
  correct: {
    fill: 'fill-yellow-500',
    stroke: 'stroke-yellow-700',
    strokeWidth: 'stroke-2',
    hover: {
      fill: 'hover:fill-yellow-600',
      stroke: 'hover:stroke-yellow-800',
    },
  },
  incorrect: {
    fill: 'fill-pink-300',
    stroke: 'stroke-pink-500',
    strokeWidth: 'stroke-1',
    hover: {
      fill: 'hover:fill-pink-400',
      stroke: 'hover:stroke-pink-600',
    },
  },
  hint: {
    fill: 'fill-blue-300',
    stroke: 'stroke-blue-500',
    strokeWidth: 'stroke-2',
    hover: {
      fill: 'hover:fill-blue-400',
      stroke: 'hover:stroke-blue-600',
    },
  },
  path: {
    fill: 'fill-purple-300',
    stroke: 'stroke-purple-500',
    strokeWidth: 'stroke-2',
    hover: {
      fill: 'hover:fill-purple-400',
      stroke: 'hover:stroke-purple-600',
    },
  },
};

/**
 * Normalize district names for consistent comparison
 */
export const normalizeDistrictName = (name: string): string => {
  return name.toLowerCase().trim().replace(/\s+/g, '').replace(/[^a-z]/g, '');
};

/**
 * Create a mapping of normalized names to display names
 */
export const createDistrictNameMap = (): Record<string, string> => {
  const map: Record<string, string> = {};
  
  DISTRICTS_NEPAL.forEach(district => {
    const normalized = normalizeDistrictName(district);
    map[normalized] = district;
  });
  
  return map;
};

// Cached district name mapping
export const DISTRICT_NAME_MAP = createDistrictNameMap();

/**
 * Find the proper district name from various input formats
 */
export const findDistrictName = (input: string): string | null => {
  const normalized = normalizeDistrictName(input);
  
  // Direct lookup in our mapping
  if (DISTRICT_NAME_MAP[normalized]) {
    return DISTRICT_NAME_MAP[normalized];
  }
  
  // Use the existing validation function as fallback
  return validateDistrictName(input);
};

/**
 * Determine the state of a district based on game state
 */
export const getDistrictState = (
  district: string,
  gameState: {
    startDistrict: string;
    endDistrict: string;
    correctGuesses: string[];
    incorrectGuesses?: string[];
    hintedDistricts?: string[];
    pathDistricts?: string[];
  }
): DistrictState => {
  const normalized = normalizeDistrictName(district);
  const {
    startDistrict,
    endDistrict,
    correctGuesses,
    incorrectGuesses = [],
    hintedDistricts = [],
    pathDistricts = []
  } = gameState;
  
  // Check if it's start or end district
  if (normalized === normalizeDistrictName(startDistrict)) return 'start';
  if (normalized === normalizeDistrictName(endDistrict)) return 'end';
  
  // Check if it's a hinted district
  const isHinted = hintedDistricts.some(hint => 
    normalizeDistrictName(hint) === normalized
  );
  if (isHinted) return 'hint';
  
  // Check if it's part of the revealed path
  const isOnPath = pathDistricts.some(pathDistrict => 
    normalizeDistrictName(pathDistrict) === normalized
  );
  if (isOnPath) return 'path';
  
  // Check if it's a correct guess
  const isCorrect = correctGuesses.some(guess => 
    normalizeDistrictName(guess) === normalized
  );
  if (isCorrect) return 'correct';
  
  // Check if it's an incorrect guess
  const isIncorrect = incorrectGuesses.some(guess => 
    normalizeDistrictName(guess) === normalized
  );
  if (isIncorrect) return 'incorrect';
  
  return 'default';
};

/**
 * Generate CSS classes for a district based on its state
 */
export const getDistrictClasses = (
  state: DistrictState,
  isInteractive: boolean = true,
  customClasses: string = ''
): string => {
  const config = DISTRICT_COLORS[state];
  const baseClasses = [
    'transition-all',
    'duration-200',
    config.fill,
    config.stroke,
    config.strokeWidth,
  ];
  
  if (isInteractive) {
    baseClasses.push(
      'cursor-pointer',
      config.hover.fill,
      config.hover.stroke,
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-blue-500',
      'focus:ring-offset-1'
    );
  }
  
  if (customClasses) {
    baseClasses.push(customClasses);
  }
  
  return baseClasses.join(' ');
};

/**
 * Create a state mapping for all districts for performance optimization
 */
export const createDistrictStateMap = (
  gameState: {
    startDistrict: string;
    endDistrict: string;
    correctGuesses: string[];
    incorrectGuesses?: string[];
    hintedDistricts?: string[];
    pathDistricts?: string[];
  }
): Record<string, DistrictState> => {
  const stateMap: Record<string, DistrictState> = {};
  
  DISTRICTS_NEPAL.forEach(district => {
    stateMap[district] = getDistrictState(district, gameState);
  });
  
  return stateMap;
};

/**
 * Validate if a district click should be allowed
 */
export const isDistrictClickable = (
  district: string,
  gameState: {
    startDistrict: string;
    endDistrict: string;
    correctGuesses: string[];
    isGameWon: boolean;
  }
): { clickable: boolean; reason?: string } => {
  const normalized = normalizeDistrictName(district);
  const { startDistrict, endDistrict, correctGuesses, isGameWon } = gameState;
  
  // Game is over
  if (isGameWon) {
    return { clickable: false, reason: 'Game is already completed' };
  }
  
  // Can't click start district
  if (normalized === normalizeDistrictName(startDistrict)) {
    return { clickable: false, reason: 'Cannot select the start district' };
  }
  
  // Can't click end district
  if (normalized === normalizeDistrictName(endDistrict)) {
    return { clickable: false, reason: 'Cannot select the end district' };
  }
  
  // Already correctly guessed
  const alreadyGuessed = correctGuesses.some(guess => 
    normalizeDistrictName(guess) === normalized
  );
  if (alreadyGuessed) {
    return { clickable: false, reason: 'District already correctly guessed' };
  }
  
  return { clickable: true };
};

/**
 * Process SVG map data and extract district information
 */
export interface DistrictPathInfo {
  id: string;
  name: string;
  path: string;
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Extract district paths from SVG content
 */
export const extractDistrictPaths = (svgContent: string): DistrictPathInfo[] => {
  const districts: DistrictPathInfo[] = [];
  
  // Parse SVG and extract path elements
  // This is a simplified implementation - you might need a proper SVG parser
  const pathRegex = /<path[^>]*id="([^"]*)"[^>]*d="([^"]*)"[^>]*>/g;
  let match;
  
  while ((match = pathRegex.exec(svgContent)) !== null) {
    const [, id, path] = match;
    const districtName = findDistrictName(id);
    
    if (districtName) {
      districts.push({
        id,
        name: districtName,
        path,
      });
    }
  }
  
  return districts;
};

/**
 * Calculate bounding box for an SVG path (simplified)
 */
export const calculatePathBounds = (pathData: string): { x: number; y: number; width: number; height: number } | null => {
  // This is a simplified implementation
  // For production, you'd want to use a proper SVG path parser
  const numbers = pathData.match(/[-+]?[0-9]*\.?[0-9]+/g);
  
  if (!numbers || numbers.length < 4) return null;
  
  const coords = numbers.map(n => parseFloat(n));
  const xCoords = coords.filter((_, i) => i % 2 === 0);
  const yCoords = coords.filter((_, i) => i % 2 === 1);
  
  const minX = Math.min(...xCoords);
  const maxX = Math.max(...xCoords);
  const minY = Math.min(...yCoords);
  const maxY = Math.max(...yCoords);
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

/**
 * Generate a color palette for different map themes
 */
export const MAP_THEMES = {
  default: DISTRICT_COLORS,
  highContrast: {
    ...DISTRICT_COLORS,
    start: {
      fill: 'fill-green-600',
      stroke: 'stroke-black',
      strokeWidth: 'stroke-3',
      hover: { fill: 'hover:fill-green-700', stroke: 'hover:stroke-black' },
    },
    end: {
      fill: 'fill-red-600',
      stroke: 'stroke-black',
      strokeWidth: 'stroke-3',
      hover: { fill: 'hover:fill-red-700', stroke: 'hover:stroke-black' },
    },
    correct: {
      fill: 'fill-yellow-400',
      stroke: 'stroke-black',
      strokeWidth: 'stroke-2',
      hover: { fill: 'hover:fill-yellow-500', stroke: 'hover:stroke-black' },
    },
  },
  colorBlind: {
    ...DISTRICT_COLORS,
    start: {
      fill: 'fill-blue-500',
      stroke: 'stroke-blue-700',
      strokeWidth: 'stroke-2',
      hover: { fill: 'hover:fill-blue-600', stroke: 'hover:stroke-blue-800' },
    },
    end: {
      fill: 'fill-orange-500',
      stroke: 'stroke-orange-700',
      strokeWidth: 'stroke-2',
      hover: { fill: 'hover:fill-orange-600', stroke: 'hover:stroke-orange-800' },
    },
  },
} as const;

/**
 * Utility to get theme-based district classes
 */
export const getThemedDistrictClasses = (
  state: DistrictState,
  theme: keyof typeof MAP_THEMES = 'default',
  isInteractive: boolean = true
): string => {
  const themeColors = MAP_THEMES[theme];
  const config = themeColors[state];
  
  const baseClasses = [
    'transition-all',
    'duration-200',
    config.fill,
    config.stroke,
    config.strokeWidth,
  ];
  
  if (isInteractive) {
    baseClasses.push(
      'cursor-pointer',
      config.hover.fill,
      config.hover.stroke,
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-blue-500',
      'focus:ring-offset-1'
    );
  }
  
  return baseClasses.join(' ');
};

/**
 * Debounce utility for map interactions
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Performance optimization: Memoize district state calculations
 */
class DistrictStateCache {
  private cache = new Map<string, DistrictState>();
  private lastGameStateHash = '';
  
  private hashGameState(gameState: any): string {
    return JSON.stringify(gameState);
  }
  
  getDistrictState(district: string, gameState: any): DistrictState {
    const currentHash = this.hashGameState(gameState);
    
    // Clear cache if game state changed
    if (currentHash !== this.lastGameStateHash) {
      this.cache.clear();
      this.lastGameStateHash = currentHash;
    }
    
    const cacheKey = `${district}-${currentHash}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    const state = getDistrictState(district, gameState);
    this.cache.set(cacheKey, state);
    return state;
  }
  
  clear(): void {
    this.cache.clear();
    this.lastGameStateHash = '';
  }
}

export const districtStateCache = new DistrictStateCache();

/**
 * Map viewport utilities for responsive behavior
 */
export interface MapViewport {
  width: number;
  height: number;
  viewBox: string;
  scale: number;
}

export const calculateOptimalViewport = (
  containerWidth: number,
  containerHeight: number,
  mapAspectRatio: number = 2 // Nepal is roughly 2:1 width to height
): MapViewport => {
  const containerAspectRatio = containerWidth / containerHeight;
  
  let width, height, scale;
  
  if (containerAspectRatio > mapAspectRatio) {
    // Container is wider than map
    height = containerHeight;
    width = height * mapAspectRatio;
    scale = containerHeight / 400; // Assuming base map height of 400
  } else {
    // Container is taller than map
    width = containerWidth;
    height = width / mapAspectRatio;
    scale = containerWidth / 800; // Assuming base map width of 800
  }
  
  return {
    width,
    height,
    viewBox: `0 0 800 400`, // Standard Nepal map dimensions
    scale: Math.max(0.5, Math.min(2, scale)), // Clamp scale between 0.5x and 2x
  };
};