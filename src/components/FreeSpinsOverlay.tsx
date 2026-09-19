import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Flame, Sparkles } from 'lucide-react';

interface FreeSpinsOverlayProps {
  isFreeSpins: boolean;
  freeSpinsRemaining: number;
  totalFreeSpinsWon: number;
  freeSpinsMultiplier: number;
  freeSpinsAccumulatedWin: number;
  showIntroModal: boolean;
  onStartFreeSpins: () => void;
  showOutroModal: boolean;
  onFinishFreeSpins: () => void;
}

export const FreeSpinsOverlay: React.FC<FreeSpinsOverlayProps> = ({
  isFreeSpins,
  freeSpinsRemaining,
  totalFreeSpinsWon,
  freeSpinsMultiplier,
  freeSpinsAccumulatedWin,
  showIntroModal,
  onStartFreeSpins,
  showOutroModal,
  onFinishFreeSpins,
}) => {
  return (
    <>
      {/* Active Free Spins Persistent Banner in Game Header */}
      {isFreeSpins && (
        <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 mb-2">
          <div className="rounded-xl bg-gradient-to-r from-amber-950 via-red-950 to-stone-900 border border-amber-500/80 p-2.5 sm:p-3 shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-between">
            {/* Left: Free Spins Count */}
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-400">
                <Crown className="w-5 h-5 text-amber-300 animate-bounce" />
              </div>
              <div>
                <div className="text-[10px] text-amber-300/80 uppercase font-bold tracking-widest font-cinzel">
                  ROYAL FREE SPINS
                </div>
                <div className="text-base sm:text-lg font-cinzel font-black text-amber-200">
                  SPIN {totalFreeSpinsWon - freeSpinsRemaining + 1} OF {totalFreeSpinsWon}
                </div>
              </div>
            </div>

            {/* Middle: Global Persistent Multiplier */}
            <div className="flex items-center gap-2 bg-stone-950/80 px-3 py-1.5 rounded-lg border border-amber-400/50">
              <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
              <div>
                <div className="text-[9px] uppercase tracking-wider text-stone-400">
                  GLOBAL MULTIPLIER
                </div>
                <div className="text-sm sm:text-base font-cinzel font-black text-amber-300">
                  {freeSpinsMultiplier}x
                </div>
              </div>
            </div>

            {/* Right: Total Bonus Won So Far */}
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-wider text-stone-400">
                BONUS TOTAL
              </div>
              <div className="font-mono text-base sm:text-lg font-bold text-emerald-400">
                ${freeSpinsAccumulatedWin.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Intro Modal (When Free Spins Triggered) */}
      <AnimatePresence>
        {showIntroModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.7, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="max-w-md w-full text-center p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-stone-900 via-amber-950/70 to-black border-2 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.7)] flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg border-2 border-yellow-100 mb-4 animate-pulse">
                <Crown className="w-10 h-10 text-stone-950" />
              </div>

              <h2 className="font-cinzel text-3xl font-black text-amber-300 mb-2">
                15 ROYAL FREE SPINS!
              </h2>

              <p className="text-stone-300 text-sm mb-4 leading-relaxed font-sans">
                The Holy Grails have opened the King’s Treasury! During Free Spins, all detonated Multiplier Bombs are added to a <strong className="text-amber-300">Permanent Global Multiplier</strong> that boosts every winning tumble!
              </p>

              <div className="flex items-center gap-2 text-xs text-amber-200/90 bg-amber-950/60 px-3 py-2 rounded-xl border border-amber-500/40 mb-6">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Hit 3+ Holy Grails to retrigger +5 Free Spins!</span>
              </div>

              <button
                id="btn-start-free-spins"
                onClick={onStartFreeSpins}
                className="w-full py-3.5 rounded-xl font-cinzel font-black text-lg bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-stone-950 shadow-xl active:scale-95 transition-all cursor-pointer"
              >
                BEGIN FREE GAMES
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Outro Modal (When Free Spins Finish) */}
      <AnimatePresence>
        {showOutroModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.7, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="max-w-md w-full text-center p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-black border-2 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.7)] flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg border-2 border-yellow-100 mb-4">
                <Crown className="w-10 h-10 text-stone-950" />
              </div>

              <h2 className="font-cinzel text-2xl sm:text-3xl font-black text-amber-300 mb-1">
                ROYAL BOUNTY WON!
              </h2>

              <div className="text-xs text-stone-400 uppercase tracking-widest font-cinzel mb-4">
                Total Free Spins Payout
              </div>

              <div className="font-mono text-4xl sm:text-5xl font-black text-emerald-400 mb-6 drop-shadow-[0_0_20px_rgba(52,211,153,0.8)]">
                ${freeSpinsAccumulatedWin.toFixed(2)}
              </div>

              <button
                id="btn-collect-free-spins"
                onClick={onFinishFreeSpins}
                className="w-full py-3.5 rounded-xl font-cinzel font-black text-lg bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-stone-950 shadow-xl active:scale-95 transition-all cursor-pointer"
              >
                COLLECT REWARD
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
