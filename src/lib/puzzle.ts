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
    endDistrict: 'taplejung',
    shortestPath: ['kaski', 'lamjung', 'gorkha', 'dhading', 'nuwakot', 'taplejung'],
  },
  {
    id: 'puzzle_3',
    startDistrict: 'morang',
    endDistrict: 'kailali',
    shortestPath: ['morang', 'sunsari', 'dhankuta', 'terhathum', 'panchthar', 'kailali', 'dhangadhi'],
  },
  {
    id: 'puzzle_4',
    startDistrict: 'banke',
    endDistrict: 'ilam',
    shortestPath: ['banke', 'bardiya', 'dang', 'pyuthan', 'rolpa', 'okhaldunga', 'ilam'],
  },
  {
    id: 'puzzle_5',
    startDistrict: 'sunsari',
    endDistrict: 'dadeldhura',
    shortestPath: ['sunsari', 'morang', 'jhapa', 'panchthar', 'taplejung', 'dadeldhura'],
  },
  {
    id: 'puzzle_6',
    startDistrict: 'rupandehi',
    endDistrict: 'jumla',
    shortestPath: ['rupandehi', 'nawalparasi', 'tanahun', 'gorkha', 'lamjung', 'jumla'],
  },
  {
    id: 'puzzle_7',
    startDistrict: 'rupandehi',
    endDistrict: 'baitadi',
    shortestPath: ['rupandehi', 'nawalparasi', 'tanahun', 'gorkha', 'darchula', 'baitadi'],
  },
  {
    id: 'puzzle_8',
    startDistrict: 'makawanpur',
    endDistrict: 'bajura',
    shortestPath: ['makawanpur', 'dhading', 'nuwakot', 'rasuwa', 'humla', 'bajura'],
  }
];

export function getDailyPuzzle(date: Date): Puzzle {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return PUZZLES[dayOfYear % PUZZLES.length];
}

export function getRandomPuzzle(): Puzzle {
  const randomIndex = Math.floor(Math.random() * PUZZLES.length);
  return PUZZLES[randomIndex];
}

export function calculateScore(guessedPath: string[], shortestPath: string[]): { score: number; feedback: string } {
  if (!guessedPath || guessedPath.length === 0 || !shortestPath || shortestPath.length === 0) {
    return { score: 0, feedback: "Invalid guess or path." };
  }

  // Only compare to intermediate districts (exclude start and end)
  const intermediatePath = shortestPath.slice(1, -1);

  for (let i = 0; i < guessedPath.length; i++) {
    const guessedDistrict = guessedPath[i].trim().toLowerCase();
    const correctDistrict = intermediatePath[i]?.trim().toLowerCase();
    if (guessedDistrict !== correctDistrict) {
      return {
        score: Math.round((i / intermediatePath.length) * 100),
        feedback: `Incorrect path. The correct next district should be '${intermediatePath[i] || 'none'}'.`
      };
    }
  }

  if (guessedPath.length === intermediatePath.length) {
    return { score: 100, feedback: "Congratulations! You found the shortest path!" };
  } else {
    return {
      score: Math.round((guessedPath.length / intermediatePath.length) * 100),
      feedback: `Correct so far! You've found ${guessedPath.length} of ${intermediatePath.length} districts.`
    };
  }
}

export function parseGuessInput(input: string): string[] {
  return input.split(',').map(d => d.trim()).filter(d => d.length > 0);
}
