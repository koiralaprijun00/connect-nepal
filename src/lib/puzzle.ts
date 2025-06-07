import type { Puzzle } from '@/types';

// Complete list of all 77 districts of Nepal with standardized names
export const DISTRICTS_NEPAL = [
  // Province 1 (Koshi)
  "Bhojpur", "Dhankuta", "Ilam", "Jhapa", "Khotang", "Morang", "Okhaldhunga", 
  "Panchthar", "Sankhuwasabha", "Solukhumbu", "Sunsari", "Taplejung", 
  "Terhathum", "Udayapur",
  
  // Province 2 (Madhesh)
  "Bara", "Dhanusha", "Mahottari", "Parsa", "Rautahat", "Saptari", "Sarlahi", "Siraha",
  
  // Bagmati Province
  "Bhaktapur", "Chitwan", "Dhading", "Dolakha", "Kathmandu", "Kavrepalanchok", 
  "Lalitpur", "Makwanpur", "Nuwakot", "Ramechhap", "Rasuwa", "Sindhuli", 
  "Sindhupalchok",
  
  // Gandaki Province
  "Baglung", "Gorkha", "Kaski", "Lamjung", "Manang", "Mustang", "Myagdi", 
  "Nawalpur", "Parbat", "Syangja", "Tanahu",
  
  // Lumbini Province
  "Arghakhanchi", "Banke", "Bardiya", "Dang", "Gulmi", "Kapilvastu", "Palpa", 
  "Parasi", "Pyuthan", "Rolpa", "Rukum East", "Rupandehi",
  
  // Karnali Province
  "Dailekh", "Dolpa", "Humla", "Jajarkot", "Jumla", "Kalikot", "Mugu", 
  "Rukum West", "Salyan", "Surkhet",
  
  // Sudurpashchim Province
  "Achham", "Baitadi", "Bajhang", "Bajura", "Dadeldhura", "Darchula", 
  "Doti", "Kailali", "Kanchanpur"
].sort();

// District name variations and common misspellings mapping
export const DISTRICT_NAME_VARIATIONS: Record<string, string> = {
  // Handle old names and common variations
  'nawalparasi': 'Nawalpur', // Old unified district
  'nawalparasi east': 'Parasi',
  'nawalparasi west': 'Nawalpur', 
  'rukum': 'Rukum East', // Default to East for legacy
  'argakhanchi': 'Arghakhanchi', // Common misspelling
  
  // Ensure proper capitalization mapping
  'kathmandu': 'Kathmandu',
  'lalitpur': 'Lalitpur',
  'bhaktapur': 'Bhaktapur',
  'chitwan': 'Chitwan',
  'pokhara': 'Kaski', // City name to district
  'biratnagar': 'Morang', // City name to district
};

// Create comprehensive district lookup for validation
export function validateDistrictName(input: string): string | null {
  const normalized = input.trim();
  
  // Check exact match (case insensitive)
  const exactMatch = DISTRICTS_NEPAL.find(d => 
    d.toLowerCase() === normalized.toLowerCase()
  );
  if (exactMatch) return exactMatch;
  
  // Check variations mapping
  const variation = DISTRICT_NAME_VARIATIONS[normalized.toLowerCase()];
  if (variation) return variation;
  
  // Check partial match (for autocomplete)
  const partialMatch = DISTRICTS_NEPAL.find(d => 
    d.toLowerCase().includes(normalized.toLowerCase())
  );
  if (partialMatch && normalized.length >= 3) return partialMatch;
  
  return null;
}

// Maximum number of intermediate districts allowed between start and end
const MAX_INTERMEDIATE_DISTRICTS = 10;

// CORRECTED ADJACENCY MAP - Manually verified with preferred routes
// Order matters: BFS will find the first path, so preferred routes should come first
export const DISTRICT_ADJACENCY: Record<string, string[]> = {
  kathmandu: ['bhaktapur', 'lalitpur', 'nuwakot', 'dhading', 'sindhupalchok'],
  bhaktapur: ['kathmandu', 'lalitpur', 'kavrepalanchok'],
  lalitpur: ['kathmandu', 'bhaktapur', 'makwanpur', 'kavrepalanchok'],
  
  // CORRECTED: Southern plains (Terai) - prioritize east-west logical flow
  bara: ['rautahat', 'parsa'], // rautahat FIRST for preferred bara→rautahat→sarlahi→sindhuli route
  rautahat: ['bara', 'sarlahi', 'makwanpur', 'parsa'], // sarlahi FIRST for direct hill connection
  sarlahi: ['rautahat', 'sindhuli', 'mahottari', 'dhanusha'], // sindhuli FIRST for direct connection
  parsa: ['bara', 'rautahat', 'makwanpur', 'chitwan'], // Maintains connections but deprioritized
  
  // Key transition districts
  makwanpur: ['lalitpur', 'chitwan', 'dhading', 'sindhuli', 'kavrepalanchok', 'parsa', 'rautahat'], // sindhuli before parsa
  sindhuli: ['sarlahi', 'makwanpur', 'kavrepalanchok', 'ramechhap', 'mahottari', 'dhanusha', 'siraha', 'okhaldhunga', 'udayapur'],
  
  // Rest of Terai districts
  mahottari: ['sarlahi', 'sindhuli', 'dhanusha'],
  dhanusha: ['mahottari', 'sarlahi', 'sindhuli', 'siraha'],
  siraha: ['dhanusha', 'saptari', 'sindhuli', 'okhaldhunga', 'udayapur'],
  saptari: ['siraha', 'sunsari', 'udayapur'],
  sunsari: ['saptari', 'morang', 'udayapur', 'dhankuta'],
  
  chitwan: ['makwanpur', 'parsa', 'nawalpur', 'tanahu', 'gorkha', 'dhading'],
  dhading: ['kathmandu', 'nuwakot', 'rasuwa', 'gorkha', 'makwanpur', 'chitwan'],
  nuwakot: ['kathmandu', 'dhading', 'rasuwa', 'sindhupalchok'],
  rasuwa: ['nuwakot', 'dhading', 'sindhupalchok'],
  gorkha: ['dhading', 'lamjung', 'tanahu', 'manang', 'chitwan'],
  lamjung: ['gorkha', 'tanahu', 'kaski', 'manang'],
  tanahu: ['lamjung', 'kaski', 'syangja', 'chitwan', 'gorkha', 'nawalpur'],
  kaski: ['lamjung', 'tanahu', 'syangja', 'parbat', 'myagdi', 'manang'],
  syangja: ['kaski', 'tanahu', 'palpa', 'gulmi', 'parbat'],
  palpa: ['syangja', 'gulmi', 'nawalpur', 'parasi', 'rupandehi', 'arghakhanchi', 'kapilvastu'],
  gulmi: ['parbat', 'palpa', 'syangja', 'arghakhanchi', 'pyuthan', 'baglung'],
  nawalpur: ['palpa', 'chitwan', 'tanahu', 'parasi'],
  parasi: ['palpa', 'rupandehi', 'nawalpur'],
  rupandehi: ['parasi', 'kapilvastu', 'palpa'],
  kapilvastu: ['rupandehi', 'palpa', 'arghakhanchi', 'dang'],
  arghakhanchi: ['gulmi', 'palpa', 'kapilvastu', 'pyuthan', 'dang'],
  pyuthan: ['rolpa', 'gulmi', 'dang', 'arghakhanchi', 'salyan'],
  rolpa: ['pyuthan', 'salyan', 'gulmi', 'rukum east', 'dang', 'rukum west'],
  'rukum east': ['rolpa', 'baglung', 'myagdi', 'rukum west'],
  'rukum west': ['rolpa', 'salyan', 'jajarkot', 'dolpa', 'rukum east', 'jumla'],
  salyan: ['rolpa', 'pyuthan', 'rukum west', 'jajarkot', 'surkhet', 'dang'],
  dang: ['banke', 'pyuthan', 'salyan', 'kapilvastu', 'arghakhanchi', 'bardiya', 'rolpa'],
  banke: ['bardiya', 'dang', 'surkhet'],
  bardiya: ['banke', 'kailali', 'surkhet', 'dang'],
  kailali: ['bardiya', 'kanchanpur', 'doti', 'achham', 'surkhet'],
  kanchanpur: ['kailali', 'dadeldhura'],
  dadeldhura: ['kanchanpur', 'doti', 'baitadi'],
  doti: ['kailali', 'dadeldhura', 'achham', 'bajura', 'bajhang'],
  achham: ['kailali', 'doti', 'bajura', 'kalikot', 'dailekh', 'surkhet'],
  bajura: ['doti', 'achham', 'bajhang', 'mugu', 'humla', 'kalikot'],
  bajhang: ['doti', 'bajura', 'humla', 'darchula'],
  darchula: ['bajhang', 'baitadi'],
  baitadi: ['dadeldhura', 'darchula'],
  surkhet: ['banke', 'bardiya', 'kailali', 'achham', 'dailekh', 'jajarkot', 'salyan'],
  dailekh: ['surkhet', 'achham', 'kalikot', 'jajarkot'],
  jajarkot: ['salyan', 'rukum west', 'dolpa', 'surkhet', 'dailekh', 'kalikot'],
  kalikot: ['achham', 'dailekh', 'jajarkot', 'mugu', 'jumla', 'bajura'],
  mugu: ['bajura', 'humla', 'jumla', 'kalikot', 'dolpa'],
  humla: ['bajura', 'mugu', 'dolpa', 'bajhang'],
  jumla: ['mugu', 'kalikot', 'dolpa', 'rukum west'],
  dolpa: ['mustang', 'rukum west', 'jumla', 'mugu', 'humla', 'myagdi', 'baglung', 'jajarkot'],
  mustang: ['manang', 'dolpa', 'myagdi'],
  myagdi: ['mustang', 'dolpa', 'baglung', 'parbat', 'kaski', 'rukum east'],
  baglung: ['myagdi', 'parbat', 'gulmi', 'rukum east', 'dolpa'],
  parbat: ['gulmi', 'baglung', 'kaski', 'myagdi', 'syangja'],
  manang: ['gorkha', 'lamjung', 'kaski', 'mustang'], // Remove 'dolpa'
  sindhupalchok: ['kathmandu', 'nuwakot', 'rasuwa', 'dolakha', 'kavrepalanchok'],
  kavrepalanchok: ['bhaktapur', 'lalitpur', 'makwanpur', 'sindhupalchok', 'ramechhap', 'sindhuli'],
  dolakha: ['sindhupalchok', 'ramechhap', 'solukhumbu'],
  ramechhap: ['kavrepalanchok', 'dolakha', 'sindhuli', 'okhaldhunga', 'solukhumbu'],
  okhaldhunga: ['sindhuli', 'ramechhap', 'khotang', 'solukhumbu', 'udayapur', 'siraha'],
  khotang: ['okhaldhunga', 'bhojpur', 'solukhumbu', 'udayapur'],
  udayapur: ['saptari', 'sunsari', 'dhankuta', 'bhojpur', 'khotang', 'okhaldhunga', 'sindhuli', 'siraha'],
  solukhumbu: ['dolakha', 'ramechhap', 'okhaldhunga', 'khotang', 'sankhuwasabha', 'bhojpur'],
  morang: ['sunsari', 'jhapa', 'dhankuta', 'ilam'],
  jhapa: ['morang', 'ilam'],
  ilam: ['jhapa', 'morang', 'panchthar', 'dhankuta'],
  panchthar: ['ilam', 'taplejung', 'terhathum', 'dhankuta'],
  taplejung: ['panchthar', 'sankhuwasabha', 'terhathum'],
  sankhuwasabha: ['taplejung', 'terhathum', 'bhojpur', 'solukhumbu'],
  terhathum: ['panchthar', 'taplejung', 'sankhuwasabha', 'dhankuta', 'bhojpur'],
  dhankuta: ['sunsari', 'morang', 'ilam', 'panchthar', 'terhathum', 'bhojpur', 'udayapur'],
  bhojpur: ['dhankuta', 'terhathum', 'sankhuwasabha', 'solukhumbu', 'khotang', 'udayapur'],
};

// Add this to your code to find ALL asymmetric issues:
function validateAdjacencies(adjacencyMap: Record<string, string[]>): void {
  for (const [district, neighbors] of Object.entries(adjacencyMap)) {
    for (const neighbor of neighbors) {
      if (!adjacencyMap[neighbor]?.includes(district)) {
        console.error(`❌ Asymmetric: ${district} → ${neighbor}`);
      }
    }
  }
}

// Route verification and manual fixing utilities
export interface RouteVerificationResult {
  isPreferredRoute: boolean;
  actualRoute: string[] | null;
  allRoutes: string[][];
  issues: string[];
}

/**
 * Verify if a specific route is the preferred shortest path
 */
export function verifyPreferredRoute(
  start: string,
  end: string,
  expectedRoute: string[]
): RouteVerificationResult {
  const startKey = start.toLowerCase();
  const endKey = end.toLowerCase();
  const expectedLower = expectedRoute.map(d => d.toLowerCase());
  
  // Find actual shortest path
  const actualRoute = findShortestPath(startKey, endKey, DISTRICT_ADJACENCY);
  const allRoutes = findAllShortestPaths(startKey, endKey, DISTRICT_ADJACENCY);
  
  const issues: string[] = [];
  let isPreferredRoute = false;
  
  if (!actualRoute) {
    issues.push(`No route found from ${start} to ${end}`);
  } else if (actualRoute.length !== expectedLower.length) {
    issues.push(`Route length mismatch: expected ${expectedLower.length}, got ${actualRoute.length}`);
  } else if (JSON.stringify(actualRoute) === JSON.stringify(expectedLower)) {
    isPreferredRoute = true;
  } else {
    issues.push(`Different route found: ${actualRoute.join(' → ')} instead of ${expectedLower.join(' → ')}`);
    
    // Check if expected route exists among all shortest paths
    const expectedExists = allRoutes.some(route => 
      JSON.stringify(route) === JSON.stringify(expectedLower)
    );
    
    if (expectedExists) {
      issues.push("Expected route exists but is not prioritized. Consider reordering adjacency lists.");
    } else {
      issues.push("Expected route does not exist or is not a shortest path.");
    }
  }
  
  return {
    isPreferredRoute,
    actualRoute,
    allRoutes,
    issues
  };
}

/**
 * Manually fix a route by reordering adjacency priorities
 */
export function prioritizeRoute(
  start: string,
  preferredNext: string,
  adjacencyMap: Record<string, string[]> = DISTRICT_ADJACENCY
): boolean {
  const startKey = start.toLowerCase();
  const nextKey = preferredNext.toLowerCase();
  
  if (!adjacencyMap[startKey] || !adjacencyMap[startKey].includes(nextKey)) {
    return false; // Connection doesn't exist
  }
  
  // Move preferred connection to front of array
  const connections = adjacencyMap[startKey];
  const index = connections.indexOf(nextKey);
  
  if (index > 0) {
    connections.splice(index, 1); // Remove from current position
    connections.unshift(nextKey);  // Add to front
  }
  
  return true;
}

// Function to validate puzzle meets the intermediate district requirement
function validatePuzzle(puzzle: Puzzle): boolean {
  const intermediateCount = puzzle.shortestPath.length - 2; // Exclude start and end
  if (intermediateCount > MAX_INTERMEDIATE_DISTRICTS) {
    console.warn(`Puzzle ${puzzle.id} exceeds maximum intermediate districts (${intermediateCount} > ${MAX_INTERMEDIATE_DISTRICTS})`);
    return false;
  }
  return true;
}

// Simple manual puzzles for reliable fallback (using proper district names)
const MANUAL_PUZZLES: Puzzle[] = [
  {
    id: 'puzzle_1',
    startDistrict: 'Rupandehi',
    endDistrict: 'Gulmi',
    shortestPath: ['rupandehi', 'palpa', 'gulmi'],
  },
  {
    id: 'puzzle_2',
    startDistrict: 'Dhading',
    endDistrict: 'Chitwan',
    shortestPath: ['dhading', 'makwanpur', 'parsa', 'chitwan'],
  },
  {
    id: 'puzzle_3',
    startDistrict: 'Kathmandu',
    endDistrict: 'Lalitpur',
    shortestPath: ['kathmandu', 'lalitpur'],
  },
  {
    id: 'puzzle_4',
    startDistrict: 'Bara',
    endDistrict: 'Sindhuli',
    shortestPath: ['bara', 'rautahat', 'sarlahi', 'sindhuli'], // CORRECTED preferred route
  }
];

// Use manual puzzles as base, can be enhanced with auto-generation at runtime
const PUZZLES: Puzzle[] = MANUAL_PUZZLES;

// Validate all puzzles on module load
const validPuzzles = PUZZLES.filter(validatePuzzle);
if (validPuzzles.length !== PUZZLES.length) {
  console.warn(`${PUZZLES.length - validPuzzles.length} puzzles were removed due to exceeding the maximum intermediate districts limit.`);
}

export function getRandomPuzzle(useAutoGenerated: boolean = false, maxIntermediate: number = 10): Puzzle {
  if (useAutoGenerated) {
    // Generate a random puzzle with random difficulty
    const difficulties: PuzzleDifficulty[] = ['easy', 'medium', 'hard'];
    const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const generatedPuzzle = generatePuzzleWithDifficulty({ difficulty: randomDifficulty, maxIntermediate });
    if (generatedPuzzle) {
      return generatedPuzzle;
    }
    // Fallback to manual puzzles if generation fails
  }
  
  // Use manual puzzles
  const randomIndex = Math.floor(Math.random() * validPuzzles.length);
  return validPuzzles[randomIndex];
}

/**
 * Find the shortest path between two districts using BFS.
 * Returns an array of district names (lowercase) or null if no path exists.
 */
export function findShortestPath(
  start: string,
  end: string,
  adjacencyMap: Record<string, string[]> = DISTRICT_ADJACENCY
): string[] | null {
  const s = start.trim().toLowerCase();
  const e = end.trim().toLowerCase();
  if (s === e) return [s];
  if (!adjacencyMap[s] || !adjacencyMap[e]) return null;

  const queue: string[][] = [[s]];
  const visited = new Set<string>([s]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const last = path[path.length - 1];
    for (const neighbor of adjacencyMap[last] || []) {
      if (visited.has(neighbor)) continue;
      const newPath = [...path, neighbor];
      if (neighbor === e) return newPath;
      queue.push(newPath);
      visited.add(neighbor);
    }
  }
  return null;
}

/**
 * Validate if a puzzle's shortestPath is the true shortest path between start and end.
 * Returns true if valid, false otherwise.
 */
export function isPuzzlePathValid(puzzle: Puzzle, adjacencyMap: Record<string, string[]> = DISTRICT_ADJACENCY): boolean {
  const computed = findShortestPath(puzzle.startDistrict, puzzle.endDistrict, adjacencyMap);
  if (!computed) return false;
  // Compare lowercased paths for strict equality
  return (
    computed.length === puzzle.shortestPath.length &&
    computed.every((d, i) => d === puzzle.shortestPath[i].toLowerCase())
  );
}

/**
 * Generate a new random puzzle with a valid shortest path within the max intermediate district limit.
 * Returns a Puzzle object or null if unable to find one after max attempts.
 */
export function generateRandomPuzzle(
  maxIntermediate: number = MAX_INTERMEDIATE_DISTRICTS,
  adjacencyMap: Record<string, string[]> = DISTRICT_ADJACENCY
): Puzzle | null {
  const districts = Object.keys(adjacencyMap);
  const maxAttempts = 1000;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const start = districts[Math.floor(Math.random() * districts.length)];
    let end = start;
    while (end === start) {
      end = districts[Math.floor(Math.random() * districts.length)];
    }
    const path = findShortestPath(start, end, adjacencyMap);
    if (path && path.length - 2 <= maxIntermediate) {
      // Convert to proper case for display
      const startDisplay = validateDistrictName(start) || start;
      const endDisplay = validateDistrictName(end) || end;
      
      return {
        id: `random_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        startDistrict: startDisplay,
        endDistrict: endDisplay,
        shortestPath: path,
      };
    }
  }
  return null;
}

export { PUZZLES };

// Enhanced puzzle generation with difficulty levels
export type PuzzleDifficulty = 'easy' | 'medium' | 'hard' | 'any';

export interface GeneratePuzzleOptions {
  difficulty?: PuzzleDifficulty;
  minIntermediate?: number;
  maxIntermediate?: number;
  excludeRegions?: string[];
  maxAttempts?: number;
}

/**
 * Generate a puzzle with specific difficulty and constraints
 */
export function generatePuzzleWithDifficulty(options: GeneratePuzzleOptions = {}): Puzzle | null {
  const {
    difficulty = 'any',
    minIntermediate = 1,
    maxIntermediate = MAX_INTERMEDIATE_DISTRICTS,
    excludeRegions = [],
    maxAttempts = 1000
  } = options;

  // Set difficulty-based constraints
  let targetMin: number, targetMax: number;
  switch (difficulty) {
    case 'easy':
      targetMin = 1;
      targetMax = 2;
      break;
    case 'medium':
      targetMin = 3;
      targetMax = 5;
      break;
    case 'hard':
      targetMin = 6;
      targetMax = Math.min(maxIntermediate, 10);
      break;
    default: // 'any'
      targetMin = minIntermediate;
      targetMax = maxIntermediate;
  }

  const districts = Object.keys(DISTRICT_ADJACENCY).filter(d => 
    !excludeRegions.some(region => d.toLowerCase().includes(region.toLowerCase()))
  );

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const start = districts[Math.floor(Math.random() * districts.length)];
    let end = start;
    while (end === start) {
      end = districts[Math.floor(Math.random() * districts.length)];
    }
    
    const path = findShortestPath(start, end, DISTRICT_ADJACENCY);
    if (path) {
      const intermediateCount = path.length - 2;
      if (intermediateCount >= targetMin && intermediateCount <= targetMax) {
        // Convert to proper case for display
        const startDisplay = validateDistrictName(start) || start;
        const endDisplay = validateDistrictName(end) || end;
        
        return {
          id: `generated_${difficulty}_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
          startDistrict: startDisplay,
          endDistrict: endDisplay,
          shortestPath: path,
        };
      }
    }
  }
  return null;
}

/**
 * Generate multiple puzzles with variety
 */
export function generatePuzzleSet(count: number = 10): Puzzle[] {
  const puzzles: Puzzle[] = [];
  const difficulties: PuzzleDifficulty[] = ['easy', 'medium', 'hard'];
  
  for (let i = 0; i < count; i++) {
    const difficulty = difficulties[i % difficulties.length];
    const puzzle = generatePuzzleWithDifficulty({ difficulty });
    if (puzzle) {
      puzzles.push(puzzle);
    }
  }
  
  return puzzles;
}

/**
 * Replace manual puzzles with auto-generated ones
 */
export function generateAllPuzzles(): Puzzle[] {
  const easyPuzzles = Array.from({ length: 3 }, () => generatePuzzleWithDifficulty({ difficulty: 'easy' })).filter(Boolean);
  const mediumPuzzles = Array.from({ length: 3 }, () => generatePuzzleWithDifficulty({ difficulty: 'medium' })).filter(Boolean);
  const hardPuzzles = Array.from({ length: 2 }, () => generatePuzzleWithDifficulty({ difficulty: 'hard' })).filter(Boolean);
  
  return [...easyPuzzles, ...mediumPuzzles, ...hardPuzzles] as Puzzle[];
}

/**
 * Utility to print puzzle information for debugging
 */
export function logPuzzleInfo(puzzle: Puzzle): void {
  const intermediateCount = puzzle.shortestPath.length - 2;
  const difficulty = intermediateCount <= 2 ? 'Easy' : intermediateCount <= 5 ? 'Medium' : 'Hard';
  
  console.log(`${puzzle.id}: ${puzzle.startDistrict} → ${puzzle.endDistrict}`);
  console.log(`  Path: ${puzzle.shortestPath.join(' → ')}`);
  console.log(`  Intermediate districts: ${intermediateCount} (${difficulty})`);
  console.log('');
}

// Find all shortest paths between two districts using BFS
export function findAllShortestPaths(
  start: string,
  end: string,
  adjacencyMap: Record<string, string[]> = DISTRICT_ADJACENCY
): string[][] {
  const s = start.trim().toLowerCase();
  const e = end.trim().toLowerCase();
  if (s === e) return [[s]];
  if (!adjacencyMap[s] || !adjacencyMap[e]) return [];

  let shortestLength = Infinity;
  const result: string[][] = [];
  const queue: string[][] = [[s]];

  while (queue.length > 0) {
    const path = queue.shift()!;
    if (shortestLength !== Infinity && path.length > shortestLength) break;
    const last = path[path.length - 1];
    if (last === e) {
      if (path.length < shortestLength) {
        shortestLength = path.length;
        result.length = 0; // Clear previous longer paths
      }
      result.push([...path]);
      continue;
    }
    for (const neighbor of adjacencyMap[last] || []) {
      if (!path.includes(neighbor)) {
        queue.push([...path, neighbor]);
      }
    }
  }
  return result;
}