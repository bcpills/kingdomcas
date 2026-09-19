import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Zap,
  RotateCw,
  Info,
  Flame,
  Crown,
  Minus,
  Plus,
  Square,
} from 'lucide-react';

interface ControlsProps {
  balance: number;
  bet: number;
  setBet: (newBet: number) => void;
  onSpin: () => void;
  isSpinning: boolean;
  turbo: boolean;
  setTurbo: (val: boolean) => void;
  anteBet: boolean;
  setAnteBet: (val: boolean) => void;
  autoSpinsRemaining: number;
  startAutoSpins: (count: number) => void;
  stopAutoSpins: () => void;
  onBuyBonus: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenPaytable: () => void;
  isFreeSpins: boolean;
  freeSpinsRemaining?: number;
}

const BET_OPTIONS = [0.20, 0.40, 0.60, 1.00, 2.00, 3.00, 5.00, 10.00, 20.00, 50.00, 100.00];

export const Controls: React.FC<ControlsProps> = ({
  balance,
  bet,
  setBet,
  onSpin,
  isSpinning,
  turbo,
  setTurbo,
  anteBet,
  setAnteBet,
  autoSpinsRemaining,
  startAutoSpins,
  stopAutoSpins,
  onBuyBonus,
  isMuted,
  onToggleMute,
  onOpenPaytable,
  isFreeSpins,
  freeSpinsRemaining = 0,
}) => {
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [showBuyConfirm, setShowBuyConfirm] = useState(false);

  const effectiveBet = anteBet ? bet * 1.25 : bet;
  const bonusCost = bet * 100;

  const handleDecreaseBet = () => {
    const currentIndex = BET_OPTIONS.findIndex((b) => Math.abs(b - bet) < 0.01);
    if (currentIndex > 0) {
      setBet(BET_OPTIONS[currentIndex - 1]);
    }
  };

  const handleIncreaseBet = () => {
    const currentIndex = BET_OPTIONS.findIndex((b) => Math.abs(b - bet) < 0.01);
    if (currentIndex < BET_OPTIONS.length - 1 && currentIndex !== -1) {
      setBet(BET_OPTIONS[currentIndex + 1]);
    } else if (currentIndex === -1 && bet < BET_OPTIONS[BET_OPTIONS.length - 1]) {
      setBet(BET_OPTIONS[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 mt-3 flex flex-col gap-2.5">
      {/* Side Actions Bar (Ante Bet & Buy Free Spins) - disabled during free spins */}
      {!isFreeSpins && (
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {/* Ante Bet Toggle */}
          <button
            id="btn-ante-bet"
            onClick={() => setAnteBet(!anteBet)}
            disabled={isSpinning}
            className={`relative p-2.5 sm:p-3 rounded-xl border text-left flex items-center justify-between transition-all select-none ${
              anteBet
                ? 'bg-gradient-to-r from-amber-950 via-yellow-950 to-stone-900 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-stone-900/90 border-stone-800 text-stone-300 hover:border-stone-700'
            } ${isSpinning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-lg border ${
                  anteBet ? 'bg-amber-500/20 border-amber-400' : 'bg-stone-800 border-stone-700'
                }`}
              >
                <Flame className={`w-4 h-4 ${anteBet ? 'text-amber-400 animate-pulse' : 'text-stone-400'}`} />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-cinzel font-bold tracking-wide flex items-center gap-1.5">
                  <span>ANTE BET (+25%)</span>
                  {anteBet && (
                    <span className="text-[10px] bg-amber-400 text-stone-950 px-1 rounded font-sans font-black">
                      ON
                    </span>
                  )}
                </div>
                <div className="text-[10px] sm:text-xs text-stone-400">
                  More Multipliers & Scatters
                </div>
              </div>
            </div>
            <div className="text-xs sm:text-sm font-mono font-bold text-amber-400">
              ${effectiveBet.toFixed(2)}
            </div>
          </button>

          {/* Buy Free Spins Feature */}
          <button
            id="btn-buy-bonus"
            onClick={() => setShowBuyConfirm(true)}
            disabled={isSpinning || balance < bonusCost}
            className={`relative p-2.5 sm:p-3 rounded-xl border text-left flex items-center justify-between transition-all select-none ${
              balance >= bonusCost
                ? 'bg-gradient-to-r from-amber-600/30 via-yellow-700/20 to-stone-900 border-amber-500/60 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] text-amber-100 cursor-pointer'
                : 'bg-stone-900/60 border-stone-800 text-stone-500 cursor-not-allowed'
            } ${isSpinning ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-400/50">
                <Crown className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-cinzel font-bold tracking-wide text-amber-300">
                  BUY FREE SPINS
                </div>
                <div className="text-[10px] sm:text-xs text-stone-400">
                  15 Royal Free Games (100x)
                </div>
              </div>
            </div>
            <div className="text-xs sm:text-sm font-mono font-bold text-amber-300">
              ${bonusCost.toFixed(2)}
            </div>
          </button>
        </div>
      )}

      {/* Main Console & Spin Deck */}
      <div className="rounded-2xl bg-gradient-to-b from-stone-900 via-stone-950 to-black p-3 sm:p-4 border border-stone-800 shadow-xl flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
        
        {/* Balance & Bet Display */}
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
          {/* Balance */}
          <div className="bg-stone-900/90 px-3 py-1.5 rounded-xl border border-stone-800 min-w-[100px]">
            <div className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">
              Balance
            </div>
            <div className="text-base sm:text-lg font-mono font-bold text-emerald-400">
              ${balance.toFixed(2)}
            </div>
          </div>

          {/* Bet Selector */}
          <div className="bg-stone-900/90 px-3 py-1.5 rounded-xl border border-stone-800 flex items-center gap-2">
            <div>
              <div className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold flex items-center justify-between">
                <span>Total Bet</span>
                {anteBet && <span className="text-amber-400 text-[9px] font-mono">+25%</span>}
              </div>
              <div className="text-base sm:text-lg font-mono font-bold text-amber-400">
                ${effectiveBet.toFixed(2)}
              </div>
            </div>
            <div className="flex items-center gap-1 ml-1">
              <button
                id="btn-bet-decrease"
                onClick={handleDecreaseBet}
                disabled={isSpinning || isFreeSpins || bet <= BET_OPTIONS[0]}
                className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-stone-200 border border-stone-700"
                aria-label="Decrease Bet"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                id="btn-bet-increase"
                onClick={handleIncreaseBet}
                disabled={isSpinning || isFreeSpins || bet >= BET_OPTIONS[BET_OPTIONS.length - 1]}
                className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-stone-200 border border-stone-700"
                aria-label="Increase Bet"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Toggles (Audio, Paytable, Turbo, Autoplay) */}
        <div className="flex items-center gap-2">
          {/* Turbo toggle */}
          <button
            id="btn-turbo-toggle"
            onClick={() => setTurbo(!turbo)}
            className={`p-2 rounded-xl border flex items-center gap-1 transition-all ${
              turbo
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
            title="Turbo Speed"
          >
            <Zap className="w-4 h-4" />
            <span className="text-xs font-bold hidden sm:inline">TURBO</span>
          </button>

          {/* Autoplay / Stop Autoplay */}
          {autoSpinsRemaining > 0 ? (
            <button
              id="btn-stop-autoplay"
              onClick={stopAutoSpins}
              className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg animate-pulse"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>STOP ({autoSpinsRemaining})</span>
            </button>
          ) : (
            <button
              id="btn-open-autoplay"
              onClick={() => setShowAutoModal(true)}
              disabled={isSpinning || isFreeSpins}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-300 text-xs font-bold flex items-center gap-1 disabled:opacity-40"
              title="Auto Play"
            >
              <RotateCw className="w-4 h-4" />
              <span className="hidden sm:inline">AUTO</span>
            </button>
          )}

          {/* Paytable Modal Trigger */}
          <button
            id="btn-open-paytable"
            onClick={onOpenPaytable}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-400 hover:text-stone-200"
            title="Paytable & Rules"
            aria-label="Paytable"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-sound-toggle"
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-400 hover:text-stone-200"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>

        {/* Primary SPIN Button */}
        <div className="w-full sm:w-auto flex justify-center">
          <button
            id="btn-spin-main"
            onClick={onSpin}
            disabled={isSpinning || (!isFreeSpins && balance < effectiveBet)}
            className={`w-full sm:w-44 h-12 sm:h-14 rounded-2xl font-cinzel font-black tracking-widest text-xs sm:text-sm flex items-center justify-center gap-2 border shadow-2xl transition-all select-none ${
              isFreeSpins
                ? 'bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 text-stone-950 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse cursor-default'
                : isSpinning
                ? 'bg-stone-800 border-stone-700 text-stone-500 cursor-not-allowed'
                : balance < effectiveBet
                ? 'bg-stone-800 border-red-900 text-red-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 border-yellow-200 text-stone-950 hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] active:scale-95 cursor-pointer text-base sm:text-lg'
            }`}
          >
            {isFreeSpins ? (
              <div className="flex items-center gap-1.5">
                <RotateCw className="w-4 h-4 animate-spin text-stone-950" />
                <span>FREE SPIN ({freeSpinsRemaining})</span>
              </div>
            ) : isSpinning ? (
              <>
                <RotateCw className="w-5 h-5 animate-spin text-stone-500" />
                <span>SPINNING</span>
              </>
            ) : (
              <span>SPIN</span>
            )}
          </button>
        </div>
      </div>

      {/* Auto Play Selector Dialog */}
      {showAutoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-cinzel text-lg font-bold text-amber-400">
                Select Auto Spins
              </h3>
              <button
                onClick={() => setShowAutoModal(false)}
                className="text-stone-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[10, 25, 50, 100].map((count) => (
                <button
                  key={count}
                  onClick={() => {
                    setShowAutoModal(false);
                    startAutoSpins(count);
                  }}
                  className="py-3 rounded-xl bg-stone-800 hover:bg-amber-600/30 border border-stone-700 hover:border-amber-400 font-cinzel font-bold text-base text-stone-100 hover:text-amber-200 transition-all"
                >
                  {count} Spins
                </button>
              ))}
            </div>
            <div className="text-[11px] text-stone-400 text-center">
              Auto play pauses automatically if Free Spins are triggered.
            </div>
          </div>
        </div>
      )}

      {/* Buy Free Spins Confirmation Dialog */}
      {showBuyConfirm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-stone-900 via-stone-950 to-black border-2 border-amber-500/80 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-[0_0_50px_rgba(245,158,11,0.4)] text-center relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-b from-amber-400 to-yellow-600 flex items-center justify-center mx-auto mb-4 border-2 border-yellow-200 shadow-lg">
              <Crown className="w-8 h-8 text-stone-950" />
            </div>

            <h3 className="font-cinzel text-xl sm:text-2xl font-black text-amber-300 mb-1">
              CONFIRM ROYAL BONUS
            </h3>

            <p className="text-xs text-stone-400 uppercase tracking-widest font-cinzel mb-4">
              15 Royal Free Spins Feature
            </p>

            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 mb-5 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-stone-300">
                <span>Current Bet:</span>
                <span className="font-mono font-bold text-amber-300">${bet.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-stone-300">
                <span>Bonus Multiplier:</span>
                <span className="font-mono font-bold text-amber-400">100x Bet</span>
              </div>
              <div className="h-px bg-stone-800 my-1" />
              <div className="flex items-center justify-between text-sm sm:text-base font-bold">
                <span className="text-stone-200">Total Purchase Price:</span>
                <span className="font-mono text-amber-400 text-lg font-black">${bonusCost.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-xs text-stone-400 mb-6 leading-relaxed">
              Guarantees at least 4 Holy Grail Scatters on the next drop to trigger 15 Royal Free Spins with permanent Multiplier Bombs!
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                id="btn-cancel-buy-bonus"
                onClick={() => setShowBuyConfirm(false)}
                className="py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-cinzel font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-buy-bonus"
                onClick={() => {
                  setShowBuyConfirm(false);
                  onBuyBonus();
                }}
                className="py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-stone-950 font-cinzel font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                Confirm & Spin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
