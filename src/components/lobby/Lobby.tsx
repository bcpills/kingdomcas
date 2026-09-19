import React from 'react';
import { GameView } from '../../types/casino';
import {
  Crown,
  Sparkles,
  Coins,
  Volume2,
  VolumeX,
  Play,
  Flame,
  Shield,
  Dices,
  Award,
  Layers,
  Package,
} from 'lucide-react';

interface LobbyProps {
  balance: number;
  onSelectGame: (game: GameView) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  handleAddGold: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  balance,
  onSelectGame,
  isMuted,
  onToggleMute,
  handleAddGold,
}) => {
  const games = [
    {
      id: 'slots' as GameView,
      title: 'KINGDOM CASCADES',
      shortTitle: 'CASCADES',
      category: 'Cascading Slot',
      badge: 'Pay Anywhere • 6x5',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      mobileHighlight: '6x5 • 500x Bombs',
      description:
        'Tumbling reels, explosive Multiplier Bombs up to 500x, Ante Bet booster, and Holy Grail Free Spins.',
      features: [
        'Pay Anywhere (8+ Match)',
        'Tumbling Cascades',
        'Multiplier Bombs up to 500x',
        '15 Royal Free Spins Feature Buy',
      ],
      icon: Crown,
      gradient: 'from-amber-950/80 via-yellow-950/40 to-stone-950',
      borderColor: 'border-amber-500/60 hover:border-amber-400',
      accentGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
      btnText: 'ENTER SLOT HALL',
      mobileBtnText: 'PLAY SLOTS',
    },
    {
      id: 'blackjack' as GameView,
      title: 'ROYAL BLACKJACK',
      shortTitle: 'BLACKJACK',
      category: 'King’s High Table',
      badge: 'Side Bets: Pairs & 21+3',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
      mobileHighlight: '3:2 • Side Bets',
      description:
        'Authentic 6-deck royal blackjack with 3:2 payouts, Double Down, Split, and high-paying side bets.',
      features: [
        'Natural Blackjack Pays 3:2',
        'Perfect Pairs Side Bet (25:1)',
        '21+3 Poker Side Bet (100:1)',
        'Double Down & Split Pairs',
      ],
      icon: Shield,
      gradient: 'from-emerald-950/80 via-stone-950 to-stone-950',
      borderColor: 'border-emerald-500/60 hover:border-emerald-400',
      accentGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
      btnText: 'TAKE A SEAT',
      mobileBtnText: 'PLAY 21',
    },
    {
      id: 'keno' as GameView,
      title: "DRAGON'S KENO",
      shortTitle: 'KENO',
      category: '40-Ball Cauldron',
      badge: 'Chip Betting • 3 Tiers',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
      mobileHighlight: 'Chip Betting • 3 Tiers',
      description:
        'Pick 1 to 10 numbers from 40 royal balls. Interactive chip betting, top draw button, and balanced 1,000x Noble Knight mode.',
      features: [
        'Blackjack-Style Chip Stacking & Doubling',
        'Top Draw Console Above Payout Matrix',
        'Noble Knight (1,000x Max Win)',
        "Dragon's Fury (35,000x Max Win)",
      ],
      icon: Dices,
      gradient: 'from-rose-950/80 via-stone-950 to-stone-950',
      borderColor: 'border-rose-500/60 hover:border-rose-400',
      accentGlow: 'shadow-[0_0_20px_rgba(244,63,94,0.2)]',
      btnText: 'ENTER KENO CAVE',
      mobileBtnText: 'PLAY KENO',
    },
    {
      id: 'lootbox' as GameView,
      title: 'ROYAL LOOTBOXES',
      shortTitle: 'LOOTBOXES',
      category: 'Mystery Relic & Gem Vaults',
      badge: 'Battles • 1v1, 2v2, FFA',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
      mobileHighlight: 'Battles & 8 Vaults',
      description:
        'Unbox legendary armaments and sparkling gem treasures solo or enter Crate Battles (1v1 Duels, 2v2 Clashes, and 2-4 Player Group Unboxes)!',
      features: [
        'Crate Battles: 1v1, 2v2, & 3-4 Player FFA',
        '8 Vaults: Relics & Jeweled Gems ($10 - $1,000)',
        'CS:GO-Style Spinning Reel & Multi-Open',
        'Winner Takes All Loot in Arena Battles',
      ],
      icon: Package,
      gradient: 'from-purple-950/80 via-stone-950 to-stone-950',
      borderColor: 'border-purple-500/60 hover:border-purple-400',
      accentGlow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]',
      btnText: 'OPEN CHEST VAULT',
      mobileBtnText: 'OPEN CHESTS',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 md:px-6 py-2 sm:py-4 md:py-6 flex flex-col justify-between min-h-[92vh]">
      {/* Lobby Navigation Header */}
      <header className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 pb-3 sm:pb-4 border-b border-stone-800/80 mb-3 sm:mb-6">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-amber-500 to-yellow-600 border border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]">
            <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-stone-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-cinzel text-sm sm:text-lg md:text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 leading-tight">
              KINGDOM GRAND CASINO
            </h1>
            <p className="text-[8px] sm:text-[10px] text-stone-400 font-cinzel tracking-widest uppercase">
              The Royal Realm • 4 Casino Games
            </p>
          </div>
        </div>

        {/* Balance & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 ml-auto">
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-stone-900/95 border border-stone-800 shadow">
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <div className="flex flex-col text-right">
              <span className="text-[8px] text-stone-400 font-cinzel font-bold leading-none hidden sm:block">
                GOLD
              </span>
              <span className="text-xs sm:text-sm font-mono font-black text-amber-300">
                ${balance.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            id="btn-lobby-refill"
            onClick={handleAddGold}
            className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-stone-950 font-cinzel font-black text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1 shadow active:scale-95 transition-all cursor-pointer"
            title="Refill Gold Coins (+500)"
          >
            <Coins className="w-3 h-3" />
            <span>+500</span>
          </button>

          <button
            onClick={onToggleMute}
            className="p-1.5 sm:p-2 rounded-xl bg-stone-900 border border-stone-800 hover:text-amber-300 text-stone-400 transition-all cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>
      </header>

      {/* Medieval Castle Banner (Compact on mobile) */}
      <section className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-black p-3 sm:p-5 md:p-6 border-2 border-stone-800 shadow-[0_10px_30px_rgba(0,0,0,0.7)] mb-3 sm:mb-6 overflow-hidden text-center">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-80 h-24 bg-amber-500/10 blur-2xl rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-900 border border-amber-500/40 text-amber-300 text-[10px] sm:text-xs font-cinzel font-bold mb-1.5 shadow">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>ROYAL GAMING SUITE</span>
          <Sparkles className="w-3 h-3 text-amber-400" />
        </div>

        <h2 className="font-cinzel text-lg sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-yellow-200 to-amber-500 mb-1">
          CHOOSE YOUR ROYAL GAME
        </h2>

        <p className="text-[10px] sm:text-xs md:text-sm text-stone-400 max-w-lg mx-auto font-cinzel leading-relaxed">
          Four distinct medieval casino experiences. Your Gold Coins balance transfers seamlessly across all games.
        </p>
      </section>

      {/* 2x2 Games Selection Grid:
          Game1 Game2
          Game3 Game4
          Formatted as 2 columns on BOTH mobile and desktop! */}
      <section className="grid grid-cols-2 gap-2.5 sm:gap-4 md:gap-5 mb-4 sm:mb-6 w-full">
        {games.map((g) => {
          const IconComp = g.icon;
          return (
            <div
              key={g.id}
              className={`rounded-2xl sm:rounded-3xl bg-gradient-to-b ${g.gradient} border-2 ${g.borderColor} ${g.accentGlow} p-2.5 sm:p-4 md:p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 relative group overflow-hidden`}
            >
              {/* Card Header & Content */}
              <div>
                {/* Top Badge & Icon */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span
                    className={`px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-full text-[8px] sm:text-[10px] md:text-xs font-cinzel font-bold border truncate max-w-[100px] sm:max-w-none ${g.badgeColor}`}
                  >
                    <span className="hidden sm:inline">{g.badge}</span>
                    <span className="sm:hidden">{g.mobileHighlight}</span>
                  </span>
                  <div className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-stone-900/80 border border-stone-800 text-stone-300 group-hover:text-amber-300 transition-colors flex-shrink-0">
                    <IconComp className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  </div>
                </div>

                {/* Category & Title */}
                <div className="text-[8px] sm:text-[10px] md:text-[11px] font-cinzel uppercase tracking-widest text-stone-400 mb-0.5 sm:mb-1">
                  {g.category}
                </div>
                <h3 className="font-cinzel text-xs sm:text-base md:text-xl font-black text-amber-200 mb-1 sm:mb-1.5 tracking-wide leading-tight line-clamp-1 sm:line-clamp-none">
                  {g.title}
                </h3>
                <p className="text-[9px] sm:text-[11px] md:text-xs text-stone-400 mb-2 sm:mb-3 leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {g.description}
                </p>

                {/* Features List (Detailed on tablet/desktop, punchy pill on mobile) */}
                <div className="hidden md:block space-y-1 mb-4">
                  {g.features.map((feat, fIdx) => (
                    <div
                      key={fIdx}
                      className="flex items-center gap-1.5 text-[10px] text-stone-300 font-cinzel"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Mobile Quick Highlight Pill */}
                <div className="md:hidden mb-2.5">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-900/90 border border-stone-800 text-[8px] text-amber-300 font-cinzel">
                    <Sparkles className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" />
                    <span className="truncate">{g.mobileHighlight}</span>
                  </div>
                </div>
              </div>

              {/* Play Button (Optimized touch target 40px+ on mobile) */}
              <button
                id={`btn-play-${g.id}`}
                onClick={() => onSelectGame(g.id)}
                className="w-full min-h-[38px] sm:min-h-[44px] py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-stone-950 font-cinzel font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.35)] active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-stone-950 text-stone-950" />
                <span className="hidden sm:inline">{g.btnText}</span>
                <span className="sm:hidden">{g.mobileBtnText}</span>
              </button>
            </div>
          );
        })}
      </section>

      {/* Medieval Castle Footer */}
      <footer className="pt-2 sm:pt-3 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-stone-500 text-[9px] sm:text-[11px] font-cinzel gap-1 text-center sm:text-left">
        <div>Kingdom Grand Casino • Pure Entertainment Simulation</div>
        <div className="flex items-center gap-2 sm:gap-3 text-[8px] sm:text-[10px]">
          <span>Slots</span>
          <span>•</span>
          <span>Blackjack</span>
          <span>•</span>
          <span>Keno</span>
          <span>•</span>
          <span>Lootboxes</span>
        </div>
      </footer>
    </div>
  );
};
