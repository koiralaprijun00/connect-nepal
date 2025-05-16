export interface Puzzle {
  startDistrict: string;
  endDistrict: string;
  shortestPath: string[];
}

export interface SubmittedGuess {
  id: string;
  path: string[];
  score: number;
  feedback: string;
}
