export type GameLevel = 1 | 2 | 3;

export interface Question {
  id: string;
  sentence: string; // e.g. "The sun rises in the ____."
  missingWord: string; // e.g. "east"
  alternatives?: string[]; // e.g. ["East"]
  gujaratiTranslation: string; // e.g. "સૂર્ય પૂર્વમાં ઊગે છે."
  gujaratiHint?: string; // e.g. "દિશાનું નામ"
  englishHint?: string; // e.g. "Direction opposite to west"
  level: GameLevel;
  category: string; // 'Animals' | 'Daily Life' | 'School' | 'Nature' | 'Grammar' | 'Actions'
}

export interface ChallengeResult {
  questionId: string;
  question: string;
  missingWord: string;
  userAnswer: string;
  isCorrect: boolean;
  timeTaken: number;
  pointsEarned: number;
  gujaratiTranslation: string;
}

export type BadgeTier = 'gold' | 'silver' | 'bronze' | 'cadet';

export interface StudentSession {
  id: string;
  studentName: string;
  grade?: string;
  timestamp: number;
  level: GameLevel;
  totalScore: number;
  totalChallenges: number;
  correctCount: number;
  wrongCount: number;
  livesRemaining: number;
  highestStreak: number;
  totalTimeSeconds: number;
  badgeTier: BadgeTier;
  results: ChallengeResult[];
}

export interface StreakState {
  count: number;
  multiplier: number;
  highest: number;
}
