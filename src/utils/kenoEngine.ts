import { KenoDifficulty, KenoDifficultyConfig } from '../types/casino';

export const TOTAL_KENO_BALLS = 40;
export const BALLS_DRAWN = 10;
export const MAX_PICKS = 10;

// Paytables for each difficulty:
// Format: payouts[spotsPicked][hits] = multiplier (e.g., 5 means 5x bet)
export const KENO_DIFFICULTIES: Record<KenoDifficulty, KenoDifficultyConfig> = {
  guardian: {
    id: 'guardian',
    name: 'Guardian Shield',
    subtitle: 'Low Volatility • Frequent Catches',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
    borderColor: 'border-emerald-500',
    description: 'High hit frequency with protective payouts. Ideal for sustained play.',
    payouts: {
      1: [0, 2.2],
      2: [0, 1.0, 5.0],
      3: [0, 0.5, 2.0, 18.0],
      4: [0, 0.5, 1.5, 6.0, 55.0],
      5: [0, 0.5, 1.5, 4.0, 20.0, 120.0],
      6: [0, 0.5, 1.2, 3.0, 10.0, 45.0, 300.0],
      7: [0, 0.5, 1.0, 2.0, 6.0, 25.0, 100.0, 800.0],
      8: [0, 0.5, 1.0, 1.5, 4.0, 15.0, 60.0, 250.0, 2000.0],
      9: [0, 0.5, 1.0, 1.2, 3.0, 10.0, 35.0, 150.0, 800.0, 4000.0],
      10: [0, 0.5, 1.0, 1.0, 2.5, 6.0, 25.0, 80.0, 350.0, 1500.0, 6000.0],
    },
  },
  noble: {
    id: 'noble',
    name: 'Noble Knight',
    subtitle: 'Balanced • 1,000x Max Win',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
    borderColor: 'border-amber-500',
    description: 'Balanced risk and reward with classic medieval keno odds up to 1,000x.',
    payouts: {
      1: [0, 3.0],
      2: [0, 1.0, 7.5],
      3: [0, 0, 2.5, 25.0],
      4: [0, 0, 1.5, 10.0, 80.0],
      5: [0, 0, 1.0, 5.0, 30.0, 180.0],
      6: [0, 0, 1.0, 3.0, 15.0, 60.0, 350.0],
      7: [0, 0, 0.5, 2.0, 8.0, 30.0, 120.0, 500.0],
      8: [0, 0, 0.5, 1.5, 5.0, 18.0, 70.0, 250.0, 750.0],
      9: [0, 0, 0.5, 1.2, 4.0, 14.0, 45.0, 160.0, 450.0, 900.0],
      10: [0, 0, 0, 1.5, 3.5, 10.0, 35.0, 100.0, 300.0, 600.0, 1000.0],
    },
  },
  dragon: {
    id: 'dragon',
    name: "Dragon's Fury",
    subtitle: 'High Volatility • Up to 30,000x',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/50',
    borderColor: 'border-red-500',
    description: 'Extreme volatility for brave knights. Small catches pay less, top catches multiply exponentially!',
    payouts: {
      1: [0, 3.8],
      2: [0, 0, 14.0],
      3: [0, 0, 1.5, 65.0],
      4: [0, 0, 0, 18.0, 240.0],
      5: [0, 0, 0, 8.0, 90.0, 1200.0],
      6: [0, 0, 0, 3.0, 35.0, 320.0, 4000.0],
      7: [0, 0, 0, 0, 20.0, 150.0, 1200.0, 10000.0],
      8: [0, 0, 0, 0, 12.0, 80.0, 600.0, 3500.0, 18000.0],
      9: [0, 0, 0, 0, 8.0, 45.0, 300.0, 1800.0, 8000.0, 25000.0],
      10: [0, 0, 0, 0, 5.0, 25.0, 150.0, 900.0, 4500.0, 15000.0, 35000.0],
    },
  },
};

// Generates 10 distinct random numbers between 1 and 40
export function drawKenoBalls(): number[] {
  const pool = Array.from({ length: TOTAL_KENO_BALLS }, (_, i) => i + 1);
  const drawn: number[] = [];

  for (let i = 0; i < BALLS_DRAWN; i++) {
    const randIdx = Math.floor(Math.random() * pool.length);
    drawn.push(pool[randIdx]);
    pool.splice(randIdx, 1);
  }

  return drawn;
}

// Calculates payout multiplier for given spots and hits under chosen difficulty
export function getKenoPayoutMultiplier(
  difficulty: KenoDifficulty,
  spotsCount: number,
  hitsCount: number
): number {
  if (spotsCount < 1 || spotsCount > MAX_PICKS) return 0;
  const table = KENO_DIFFICULTIES[difficulty].payouts[spotsCount];
  if (!table || hitsCount >= table.length) return 0;
  return table[hitsCount] || 0;
}
