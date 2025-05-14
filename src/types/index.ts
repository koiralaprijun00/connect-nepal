export interface Puzzle {
  id: string;
  startDistrict: string;
  endDistrict: string;
  shortestPath: string[];
}

export interface SubmittedGuess {
  id: string;
  path: string[];
  score: number; // Percentage 0-100
  feedback?: string;
}

export type HintType = 'NEXT_DISTRICT_OUTLINE' | 'ALL_DISTRICT_OUTLINES' | 'DISTRICT_INITIALS';
