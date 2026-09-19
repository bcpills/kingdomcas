import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../../types/casino';
import { Crown, Sword, Shield, Gem } from 'lucide-react';

interface PlayingCardProps {
  card: Card;
  index?: number;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({ card, index = 0 }) => {
  if (card.isFaceDown) {
    return (
      <motion.div
        initial={{ y: -40, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, delay: index * 0.08 }}
        className="w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36 rounded-xl border-2 border-amber-500/70 shadow-[0_8px_20px_rgba(0,0,0,0.8)] bg-gradient-to-br from-red-950 via-stone-900 to-amber-950 flex items-center justify-center p-1.5 relative overflow-hidden select-none"
      >
        {/* Ornate back pattern */}
        <div className="w-full h-full rounded-lg border border-amber-400/40 bg-stone-950/80 flex flex-col items-center justify-center relative">
          <div className="absolute inset-1 border border-dashed border-amber-500/30 rounded" />
          <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          <span className="text-[8px] sm:text-[9px] font-cinzel font-bold text-amber-300 tracking-wider mt-1">
            ROYAL
          </span>
        </div>
      </motion.div>
    );
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

  const renderSuitSymbol = (sizeClass: string) => {
    switch (card.suit) {
      case 'hearts':
        return <span className={`text-rose-500 ${sizeClass}`}>♥</span>;
      case 'diamonds':
        return <span className={`text-rose-500 ${sizeClass}`}>♦</span>;
      case 'clubs':
        return <span className={`text-stone-300 ${sizeClass}`}>♣</span>;
      case 'spades':
        return <span className={`text-stone-300 ${sizeClass}`}>♠</span>;
    }
  };

  const renderCenterRoyalArt = () => {
    if (card.rank === 'A') {
      return (
        <div className="flex flex-col items-center justify-center">
          <Shield className={`w-8 h-8 sm:w-10 sm:h-10 ${isRed ? 'text-rose-500' : 'text-amber-400'} drop-shadow-md`} />
          <span className="text-[9px] sm:text-[10px] font-cinzel font-extrabold tracking-widest text-amber-300">
            ACE
          </span>
        </div>
      );
    }
    if (card.rank === 'K') {
      return (
        <div className="flex flex-col items-center justify-center">
          <Crown className={`w-8 h-8 sm:w-10 sm:h-10 ${isRed ? 'text-amber-400' : 'text-yellow-300'} drop-shadow-md`} />
          <span className="text-[9px] sm:text-[10px] font-cinzel font-extrabold tracking-widest text-amber-300">
            KING
          </span>
        </div>
      );
    }
    if (card.rank === 'Q') {
      return (
        <div className="flex flex-col items-center justify-center">
          <Gem className={`w-7 h-7 sm:w-9 sm:h-9 ${isRed ? 'text-rose-400' : 'text-indigo-300'} drop-shadow-md`} />
          <span className="text-[9px] sm:text-[10px] font-cinzel font-extrabold tracking-widest text-amber-200">
            QUEEN
          </span>
        </div>
      );
    }
    if (card.rank === 'J') {
      return (
        <div className="flex flex-col items-center justify-center">
          <Sword className={`w-7 h-7 sm:w-9 sm:h-9 ${isRed ? 'text-amber-400' : 'text-cyan-300'} drop-shadow-md`} />
          <span className="text-[9px] sm:text-[10px] font-cinzel font-extrabold tracking-widest text-amber-200">
            KNIGHT
          </span>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center">
        {renderSuitSymbol('text-2xl sm:text-3xl md:text-4xl drop-shadow')}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ y: -40, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, delay: index * 0.08 }}
      className="w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36 rounded-xl border-2 border-stone-700 bg-gradient-to-b from-stone-900 via-stone-950 to-black shadow-[0_8px_20px_rgba(0,0,0,0.85)] flex flex-col justify-between p-1.5 sm:p-2 relative select-none overflow-hidden"
    >
      {/* Subtle gold inner filigree rim */}
      <div className="absolute inset-0.5 border border-amber-500/20 rounded-lg pointer-events-none" />

      {/* Top Left Corner Value & Suit */}
      <div className="flex flex-col items-center leading-none z-10">
        <span
          className={`font-cinzel font-black text-xs sm:text-sm md:text-base ${
            isRed ? 'text-rose-400' : 'text-stone-100'
          }`}
        >
          {card.rank}
        </span>
        <div className="text-xs sm:text-sm leading-tight">
          {renderSuitSymbol('text-xs sm:text-sm')}
        </div>
      </div>

      {/* Center Royal Graphic */}
      <div className="self-center z-10">{renderCenterRoyalArt()}</div>

      {/* Bottom Right Inverted Corner */}
      <div className="flex flex-col items-center leading-none rotate-180 self-end z-10">
        <span
          className={`font-cinzel font-black text-xs sm:text-sm md:text-base ${
            isRed ? 'text-rose-400' : 'text-stone-100'
          }`}
        >
          {card.rank}
        </span>
        <div className="text-xs sm:text-sm leading-tight">
          {renderSuitSymbol('text-xs sm:text-sm')}
        </div>
      </div>
    </motion.div>
  );
};
