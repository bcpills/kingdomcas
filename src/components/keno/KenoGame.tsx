import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KenoDifficulty } from '../../types/casino';
import {
  TOTAL_KENO_BALLS,
  BALLS_DRAWN,
  MAX_PICKS,
  KENO_DIFFICULTIES,
  drawKenoBalls,
  getKenoPayoutMultiplier,
} from '../../utils/kenoEngine';
import { sound } from '../../utils/sound';
import {
  Crown,
  ArrowLeft,
  Coins,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Trash2,
  Dices,
  Shield,
  Flame,
  Award,
} from 'lucide-react';

interface KenoGameProps {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  onBackToLobby: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  handleAddGold: () => void;
}

const CHIP_VALUES = [1, 5, 25, 50, 100, 500];
const QUICK_PRESETS = [1, 5, 10, 25, 50, 100];

export const KenoGame: React.FC<KenoGameProps> = ({
  balance,
  setBalance,
  onBackToLobby,
  isMuted,
  onToggleMute,
  handleAddGold,
}) => {
  // State
  const [difficulty, setDifficulty] = useState<KenoDifficulty>('noble');
  const [bet, setBet] = useState<number>(5.0);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([7, 14, 21, 28, 35]);
  const [drawnBalls, setDrawnBalls] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [turbo, setTurbo] = useState<boolean>(false);

  // Round results
  const [hitNumbers, setHitNumbers] = useState<number[]>([]);
  const [roundPayout, setRoundPayout] = useState<number>(0);
  const [roundMultiplier, setRoundMultiplier] = useState<number>(0);
  const [hasPlayed, setHasPlayed] = useState<boolean>(false);

  const activeDifficultyConfig = KENO_DIFFICULTIES[difficulty];

  // Chip betting handlers (matching Blackjack chip interactions)
  const handleAddChip = (val: number) => {
    if (isDrawing) return;
    sound.playChip();
    setBet((prev) => {
      const next = +(prev + val).toFixed(2);
      return Math.min(balance, next);
    });
  };

  const handleHalveBet = () => {
    if (isDrawing || bet <= 0) return;
    sound.playChip();
    setBet((prev) => Math.max(1, Math.floor(prev / 2)));
  };

  const handleDoubleBet = () => {
    if (isDrawing) return;
    sound.playChip();
    setBet((prev) => {
      const doubled = prev === 0 ? 5 : prev * 2;
      return Math.min(balance, doubled);
    });
  };

  const handleClearBet = () => {
    if (isDrawing) return;
    sound.playChip();
    setBet(0);
  };

  // Helper delay
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, turbo ? ms * 0.25 : ms));

  // Toggle picking a number
  const handleToggleNumber = (num: number) => {
    if (isDrawing) return;
    sound.playChip();

    if (selectedNumbers.includes(num)) {
      setSelectedNumbers((prev) => prev.filter((n) => n !== num));
    } else {
      if (selectedNumbers.length < MAX_PICKS) {
        setSelectedNumbers((prev) => [...prev, num].sort((a, b) => a - b));
      }
    }
  };

  // Clear selections
  const handleClear = () => {
    if (isDrawing) return;
    sound.playChip();
    setSelectedNumbers([]);
    setDrawnBalls([]);
    setHitNumbers([]);
    setHasPlayed(false);
  };

  // Quick Pick
  const handleQuickPick = (count: number) => {
    if (isDrawing) return;
    sound.playChip();

    const pool = Array.from({ length: TOTAL_KENO_BALLS }, (_, i) => i + 1);
    const picks: number[] = [];

    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      picks.push(pool[idx]);
      pool.splice(idx, 1);
    }

    picks.sort((a, b) => a - b);
    setSelectedNumbers(picks);
    setDrawnBalls([]);
    setHitNumbers([]);
    setHasPlayed(false);
  };

  // Execute Draw
  const handlePlayDraw = async () => {
    if (isDrawing || selectedNumbers.length === 0 || balance < bet) return;

    setIsDrawing(true);
    setHasPlayed(false);
    setDrawnBalls([]);
    setHitNumbers([]);
    setRoundPayout(0);
    setRoundMultiplier(0);

    // Deduct bet
    setBalance((prev) => prev - bet);
    sound.playSpinStart();

    // 10 balls drawn
    const finalDrawn = drawKenoBalls();
    const currentDrawn: number[] = [];
    const currentHits: number[] = [];

    for (let i = 0; i < finalDrawn.length; i++) {
      await delay(180);
      const ball = finalDrawn[i];
      currentDrawn.push(ball);
      setDrawnBalls([...currentDrawn]);

      if (selectedNumbers.includes(ball)) {
        currentHits.push(ball);
        setHitNumbers([...currentHits]);
        sound.playKenoHit();
      } else {
        sound.playKenoBall();
      }
    }

    await delay(250);

    // Calculate payout
    const mult = getKenoPayoutMultiplier(difficulty, selectedNumbers.length, currentHits.length);
    const winAmount = bet * mult;

    setRoundMultiplier(mult);
    setRoundPayout(winAmount);
    setHasPlayed(true);

    if (winAmount > 0) {
      setBalance((prev) => prev + winAmount);
      if (mult >= 20) {
        sound.playFreeSpinsTrigger();
      } else {
        sound.playWinChime(3);
      }
    }

    setIsDrawing(false);
  };

  // Current paytable data for selected spot count
  const currentPaytable = activeDifficultyConfig.payouts[selectedNumbers.length] || [];

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex flex-col justify-between">
      {/* Top Medieval Header */}
      <header className="w-full mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-back-to-lobby-keno"
            onClick={onBackToLobby}
            disabled={isDrawing}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-500/60 text-stone-300 hover:text-amber-300 transition-all flex items-center gap-1 text-xs font-cinzel font-bold disabled:opacity-40 cursor-pointer shadow"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">LOBBY</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-gradient-to-b from-amber-500 to-yellow-600 border border-amber-300 shadow">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-stone-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-cinzel text-base sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500">
                ROYAL 40-BALL KENO
              </h1>
              <div className="text-[9px] sm:text-[10px] text-stone-400 tracking-widest font-cinzel uppercase flex items-center gap-1.5">
                <span>Pick 1-10</span>
                <span>•</span>
                <span className="text-amber-400">10 Balls Drawn</span>
                <span>•</span>
                <span className="text-orange-400">3 Difficulty Modes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Balance & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900/90 border border-stone-800 shadow">
            <Coins className="w-4 h-4 text-amber-400" />
            <div className="flex flex-col text-right">
              <span className="text-[9px] text-stone-400 font-cinzel font-bold leading-none">GOLD COINS</span>
              <span className="text-xs sm:text-sm font-mono font-black text-amber-300">
                ${balance.toFixed(2)}
              </span>
            </div>
          </div>

          {balance < 10 && (
            <button
              id="btn-refill-gold-keno"
              onClick={handleAddGold}
              className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-300 text-xs font-bold font-cinzel flex items-center gap-1 animate-bounce cursor-pointer shadow"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>REFILL</span>
            </button>
          )}

          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:text-amber-300 text-stone-400 text-xs font-bold cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Difficulty Tier Selector (3 Levels) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
        {/* Tier 1: Guardian Shield */}
        <button
          id="btn-diff-guardian"
          onClick={() => {
            if (!isDrawing) setDifficulty('guardian');
          }}
          disabled={isDrawing}
          className={`p-2.5 sm:p-3 rounded-2xl border-2 text-left transition-all select-none ${
            difficulty === 'guardian'
              ? 'bg-gradient-to-b from-emerald-950/80 to-stone-900 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              : 'bg-stone-900/80 border-stone-800 hover:border-stone-700'
          } ${isDrawing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <Shield className={`w-4 h-4 ${difficulty === 'guardian' ? 'text-emerald-400' : 'text-stone-500'}`} />
            <span className="font-cinzel font-black text-xs sm:text-sm text-stone-200">
              GUARDIAN
            </span>
          </div>
          <div className="text-[10px] text-emerald-400 font-cinzel font-bold">Low Volatility</div>
          <div className="text-[9px] text-stone-400 hidden sm:block">Frequent catches & returns</div>
        </button>

        {/* Tier 2: Noble Knight */}
        <button
          id="btn-diff-noble"
          onClick={() => {
            if (!isDrawing) setDifficulty('noble');
          }}
          disabled={isDrawing}
          className={`p-2.5 sm:p-3 rounded-2xl border-2 text-left transition-all select-none ${
            difficulty === 'noble'
              ? 'bg-gradient-to-b from-amber-950/80 to-stone-900 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
              : 'bg-stone-900/80 border-stone-800 hover:border-stone-700'
          } ${isDrawing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <Award className={`w-4 h-4 ${difficulty === 'noble' ? 'text-amber-400' : 'text-stone-500'}`} />
            <span className="font-cinzel font-black text-xs sm:text-sm text-stone-200">
              NOBLE
            </span>
          </div>
          <div className="text-[10px] text-amber-400 font-cinzel font-bold">Classic Balanced</div>
          <div className="text-[9px] text-stone-400 hidden sm:block">Standard medieval odds</div>
        </button>

        {/* Tier 3: Dragon's Fury */}
        <button
          id="btn-diff-dragon"
          onClick={() => {
            if (!isDrawing) setDifficulty('dragon');
          }}
          disabled={isDrawing}
          className={`p-2.5 sm:p-3 rounded-2xl border-2 text-left transition-all select-none ${
            difficulty === 'dragon'
              ? 'bg-gradient-to-b from-red-950/80 to-stone-900 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
              : 'bg-stone-900/80 border-stone-800 hover:border-stone-700'
          } ${isDrawing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <Flame className={`w-4 h-4 ${difficulty === 'dragon' ? 'text-red-400 animate-pulse' : 'text-stone-500'}`} />
            <span className="font-cinzel font-black text-xs sm:text-sm text-stone-200">
              DRAGON'S FURY
            </span>
          </div>
          <div className="text-[10px] text-red-400 font-cinzel font-bold">High Multipliers</div>
          <div className="text-[9px] text-stone-400 hidden sm:block">Up to 35,000x Max Win</div>
        </button>
      </div>

      {/* Drawn Balls Cauldron Bar (10 Balls) */}
      <div className="w-full bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800 rounded-2xl p-2.5 sm:p-3 mb-3 flex flex-col items-center justify-center shadow-lg">
        <div className="flex items-center justify-between w-full mb-1.5 px-2">
          <span className="text-[10px] sm:text-xs font-cinzel font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
            <span>Dragon's Cauldron Draw</span>
            <span className="text-amber-400">({drawnBalls.length}/10)</span>
          </span>
          <div className="text-xs font-cinzel font-bold text-amber-300">
            Hits: <span className="text-amber-400 font-mono font-black">{hitNumbers.length}</span> / {selectedNumbers.length}
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 flex-wrap min-h-[44px]">
          {Array.from({ length: BALLS_DRAWN }).map((_, idx) => {
            const ball = drawnBalls[idx];
            const isHit = ball && selectedNumbers.includes(ball);

            return (
              <div
                key={`drawn-${idx}`}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center font-mono font-black text-xs sm:text-sm transition-all select-none ${
                  ball
                    ? isHit
                      ? 'bg-gradient-to-b from-amber-400 to-yellow-600 border-yellow-200 text-stone-950 shadow-[0_0_15px_rgba(245,158,11,0.9)] scale-110 animate-bounce'
                      : 'bg-stone-800 border-stone-600 text-stone-300'
                    : 'bg-stone-950/80 border-dashed border-stone-800 text-stone-700'
                }`}
              >
                {ball || ''}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid & Live Paytable Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-3">
        {/* The 40-Ball Medieval Board (3 Cols wide on desktop) */}
        <div className="lg:col-span-3 bg-stone-950 border-2 border-stone-800 rounded-3xl p-3 sm:p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-cinzel font-bold text-stone-300 tracking-wider">
              SELECT 1 TO 10 NUMBERS ({selectedNumbers.length}/10 PICKED)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                id="btn-keno-quick-5"
                onClick={() => handleQuickPick(5)}
                disabled={isDrawing}
                className="px-2 py-1 rounded-lg bg-stone-900 border border-stone-800 hover:border-amber-400 text-[10px] font-cinzel font-bold text-stone-300 hover:text-amber-300 transition-all cursor-pointer"
              >
                Pick 5
              </button>
              <button
                id="btn-keno-quick-10"
                onClick={() => handleQuickPick(10)}
                disabled={isDrawing}
                className="px-2 py-1 rounded-lg bg-stone-900 border border-stone-800 hover:border-amber-400 text-[10px] font-cinzel font-bold text-stone-300 hover:text-amber-300 transition-all cursor-pointer"
              >
                Pick 10
              </button>
              <button
                id="btn-keno-clear"
                onClick={handleClear}
                disabled={isDrawing || selectedNumbers.length === 0}
                className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 hover:border-red-500 text-stone-400 hover:text-red-400 transition-all cursor-pointer disabled:opacity-40"
                title="Clear picks"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 40 Numbers Grid (8 cols x 5 rows) */}
          <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
            {Array.from({ length: TOTAL_KENO_BALLS }, (_, i) => i + 1).map((num) => {
              const isSelected = selectedNumbers.includes(num);
              const isDrawn = drawnBalls.includes(num);
              const isHit = isSelected && isDrawn;

              return (
                <button
                  key={num}
                  id={`keno-num-${num}`}
                  onClick={() => handleToggleNumber(num)}
                  disabled={isDrawing}
                  className={`aspect-square rounded-xl sm:rounded-2xl font-mono font-black text-xs sm:text-base border-2 transition-all flex items-center justify-center relative select-none ${
                    isHit
                      ? 'bg-gradient-to-b from-amber-400 to-yellow-600 border-yellow-200 text-stone-950 shadow-[0_0_20px_rgba(245,158,11,1)] scale-105 z-10'
                      : isSelected
                      ? 'bg-gradient-to-b from-amber-950 via-yellow-950 to-stone-900 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                      : isDrawn
                      ? 'bg-stone-800 border-stone-600 text-stone-400 opacity-60'
                      : 'bg-stone-900/90 border-stone-800 text-stone-300 hover:border-stone-700 hover:text-amber-200'
                  } ${isDrawing ? 'cursor-default' : 'cursor-pointer active:scale-95'}`}
                >
                  {num}
                  {isHit && (
                    <Sparkles className="w-3 h-3 text-stone-950 absolute top-0.5 right-0.5 animate-spin" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Dynamic Paytable Side Panel */}
        <div className="bg-stone-950 border-2 border-stone-800 rounded-3xl p-3 sm:p-4 shadow-xl flex flex-col justify-between">
          <div>
            {/* Draw Button & Fast Toggle: MOVED ABOVE PAYOUT TABLE */}
            <div className="mb-3 flex items-center gap-2">
              <button
                id="btn-keno-play"
                onClick={handlePlayDraw}
                disabled={isDrawing || selectedNumbers.length === 0 || balance < bet || bet <= 0}
                className={`flex-1 h-12 sm:h-14 rounded-2xl font-cinzel font-black tracking-widest text-sm sm:text-base flex items-center justify-center gap-2 border shadow-2xl transition-all select-none ${
                  isDrawing
                    ? 'bg-stone-800 border-stone-700 text-stone-500 cursor-not-allowed'
                    : selectedNumbers.length === 0
                    ? 'bg-stone-800 border-stone-700 text-stone-500 cursor-not-allowed'
                    : balance < bet || bet <= 0
                    ? 'bg-stone-800 border-red-900 text-red-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 border-yellow-200 text-stone-950 shadow-[0_0_25px_rgba(245,158,11,0.5)] cursor-pointer active:scale-95'
                }`}
              >
                <Dices className="w-5 h-5 text-stone-950" />
                <span>{isDrawing ? 'DRAWING...' : `DRAW 10 BALLS ($${bet.toFixed(2)})`}</span>
              </button>

              <button
                id="btn-keno-turbo"
                onClick={() => setTurbo(!turbo)}
                disabled={isDrawing}
                className={`h-12 sm:h-14 px-3 rounded-2xl border flex items-center gap-1 text-xs font-cinzel font-bold transition-all cursor-pointer select-none ${
                  turbo
                    ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
                title="Toggle Fast Draw"
              >
                <Zap className={`w-4 h-4 ${turbo ? 'text-amber-400 fill-amber-400' : ''}`} />
                <span className="hidden sm:inline">FAST</span>
              </button>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-cinzel font-bold text-amber-300 uppercase tracking-wider">
                Payout Matrix
              </span>
              <span className="text-[10px] font-cinzel text-stone-400">
                {selectedNumbers.length} spots
              </span>
            </div>

            {selectedNumbers.length === 0 ? (
              <div className="text-xs text-stone-500 font-cinzel text-center py-8">
                Pick 1 to 10 numbers to view payout table
              </div>
            ) : (
              <div className="flex flex-col gap-1 text-xs">
                <div className="grid grid-cols-2 text-[10px] font-cinzel font-bold text-stone-500 border-b border-stone-800 pb-1">
                  <span>HITS</span>
                  <span className="text-right">PAYOUT</span>
                </div>
                {currentPaytable.map((mult, hits) => {
                  if (mult === 0 && hits === 0) return null;
                  const isCurrentHit = hasPlayed && hitNumbers.length === hits;

                  return (
                    <div
                      key={hits}
                      className={`grid grid-cols-2 py-1 px-1.5 rounded-lg font-mono transition-all ${
                        isCurrentHit
                          ? 'bg-amber-400 text-stone-950 font-black shadow-md'
                          : mult > 0
                          ? 'text-stone-300 hover:bg-stone-900'
                          : 'text-stone-600'
                      }`}
                    >
                      <span className="font-cinzel font-bold">{hits} Catch</span>
                      <span className="text-right font-black">
                        {mult > 0 ? `${mult}x ($${(bet * mult).toFixed(2)})` : '-'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Round Net Banner */}
          {hasPlayed && (
            <div className="mt-3 p-2.5 rounded-2xl bg-stone-900 border border-stone-800 text-center">
              <div className="text-[10px] font-cinzel text-stone-400 uppercase">Round Result</div>
              <div
                className={`font-cinzel font-black text-sm sm:text-base ${
                  roundPayout > 0 ? 'text-amber-300' : 'text-stone-500'
                }`}
              >
                {roundPayout > 0
                  ? `WIN +$${roundPayout.toFixed(2)} (${roundMultiplier}x)`
                  : 'NO WIN'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Console: Blackjack-Style Chip Betting */}
      <div className="bg-gradient-to-b from-stone-900 via-stone-950 to-black p-3 sm:p-4 rounded-3xl border border-stone-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Total Wager Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-b from-amber-500 to-yellow-600 border-2 border-yellow-200 flex items-center justify-center font-mono font-black text-xs text-stone-950 shadow-md">
            ${bet}
          </div>
          <div>
            <div className="text-[10px] font-cinzel text-stone-400 font-bold uppercase tracking-wider">
              KENO WAGER
            </div>
            <div className="font-mono font-black text-sm sm:text-base text-amber-300">
              ${bet.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Interactive Chip Stacking (Like Blackjack) */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-xs font-cinzel font-bold text-stone-400 mr-1 hidden sm:inline">
            ADD CHIP:
          </span>
          {CHIP_VALUES.map((val) => (
            <button
              key={val}
              id={`btn-keno-chip-${val}`}
              onClick={() => handleAddChip(val)}
              disabled={isDrawing || balance < val}
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-full font-mono font-black text-xs sm:text-sm border-2 transition-all flex items-center justify-center select-none cursor-pointer border-stone-700 bg-stone-900 text-stone-300 hover:border-amber-400 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow"
              title={`Add $${val} to bet`}
            >
              +${val}
            </button>
          ))}

          {/* Quick 1/2, 2x, Clear Buttons */}
          <button
            id="btn-keno-halve"
            onClick={handleHalveBet}
            disabled={isDrawing || bet <= 0}
            className="px-2.5 py-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-400 text-stone-300 hover:text-amber-300 text-xs font-cinzel font-bold transition-all disabled:opacity-40 cursor-pointer ml-1"
            title="Halve current bet"
          >
            ½
          </button>
          <button
            id="btn-keno-double"
            onClick={handleDoubleBet}
            disabled={isDrawing || balance < (bet === 0 ? 5 : bet * 2)}
            className="px-2.5 py-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-400 text-stone-300 hover:text-amber-300 text-xs font-cinzel font-bold transition-all disabled:opacity-40 cursor-pointer"
            title="Double current bet"
          >
            2×
          </button>
          <button
            id="btn-keno-clear-bet"
            onClick={handleClearBet}
            disabled={isDrawing || bet <= 0}
            className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-red-500/60 text-stone-400 hover:text-red-400 text-xs font-cinzel font-bold transition-all disabled:opacity-40 cursor-pointer"
            title="Clear bet"
          >
            Clear
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-cinzel text-stone-500 uppercase mr-0.5 hidden lg:inline">
            Presets:
          </span>
          {QUICK_PRESETS.map((val) => (
            <button
              key={`preset-${val}`}
              onClick={() => {
                if (!isDrawing) setBet(val);
              }}
              disabled={isDrawing}
              className={`px-2 py-1 rounded-lg font-mono font-bold text-[11px] border transition-all cursor-pointer ${
                bet === val
                  ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                  : 'border-stone-800 bg-stone-900 text-stone-500 hover:text-stone-300'
              }`}
            >
              ${val}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
