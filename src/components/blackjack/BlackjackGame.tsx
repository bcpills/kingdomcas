import React, { useState, useEffect } from 'react';
import { Card, BlackjackHand, GameOutcome } from '../../types/casino';
import {
  createShoe,
  calculateHandScore,
  isNaturalBlackjack,
  evaluatePerfectPairs,
  evaluate21Plus3,
} from '../../utils/blackjackEngine';
import { sound } from '../../utils/sound';
import { PlayingCard } from './PlayingCard';
import {
  Crown,
  ArrowLeft,
  RotateCcw,
  Coins,
  Volume2,
  VolumeX,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface BlackjackGameProps {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  onBackToLobby: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  handleAddGold: () => void;
}

const CHIP_VALUES = [1, 5, 25, 50, 100, 500];

export const BlackjackGame: React.FC<BlackjackGameProps> = ({
  balance,
  setBalance,
  onBackToLobby,
  isMuted,
  onToggleMute,
  handleAddGold,
}) => {
  // Shoe & Deck
  const [shoe, setShoe] = useState<Card[]>(() => createShoe(6));

  // Bet States
  const [selectedChip, setSelectedChip] = useState<number>(25);
  const [mainBet, setMainBet] = useState<number>(0);
  const [perfectPairsBet, setPerfectPairsBet] = useState<number>(0);
  const [twentyOnePlusThreeBet, setTwentyOnePlusThreeBet] = useState<number>(0);
  const [lastBets, setLastBets] = useState<{ main: number; pp: number; top: number }>({
    main: 0,
    pp: 0,
    top: 0,
  });

  // Game Phases: 'betting' | 'player_turn' | 'dealer_turn' | 'round_over'
  const [phase, setPhase] = useState<'betting' | 'player_turn' | 'dealer_turn' | 'round_over'>('betting');

  // Hands
  const [playerHands, setPlayerHands] = useState<BlackjackHand[]>([]);
  const [activeHandIndex, setActiveHandIndex] = useState<number>(0);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);

  // Messages & Outcomes
  const [handOutcomes, setHandOutcomes] = useState<GameOutcome[]>([]);
  const [sideBetMessages, setSideBetMessages] = useState<{ pp?: string; top?: string }>({});
  const [roundNetWin, setRoundNetWin] = useState<number>(0);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

  // Helper delay
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Reset or re-shoe if low
  const checkShoeReshuffle = (currentShoe: Card[]) => {
    if (currentShoe.length < 50) {
      return createShoe(6);
    }
    return currentShoe;
  };

  // Place bet on a spot
  const handleAddBet = (spot: 'main' | 'pp' | 'top') => {
    if (phase !== 'betting') return;
    if (balance < selectedChip) return;

    sound.playChip();
    setBalance((prev) => prev - selectedChip);

    if (spot === 'main') setMainBet((prev) => prev + selectedChip);
    if (spot === 'pp') setPerfectPairsBet((prev) => prev + selectedChip);
    if (spot === 'top') setTwentyOnePlusThreeBet((prev) => prev + selectedChip);
  };

  // Clear all current bets and refund to balance
  const handleClearBets = () => {
    if (phase !== 'betting') return;
    const totalRefund = mainBet + perfectPairsBet + twentyOnePlusThreeBet;
    if (totalRefund > 0) {
      sound.playChip();
      setBalance((prev) => prev + totalRefund);
      setMainBet(0);
      setPerfectPairsBet(0);
      setTwentyOnePlusThreeBet(0);
    }
  };

  // Halve current bets (1/2)
  const handleHalveBet = () => {
    if (phase !== 'betting') return;
    const newMain = Math.floor(mainBet / 2);
    const newPP = Math.floor(perfectPairsBet / 2);
    const newTOP = Math.floor(twentyOnePlusThreeBet / 2);
    const refund = (mainBet - newMain) + (perfectPairsBet - newPP) + (twentyOnePlusThreeBet - newTOP);
    if (refund > 0) {
      sound.playChip();
      setBalance((prev) => prev + refund);
      setMainBet(newMain);
      setPerfectPairsBet(newPP);
      setTwentyOnePlusThreeBet(newTOP);
    }
  };

  // Double current bets (2x)
  const handleDoubleBet = () => {
    if (phase !== 'betting') return;
    const totalCurrent = mainBet + perfectPairsBet + twentyOnePlusThreeBet;
    if (totalCurrent === 0) {
      if (balance >= selectedChip) {
        handleAddBet('main');
      }
      return;
    }
    if (balance < totalCurrent) return;
    sound.playChip();
    setBalance((prev) => prev - totalCurrent);
    setMainBet((prev) => prev * 2);
    setPerfectPairsBet((prev) => prev * 2);
    setTwentyOnePlusThreeBet((prev) => prev * 2);
  };

  // Re-bet previous round's chips
  const handleRebet = () => {
    if (phase !== 'betting') return;
    const totalRequired = lastBets.main + lastBets.pp + lastBets.top;
    if (totalRequired > 0 && balance >= totalRequired) {
      sound.playChip();
      handleClearBets();
      setBalance((prev) => prev - totalRequired);
      setMainBet(lastBets.main);
      setPerfectPairsBet(lastBets.pp);
      setTwentyOnePlusThreeBet(lastBets.top);
    }
  };

  // Start Deal
  const handleDeal = async () => {
    if (mainBet <= 0 || phase !== 'betting') return;

    // Save last bets
    setLastBets({
      main: mainBet,
      pp: perfectPairsBet,
      top: twentyOnePlusThreeBet,
    });

    let currentShoe = checkShoeReshuffle([...shoe]);

    setSideBetMessages({});
    setHandOutcomes([]);
    setRoundNetWin(0);

    // Deal: Player 1, Dealer 1, Player 2, Dealer 2 (Face down)
    const pCard1 = currentShoe.pop()!;
    sound.playCardDeal();
    await delay(220);

    const dCard1 = currentShoe.pop()!;
    sound.playCardDeal();
    await delay(220);

    const pCard2 = currentShoe.pop()!;
    sound.playCardDeal();
    await delay(220);

    const dCard2: Card = { ...currentShoe.pop()!, isFaceDown: true };
    sound.playCardDeal();
    await delay(220);

    setShoe(currentShoe);

    const initialPlayerCards = [pCard1, pCard2];
    const initialDealerCards = [dCard1, dCard2];

    const pScore = calculateHandScore(initialPlayerCards);
    const pHand: BlackjackHand = {
      cards: initialPlayerCards,
      score: pScore.score,
      isSoft: pScore.isSoft,
      isBust: pScore.isBust,
      isBlackjack: isNaturalBlackjack(initialPlayerCards),
      isStanding: false,
    };

    setPlayerHands([pHand]);
    setActiveHandIndex(0);
    setDealerCards(initialDealerCards);

    // --- EVALUATE SIDE BETS IMMEDIATELY ---
    let sideBetsWon = 0;
    const messages: { pp?: string; top?: string } = {};

    if (perfectPairsBet > 0) {
      const ppResult = evaluatePerfectPairs(pCard1, pCard2);
      if (ppResult.payoutMultiplier > 0) {
        const ppPayout = perfectPairsBet * (ppResult.payoutMultiplier + 1);
        sideBetsWon += ppPayout;
        messages.pp = `${ppResult.label} (+$${ppPayout.toFixed(2)})`;
        sound.playKenoHit();
      } else {
        messages.pp = 'No Pair';
      }
    }

    if (twentyOnePlusThreeBet > 0) {
      const topResult = evaluate21Plus3(pCard1, pCard2, dCard1);
      if (topResult.payoutMultiplier > 0) {
        const topPayout = twentyOnePlusThreeBet * (topResult.payoutMultiplier + 1);
        sideBetsWon += topPayout;
        messages.top = `${topResult.label} (+$${topPayout.toFixed(2)})`;
        sound.playKenoHit();
      } else {
        messages.top = 'No 21+3';
      }
    }

    if (sideBetsWon > 0) {
      setBalance((prev) => prev + sideBetsWon);
      setRoundNetWin((prev) => prev + sideBetsWon);
    }
    setSideBetMessages(messages);

    // Check for Natural Blackjack
    if (pHand.isBlackjack) {
      // Reveal dealer hole card
      await delay(500);
      dCard2.isFaceDown = false;
      setDealerCards([...initialDealerCards]);
      sound.playCardDeal();

      const dealerScore = calculateHandScore(initialDealerCards);
      if (dealerScore.score === 21) {
        // Push
        setBalance((prev) => prev + mainBet);
        setHandOutcomes(['push']);
        setPhase('round_over');
      } else {
        // Player Natural Blackjack pays 3:2 (bet * 2.5)
        const bjPayout = mainBet * 2.5;
        setBalance((prev) => prev + bjPayout);
        setRoundNetWin((prev) => prev + bjPayout);
        setHandOutcomes(['player_blackjack']);
        sound.playFreeSpinsTrigger();
        setPhase('round_over');
      }
      return;
    }

    setPhase('player_turn');
  };

  // Player Action: Hit
  const handleHit = async () => {
    if (phase !== 'player_turn') return;
    const currentShoe = checkShoeReshuffle([...shoe]);
    const newCard = currentShoe.pop()!;
    setShoe(currentShoe);
    sound.playCardDeal();

    const currentHand = playerHands[activeHandIndex];
    const updatedCards = [...currentHand.cards, newCard];
    const scoreInfo = calculateHandScore(updatedCards);

    const updatedHand: BlackjackHand = {
      ...currentHand,
      cards: updatedCards,
      score: scoreInfo.score,
      isSoft: scoreInfo.isSoft,
      isBust: scoreInfo.isBust,
      isStanding: scoreInfo.isBust || scoreInfo.score === 21,
    };

    const nextHands = [...playerHands];
    nextHands[activeHandIndex] = updatedHand;
    setPlayerHands(nextHands);

    if (scoreInfo.isBust || scoreInfo.score === 21) {
      await delay(350);
      advanceToNextHandOrDealer(nextHands, activeHandIndex);
    }
  };

  // Player Action: Stand
  const handleStand = () => {
    if (phase !== 'player_turn') return;
    const nextHands = [...playerHands];
    nextHands[activeHandIndex].isStanding = true;
    setPlayerHands(nextHands);
    advanceToNextHandOrDealer(nextHands, activeHandIndex);
  };

  // Player Action: Double Down
  const handleDoubleDown = async () => {
    if (phase !== 'player_turn') return;
    const currentHand = playerHands[activeHandIndex];
    if (currentHand.cards.length !== 2 || balance < mainBet) return;

    // Deduct double bet
    sound.playChip();
    setBalance((prev) => prev - mainBet);

    const currentShoe = checkShoeReshuffle([...shoe]);
    const newCard = currentShoe.pop()!;
    setShoe(currentShoe);
    sound.playCardDeal();

    const updatedCards = [...currentHand.cards, newCard];
    const scoreInfo = calculateHandScore(updatedCards);

    const updatedHand: BlackjackHand = {
      ...currentHand,
      cards: updatedCards,
      score: scoreInfo.score,
      isSoft: scoreInfo.isSoft,
      isBust: scoreInfo.isBust,
      isStanding: true,
    };

    const nextHands = [...playerHands];
    nextHands[activeHandIndex] = updatedHand;
    setPlayerHands(nextHands);

    await delay(450);
    advanceToNextHandOrDealer(nextHands, activeHandIndex, true);
  };

  // Player Action: Split (if pair)
  const handleSplit = () => {
    if (phase !== 'player_turn') return;
    const currentHand = playerHands[activeHandIndex];
    if (
      playerHands.length !== 1 ||
      currentHand.cards.length !== 2 ||
      currentHand.cards[0].rank !== currentHand.cards[1].rank ||
      balance < mainBet
    ) {
      return;
    }

    sound.playChip();
    setBalance((prev) => prev - mainBet);

    const currentShoe = checkShoeReshuffle([...shoe]);
    const splitCard1 = currentHand.cards[0];
    const splitCard2 = currentHand.cards[1];

    const hitCard1 = currentShoe.pop()!;
    const hitCard2 = currentShoe.pop()!;
    setShoe(currentShoe);

    const hand1Cards = [splitCard1, hitCard1];
    const hand2Cards = [splitCard2, hitCard2];

    const s1 = calculateHandScore(hand1Cards);
    const s2 = calculateHandScore(hand2Cards);

    const hand1: BlackjackHand = {
      cards: hand1Cards,
      score: s1.score,
      isSoft: s1.isSoft,
      isBust: s1.isBust,
      isBlackjack: false,
      isStanding: false,
    };

    const hand2: BlackjackHand = {
      cards: hand2Cards,
      score: s2.score,
      isSoft: s2.isSoft,
      isBust: s2.isBust,
      isBlackjack: false,
      isStanding: false,
    };

    sound.playCardDeal();
    setPlayerHands([hand1, hand2]);
    setActiveHandIndex(0);
  };

  // Next Hand or Transition to Dealer
  const advanceToNextHandOrDealer = (
    hands: BlackjackHand[],
    currentIndex: number,
    isDoubled: boolean = false
  ) => {
    if (currentIndex < hands.length - 1) {
      setActiveHandIndex(currentIndex + 1);
    } else {
      // All player hands resolved. Check if all busted.
      const allBust = hands.every((h) => h.isBust);
      if (allBust) {
        // Dealer doesn't need to draw. Reveal hole card.
        dealerCards[1].isFaceDown = false;
        setDealerCards([...dealerCards]);
        setHandOutcomes(hands.map(() => 'player_bust'));
        setPhase('round_over');
      } else {
        runDealerTurn(hands, isDoubled);
      }
    }
  };

  // Dealer Turn Execution
  const runDealerTurn = async (hands: BlackjackHand[], wasDoubled: boolean = false) => {
    setPhase('dealer_turn');

    // Reveal dealer hole card
    await delay(400);
    const currentDealer = [...dealerCards];
    currentDealer[1].isFaceDown = false;
    setDealerCards([...currentDealer]);
    sound.playCardDeal();

    let currentShoe = checkShoeReshuffle([...shoe]);
    let dScore = calculateHandScore(currentDealer);

    // Dealer draws on soft 17 or less than 17
    while (dScore.score < 17) {
      await delay(600);
      const nextCard = currentShoe.pop()!;
      currentDealer.push(nextCard);
      setDealerCards([...currentDealer]);
      sound.playCardDeal();
      dScore = calculateHandScore(currentDealer);
    }
    setShoe(currentShoe);

    await delay(400);

    // Settle each player hand against dealer
    let totalMainPayout = 0;
    const outcomes: GameOutcome[] = [];

    hands.forEach((hand) => {
      const betMultiplier = wasDoubled ? 2 : 1;
      const handWager = mainBet * betMultiplier;

      if (hand.isBust) {
        outcomes.push('player_bust');
      } else if (dScore.isBust) {
        // Dealer busts! 1:1 payout
        outcomes.push('dealer_bust');
        totalMainPayout += handWager * 2;
      } else if (hand.score > dScore.score) {
        // Player higher
        outcomes.push('player_win');
        totalMainPayout += handWager * 2;
      } else if (hand.score === dScore.score) {
        // Push
        outcomes.push('push');
        totalMainPayout += handWager;
      } else {
        // Dealer higher
        outcomes.push('dealer_win');
      }
    });

    if (totalMainPayout > 0) {
      setBalance((prev) => prev + totalMainPayout);
      setRoundNetWin((prev) => prev + totalMainPayout);
      sound.playWinChime(2);
    }

    setHandOutcomes(outcomes);
    setPhase('round_over');
  };

  // Active hand check for actions
  const currentActiveHand = playerHands[activeHandIndex];
  const canSplit =
    phase === 'player_turn' &&
    playerHands.length === 1 &&
    currentActiveHand?.cards.length === 2 &&
    currentActiveHand.cards[0].rank === currentActiveHand.cards[1].rank &&
    balance >= mainBet;

  const canDouble =
    phase === 'player_turn' &&
    currentActiveHand?.cards.length === 2 &&
    balance >= mainBet;

  const dealerScoreDisplay = dealerCards.length > 0 && !dealerCards[1]?.isFaceDown
    ? calculateHandScore(dealerCards).score
    : dealerCards[0]?.value || 0;

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex flex-col justify-between">
      {/* Top Medieval Header */}
      <header className="w-full mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-back-to-lobby-bj"
            onClick={onBackToLobby}
            disabled={phase === 'player_turn' || phase === 'dealer_turn'}
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
                ROYAL BLACKJACK
              </h1>
              <div className="text-[9px] sm:text-[10px] text-stone-400 tracking-widest font-cinzel uppercase flex items-center gap-1.5">
                <span>Perfect Pairs (25:1)</span>
                <span>•</span>
                <span className="text-amber-400">21+3 (100:1)</span>
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
              id="btn-refill-gold-bj"
              onClick={handleAddGold}
              className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-300 text-xs font-bold font-cinzel flex items-center gap-1 animate-bounce cursor-pointer shadow"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>REFILL</span>
            </button>
          )}

          <button
            onClick={() => setShowRulesModal(true)}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:text-amber-300 text-stone-400 text-xs font-bold cursor-pointer"
            title="Blackjack & Side Bet Rules"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:text-amber-300 text-stone-400 text-xs font-bold cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Medieval Castle High Table Felt Area */}
      <div className="relative w-full rounded-3xl bg-gradient-to-b from-emerald-950 via-stone-950 to-stone-950 border-2 border-stone-700/80 p-3 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Table Felt Arch & Slogan */}
        <div className="text-center mb-4">
          <div className="inline-block px-4 py-1 rounded-full border border-amber-500/40 bg-stone-950/70 text-[10px] sm:text-xs font-cinzel font-bold text-amber-300/90 tracking-widest uppercase shadow">
            Royal Table • Blackjack Pays 3 to 2 • Dealer Stands on 17
          </div>
        </div>

        {/* Dealer Area */}
        <div className="flex flex-col items-center justify-center mb-6 min-h-[120px] sm:min-h-[150px]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-cinzel font-bold text-stone-400 uppercase tracking-wider">
              King's Dealer
            </span>
            {dealerCards.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-stone-900 border border-stone-700 font-mono text-xs font-bold text-amber-300">
                {dealerScoreDisplay}
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {dealerCards.map((card, idx) => (
              <PlayingCard key={`dealer-${idx}`} card={card} index={idx} />
            ))}
          </div>
        </div>

        {/* Center Side Bet Notices Banner */}
        {(sideBetMessages.pp || sideBetMessages.top) && (
          <div className="my-2 flex flex-wrap items-center justify-center gap-2">
            {sideBetMessages.pp && sideBetMessages.pp !== 'No Pair' && (
              <div className="px-3 py-1 rounded-xl bg-amber-950/90 border border-amber-400 text-amber-200 text-xs font-cinzel font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>PERFECT PAIRS: {sideBetMessages.pp}</span>
              </div>
            )}
            {sideBetMessages.top && sideBetMessages.top !== 'No 21+3' && (
              <div className="px-3 py-1 rounded-xl bg-amber-950/90 border border-amber-400 text-amber-200 text-xs font-cinzel font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>21+3: {sideBetMessages.top}</span>
              </div>
            )}
          </div>
        )}

        {/* Player Hands Area */}
        <div className="flex flex-col items-center justify-center mb-4 min-h-[130px] sm:min-h-[160px]">
          <div className="flex items-center justify-center gap-6">
            {playerHands.map((hand, hIdx) => {
              const isActive = hIdx === activeHandIndex && phase === 'player_turn';
              return (
                <div
                  key={`hand-${hIdx}`}
                  className={`flex flex-col items-center p-2 rounded-2xl transition-all ${
                    isActive
                      ? 'ring-2 ring-amber-400 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-cinzel font-bold text-stone-300 uppercase tracking-wider">
                      {playerHands.length > 1 ? `Hand ${hIdx + 1}` : 'Your Hand'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-mono text-xs font-bold ${
                        hand.isBust
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : hand.isBlackjack
                          ? 'bg-amber-950 text-yellow-300 border border-amber-400 animate-pulse'
                          : 'bg-stone-900 border border-stone-700 text-amber-300'
                      }`}
                    >
                      {hand.isBlackjack ? 'BLACKJACK!' : hand.isBust ? 'BUST' : hand.score}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    {hand.cards.map((card, cIdx) => (
                      <PlayingCard key={`p-${hIdx}-${cIdx}`} card={card} index={cIdx} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Round Outcome Banner */}
        {phase === 'round_over' && (
          <div className="my-3 text-center">
            <div className="inline-flex flex-col items-center px-6 py-2 rounded-2xl bg-stone-900/95 border-2 border-amber-400/90 shadow-[0_0_25px_rgba(245,158,11,0.4)]">
              <span className="font-cinzel text-base sm:text-lg font-black text-amber-300">
                {handOutcomes.includes('player_blackjack')
                  ? 'ROYAL BLACKJACK! 3:2 PAYOUT'
                  : handOutcomes.includes('dealer_bust')
                  ? 'DEALER BUSTS! YOU WIN!'
                  : handOutcomes.includes('player_win')
                  ? 'HAND WINS!'
                  : handOutcomes.includes('push')
                  ? 'PUSH - BETS RETURNED'
                  : 'DEALER WINS'}
              </span>
              {roundNetWin > 0 && (
                <span className="text-xs font-mono font-bold text-emerald-400">
                  Total Payout: +${roundNetWin.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Betting Spots Deck (Main Bet, Perfect Pairs, 21+3) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xl mx-auto my-3">
          {/* Perfect Pairs Spot */}
          <button
            id="bet-spot-perfect-pairs"
            onClick={() => handleAddBet('pp')}
            disabled={phase !== 'betting'}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all select-none ${
              perfectPairsBet > 0
                ? 'bg-amber-950/80 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-stone-900/80 border-dashed border-stone-700 hover:border-amber-500/60'
            } ${phase === 'betting' ? 'cursor-pointer hover:scale-102 active:scale-95' : 'cursor-default'}`}
          >
            <span className="text-[10px] sm:text-xs font-cinzel font-bold text-stone-300 uppercase tracking-wider">
              PERFECT PAIRS
            </span>
            <span className="text-[9px] text-amber-400 font-cinzel">Pays up to 25:1</span>
            <div className="mt-1.5 w-10 h-10 rounded-full bg-gradient-to-b from-stone-800 to-stone-950 border border-stone-600 flex items-center justify-center font-mono font-black text-xs text-amber-300 shadow-inner">
              ${perfectPairsBet}
            </div>
          </button>

          {/* Royal Main Bet Spot */}
          <button
            id="bet-spot-main"
            onClick={() => handleAddBet('main')}
            disabled={phase !== 'betting'}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all select-none ${
              mainBet > 0
                ? 'bg-gradient-to-b from-amber-950 via-yellow-950 to-stone-900 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                : 'bg-stone-900/80 border-dashed border-stone-700 hover:border-amber-500/60'
            } ${phase === 'betting' ? 'cursor-pointer hover:scale-102 active:scale-95' : 'cursor-default'}`}
          >
            <span className="text-xs sm:text-sm font-cinzel font-black text-amber-300 uppercase tracking-wider">
              MAIN BET
            </span>
            <span className="text-[9px] text-stone-400 font-cinzel">Blackjack 3:2</span>
            <div className="mt-1.5 w-12 h-12 rounded-full bg-gradient-to-b from-amber-500 to-yellow-600 border-2 border-yellow-200 flex items-center justify-center font-mono font-black text-xs sm:text-sm text-stone-950 shadow-md">
              ${mainBet}
            </div>
          </button>

          {/* 21+3 Spot */}
          <button
            id="bet-spot-21-plus-3"
            onClick={() => handleAddBet('top')}
            disabled={phase !== 'betting'}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all select-none ${
              twentyOnePlusThreeBet > 0
                ? 'bg-amber-950/80 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-stone-900/80 border-dashed border-stone-700 hover:border-amber-500/60'
            } ${phase === 'betting' ? 'cursor-pointer hover:scale-102 active:scale-95' : 'cursor-default'}`}
          >
            <span className="text-[10px] sm:text-xs font-cinzel font-bold text-stone-300 uppercase tracking-wider">
              21 + 3
            </span>
            <span className="text-[9px] text-amber-400 font-cinzel">Pays up to 100:1</span>
            <div className="mt-1.5 w-10 h-10 rounded-full bg-gradient-to-b from-stone-800 to-stone-950 border border-stone-600 flex items-center justify-center font-mono font-black text-xs text-amber-300 shadow-inner">
              ${twentyOnePlusThreeBet}
            </div>
          </button>
        </div>
      </div>

      {/* Action Deck & Chips */}
      <div className="mt-3 flex flex-col gap-2.5">
        {/* Chips Selector (when betting or round over) */}
        {phase === 'betting' && (
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-xs font-cinzel font-bold text-stone-400 mr-1">CHIP:</span>
            {CHIP_VALUES.map((val) => (
              <button
                key={val}
                onClick={() => setSelectedChip(val)}
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full font-mono font-black text-xs sm:text-sm border-2 transition-all flex items-center justify-center select-none cursor-pointer ${
                  selectedChip === val
                    ? 'border-yellow-300 scale-110 shadow-[0_0_15px_rgba(245,158,11,0.8)] bg-gradient-to-b from-amber-400 to-yellow-600 text-stone-950'
                    : 'border-stone-700 bg-stone-900 text-stone-300 hover:border-amber-400'
                }`}
              >
                ${val}
              </button>
            ))}

            <button
              id="btn-bj-halve"
              onClick={handleHalveBet}
              disabled={mainBet === 0 && perfectPairsBet === 0 && twentyOnePlusThreeBet === 0}
              className="px-2.5 py-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-400 text-stone-300 hover:text-amber-300 text-xs font-cinzel font-bold transition-all disabled:opacity-40 cursor-pointer ml-1"
              title="Halve current bet"
            >
              ½
            </button>

            <button
              id="btn-bj-double-bet"
              onClick={handleDoubleBet}
              disabled={balance < (mainBet + perfectPairsBet + twentyOnePlusThreeBet || selectedChip)}
              className="px-2.5 py-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-400 text-stone-300 hover:text-amber-300 text-xs font-cinzel font-bold transition-all disabled:opacity-40 cursor-pointer"
              title="Double current bet"
            >
              2×
            </button>

            <button
              id="btn-bj-clear"
              onClick={handleClearBets}
              disabled={mainBet === 0 && perfectPairsBet === 0 && twentyOnePlusThreeBet === 0}
              className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-red-500/60 text-stone-400 hover:text-red-400 text-xs font-cinzel font-bold transition-all disabled:opacity-40 cursor-pointer"
            >
              Clear
            </button>

            {lastBets.main > 0 && (
              <button
                id="btn-bj-rebet"
                onClick={handleRebet}
                className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-400 text-stone-300 hover:text-amber-300 text-xs font-cinzel font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Rebet</span>
              </button>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3">
          {phase === 'betting' && (
            <button
              id="btn-bj-deal"
              onClick={handleDeal}
              disabled={mainBet <= 0}
              className={`w-full sm:w-64 h-12 sm:h-14 rounded-2xl font-cinzel font-black tracking-widest text-base sm:text-lg flex items-center justify-center gap-2 border shadow-2xl transition-all select-none ${
                mainBet > 0
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 border-yellow-200 text-stone-950 shadow-[0_0_25px_rgba(245,158,11,0.5)] cursor-pointer active:scale-95'
                  : 'bg-stone-800 border-stone-700 text-stone-500 cursor-not-allowed'
              }`}
            >
              <Crown className="w-5 h-5 text-stone-950" />
              <span>DEAL HAND</span>
            </button>
          )}

          {phase === 'player_turn' && (
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap w-full max-w-xl">
              <button
                id="btn-bj-hit"
                onClick={handleHit}
                className="flex-1 min-w-[90px] h-12 sm:h-14 rounded-xl bg-stone-900 hover:bg-stone-800 border-2 border-amber-400 font-cinzel font-black text-amber-300 text-sm sm:text-base tracking-wider transition-all active:scale-95 cursor-pointer shadow-lg"
              >
                HIT
              </button>
              <button
                id="btn-bj-stand"
                onClick={handleStand}
                className="flex-1 min-w-[90px] h-12 sm:h-14 rounded-xl bg-gradient-to-r from-red-800 to-rose-700 hover:from-red-700 hover:to-rose-600 border border-red-500 font-cinzel font-black text-white text-sm sm:text-base tracking-wider transition-all active:scale-95 cursor-pointer shadow-lg"
              >
                STAND
              </button>
              {canDouble && (
                <button
                  id="btn-bj-double"
                  onClick={handleDoubleDown}
                  className="flex-1 min-w-[110px] h-12 sm:h-14 rounded-xl bg-stone-900 hover:bg-stone-800 border border-cyan-400 font-cinzel font-black text-cyan-300 text-xs sm:text-sm tracking-wider transition-all active:scale-95 cursor-pointer shadow-lg"
                >
                  DOUBLE
                </button>
              )}
              {canSplit && (
                <button
                  id="btn-bj-split"
                  onClick={handleSplit}
                  className="flex-1 min-w-[110px] h-12 sm:h-14 rounded-xl bg-stone-900 hover:bg-stone-800 border border-fuchsia-400 font-cinzel font-black text-fuchsia-300 text-xs sm:text-sm tracking-wider transition-all active:scale-95 cursor-pointer shadow-lg"
                >
                  SPLIT
                </button>
              )}
            </div>
          )}

          {phase === 'round_over' && (
            <button
              id="btn-bj-new-hand"
              onClick={() => {
                setPhase('betting');
                setPlayerHands([]);
                setDealerCards([]);
                setHandOutcomes([]);
                setSideBetMessages({});
              }}
              className="w-full sm:w-64 h-12 sm:h-14 rounded-2xl font-cinzel font-black tracking-widest text-base sm:text-lg bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 border border-yellow-200 text-stone-950 shadow-[0_0_25px_rgba(245,158,11,0.5)] cursor-pointer active:scale-95"
            >
              NEW HAND
            </button>
          )}
        </div>
      </div>

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-stone-900 via-stone-950 to-black border border-amber-500/80 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-cinzel text-xl font-bold text-amber-300">
                Royal Blackjack & Side Bets
              </h3>
              <button
                onClick={() => setShowRulesModal(false)}
                className="text-stone-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                <h4 className="font-cinzel font-bold text-amber-400 text-sm mb-1">
                  Royal Blackjack Rules
                </h4>
                <p>• Natural Blackjack pays 3:2.</p>
                <p>• Dealer stands on soft and hard 17.</p>
                <p>• Double Down allowed on any first 2 cards.</p>
                <p>• Split allowed once when player holds a pair of matching rank.</p>
              </div>

              <div className="p-3 rounded-xl bg-stone-900 border border-amber-500/30">
                <h4 className="font-cinzel font-bold text-amber-300 text-sm mb-1">
                  Perfect Pairs Side Bet
                </h4>
                <p>Evaluated on the player's initial 2 cards:</p>
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-stone-300">
                  <li><strong className="text-amber-300">Perfect Pair (25:1)</strong> - Same rank and same suit.</li>
                  <li><strong className="text-amber-300">Colored Pair (12:1)</strong> - Same rank and color (e.g. hearts + diamonds).</li>
                  <li><strong className="text-amber-300">Mixed Pair (6:1)</strong> - Same rank, different color.</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-stone-900 border border-amber-500/30">
                <h4 className="font-cinzel font-bold text-amber-300 text-sm mb-1">
                  21+3 Side Bet
                </h4>
                <p>Forms a 3-card poker hand using player's 2 cards + dealer's face-up card:</p>
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-stone-300">
                  <li><strong className="text-amber-300">Suited Trips (100:1)</strong> - 3 cards of identical rank and suit.</li>
                  <li><strong className="text-amber-300">Straight Flush (40:1)</strong> - 3 consecutive ranks of the same suit.</li>
                  <li><strong className="text-amber-300">Three of a Kind (30:1)</strong> - 3 cards of the same rank.</li>
                  <li><strong className="text-amber-300">Straight (10:1)</strong> - 3 consecutive ranks of mixed suits.</li>
                  <li><strong className="text-amber-300">Flush (5:1)</strong> - 3 cards of the same suit.</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-cinzel font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
