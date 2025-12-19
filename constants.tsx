import { Team, Match } from './types';

export const TEAMS: Team[] = [
  { id: 't1', name: 'Arsenal', shortName: 'ARS', league: 'Premier League', recentForm: ['W', 'W', 'W', 'D', 'L'] },
  { id: 't2', name: 'Aston Villa', shortName: 'AVL', league: 'Premier League', recentForm: ['L', 'D', 'W', 'L', 'W'] },
  { id: 't3', name: 'Liverpool', shortName: 'LIV', league: 'Premier League', recentForm: ['W', 'W', 'D', 'W', 'W'] },
  { id: 't4', name: 'Man City', shortName: 'MCI', league: 'Premier League', recentForm: ['W', 'W', 'W', 'W', 'W'] },
  { id: 't5', name: 'Man United', shortName: 'MUN', league: 'Premier League', recentForm: ['L', 'W', 'L', 'D', 'L'] },
  { id: 't6', name: 'Chelsea', shortName: 'CHE', league: 'Premier League', recentForm: ['W', 'D', 'D', 'W', 'L'] },
  { id: 't7', name: 'Tottenham', shortName: 'TOT', league: 'Premier League', recentForm: ['L', 'L', 'W', 'D', 'W'] },
  { id: 't8', name: 'Newcastle', shortName: 'NEW', league: 'Premier League', recentForm: ['D', 'W', 'L', 'W', 'D'] },
  { id: 't9', name: 'Real Madrid', shortName: 'RMA', league: 'La Liga', recentForm: ['W', 'W', 'W', 'D', 'W'] },
  { id: 't10', name: 'Barcelona', shortName: 'BAR', league: 'La Liga', recentForm: ['W', 'W', 'L', 'W', 'W'] },
  { id: 't11', name: 'Bayern Munich', shortName: 'BAY', league: 'Bundesliga', recentForm: ['W', 'W', 'W', 'W', 'W'] },
  { id: 't12', name: 'Dortmund', shortName: 'BVB', league: 'Bundesliga', recentForm: ['W', 'L', 'W', 'D', 'W'] },
  { id: 't13', name: 'PSG', shortName: 'PSG', league: 'Ligue 1', recentForm: ['W', 'W', 'D', 'W', 'W'] },
  { id: 't14', name: 'Inter Milan', shortName: 'INT', league: 'Serie A', recentForm: ['W', 'W', 'W', 'D', 'L'] },
  { id: 't15', name: 'Juventus', shortName: 'JUV', league: 'Serie A', recentForm: ['D', 'W', 'D', 'W', 'D'] },
];

// Helper to generate fake history for the chart using REAL team names
export const generateMockHistory = (count: number) => {
  const history: any[] = [];
  let bankroll = 1000;
  
  for (let i = 0; i < count; i++) {
    const isWin = Math.random() > 0.45; // 55% win rate
    const odds = 1.8 + Math.random() * 2.0;
    const stake = 50;
    const profit = isWin ? (stake * odds) - stake : -stake;
    bankroll += profit;
    
    // Pick random teams for realism
    const home = TEAMS[Math.floor(Math.random() * TEAMS.length)];
    let away = TEAMS[Math.floor(Math.random() * TEAMS.length)];
    while (away.id === home.id) {
        away = TEAMS[Math.floor(Math.random() * TEAMS.length)];
    }

    history.push({
      id: `h-${i}`,
      date: new Date(Date.now() - (count - i) * 86400000).toISOString().split('T')[0],
      bankroll,
      profit,
      odds: odds.toFixed(2),
      result: isWin ? 'WON' : 'LOST',
      match: `${home.name} vs ${away.name}`
    });
  }
  return history;
};
