export enum Outcome {
  HOME_WIN = 'HOME_WIN',
  DRAW = 'DRAW',
  AWAY_WIN = 'AWAY_WIN'
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logoUrl?: string;
  league: string;
  recentForm: string[]; // e.g., ['W', 'L', 'D', 'W', 'W']
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  date: string;
  league: string;
  // Mock odds (Decimal format) provided by "Bookmaker"
  odds: {
    home: number;
    draw: number;
    away: number;
  };
}

export interface Prediction {
  matchId: string;
  probabilities: {
    home: number; // 0.0 to 1.0
    draw: number;
    away: number;
  };
  reasoning: string;
  confidenceScore: number; // 0 to 100
  recommendedBet: Outcome;
  impliedValue: number; // The "edge" percentage
  breakEvenProb: number; // 1 / odds
}

export interface HistoryRecord {
  id: string;
  date: string;
  match: string;
  bet: Outcome;
  odds: number;
  stake: number;
  result: 'WON' | 'LOST' | 'PENDING';
  profit: number;
  aiConfidence: number;
}
