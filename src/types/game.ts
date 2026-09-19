export type SymbolType = 'high' | 'low' | 'scatter' | 'multiplier';

export type SymbolId =
  | 'crown'
  | 'sword'
  | 'shield'
  | 'ring'
  | 'chalice'
  | 'ruby'
  | 'sapphire'
  | 'emerald'
  | 'topaz'
  | 'scatter'
  | 'multiplier_bomb';

export interface SymbolDefinition {
  id: SymbolId;
  name: string;
  type: SymbolType;
  // Multipliers of the base bet for (8-9), (10-11), (12+) matches
  payouts: {
    min8: number;
    min10: number;
    min12: number;
  };
  color: string;
  accent: string;
  glowColor: string;
  description: string;
}

export interface GridCell {
  id: string; // unique ID for Motion layout animation
  symbolId: SymbolId;
  row: number; // 0 to 4 (5 rows)
  col: number; // 0 to 5 (6 columns)
  multiplierValue?: number; // e.g. 2x, 5x, 10x, 25x, 50x, 100x...
  isWinning?: boolean;
  isExploding?: boolean;
  isBombActive?: boolean;
}

export interface WinGroup {
  symbolId: SymbolId;
  count: number;
  multiplier: number; // payout multiplier of bet
  amount: number; // payout in cash ($)
  cellIds: string[];
}

export interface TumbleRoundSummary {
  stepIndex: number;
  wins: WinGroup[];
  tumbleWin: number;
  multiplierBombs: { id: string; value: number; col: number; row: number }[];
}

export interface SpinResult {
  tumbles: TumbleRoundSummary[];
  totalWinBeforeMultiplier: number;
  totalMultiplier: number;
  finalTotalWin: number;
  scattersCount: number;
  triggeredFreeSpins: boolean;
  freeSpinsWon: number;
}
