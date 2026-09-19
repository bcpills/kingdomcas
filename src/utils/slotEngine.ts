import { GridCell, SymbolDefinition, SymbolId, WinGroup } from '../types/game';

export const GRID_COLS = 6;
export const GRID_ROWS = 5;

export const SYMBOL_DEFINITIONS: Record<SymbolId, SymbolDefinition> = {
  crown: {
    id: 'crown',
    name: 'Imperial Crown',
    type: 'high',
    payouts: { min8: 5.0, min10: 12.0, min12: 30.0 },
    color: 'from-amber-400 to-yellow-600',
    accent: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.5)',
    description: 'The King’s sovereign gold and diamond crown',
  },
  sword: {
    id: 'sword',
    name: 'Excalibur Blade',
    type: 'high',
    payouts: { min8: 3.0, min10: 7.0, min12: 18.0 },
    color: 'from-slate-200 to-indigo-400',
    accent: '#818cf8',
    glowColor: 'rgba(129, 140, 248, 0.5)',
    description: 'Forged steel with dragon-engraved runic hilt',
  },
  shield: {
    id: 'shield',
    name: 'Lion Crest Shield',
    type: 'high',
    payouts: { min8: 2.0, min10: 5.0, min12: 12.0 },
    color: 'from-amber-600 to-red-800',
    accent: '#dc2626',
    glowColor: 'rgba(220, 38, 38, 0.5)',
    description: 'Gilded heraldic shield bearing the rampant lion',
  },
  ring: {
    id: 'ring',
    name: 'Royal Signet Ring',
    type: 'high',
    payouts: { min8: 1.5, min10: 3.5, min12: 9.0 },
    color: 'from-purple-400 to-pink-600',
    accent: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.5)',
    description: 'Solid gold signet with an amethyst center',
  },
  chalice: {
    id: 'chalice',
    name: 'Golden Chalice',
    type: 'high',
    payouts: { min8: 1.0, min10: 2.2, min12: 7.0 },
    color: 'from-yellow-300 to-amber-600',
    accent: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.5)',
    description: 'Jewel-encrusted vessel for royal banquet wine',
  },
  ruby: {
    id: 'ruby',
    name: 'Dragon Ruby',
    type: 'low',
    payouts: { min8: 0.7, min10: 1.5, min12: 4.5 },
    color: 'from-rose-500 to-red-700',
    accent: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    description: 'Cut crimson gemstone mined from dragon caves',
  },
  sapphire: {
    id: 'sapphire',
    name: 'Crest Sapphire',
    type: 'low',
    payouts: { min8: 0.5, min10: 1.0, min12: 3.5 },
    color: 'from-sky-400 to-blue-700',
    accent: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    description: 'Deep cobalt crystal radiating calm power',
  },
  emerald: {
    id: 'emerald',
    name: 'Forest Emerald',
    type: 'low',
    payouts: { min8: 0.35, min10: 0.75, min12: 2.5 },
    color: 'from-emerald-400 to-green-700',
    accent: '#34d399',
    glowColor: 'rgba(52, 211, 153, 0.4)',
    description: 'Ancient green rune stone from enchanted glades',
  },
  topaz: {
    id: 'topaz',
    name: 'Sun Topaz',
    type: 'low',
    payouts: { min8: 0.2, min10: 0.5, min12: 1.8 },
    color: 'from-amber-300 to-amber-500',
    accent: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    description: 'Luminous solar crystal blessed by the church',
  },
  scatter: {
    id: 'scatter',
    name: 'Holy Grail (Scatter)',
    type: 'scatter',
    payouts: { min8: 3, min10: 5, min12: 100 },
    color: 'from-amber-200 via-yellow-400 to-amber-600',
    accent: '#fef08a',
    glowColor: 'rgba(254, 240, 138, 0.8)',
    description: 'Land 4+ to trigger 15 Royal Free Spins!',
  },
  multiplier_bomb: {
    id: 'multiplier_bomb',
    name: 'Dragon Multiplier Bomb',
    type: 'multiplier',
    payouts: { min8: 0, min10: 0, min12: 0 },
    color: 'from-orange-500 via-red-600 to-purple-800',
    accent: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.8)',
    description: 'Detonates after all tumbles, multiplying total spin win up to 500x!',
  },
};

// Weighted pool for regular symbols during normal spins
const REGULAR_POOL: { symbol: SymbolId; weight: number }[] = [
  { symbol: 'topaz', weight: 26 },
  { symbol: 'emerald', weight: 24 },
  { symbol: 'sapphire', weight: 22 },
  { symbol: 'ruby', weight: 19 },
  { symbol: 'chalice', weight: 15 },
  { symbol: 'ring', weight: 13 },
  { symbol: 'shield', weight: 10 },
  { symbol: 'sword', weight: 7 },
  { symbol: 'crown', weight: 4 },
];

// Generate weighted multiplier bomb values
export function getRandomMultiplierValue(): number {
  const roll = Math.random() * 100;
  if (roll < 45) return 2;
  if (roll < 75) return 3;
  if (roll < 88) return 5;
  if (roll < 94) return 8;
  if (roll < 97) return 10;
  if (roll < 98.4) return 15;
  if (roll < 99.2) return 20;
  if (roll < 99.6) return 25;
  if (roll < 99.85) return 50;
  if (roll < 99.95) return 100;
  if (roll < 99.99) return 250;
  return 500;
}

// Get bomb color themes by multiplier value
export function getBombTheme(value: number) {
  if (value >= 100) {
    return {
      name: 'Mythic Void Bomb',
      border: 'border-fuchsia-400',
      bg: 'from-purple-950 via-fuchsia-900 to-slate-950',
      textColor: 'text-fuchsia-200',
      glow: 'shadow-[0_0_25px_rgba(217,70,239,0.8)]',
      particleColor: '#d946ef',
    };
  }
  if (value >= 25) {
    return {
      name: 'Royal Sun Bomb',
      border: 'border-amber-300',
      bg: 'from-red-900 via-amber-800 to-yellow-950',
      textColor: 'text-amber-200',
      glow: 'shadow-[0_0_22px_rgba(245,158,11,0.8)]',
      particleColor: '#f59e0b',
    };
  }
  if (value >= 10) {
    return {
      name: 'Sapphire Dragon Bomb',
      border: 'border-cyan-400',
      bg: 'from-blue-950 via-cyan-900 to-indigo-950',
      textColor: 'text-cyan-200',
      glow: 'shadow-[0_0_18px_rgba(6,182,212,0.8)]',
      particleColor: '#06b6d4',
    };
  }
  return {
    name: 'Copper Alchemist Bomb',
    border: 'border-orange-400',
    bg: 'from-orange-950 via-amber-900 to-stone-900',
    textColor: 'text-orange-200',
    glow: 'shadow-[0_0_14px_rgba(249,115,22,0.7)]',
    particleColor: '#f97316',
  };
}

let cellCounter = 0;
export function createCell(
  row: number,
  col: number,
  options: {
    isFreeSpins?: boolean;
    anteBet?: boolean;
    forceScatter?: boolean;
    forceBomb?: boolean;
  } = {}
): GridCell {
  cellCounter += 1;
  const uniqueId = `cell-${Date.now()}-${cellCounter}-${Math.random().toString(36).substring(2, 7)}`;

  if (options.forceScatter) {
    return { id: uniqueId, symbolId: 'scatter', row, col };
  }
  if (options.forceBomb) {
    return {
      id: uniqueId,
      symbolId: 'multiplier_bomb',
      row,
      col,
      multiplierValue: getRandomMultiplierValue(),
    };
  }

  // Base probabilities
  // Multiplier bombs appear during Free Spins and occasionally in base game
  let bombChance = options.isFreeSpins ? 0.024 : 0.007;
  let scatterChance = options.isFreeSpins ? 0.008 : 0.012;

  if (options.anteBet) {
    bombChance *= 1.4;
    scatterChance *= 1.35;
  }

  const roll = Math.random();
  if (roll < bombChance) {
    return {
      id: uniqueId,
      symbolId: 'multiplier_bomb',
      row,
      col,
      multiplierValue: getRandomMultiplierValue(),
    };
  }

  if (roll < bombChance + scatterChance) {
    return {
      id: uniqueId,
      symbolId: 'scatter',
      row,
      col,
    };
  }

  // Pick regular symbol from weighted pool
  const totalWeight = REGULAR_POOL.reduce((acc, item) => acc + item.weight, 0);
  let randomWeight = Math.random() * totalWeight;

  let selectedSymbol: SymbolId = 'topaz';
  for (const item of REGULAR_POOL) {
    if (randomWeight < item.weight) {
      selectedSymbol = item.symbol;
      break;
    }
    randomWeight -= item.weight;
  }

  return {
    id: uniqueId,
    symbolId: selectedSymbol,
    row,
    col,
  };
}

// Generate a full 6x5 initial board
export function generateBoard(options: {
  isFreeSpins?: boolean;
  anteBet?: boolean;
  guaranteeScatters?: number;
}): GridCell[][] {
  const board: GridCell[][] = [];

  for (let r = 0; r < GRID_ROWS; r++) {
    const rowCells: GridCell[] = [];
    for (let c = 0; c < GRID_COLS; c++) {
      rowCells.push(createCell(r, c, options));
    }
    board.push(rowCells);
  }

  // If buying bonus or testing, guarantee required scatters
  if (options.guaranteeScatters && options.guaranteeScatters > 0) {
    const positions: { r: number; c: number }[] = [];
    while (positions.length < options.guaranteeScatters) {
      const r = Math.floor(Math.random() * GRID_ROWS);
      const c = Math.floor(Math.random() * GRID_COLS);
      if (!positions.some((p) => p.r === r && p.c === c)) {
        positions.push({ r, c });
      }
    }
    positions.forEach((pos) => {
      board[pos.r][pos.c] = createCell(pos.r, pos.c, { forceScatter: true });
    });
  }

  return board;
}

// Check for pay-anywhere wins (8+ matching regular symbols)
export function findPayAnywhereWins(board: GridCell[][], bet: number): WinGroup[] {
  const counts: Record<string, { count: number; cellIds: string[] }> = {};

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const cell = board[r][c];
      const def = SYMBOL_DEFINITIONS[cell.symbolId];
      // Multipliers and scatters do not participate in regular pay-anywhere 8+ matching
      if (def.type !== 'high' && def.type !== 'low') continue;

      if (!counts[cell.symbolId]) {
        counts[cell.symbolId] = { count: 0, cellIds: [] };
      }
      counts[cell.symbolId].count += 1;
      counts[cell.symbolId].cellIds.push(cell.id);
    }
  }

  const wins: WinGroup[] = [];

  for (const [symId, data] of Object.entries(counts)) {
    if (data.count >= 8) {
      const def = SYMBOL_DEFINITIONS[symId as SymbolId];
      let multiplier = def.payouts.min8;
      if (data.count >= 12) {
        multiplier = def.payouts.min12;
      } else if (data.count >= 10) {
        multiplier = def.payouts.min10;
      }

      wins.push({
        symbolId: symId as SymbolId,
        count: data.count,
        multiplier,
        amount: Math.round(bet * multiplier * 100) / 100,
        cellIds: data.cellIds,
      });
    }
  }

  // Sort by highest paying win
  wins.sort((a, b) => b.amount - a.amount);
  return wins;
}

// Check scatters on the board (4+ triggers free spins, also pays cash)
export function checkScatters(
  board: GridCell[][],
  bet: number
): { count: number; cellIds: string[]; payout: number; triggersBonus: boolean } {
  const scatterIds: string[] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (board[r][c].symbolId === 'scatter') {
        scatterIds.push(board[r][c].id);
      }
    }
  }

  let payout = 0;
  if (scatterIds.length >= 6) {
    payout = bet * 100;
  } else if (scatterIds.length === 5) {
    payout = bet * 5;
  } else if (scatterIds.length === 4) {
    payout = bet * 3;
  }

  return {
    count: scatterIds.length,
    cellIds: scatterIds,
    payout,
    triggersBonus: scatterIds.length >= 4,
  };
}

// Find all multiplier bombs currently on the board
export function findMultiplierBombs(
  board: GridCell[][]
): { id: string; value: number; col: number; row: number }[] {
  const bombs: { id: string; value: number; col: number; row: number }[] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const cell = board[r][c];
      if (cell.symbolId === 'multiplier_bomb' && cell.multiplierValue) {
        bombs.push({
          id: cell.id,
          value: cell.multiplierValue,
          col: c,
          row: r,
        });
      }
    }
  }
  return bombs;
}

// Cascade / Drop down logic:
// Remove winning cells, drop remaining cells downward, fill top of each column with fresh cells
export function cascadeBoard(
  board: GridCell[][],
  winningCellIds: Set<string>,
  options: { isFreeSpins?: boolean; anteBet?: boolean } = {}
): GridCell[][] {
  const newBoard: GridCell[][] = Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => null as unknown as GridCell)
  );

  for (let c = 0; c < GRID_COLS; c++) {
    // Collect non-winning cells in this column from bottom to top
    const survivingCells: GridCell[] = [];
    for (let r = GRID_ROWS - 1; r >= 0; r--) {
      const cell = board[r][c];
      if (!winningCellIds.has(cell.id)) {
        survivingCells.push(cell);
      }
    }

    // Place surviving cells at the bottom
    let targetRow = GRID_ROWS - 1;
    for (const cell of survivingCells) {
      newBoard[targetRow][c] = {
        ...cell,
        row: targetRow,
        col: c,
        isWinning: false,
        isExploding: false,
      };
      targetRow -= 1;
    }

    // Fill remaining empty top spots with newly created tumbling cells
    while (targetRow >= 0) {
      const fresh = createCell(targetRow, c, options);
      newBoard[targetRow][c] = fresh;
      targetRow -= 1;
    }
  }

  return newBoard;
}
