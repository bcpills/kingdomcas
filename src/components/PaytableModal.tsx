import React from 'react';
import { motion } from 'motion/react';
import { SYMBOL_DEFINITIONS, getBombTheme } from '../utils/slotEngine';
import { SymbolId } from '../types/game';
import { SymbolCell } from './SymbolCell';
import { Crown, Flame, Sparkles, X, ShieldAlert } from 'lucide-react';

interface PaytableModalProps {
  isOpen: boolean;
  onClose: () => void;
  bet: number;
}

export const PaytableModal: React.FC<PaytableModalProps> = ({
  isOpen,
  onClose,
  bet,
}) => {
  if (!isOpen) return null;

  const regularSymbols: SymbolId[] = [
    'crown',
    'sword',
    'shield',
    'ring',
    'chalice',
    'ruby',
    'sapphire',
    'emerald',
    'topaz',
  ];

  const bombSampleTiers = [
    { label: 'Copper Alchemist', val: 5, color: getBombTheme(5) },
    { label: 'Sapphire Dragon', val: 15, color: getBombTheme(15) },
    { label: 'Royal Sun', val: 50, color: getBombTheme(50) },
    { label: 'Mythic Void', val: 500, color: getBombTheme(500) },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gradient-to-b from-stone-900 via-stone-950 to-black border-2 border-stone-700 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative my-auto max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-400" />
            <h2 className="font-cinzel text-xl sm:text-2xl font-black text-amber-300">
              PAYTABLE & RULES
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-1 flex flex-col gap-6 text-stone-300 text-xs sm:text-sm">
          
          {/* Rules Overview Callout */}
          <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3.5 flex flex-col gap-1.5">
            <div className="font-cinzel font-bold text-amber-300 flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>PAY ANYWHERE MECHANIC</span>
            </div>
            <p className="text-stone-300 leading-relaxed">
              Symbols pay anywhere on the 6x5 grid! The total number of the same symbol on the screen at the end of a spin determines the win value. Match 8 or more to trigger a payout and initiate the cascade!
            </p>
          </div>

          {/* Multiplier Bombs Showcase */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="font-cinzel font-bold text-base text-orange-400 flex items-center gap-1.5">
                <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
                <span>MULTIPLIER BOMBS (2x — 500x)</span>
              </div>
            </div>
            <p className="text-stone-300 leading-relaxed text-xs">
              Multiplier Bombs can land on any reel during spins and cascades. At the end of all tumbles, all bombs detonate! Their multiplier values add together and multiply the entire spin tumble win!
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
              {bombSampleTiers.map((b) => (
                <div
                  key={b.val}
                  className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 bg-stone-950 ${b.color.border}`}
                >
                  <span className={`text-lg font-cinzel font-black ${b.color.textColor}`}>
                    {b.val}x
                  </span>
                  <span className="text-[10px] text-stone-400 font-semibold">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scatter Holy Grail */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-16 h-16 shrink-0">
              <SymbolCell
                cell={{
                  id: 'demo-scatter',
                  symbolId: 'scatter',
                  row: 0,
                  col: 0,
                }}
              />
            </div>
            <div>
              <div className="font-cinzel font-bold text-amber-300 text-base">
                HOLY GRAIL (SCATTER)
              </div>
              <p className="text-xs text-stone-300 mt-1">
                Land 4 or more Holy Grails anywhere on the reels to trigger <strong className="text-amber-400">15 Royal Free Spins</strong>.
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs font-mono text-amber-300">
                <span>4x = ${(bet * 3).toFixed(2)}</span>
                <span>5x = ${(bet * 5).toFixed(2)}</span>
                <span>6+ = ${(bet * 100).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Regular Symbols & Dynamic Payouts based on current bet */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-cinzel font-bold text-sm text-stone-200">
                SYMBOL PAYOUTS (CURRENT BET: ${bet.toFixed(2)})
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {regularSymbols.map((symId) => {
                const def = SYMBOL_DEFINITIONS[symId];
                return (
                  <div
                    key={symId}
                    className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center gap-3"
                  >
                    <div className="w-12 h-12 shrink-0">
                      <SymbolCell
                        cell={{
                          id: `demo-${symId}`,
                          symbolId: symId,
                          row: 0,
                          col: 0,
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-cinzel font-bold text-stone-200 text-xs truncate">
                        {def.name}
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[11px] font-mono mt-1">
                        <div>
                          <span className="text-stone-500 block text-[9px]">8-9</span>
                          <span className="text-stone-300">${(bet * def.payouts.min8).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block text-[9px]">10-11</span>
                          <span className="text-stone-300">${(bet * def.payouts.min10).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block text-[9px]">12+</span>
                          <span className="text-amber-400 font-bold">${(bet * def.payouts.min12).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Free Spins Rules */}
          <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-3.5">
            <h4 className="font-cinzel font-bold text-amber-400 text-sm mb-1.5 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>FREE SPINS PERSISTENT MULTIPLIER RULE</span>
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Whenever a Multiplier Bomb lands during a winning tumble in Free Spins, its multiplier value is added to the <strong>Global Persistent Multiplier</strong>. This accumulated multiplier remains active for the duration of the entire bonus round and multiplies every subsequent winning spin!
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-stone-800 pt-3 mt-4 text-center shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-48 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-cinzel font-bold text-xs uppercase tracking-wider"
          >
            Close Paytable
          </button>
        </div>
      </motion.div>
    </div>
  );
};
