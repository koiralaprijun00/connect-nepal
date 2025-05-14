
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


const DAILY_PUZZLES: Puzzle[] = [
  {
    id: 'daily_1',
    startDistrict: 'Kathmandu',
    endDistrict: 'Kavrepalanchok',
    shortestPath: ['Kathmandu', 'Bhaktapur', 'Kavrepalanchok'],
  },
  {
    id: 'daily_2',
    startDistrict: 'Lalitpur',
    endDistrict: 'Nuwakot',
    shortestPath: ['Lalitpur', 'Kathmandu', 'Nuwakot'],
  },
  {
    id: 'daily_3',
    startDistrict: 'Chitwan',
    endDistrict: 'Dhading',
    shortestPath: ['Chitwan', 'Makwanpur', 'Dhading'], // Fictional path for variety
  },
   {
    id: 'daily_4',
    startDistrict: 'Rasuwa',
    endDistrict: 'Sindhupalchok',
    shortestPath: ['Rasuwa', 'Nuwakot', 'Sindhupalchok'],
  }
];

export function getDailyPuzzle(date: Date): Puzzle {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return DAILY_PUZZLES[dayOfYear % DAILY_PUZZLES.length];
}

export function calculateScore(guessedPath: string[], shortestPath: string[]): { score: number; feedback: string } {
  if (!guessedPath || guessedPath.length === 0 || !shortestPath || shortestPath.length === 0) {
    return { score: 0, feedback: "Invalid guess or path." };
  }

  let correctInSequence = 0;
  for (let i = 0; i < guessedPath.length; i++) {
    if (i < shortestPath.length) {
      const guessedDistrict = guessedPath[i].trim().toLowerCase();
      const correctDistrict = shortestPath[i].trim().toLowerCase();
      if (guessedDistrict === correctDistrict) {
        correctInSequence++;
      } else {
        // Incorrect district in sequence
        const feedback = `Path correct up to '${shortestPath[i-1] || 'start'}'. '${guessedPath[i]}' is not the next correct district.`;
        return { score: Math.round((correctInSequence / shortestPath.length) * 100), feedback };
      }
    } else {
      // Guessed path is longer than shortest path but correct so far
      const feedback = `Path is correct but longer than optimal. Optimal path has ${shortestPath.length} districts.`;
      return { score: Math.round((correctInSequence / shortestPath.length) * 100), feedback };
    }
  }

  if (correctInSequence === shortestPath.length && guessedPath.length === shortestPath.length) {
    return { score: 100, feedback: "Congratulations! You found the shortest path!" };
  }
  
  if (correctInSequence === guessedPath.length && guessedPath.length < shortestPath.length) {
     const feedback = `Path is correct so far. Keep going! You've found ${correctInSequence} of ${shortestPath.length} districts.`;
     return { score: Math.round((correctInSequence / shortestPath.length) * 100), feedback };
  }

  // Default if loop finishes without returning (e.g. guessed path is shorter but all correct)
  const feedback = `Path correct up to the end of your guess. You've found ${correctInSequence} of ${shortestPath.length} districts.`;
  return { score: Math.round((correctInSequence / shortestPath.length) * 100), feedback };
}

export function parseGuessInput(input: string): string[] {
  return input.split(',').map(d => d.trim()).filter(d => d.length > 0);
}
