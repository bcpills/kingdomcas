import React from 'react';
import { motion } from 'motion/react';
import { GridCell } from '../types/game';
import { SYMBOL_DEFINITIONS, getBombTheme } from '../utils/slotEngine';
import {
  Crown,
  Sword,
  Shield,
  CircleDot,
  Wine,
  Gem,
  Sparkles,
  Flame,
  Bomb,
} from 'lucide-react';

interface SymbolCellProps {
  cell: GridCell;
  isWinning?: boolean;
  isBombDetonating?: boolean;
}

export const SymbolCell: React.FC<SymbolCellProps> = ({
  cell,
  isWinning = false,
  isBombDetonating = false,
}) => {
  const def = SYMBOL_DEFINITIONS[cell.symbolId];

  // Render medieval icon inside the emblem
  const renderIcon = () => {
    switch (cell.symbolId) {
      case 'crown':
        return (
          <div className="relative flex items-center justify-center">
            <Crown className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-yellow-300 drop-shadow-[0_2px_8px_rgba(234,179,8,0.8)] fill-amber-400" />
            <Sparkles className="w-3.5 h-3.5 text-amber-100 absolute -top-1 -right-1 animate-pulse" />
          </div>
        );
      case 'sword':
        return (
          <div className="relative flex items-center justify-center">
            <Sword className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 text-indigo-200 drop-shadow-[0_2px_6px_rgba(99,102,241,0.8)] stroke-[2.2]" />
            <div className="absolute w-1 h-7 bg-cyan-300/40 blur-[1px] rotate-45" />
          </div>
        );
      case 'shield':
        return (
          <div className="relative flex items-center justify-center">
            <Shield className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 text-red-400 drop-shadow-[0_2px_6px_rgba(220,38,38,0.8)] fill-red-950/60 stroke-[2]" />
            <Crown className="w-3.5 h-3.5 text-amber-300 absolute center fill-amber-400" />
          </div>
        );
      case 'ring':
        return (
          <div className="relative flex items-center justify-center">
            <CircleDot className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 text-purple-300 drop-shadow-[0_2px_6px_rgba(168,85,247,0.7)] stroke-[2.5]" />
            <div className="w-3 h-3 bg-fuchsia-400 rounded-full shadow-[0_0_8px_#c084fc] absolute" />
          </div>
        );
      case 'chalice':
        return (
          <div className="relative flex items-center justify-center">
            <Wine className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 text-amber-300 drop-shadow-[0_2px_6px_rgba(245,158,11,0.7)] fill-amber-600/40" />
            <div className="w-2 h-1 bg-red-500 rounded-t-full absolute top-2.5" />
          </div>
        );
      case 'ruby':
        return (
          <div className="relative flex items-center justify-center">
            <Gem className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 text-rose-400 drop-shadow-[0_2px_8px_rgba(244,63,94,0.7)] fill-rose-600/50" />
          </div>
        );
      case 'sapphire':
        return (
          <div className="relative flex items-center justify-center">
            <Gem className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 text-sky-400 drop-shadow-[0_2px_8px_rgba(56,189,248,0.7)] fill-blue-600/50" />
          </div>
        );
      case 'emerald':
        return (
          <div className="relative flex items-center justify-center">
            <Gem className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 text-emerald-400 drop-shadow-[0_2px_8px_rgba(52,211,153,0.7)] fill-emerald-600/50" />
          </div>
        );
      case 'topaz':
        return (
          <div className="relative flex items-center justify-center">
            <Gem className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 text-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.7)] fill-amber-600/50" />
          </div>
        );
      case 'scatter':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div className="relative">
              <Wine className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-yellow-200 fill-amber-300 drop-shadow-[0_0_12px_rgba(253,224,71,0.9)]" />
              <Sparkles className="w-4 h-4 text-yellow-100 absolute -top-2 -right-2 animate-spin text-amber-200" style={{ animationDuration: '4s' }} />
              <Flame className="w-3.5 h-3.5 text-orange-400 absolute -top-1 left-2 animate-bounce" />
            </div>
            <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider text-amber-200 bg-amber-950/90 px-1 py-0.2 rounded border border-amber-400/60 shadow font-cinzel leading-none mt-0.5">
              SCATTER
            </span>
          </div>
        );
      case 'multiplier_bomb': {
        const theme = getBombTheme(cell.multiplierValue || 2);
        return (
          <div className={`relative flex flex-col items-center justify-center ${isBombDetonating ? 'scale-110' : ''} transition-transform`}>
            {/* Sparking fuse */}
            <div className="relative mb-0.5 flex items-center justify-center">
              <Bomb className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 text-stone-200 fill-stone-900 drop-shadow-[0_0_12px_rgba(249,115,22,0.8)]" />
              <Flame className="w-3.5 h-3.5 text-orange-400 absolute -top-2 right-1 animate-pulse" />
            </div>
            {/* Multiplier Badge */}
            <div
              className={`px-1.5 py-0.5 rounded-full font-black text-[10px] sm:text-xs tracking-tight border font-cinzel shadow-lg flex items-center gap-0.5 ${theme.border} bg-stone-950/95 ${theme.textColor} ${theme.glow}`}
            >
              <span>{cell.multiplierValue}x</span>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  const isBomb = cell.symbolId === 'multiplier_bomb';
  const isScatter = cell.symbolId === 'scatter';
  const bombTheme = isBomb ? getBombTheme(cell.multiplierValue || 2) : null;

  return (
    <div
      className={`w-full h-full rounded-xl p-0.5 sm:p-1 flex items-center justify-center select-none transition-all ${
        isWinning
          ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-stone-950 shadow-[0_0_15px_rgba(250,204,21,0.7)] z-10'
          : ''
      }`}
    >
      {/* Background Frame / Stone Inset */}
      <div
        className={`w-full h-full rounded-lg flex items-center justify-center relative overflow-hidden transition-all border ${
          isBomb && bombTheme
            ? `bg-gradient-to-b ${bombTheme.bg} ${bombTheme.border} ${bombTheme.glow}`
            : isScatter
            ? 'bg-gradient-to-b from-amber-950/90 via-yellow-950/80 to-stone-900 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
            : def.type === 'high'
            ? 'bg-gradient-to-b from-stone-800/90 via-stone-900/90 to-stone-950 border-stone-700/80 hover:border-amber-500/50 shadow-inner'
            : 'bg-gradient-to-b from-stone-900/80 via-stone-900/90 to-black/80 border-stone-800/80 hover:border-stone-600'
        }`}
      >
        {/* Subtle corner rivets for medieval armor feel */}
        <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-stone-500/30" />
        <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-stone-500/30" />
        <div className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-stone-500/30" />
        <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-stone-500/30" />

        {/* Ambient radial inner glow */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none rounded-lg"
          style={{
            background: `radial-gradient(circle at center, ${def.accent}, transparent 70%)`,
          }}
        />

        {/* The symbol art */}
        <div className="relative z-10 flex items-center justify-center">
          {renderIcon()}
        </div>

        {/* Detonation flash if bomb exploding */}
        {isBombDetonating && (
          <div className="absolute inset-0 bg-orange-500/50 animate-ping rounded-lg pointer-events-none" />
        )}

        {/* Win shimmer beam */}
        {isWinning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ repeat: Infinity, duration: 0.7 }}
            className="absolute inset-0 bg-yellow-400/25 rounded-lg pointer-events-none"
          />
        )}
      </div>
    </div>
  );
};
