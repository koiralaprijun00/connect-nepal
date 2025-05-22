import type { Puzzle } from '@/types';

// A more comprehensive list of districts in Nepal, sorted alphabetically.
export const DISTRICTS_NEPAL = [
  "Achham", "Arghakhanchi", "Baglung", "Baitadi", "Bajhang", "Bajura", "Banke", "Bara",
  "Bardiya", "Bhaktapur", "Bhojpur", "Chitwan", "Dadeldhura", "Dailekh", "Dang",
  "Darchula", "Dhading", "Dhankuta", "Dhanusha", "Dolakha", "Dolpa", "Doti", "Gorkha",
  "Gulmi", "Humla", "Ilam", "Jajarkot", "Jhapa", "Jumla", "Kailali", "Kalikot",
  "Kanchanpur", "Kapilvastu", "Kaski", "Kathmandu", "Kavrepalanchok", "Khotang",
  "Lalitpur", "Lamjung", "Mahottari", "Makwanpur", "Manang", "Morang", "Mugu",
  "Mustang", "Myagdi", "Nawalparasi", // Note: Nawalparasi was split; using old name for simplicity.
  "Nuwakot", "Okhaldhunga", "Palpa", "Panchthar", "Parbat", "Parsa", "Pyuthan",
  "Ramechhap", "Rasuwa", "Rautahat", "Rolpa", "Rukum", // Note: Rukum was split; using old name for simplicity.
  "Rupandehi", "Salyan", "Sankhuwasabha", "Saptari", "Sarlahi", "Sindhuli",
  "Sindhupalchok", "Siraha", "Solukhumbu", "Sunsari", "Surkhet", "Syangja",
  "Tanahu", "Taplejung", "Terhathum", "Udayapur"
].sort();

// Maximum number of intermediate districts allowed between start and end
const MAX_INTERMEDIATE_DISTRICTS = 10;

// Function to validate puzzle meets the intermediate district requirement
function validatePuzzle(puzzle: Puzzle): boolean {
  const intermediateCount = puzzle.shortestPath.length - 2; // Exclude start and end
  if (intermediateCount > MAX_INTERMEDIATE_DISTRICTS) {
    console.warn(`Puzzle ${puzzle.id} exceeds maximum intermediate districts (${intermediateCount} > ${MAX_INTERMEDIATE_DISTRICTS})`);
    return false;
  }
  return true;
}

const PUZZLES: Puzzle[] = [
  {
    id: 'puzzle_1',
    startDistrict: 'kathmandu',
    endDistrict: 'dolpa',
    shortestPath: ['kathmandu', 'nuwakot', 'rasuwa', 'gorkha', 'baglung', 'myagdi', 'dolpa'],
  },
  {
    id: 'puzzle_2',
    startDistrict: 'kaski',
    endDistrict: 'lamjung',
    shortestPath: ['kaski', 'syangja', 'palpa', 'gorkha', 'lamjung'],
  },
  {
    id: 'puzzle_3',
    startDistrict: 'dhading',
    endDistrict: 'chitwan',
    shortestPath: ['dhading', 'makwanpur', 'parsa', 'chitwan'],
  },
  {
    id: 'puzzle_4',
    startDistrict: 'rupandehi',
    endDistrict: 'gulmi',
    shortestPath: ['rupandehi', 'palpa', 'gulmi'],
  },
  {
    id: 'puzzle_5',
    startDistrict: 'jhapa',
    endDistrict: 'panchthar',
    shortestPath: ['jhapa', 'morang', 'sunsari', 'dhankuta', 'panchthar'],
  },
  {
    id: 'puzzle_6',
    startDistrict: 'lalitpur',
    endDistrict: 'ramechhap',
    shortestPath: ['lalitpur', 'bhaktapur', 'kavrepalanchok', 'dolakha', 'ramechhap'],
  },
  {
    id: 'puzzle_7',
    startDistrict: 'banke',
    endDistrict: 'dailekh',
    shortestPath: ['banke', 'bardiya', 'surkhet', 'jajarkot', 'dailekh'],
  },
  {
    id: 'puzzle_8',
    startDistrict: 'sindhupalchok',
    endDistrict: 'solukhumbu',
    shortestPath: ['sindhupalchok', 'dolakha', 'ramechhap', 'okhaldhunga', 'solukhumbu'],
  }
];

// Validate all puzzles on module load
const validPuzzles = PUZZLES.filter(validatePuzzle);
if (validPuzzles.length !== PUZZLES.length) {
  console.warn(`${PUZZLES.length - validPuzzles.length} puzzles were removed due to exceeding the maximum intermediate districts limit.`);
}



export function getRandomPuzzle(): Puzzle {
  const randomIndex = Math.floor(Math.random() * validPuzzles.length);
  return validPuzzles[randomIndex];
}








export const DISTRICT_ADJACENCY: Record<string, string[]> = {
  kathmandu: ['bhaktapur', 'lalitpur', 'nuwakot', 'dhading', 'sindhupalchok'],
  bhaktapur: ['kathmandu', 'lalitpur', 'kavrepalanchok'],
  lalitpur: ['kathmandu', 'bhaktapur', 'makwanpur', 'kavrepalanchok'],
  makwanpur: ['lalitpur', 'chitwan', 'dhading', 'parsa', 'rautahat', 'sarlahi', 'kavrepalanchok', 'sindhuli'],
  chitwan: ['makwanpur', 'parsa', 'nawalpur', 'tanahu', 'gorkha', 'dhading'],
  dhading: ['kathmandu', 'nuwakot', 'gorkha', 'makwanpur', 'rasuwa', 'chitwan'],
  nuwakot: ['kathmandu', 'dhading', 'rasuwa', 'sindhupalchok'],
  rasuwa: ['nuwakot', 'dhading', 'gorkha', 'sindhupalchok'],
  gorkha: ['dhading', 'lamjung', 'tanahu', 'rasuwa', 'manang', 'chitwan'],
  lamjung: ['gorkha', 'tanahu', 'kaski', 'manang'],
  tanahu: ['lamjung', 'kaski', 'syangja', 'chitwan', 'gorkha', 'nawalpur'],
  kaski: ['lamjung', 'tanahu', 'syangja', 'parbat', 'myagdi', 'manang'],
  syangja: ['kaski', 'tanahu', 'palpa', 'gulmi', 'parbat'],
  palpa: ['syangja', 'gulmi', 'nawalpur', 'parasi', 'rupandehi', 'argakhanchi', 'kapilvastu'],
  gulmi: ['palpa', 'syangja', 'argakhanchi', 'pyuthan', 'baglung'],
  nawalpur: ['palpa', 'chitwan', 'tanahu', 'parasi'],
  parasi: ['palpa', 'rupandehi', 'nawalpur'], // Removed 'chitwan'
  rupandehi: ['parasi', 'kapilvastu', 'palpa'],
  kapilvastu: ['rupandehi', 'palpa', 'argakhanchi', 'dang'], // Removed 'parasi'
  argakhanchi: ['gulmi', 'palpa', 'kapilvastu', 'pyuthan', 'dang'],
  pyuthan: ['dang', 'rolpa', 'gulmi', 'argakhanchi', 'salyan'],
  rolpa: ['pyuthan', 'rukum_east', 'salyan', 'dang', 'rukum_west'],
  rukum_east: ['rolpa', 'baglung', 'myagdi', 'rukum_west'],
  rukum_west: ['rolpa', 'salyan', 'jajarkot', 'dolpa', 'rukum_east', 'jumla'],
  salyan: ['pyuthan', 'rolpa', 'rukum_west', 'jajarkot', 'surkhet', 'dang'],
  dang: ['banke', 'pyuthan', 'salyan', 'kapilvastu', 'argakhanchi', 'bardiya', 'rolpa'],
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
  jajarkot: ['salyan', 'rukum_west', 'dolpa', 'surkhet', 'dailekh', 'kalikot'],
  kalikot: ['achham', 'dailekh', 'jajarkot', 'mugu', 'jumla', 'bajura'],
  mugu: ['bajura', 'humla', 'jumla', 'kalikot', 'dolpa'],
  humla: ['bajura', 'mugu', 'dolpa', 'bajhang'],
  jumla: ['mugu', 'kalikot', 'dolpa', 'rukum_west'],
  dolpa: ['rukum_west', 'jumla', 'mugu', 'humla', 'mustang', 'myagdi', 'baglung', 'jajarkot', 'manang'],
  mustang: ['dolpa', 'myagdi', 'manang'],
  myagdi: ['mustang', 'dolpa', 'baglung', 'parbat', 'kaski', 'rukum_east'],
  baglung: ['myagdi', 'parbat', 'gulmi', 'rukum_east', 'dolpa'],
  parbat: ['baglung', 'kaski', 'myagdi', 'syangja'],
  manang: ['gorkha', 'lamjung', 'kaski', 'mustang', 'dolpa'],
  sindhupalchok: ['kathmandu', 'nuwakot', 'rasuwa', 'dolakha', 'kavrepalanchok'],
  kavrepalanchok: ['bhaktapur', 'lalitpur', 'makwanpur', 'sindhupalchok', 'ramechhap', 'sindhuli'],
  dolakha: ['sindhupalchok', 'ramechhap', 'solukhumbu'],
  ramechhap: ['kavrepalanchok', 'dolakha', 'sindhuli', 'okhaldhunga', 'solukhumbu'],
  sindhuli: ['kavrepalanchok', 'makwanpur', 'sarlahi', 'mahottari', 'okhaldhunga', 'ramechhap', 'dhanusha', 'siraha', 'udayapur'],
  sarlahi: ['makwanpur', 'sindhuli', 'mahottari', 'dhanusha', 'rautahat'],
  rautahat: ['makwanpur', 'sarlahi', 'parsa', 'bara'],
  parsa: ['makwanpur', 'chitwan', 'rautahat', 'bara'],
  bara: ['parsa', 'rautahat'],
  mahottari: ['sarlahi', 'sindhuli', 'dhanusha'],
  dhanusha: ['mahottari', 'sarlahi', 'sindhuli', 'siraha'],
  siraha: ['dhanusha', 'saptari', 'sindhuli', 'okhaldhunga'],
  saptari: ['siraha', 'sunsari', 'udayapur'],
  sunsari: ['saptari', 'morang', 'udayapur', 'dhankuta'],
  morang: ['sunsari', 'jhapa', 'dhankuta', 'ilam'],
  jhapa: ['morang', 'ilam'],
  ilam: ['jhapa', 'morang', 'panchthar', 'dhankuta'],
  panchthar: ['ilam', 'taplejung', 'terhathum', 'dhankuta'],
  taplejung: ['panchthar', 'sankhuwasabha', 'terhathum'],
  sankhuwasabha: ['taplejung', 'terhathum', 'bhojpur', 'solukhumbu'],
  terhathum: ['panchthar', 'taplejung', 'sankhuwasabha', 'dhankuta', 'bhojpur'],
  dhankuta: ['sunsari', 'morang', 'ilam', 'panchthar', 'terhathum', 'bhojpur', 'udayapur'],
  bhojpur: ['dhankuta', 'terhathum', 'sankhuwasabha', 'solukhumbu', 'khotang', 'udayapur'],
  okhaldhunga: ['sindhuli', 'ramechhap', 'khotang', 'solukhumbu', 'udayapur', 'siraha'],
  khotang: ['okhaldhunga', 'bhojpur', 'solukhumbu', 'udayapur'],
  udayapur: ['saptari', 'sunsari', 'dhankuta', 'bhojpur', 'khotang', 'okhaldhunga', 'sindhuli'],
  solukhumbu: ['dolakha', 'ramechhap', 'okhaldhunga', 'khotang', 'sankhuwasabha', 'bhojpur'],
};

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
      return {
        id: `random_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        startDistrict: start,
        endDistrict: end,
        shortestPath: path,
      };
    }
  }
  return null;
}

export { PUZZLES };

