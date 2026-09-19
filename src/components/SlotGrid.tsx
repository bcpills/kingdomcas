import React from 'react';
import { motion } from 'motion/react';
import { GridCell } from '../types/game';
import { SymbolCell } from './SymbolCell';
import { GRID_COLS, GRID_ROWS } from '../utils/slotEngine';

interface SlotGridProps {
  board: GridCell[][];
  winningIds: Set<string>;
  detonatingBombIds: Set<string>;
  isSpinning: boolean;
  turbo?: boolean;
}

export const SlotGrid: React.FC<SlotGridProps> = ({
  board,
  winningIds,
  detonatingBombIds,
  isSpinning,
  turbo = false,
}) => {
  return (
    <div className="relative w-full max-w-4xl mx-auto px-2 sm:px-4 select-none">
      {/* Medieval Castle Portcullis & Stone Arch Frame */}
      <div className="relative rounded-2xl bg-gradient-to-b from-stone-900 via-stone-950 to-black p-2 sm:p-3 border-2 border-stone-700/80 shadow-[0_15px_40px_rgba(0,0,0,0.85)] ring-1 ring-amber-500/20 overflow-hidden">
        
        {/* Castle Header Banner */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-stone-900 border border-amber-500/50 shadow-md text-[10px] sm:text-[11px] font-cinzel font-bold text-amber-300 uppercase tracking-widest z-30">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span>Pay Anywhere • 8+ To Win</span>
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
        </div>

        {/* Ambient Torch Highlights */}
        <div className="absolute -left-1 top-1/4 w-3 h-28 bg-amber-500/15 blur-lg rounded-full pointer-events-none" />
        <div className="absolute -right-1 top-1/4 w-3 h-28 bg-amber-500/15 blur-lg rounded-full pointer-events-none" />

        {/* The 6-Column Grid: STRICTLY OVERFLOW HIDDEN */}
        <div className="grid grid-cols-6 gap-1 sm:gap-2 bg-stone-950/95 rounded-xl p-1.5 sm:p-2 border border-stone-800/90 overflow-hidden relative">
          {Array.from({ length: GRID_COLS }).map((_, colIdx) => (
            <div
              key={`col-${colIdx}`}
              className="flex flex-col gap-1 sm:gap-2 relative overflow-hidden rounded-lg bg-stone-900/30"
            >
              {Array.from({ length: GRID_ROWS }).map((_, rowIdx) => {
                const cell = board[rowIdx] && board[rowIdx][colIdx];
                if (!cell) return null;
                const isWinning = winningIds.has(cell.id);
                const isBombDetonating = detonatingBombIds.has(cell.id);

                return (
                  <motion.div
                    key={cell.id}
                    layout="position"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{
                      y: 0,
                      opacity: 1,
                      scale: isWinning ? [1, 1.08, 0.2] : isBombDetonating ? 1.12 : 1,
                    }}
                    transition={{
                      layout: {
                        type: 'spring',
                        stiffness: turbo ? 360 : 200,
                        damping: 24,
                        mass: 0.85,
                      },
                      y: {
                        type: 'spring',
                        stiffness: turbo ? 320 : 170,
                        damping: 22,
                        mass: 0.9,
                        delay: isSpinning ? colIdx * (turbo ? 0.04 : 0.11) : 0,
                      },
                      scale: {
                        duration: isWinning ? (turbo ? 0.28 : 0.45) : 0.22,
                      },
                      opacity: { duration: turbo ? 0.12 : 0.2 },
                    }}
                    className="w-full aspect-square relative"
                  >
                    <SymbolCell
                      cell={cell}
                      isWinning={isWinning}
                      isBombDetonating={isBombDetonating}
                    />
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
