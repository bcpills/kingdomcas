import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Flame, Sparkles, Trophy } from 'lucide-react';
import { WinGroup } from '../types/game';
import { SYMBOL_DEFINITIONS } from '../utils/slotEngine';

interface WinBannerProps {
  currentTumbleWin: number;
  activeMultiplier: number;
  latestWinGroups: WinGroup[];
  bigWinData: {
    show: boolean;
    amount: number;
    multiplier: number;
    title: string;
  } | null;
  onDismissBigWin: () => void;
}

export const WinBanner: React.FC<WinBannerProps> = ({
  currentTumbleWin,
  activeMultiplier,
  latestWinGroups,
  bigWinData,
  onDismissBigWin,
}) => {
  // Fire celebratory gold coin confetti when Big Win triggers
  useEffect(() => {
    if (bigWinData?.show) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#fef08a', '#dc2626', '#a855f7'],
        });
      } catch {
        // Safe fallback if canvas not ready
      }
    }
  }, [bigWinData?.show]);

  return (
    <>
      {/* Live Spin / Tumble Tally Bar above the grid */}
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 mb-2">
        <div className="flex items-center justify-between gap-2 bg-stone-900/80 border border-stone-800 rounded-xl px-3 py-2 text-xs sm:text-sm">
          {/* Win Match Announcement */}
          <div className="flex items-center gap-2 overflow-hidden">
            {latestWinGroups.length > 0 ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-amber-400 font-bold uppercase tracking-wider font-cinzel text-[11px] sm:text-xs">
                  WIN:
                </span>
                {latestWinGroups.map((w, idx) => {
                  const def = SYMBOL_DEFINITIONS[w.symbolId];
                  return (
                    <span
                      key={`${w.symbolId}-${idx}`}
                      className="px-2 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-200 font-mono text-[11px] flex items-center gap-1"
                    >
                      <span>{w.count}x</span>
                      <span className="font-semibold text-amber-300">{def.name}</span>
                      <span className="text-emerald-400">+${w.amount.toFixed(2)}</span>
                    </span>
                  );
                })}
              </div>
            ) : (
              <div className="text-stone-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Match 8+ symbols anywhere on reels</span>
              </div>
            )}
          </div>

          {/* Right side: Current Tumble Win & Active Multiplier */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Multiplier Bomb Badge */}
            {activeMultiplier > 1 && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-950 via-orange-900 to-amber-950 border border-amber-400 text-amber-300 font-cinzel font-black text-xs sm:text-sm shadow-[0_0_12px_rgba(245,158,11,0.6)]"
              >
                <Flame className="w-3.5 h-3.5 text-orange-400 animate-bounce" />
                <span>{activeMultiplier}x MULTIPLIER</span>
              </motion.div>
            )}

            {/* Current Win */}
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-stone-400 block -mb-0.5">
                Spin Win
              </span>
              <span className="font-mono font-bold text-sm sm:text-base text-emerald-400">
                ${currentTumbleWin.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Epic Big Win Modal Overlay */}
      <AnimatePresence>
        {bigWinData?.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onDismissBigWin}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.5, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="relative max-w-md w-full text-center p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-black border-2 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.6)] flex flex-col items-center"
            >
              {/* Crown Emblem */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-b from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg border-2 border-yellow-200 mb-3 animate-bounce">
                <Trophy className="w-10 h-10 text-stone-950" />
              </div>

              {/* Title */}
              <h2 className="font-cinzel text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-100 tracking-wider mb-2 drop-shadow-md">
                {bigWinData.title}
              </h2>

              {bigWinData.multiplier > 1 && (
                <div className="flex items-center gap-1.5 px-4 py-1 rounded-full bg-orange-950/80 border border-orange-500/60 text-orange-300 font-cinzel font-bold text-sm mb-3">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>TOTAL BOMB BOOST: {bigWinData.multiplier}x</span>
                </div>
              )}

              {/* Huge Win Counter */}
              <div className="font-mono text-4xl sm:text-5xl font-black text-emerald-400 my-3 tracking-tight drop-shadow-[0_0_20px_rgba(52,211,153,0.8)]">
                ${bigWinData.amount.toFixed(2)}
              </div>

              <div className="text-xs text-stone-400 mt-4 uppercase tracking-widest font-cinzel">
                Tap anywhere to continue
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
