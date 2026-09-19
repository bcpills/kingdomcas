import React, { useState, useEffect, useCallback } from 'react';
import {
  GridCell,
  WinGroup,
} from '../../types/game';
import {
  generateBoard,
  findPayAnywhereWins,
  checkScatters,
  findMultiplierBombs,
  cascadeBoard,
} from '../../utils/slotEngine';
import { sound } from '../../utils/sound';
import { SlotGrid } from '../SlotGrid';
import { Controls } from '../Controls';
import { WinBanner } from '../WinBanner';
import { FreeSpinsOverlay } from '../FreeSpinsOverlay';
import { PaytableModal } from '../PaytableModal';
import {
  Crown,
  History,
  Coins,
  ArrowLeft,
} from 'lucide-react';

interface SlotGameProps {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  onBackToLobby: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  handleAddGold: () => void;
}

export const SlotGame: React.FC<SlotGameProps> = ({
  balance,
  setBalance,
  onBackToLobby,
  isMuted,
  onToggleMute,
  handleAddGold,
}) => {
  // Game State
  const [board, setBoard] = useState<GridCell[][]>(() => generateBoard({}));
  const [bet, setBet] = useState<number>(1.0);
  const [anteBet, setAnteBet] = useState<boolean>(false);
  const [turbo, setTurbo] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  // Active cascade states
  const [winningIds, setWinningIds] = useState<Set<string>>(new Set());
  const [detonatingBombIds, setDetonatingBombIds] = useState<Set<string>>(new Set());
  const [currentTumbleWin, setCurrentTumbleWin] = useState<number>(0);
  const [activeMultiplier, setActiveMultiplier] = useState<number>(1);
  const [latestWinGroups, setLatestWinGroups] = useState<WinGroup[]>([]);

  // Free Spins State
  const [isFreeSpins, setIsFreeSpins] = useState<boolean>(false);
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState<number>(0);
  const [totalFreeSpinsWon, setTotalFreeSpinsWon] = useState<number>(0);
  const [freeSpinsMultiplier, setFreeSpinsMultiplier] = useState<number>(1);
  const [freeSpinsAccumulatedWin, setFreeSpinsAccumulatedWin] = useState<number>(0);
  const [showFreeSpinsIntro, setShowFreeSpinsIntro] = useState<boolean>(false);
  const [showFreeSpinsOutro, setShowFreeSpinsOutro] = useState<boolean>(false);

  // Auto spin
  const [autoSpinsRemaining, setAutoSpinsRemaining] = useState<number>(0);

  // Big Win Overlay
  const [bigWinData, setBigWinData] = useState<{
    show: boolean;
    amount: number;
    multiplier: number;
    title: string;
  } | null>(null);

  // Paytable & Rules Modal
  const [showPaytable, setShowPaytable] = useState<boolean>(false);

  // Stats
  const [biggestWin, setBiggestWin] = useState<number>(() => {
    const saved = localStorage.getItem('kingdom_cascades_max_win');
    return saved ? parseFloat(saved) : 0;
  });

  useEffect(() => {
    if (biggestWin > 0) {
      localStorage.setItem('kingdom_cascades_max_win', biggestWin.toString());
    }
  }, [biggestWin]);

  // Helper delay function
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, turbo ? ms * 0.5 : ms));

  // Main Spin Execution Loop
  const executeSpin = useCallback(
    async (options: { buyBonus?: boolean } = {}) => {
      if (isSpinning) return;

      const effectiveBet = anteBet ? bet * 1.25 : bet;
      const spinCost = options.buyBonus ? bet * 100 : effectiveBet;

      // Ensure player has enough coins
      if (!isFreeSpins && balance < spinCost) {
        return;
      }

      setIsSpinning(true);
      setCurrentTumbleWin(0);
      setLatestWinGroups([]);
      setWinningIds(new Set());
      setDetonatingBombIds(new Set());

      // Deduct bet if base game
      if (!isFreeSpins) {
        setBalance((prev) => prev - spinCost);
        setActiveMultiplier(1);
      } else {
        setActiveMultiplier(freeSpinsMultiplier);
      }

      sound.playSpinStart();

      // Generate first board
      let currentBoard = generateBoard({
        isFreeSpins,
        anteBet,
        guaranteeScatters: options.buyBonus ? 4 : 0,
      });
      setBoard(currentBoard);

      // Play column drop thuds synchronized with staggered reel drops
      for (let c = 0; c < 6; c++) {
        sound.playColumnDrop(c);
        await delay(turbo ? 50 : 130);
      }

      // Allow final column to settle and let player register initial grid
      await delay(turbo ? 200 : 500);

      let accumulatedTumbleWin = 0;
      let tumbleStep = 0;
      let hasWins = true;

      // Tumble Cascade Cycle
      while (hasWins) {
        const wins = findPayAnywhereWins(currentBoard, bet);

        if (wins.length > 0) {
          tumbleStep += 1;
          const stepWinAmount = wins.reduce((sum, w) => sum + w.amount, 0);
          accumulatedTumbleWin += stepWinAmount;
          setCurrentTumbleWin(accumulatedTumbleWin);
          setLatestWinGroups(wins);

          // Collect all winning cell IDs to highlight and animate
          const winIdSet = new Set<string>();
          wins.forEach((w) => w.cellIds.forEach((id) => winIdSet.add(id)));
          setWinningIds(winIdSet);

          sound.playWinChime(tumbleStep);

          // Wait while player sees winning symbols glow and pulse
          await delay(turbo ? 320 : 680);

          // Cascade: Remove winning cells, drop remaining, fill top
          currentBoard = cascadeBoard(currentBoard, winIdSet, {
            isFreeSpins,
            anteBet,
          });
          setBoard(currentBoard);
          setWinningIds(new Set());

          // Stone drop thuds
          sound.playColumnDrop(tumbleStep % 6);

          // Allow cascaded tiles to drop down and settle
          await delay(turbo ? 250 : 550);
        } else {
          hasWins = false;
        }
      }

      // Check Multiplier Bombs on grid
      const bombsOnGrid = findMultiplierBombs(currentBoard);
      let totalSpinMultiplier = isFreeSpins ? freeSpinsMultiplier : 1;
      let newBombsSum = 0;

      if (bombsOnGrid.length > 0 && accumulatedTumbleWin > 0) {
        for (const bomb of bombsOnGrid) {
          setDetonatingBombIds((prev) => new Set([...prev, bomb.id]));
          sound.playBombExplosion();
          await delay(turbo ? 200 : 380);

          newBombsSum += bomb.value;
          const currentTotalMult = isFreeSpins
            ? freeSpinsMultiplier + newBombsSum
            : 1 + newBombsSum - (bombsOnGrid.indexOf(bomb) === 0 ? 1 : 0);

          sound.playMultiplierMultiply(bomb.value > 10 ? 3 : 1);
          setActiveMultiplier(currentTotalMult);
          await delay(turbo ? 240 : 450);
        }

        if (isFreeSpins) {
          const updatedGlobalMult = freeSpinsMultiplier + newBombsSum;
          setFreeSpinsMultiplier(updatedGlobalMult);
          totalSpinMultiplier = updatedGlobalMult;
        } else {
          totalSpinMultiplier = newBombsSum;
        }
      }

      // Check Scatters for payout & bonus trigger
      const scatterResult = checkScatters(currentBoard, bet);
      if (scatterResult.count > 0) {
        sound.playScatterLand(scatterResult.count);
      }

      // Final Win Calculation
      const finalSpinWin =
        accumulatedTumbleWin * (totalSpinMultiplier > 1 ? totalSpinMultiplier : 1) +
        scatterResult.payout;

      if (finalSpinWin > 0) {
        setBalance((prev) => prev + finalSpinWin);
        sound.playCoin();

        if (isFreeSpins) {
          setFreeSpinsAccumulatedWin((prev) => prev + finalSpinWin);
        }

        // Track biggest win record
        if (finalSpinWin > biggestWin) {
          setBiggestWin(finalSpinWin);
        }

        // Check for Big Win celebration
        if (finalSpinWin >= effectiveBet * 20) {
          let title = 'ROYAL BIG WIN!';
          if (finalSpinWin >= effectiveBet * 100) {
            title = 'ROYAL LEGENDARY WIN!';
          } else if (finalSpinWin >= effectiveBet * 50) {
            title = 'MEGA TREASURE WIN!';
          }

          sound.playFreeSpinsTrigger();
          setBigWinData({
            show: true,
            amount: finalSpinWin,
            multiplier: totalSpinMultiplier,
            title,
          });
        }
      }

      // Handle Free Spins Trigger (4+ Scatters in base game, or 3+ during free spins)
      if (scatterResult.triggersBonus && !isFreeSpins) {
        setAutoSpinsRemaining(0); // Pause autoplay on bonus
        sound.playFreeSpinsTrigger();
        setShowFreeSpinsIntro(true);
      } else if (isFreeSpins && scatterResult.count >= 3) {
        // Retrigger +5 Free Spins
        sound.playFreeSpinsTrigger();
        setFreeSpinsRemaining((prev) => prev + 5);
        setTotalFreeSpinsWon((prev) => prev + 5);
      }

      // Decrement Free Spins if in bonus mode
      if (isFreeSpins) {
        setFreeSpinsRemaining((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            // Free spins ended!
            setTimeout(() => {
              setShowFreeSpinsOutro(true);
            }, 600);
          }
          return next;
        });
      }

      setIsSpinning(false);

      // Continue Auto Spins if active
      if (autoSpinsRemaining > 0 && !isFreeSpins && !scatterResult.triggersBonus) {
        setAutoSpinsRemaining((prev) => prev - 1);
      }
    },
    [
      isSpinning,
      anteBet,
      bet,
      balance,
      setBalance,
      isFreeSpins,
      turbo,
      freeSpinsMultiplier,
      biggestWin,
      autoSpinsRemaining,
    ]
  );

  // Auto-play effect loop for Base Game
  useEffect(() => {
    if (autoSpinsRemaining > 0 && !isSpinning && !isFreeSpins && !showFreeSpinsIntro) {
      const timer = setTimeout(() => {
        executeSpin();
      }, turbo ? 350 : 1100);
      return () => clearTimeout(timer);
    }
  }, [autoSpinsRemaining, isSpinning, isFreeSpins, showFreeSpinsIntro, turbo, executeSpin]);

  // Free Spins Automatic Continuous Progression
  useEffect(() => {
    if (
      isFreeSpins &&
      freeSpinsRemaining > 0 &&
      !isSpinning &&
      !showFreeSpinsIntro &&
      !showFreeSpinsOutro &&
      !bigWinData?.show
    ) {
      const timer = setTimeout(() => {
        executeSpin();
      }, turbo ? 250 : 850);
      return () => clearTimeout(timer);
    }
  }, [
    isFreeSpins,
    freeSpinsRemaining,
    isSpinning,
    showFreeSpinsIntro,
    showFreeSpinsOutro,
    bigWinData?.show,
    turbo,
    executeSpin,
  ]);

  // Auto-dismiss Big Win during Free Spins after 2.8s so auto-spins resume seamlessly
  useEffect(() => {
    if (bigWinData?.show && isFreeSpins) {
      const timer = setTimeout(() => {
        setBigWinData(null);
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [bigWinData?.show, isFreeSpins]);

  // Spacebar key shortcut for quick spinning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !showPaytable) {
        e.preventDefault();
        if (bigWinData?.show) {
          setBigWinData(null);
        } else if (!isSpinning && !isFreeSpins) {
          executeSpin();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, isFreeSpins, bigWinData, showPaytable, executeSpin]);

  // Free Spins Handlers
  const handleStartFreeSpins = () => {
    setShowFreeSpinsIntro(false);
    setIsFreeSpins(true);
    setFreeSpinsRemaining(15);
    setTotalFreeSpinsWon(15);
    setFreeSpinsMultiplier(1);
    setFreeSpinsAccumulatedWin(0);
  };

  const handleFinishFreeSpins = () => {
    setShowFreeSpinsOutro(false);
    setIsFreeSpins(false);
    setFreeSpinsRemaining(0);
    setFreeSpinsMultiplier(1);
    setActiveMultiplier(1);
  };

  const handleBuyBonus = () => {
    executeSpin({ buyBonus: true });
  };

  return (
    <div className="w-full flex flex-col justify-between py-2 sm:py-3">
      {/* Top Medieval Header */}
      <header className="w-full max-w-4xl mx-auto px-2 sm:px-4 mb-2 flex items-center justify-between">
        {/* Left: Back to Lobby button & Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-back-to-lobby"
            onClick={onBackToLobby}
            disabled={isSpinning || isFreeSpins}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-500/60 text-stone-300 hover:text-amber-300 transition-all flex items-center gap-1 text-xs font-cinzel font-bold disabled:opacity-40 cursor-pointer shadow"
            title="Return to Castle Lobby"
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
                KINGDOM CASCADES
              </h1>
              <div className="text-[9px] sm:text-[10px] text-stone-400 tracking-widest font-cinzel uppercase flex items-center gap-1.5">
                <span>Pay Anywhere</span>
                <span>•</span>
                <span className="text-orange-400">Multiplier Bombs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Stats & Reload Gold */}
        <div className="flex items-center gap-2 sm:gap-3">
          {biggestWin > 0 && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-900 border border-stone-800 text-xs">
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-stone-400 text-[10px]">BEST WIN:</span>
              <span className="font-mono font-bold text-amber-300">
                ${biggestWin.toFixed(2)}
              </span>
            </div>
          )}

          {balance < 10 && (
            <button
              id="btn-refill-gold-slot"
              onClick={handleAddGold}
              className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-300 text-xs font-bold font-cinzel flex items-center gap-1 animate-bounce cursor-pointer shadow-lg"
              title="Add 500 Gold Coins"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>REFILL GOLD</span>
            </button>
          )}
        </div>
      </header>

      {/* Free Spins Banner (if in bonus mode) */}
      <FreeSpinsOverlay
        isFreeSpins={isFreeSpins}
        freeSpinsRemaining={freeSpinsRemaining}
        totalFreeSpinsWon={totalFreeSpinsWon}
        freeSpinsMultiplier={freeSpinsMultiplier}
        freeSpinsAccumulatedWin={freeSpinsAccumulatedWin}
        showIntroModal={showFreeSpinsIntro}
        onStartFreeSpins={handleStartFreeSpins}
        showOutroModal={showFreeSpinsOutro}
        onFinishFreeSpins={handleFinishFreeSpins}
      />

      {/* Live Win Ticker / Active Multiplier */}
      <WinBanner
        currentTumbleWin={currentTumbleWin}
        activeMultiplier={activeMultiplier}
        latestWinGroups={latestWinGroups}
        bigWinData={bigWinData}
        onDismissBigWin={() => setBigWinData(null)}
      />

      {/* The 6x5 Cascading Reels Stage */}
      <section aria-label="Slot Reels">
        <SlotGrid
          board={board}
          winningIds={winningIds}
          detonatingBombIds={detonatingBombIds}
          isSpinning={isSpinning}
          turbo={turbo}
        />
      </section>

      {/* Controls Deck */}
      <Controls
        balance={balance}
        bet={bet}
        setBet={setBet}
        onSpin={() => executeSpin()}
        isSpinning={isSpinning}
        turbo={turbo}
        setTurbo={setTurbo}
        anteBet={anteBet}
        setAnteBet={setAnteBet}
        autoSpinsRemaining={autoSpinsRemaining}
        startAutoSpins={(count) => setAutoSpinsRemaining(count)}
        stopAutoSpins={() => setAutoSpinsRemaining(0)}
        onBuyBonus={handleBuyBonus}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        onOpenPaytable={() => setShowPaytable(true)}
        isFreeSpins={isFreeSpins}
        freeSpinsRemaining={freeSpinsRemaining}
      />

      {/* Paytable Modal */}
      <PaytableModal
        isOpen={showPaytable}
        onClose={() => setShowPaytable(false)}
        bet={anteBet ? bet * 1.25 : bet}
      />

      {/* Bottom Key Hint */}
      <footer className="text-center text-[11px] text-stone-600 mt-2 font-cinzel">
        Press <kbd className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-400 font-mono">SPACE</kbd> to Spin
      </footer>
    </div>
  );
};
