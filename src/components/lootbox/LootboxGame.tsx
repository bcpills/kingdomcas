import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChestTier, ItemRarity, LootChestConfig, LootItem, UnboxResult } from '../../types/casino';
import {
  LOOT_CHESTS,
  RARITY_CONFIG,
  rollLootItem,
  generateSpinReel,
} from '../../utils/lootboxEngine';
import { sound } from '../../utils/sound';
import {
  Crown,
  ArrowLeft,
  Coins,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  HelpCircle,
  Package,
  Shield,
  Flame,
  Sword,
  Swords,
  Gem,
  Award,
  ChevronRight,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { CrateBattles } from './CrateBattles';
import {
  MultiChestReels,
  MultiLaneData,
  MULTI_CARD_WIDTH,
  MULTI_TARGET_INDEX,
  MULTI_REEL_COUNT,
} from './MultiChestReels';

interface LootboxGameProps {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  onBackToLobby: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  handleAddGold: () => void;
}

const CARD_WIDTH = 136; // px per reel card
const TARGET_INDEX = 30; // landing item index
const REEL_COUNT = 38;

// Create preview lanes for 5x and 10x modes
const createPreviewMultiLanes = (count: 5 | 10, tier: ChestTier): MultiLaneData[] => {
  const lanes: MultiLaneData[] = [];
  const chest = LOOT_CHESTS[tier];
  for (let i = 0; i < count; i++) {
    const defaultItem = chest.items[i % chest.items.length];
    const previewItems = generateSpinReel(tier, defaultItem, MULTI_REEL_COUNT, MULTI_TARGET_INDEX);
    lanes.push({
      laneId: i,
      items: previewItems,
      winningItem: defaultItem,
      payout: +(chest.cost * defaultItem.multiplier).toFixed(2),
      targetOffset: 0,
      jitter: 0,
    });
  }
  return lanes;
};

export const LootboxGame: React.FC<LootboxGameProps> = ({
  balance,
  setBalance,
  onBackToLobby,
  isMuted,
  onToggleMute,
  handleAddGold,
}) => {
  // Active chest selection
  const [viewMode, setViewMode] = useState<'solo' | 'battles'>('solo');
  const [selectedTier, setSelectedTier] = useState<ChestTier>('gem_emerald');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'gems' | 'relics'>('all');
  const [openCount, setOpenCount] = useState<1 | 5 | 10>(1);
  const [fastOpen, setFastOpen] = useState<boolean>(false);

  const handleCategoryChange = (cat: 'all' | 'gems' | 'relics') => {
    setCategoryFilter(cat);
    if (cat !== 'all') {
      const match = (Object.keys(LOOT_CHESTS) as ChestTier[]).find(
        (t) => LOOT_CHESTS[t].category === cat
      );
      if (match && LOOT_CHESTS[selectedTier].category !== cat) {
        setSelectedTier(match);
      }
    }
  };

  const displayedChests = (Object.keys(LOOT_CHESTS) as ChestTier[]).filter((tier) => {
    if (categoryFilter === 'all') return true;
    return LOOT_CHESTS[tier].category === categoryFilter;
  });

  // Unboxing Animation States
  const [isOpening, setIsOpening] = useState<boolean>(false);
  const singleReelRef = useRef<HTMLDivElement>(null);
  const [reelItems, setReelItems] = useState<LootItem[]>([]);
  const [reelOffset, setReelOffset] = useState<number>(0);
  const [revealedItem, setRevealedItem] = useState<LootItem | null>(null);
  const [multiResults, setMultiResults] = useState<UnboxResult[]>([]);
  const [multiLanes, setMultiLanes] = useState<MultiLaneData[]>(() =>
    createPreviewMultiLanes(5, 'gem_emerald')
  );
  const [multiProgress, setMultiProgress] = useState<number>(0);
  const [recentDrops, setRecentDrops] = useState<UnboxResult[]>(() => {
    const saved = localStorage.getItem('kingdom_loot_drops');
    return saved ? JSON.parse(saved).slice(0, 15) : [];
  });

  // Modals
  const [showOddsModal, setShowOddsModal] = useState<boolean>(false);

  const activeChest: LootChestConfig = LOOT_CHESTS[selectedTier];
  const totalCost = activeChest.cost * openCount;

  // Save drops history
  useEffect(() => {
    localStorage.setItem('kingdom_loot_drops', JSON.stringify(recentDrops));
  }, [recentDrops]);

  // Initial reel setup & updates when tier or count changes
  useEffect(() => {
    const previewReel = generateSpinReel(selectedTier, activeChest.items[0], REEL_COUNT, TARGET_INDEX);
    setReelItems(previewReel);
    setReelOffset(0);
    setRevealedItem(null);
    setMultiResults([]);
    if (openCount > 1) {
      setMultiLanes(createPreviewMultiLanes(openCount as 5 | 10, selectedTier));
      setMultiProgress(0);
    }
  }, [selectedTier, openCount]);

  // Render dynamic icon
  const renderItemIcon = (iconName: string, className: string = 'w-6 h-6') => {
    switch (iconName) {
      case 'Sword':
        return <Sword className={className} />;
      case 'Shield':
        return <Shield className={className} />;
      case 'Gem':
        return <Gem className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Crown':
        return <Crown className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  // Perform unboxing
  const handleOpenChest = async () => {
    if (isOpening || balance < totalCost) return;

    // Deduct cost
    setBalance((prev) => +(prev - totalCost).toFixed(2));
    setIsOpening(true);
    setRevealedItem(null);
    setMultiResults([]);

    sound.playChestUnlock();

    if (openCount === 1) {
      // Single Box: Full CS:GO / Casino spinning reel animation
      const wonItem = rollLootItem(selectedTier);
      const newReel = generateSpinReel(selectedTier, wonItem, REEL_COUNT, TARGET_INDEX);
      setReelItems(newReel);
      setReelOffset(0);

      const payout = +(activeChest.cost * wonItem.multiplier).toFixed(2);
      const result: UnboxResult = {
        id: `drop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        chestTier: selectedTier,
        chestName: activeChest.name,
        item: wonItem,
        payout,
        cost: activeChest.cost,
        timestamp: Date.now(),
      };

      // Calculate target scroll distance with small random center jitter (+/- 20px)
      const jitter = Math.floor(Math.random() * 40) - 20;
      const singleCenter = singleReelRef.current
        ? singleReelRef.current.clientWidth / 2
        : window.innerWidth < 640
        ? 160
        : 440;
      const targetOffset = TARGET_INDEX * CARD_WIDTH + CARD_WIDTH / 2 - singleCenter + jitter;

      sound.playChestOpen();

      if (fastOpen) {
        // Fast reveal: snappy 500ms roll with tick
        const startTime = Date.now();
        const duration = 500;
        const animateFastReel = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          setReelOffset(targetOffset * easeOut);

          if (progress < 1) {
            requestAnimationFrame(animateFastReel);
          } else {
            sound.playLootReveal(wonItem.rarity);
            setRevealedItem(wonItem);
            setBalance((prev) => +(prev + payout).toFixed(2));
            setRecentDrops((prev) => [result, ...prev.slice(0, 14)]);
            setIsOpening(false);
          }
        };
        requestAnimationFrame(animateFastReel);
        return;
      }

      // Standard deceleration animation onto TARGET_INDEX
      const startTime = Date.now();
      const duration = 3800; // ms
      let lastTickTime = 0;

      const animateReel = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease Out Cubic for realistic reel friction
        const easeOut = 1 - Math.pow(1 - progress, 3.5);
        const currentPos = targetOffset * easeOut;
        setReelOffset(currentPos);

        // Play tick sound based on card passing
        if (elapsed - lastTickTime > 40 + progress * 240 && progress < 0.95) {
          sound.playReelTick();
          lastTickTime = elapsed;
        }

        if (progress < 1) {
          requestAnimationFrame(animateReel);
        } else {
          // Reel finished
          sound.playLootReveal(wonItem.rarity);
          setRevealedItem(wonItem);
          setBalance((prev) => +(prev + payout).toFixed(2));
          setRecentDrops((prev) => [result, ...prev.slice(0, 14)]);
          setIsOpening(false);
        }
      };

      requestAnimationFrame(animateReel);
    } else {
      // Multi-open (5x or 10x): Synchronized multi-reel animation
      const count = openCount as 5 | 10;
      const results: UnboxResult[] = [];
      const newLanes: MultiLaneData[] = [];
      let totalPayout = 0;

      for (let i = 0; i < count; i++) {
        const item = rollLootItem(selectedTier);
        const payout = +(activeChest.cost * item.multiplier).toFixed(2);
        totalPayout += payout;
        const result: UnboxResult = {
          id: `drop-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
          chestTier: selectedTier,
          chestName: activeChest.name,
          item,
          payout,
          cost: activeChest.cost,
          timestamp: Date.now(),
        };
        results.push(result);

        const reelItems = generateSpinReel(selectedTier, item, MULTI_REEL_COUNT, MULTI_TARGET_INDEX);
        const jitter = Math.floor(Math.random() * 24) - 12; // -12 to +12px organic variance
        newLanes.push({
          laneId: i,
          items: reelItems,
          winningItem: item,
          payout,
          targetOffset: 0,
          jitter,
        });
      }

      setMultiLanes(newLanes);
      setMultiProgress(0);

      sound.playChestOpen();

      const duration = fastOpen ? 900 : 3600;
      const startTime = Date.now();
      let lastTickTime = 0;

      const animateMultiReels = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setMultiProgress(progress);

        // Tick sounds as cards pass
        if (elapsed - lastTickTime > 50 + progress * 240 && progress < 0.95) {
          sound.playReelTick();
          lastTickTime = elapsed;
        }

        if (progress < 1) {
          requestAnimationFrame(animateMultiReels);
        } else {
          // Finished animation!
          setMultiResults(results);
          setBalance((prev) => +(prev + totalPayout).toFixed(2));
          setRecentDrops((prev) => [...results, ...prev].slice(0, 15));

          // Determine highest rarity for fanfare sound
          let highestRarity: ItemRarity = 'common';
          const rarityRank: Record<ItemRarity, number> = {
            common: 1,
            rare: 2,
            epic: 3,
            legendary: 4,
            mythic: 5,
          };
          results.forEach((r) => {
            if (rarityRank[r.item.rarity] > rarityRank[highestRarity]) {
              highestRarity = r.item.rarity;
            }
          });

          sound.playLootReveal(highestRarity);
          sound.playFreeSpinsTrigger();
          setIsOpening(false);
        }
      };

      requestAnimationFrame(animateMultiReels);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex flex-col justify-between">
      {/* Top Medieval Header */}
      <header className="w-full mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-back-to-lobby-lb"
            onClick={onBackToLobby}
            disabled={isOpening}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-500/60 text-stone-300 hover:text-amber-300 transition-all flex items-center gap-1 text-xs font-cinzel font-bold disabled:opacity-40 cursor-pointer shadow"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">LOBBY</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-gradient-to-b from-amber-500 to-yellow-600 border border-amber-300 shadow">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-stone-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-cinzel text-base sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500">
                ROYAL LOOTBOXES
              </h1>
              <div className="text-[9px] sm:text-[10px] text-stone-400 tracking-widest font-cinzel uppercase flex items-center gap-1.5">
                <span>4 Chest Tiers</span>
                <span>•</span>
                <span className="text-amber-400">Up to 2,500x Multipliers</span>
                <span>•</span>
                <span className="text-rose-400">Mythic Relics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Balance & Audio */}
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
              id="btn-refill-gold-lb"
              onClick={handleAddGold}
              className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-300 text-xs font-bold font-cinzel flex items-center gap-1 animate-bounce cursor-pointer shadow"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>REFILL</span>
            </button>
          )}

          <button
            onClick={() => setShowOddsModal(true)}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 hover:text-amber-300 text-stone-400 text-xs font-bold cursor-pointer"
            title="Chest Odds & Item Contents"
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

      {/* Game Mode Selector: Solo Vaults vs Crate Battles */}
      <div className="flex items-center justify-between gap-2 mb-3 px-1 py-1.5 rounded-2xl bg-stone-900/90 border border-stone-800 shadow">
        <div className="flex items-center gap-1.5 text-xs font-cinzel">
          <button
            id="tab-mode-solo"
            onClick={() => setViewMode('solo')}
            disabled={isOpening}
            className={`px-3 sm:px-4 py-1.5 rounded-xl font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'solo'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Solo Vaults</span>
          </button>

          <button
            id="tab-mode-battles"
            onClick={() => setViewMode('battles')}
            disabled={isOpening}
            className={`px-3 sm:px-4 py-1.5 rounded-xl font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'battles'
                ? 'bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-amber-300'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Crate Battles (1v1, 2v2, FFA)</span>
          </button>
        </div>

        <div className="text-[11px] font-cinzel text-stone-400 hidden sm:flex items-center gap-1.5 mr-2">
          {viewMode === 'solo' ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Standard spinning reels</span>
            </>
          ) : (
            <>
              <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>Winner takes all loot!</span>
            </>
          )}
        </div>
      </div>

      {viewMode === 'battles' ? (
        <CrateBattles
          balance={balance}
          setBalance={setBalance}
          onBackToSolo={() => setViewMode('solo')}
          handleAddGold={handleAddGold}
          isMuted={isMuted}
        />
      ) : (
        <>
          {/* Vault Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-0.5">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-900/90 border border-stone-800 text-xs font-cinzel">
          <button
            id="tab-vaults-all"
            onClick={() => handleCategoryChange('all')}
            disabled={isOpening}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-amber-500 text-stone-950 shadow font-black'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            All Vaults ({Object.keys(LOOT_CHESTS).length})
          </button>
          <button
            id="tab-vaults-gems"
            onClick={() => handleCategoryChange('gems')}
            disabled={isOpening}
            className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              categoryFilter === 'gems'
                ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-stone-950 shadow font-black'
                : 'text-stone-400 hover:text-emerald-300'
            }`}
          >
            <Gem className="w-3.5 h-3.5" />
            <span>Jeweled Gems (4)</span>
          </button>
          <button
            id="tab-vaults-relics"
            onClick={() => handleCategoryChange('relics')}
            disabled={isOpening}
            className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              categoryFilter === 'relics'
                ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-stone-950 shadow font-black'
                : 'text-stone-400 hover:text-amber-300'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Royal Relics (4)</span>
          </button>
        </div>
        <div className="text-[11px] font-cinzel text-stone-400 hidden sm:flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Select a vault to preview odds & drops</span>
        </div>
      </div>

      {/* Chest Tiers Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-3">
        {displayedChests.map((tierKey) => {
          const chest = LOOT_CHESTS[tierKey];
          const isSelected = selectedTier === tierKey;

          return (
            <button
              key={tierKey}
              id={`chest-tier-${tierKey}`}
              onClick={() => {
                if (!isOpening) setSelectedTier(tierKey);
              }}
              disabled={isOpening}
              className={`p-2.5 sm:p-3 rounded-2xl border-2 text-left transition-all relative overflow-hidden select-none ${
                isSelected
                  ? `bg-stone-900 ${chest.borderColor} ${chest.glowColor} scale-[1.02] ring-1 ring-amber-400/40`
                  : 'bg-stone-950/80 border-stone-800 hover:border-stone-700 opacity-80 hover:opacity-100'
              } ${isOpening ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-98'}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-cinzel font-bold border ${chest.badgeColor}`}>
                  {chest.subtitle.split('•')[0].trim()}
                </span>
                <span className="font-mono font-black text-xs sm:text-sm text-amber-300">
                  ${chest.cost}
                </span>
              </div>

              <div className="font-cinzel font-black text-xs sm:text-sm text-stone-200 truncate mb-0.5">
                {chest.name}
              </div>

              <div className="text-[10px] font-cinzel text-amber-400 font-bold">
                Max Win: {chest.topMultiplier}x (${chest.cost * chest.topMultiplier})
              </div>
            </button>
          );
        })}
      </div>

      {/* Central Unboxing & Reel Stage */}
      <div className="relative w-full rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-black border-2 border-stone-800 p-3 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] mb-3 overflow-hidden">
        {/* Chest Header & Info */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-sm sm:text-base font-black text-amber-200">
              {activeChest.name}
            </span>
            <span className="text-[10px] text-stone-400 hidden sm:inline font-cinzel">
              ({activeChest.description})
            </span>
          </div>

          <button
            onClick={() => setShowOddsModal(true)}
            className="text-[10px] sm:text-xs font-cinzel text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View Odds & Drops</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Carousel Reel Container (for 1x open mode) */}
        {openCount === 1 && (
          <div
            ref={singleReelRef}
            className="relative w-full overflow-hidden rounded-2xl bg-stone-950 border border-stone-800 py-3 shadow-inner min-h-[140px] flex items-center"
          >
            {/* Center Selector Needle Indicator */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1.5 bg-gradient-to-b from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_15px_rgba(245,158,11,1)] z-20 pointer-events-none" />
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-amber-400 z-20 pointer-events-none" />
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-amber-400 z-20 pointer-events-none" />

            {/* Edge Shadow Vignettes */}
            <div className="absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-stone-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-stone-950 to-transparent z-10 pointer-events-none" />

            {/* Scrolling Reel strip */}
            <div
              className="flex items-center gap-3 px-4 transition-transform ease-out will-change-transform"
              style={{
                transform: `translateX(-${reelOffset}px)`,
              }}
            >
              {reelItems.map((item, idx) => {
                const rarity = RARITY_CONFIG[item.rarity];
                return (
                  <div
                    key={`reel-${idx}`}
                    className={`w-[124px] h-[110px] rounded-xl border-2 flex-shrink-0 flex flex-col items-center justify-between p-2 select-none transition-all ${
                      rarity.bgColor
                    } ${rarity.borderColor} shadow-md`}
                  >
                    <div className="w-full flex items-center justify-between text-[9px] font-cinzel">
                      <span className={`font-bold ${rarity.textColor}`}>{rarity.label}</span>
                      <span className="font-mono text-amber-300">{item.multiplier}x</span>
                    </div>

                    <div className={`p-1.5 rounded-lg bg-stone-950/60 ${rarity.textColor}`}>
                      {renderItemIcon(item.icon, 'w-6 h-6')}
                    </div>

                    <div className="w-full text-center">
                      <div className="font-cinzel font-bold text-[10px] text-stone-200 truncate leading-tight">
                        {item.name}
                      </div>
                      <div className="font-mono text-[9px] text-stone-400">
                        ${(activeChest.cost * item.multiplier).toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Multi-Open Spinning Reels Arena (for 5x or 10x mode) */}
        {openCount > 1 && (
          <MultiChestReels
            openCount={openCount}
            activeChest={activeChest}
            isOpening={isOpening}
            lanes={multiLanes}
            progress={multiProgress}
            multiResults={multiResults}
            renderItemIcon={renderItemIcon}
          />
        )}

        {/* Revealed Win Card (for 1x open mode) */}
        {revealedItem && openCount === 1 && (
          <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 border-2 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.4)] flex items-center justify-between flex-wrap gap-2 animate-bounceOnce">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl border-2 ${
                  RARITY_CONFIG[revealedItem.rarity].bgColor
                } ${RARITY_CONFIG[revealedItem.rarity].borderColor} ${
                  RARITY_CONFIG[revealedItem.rarity].textColor
                } shadow-lg`}
              >
                {renderItemIcon(revealedItem.icon, 'w-7 h-7')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-cinzel font-bold uppercase border ${
                      RARITY_CONFIG[revealedItem.rarity].borderColor
                    } ${RARITY_CONFIG[revealedItem.rarity].textColor}`}
                  >
                    {RARITY_CONFIG[revealedItem.rarity].label}
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-400">
                    {revealedItem.multiplier}x MULTIPLIER
                  </span>
                </div>
                <h4 className="font-cinzel text-base font-black text-amber-200">
                  {revealedItem.name}
                </h4>
                <p className="text-[11px] text-stone-400 font-cinzel">
                  {revealedItem.description}
                </p>
              </div>
            </div>

            <div className="flex flex-col text-right">
              <span className="text-[10px] font-cinzel text-stone-400 uppercase">You Won</span>
              <span className="text-base sm:text-lg font-mono font-black text-emerald-400">
                +${(activeChest.cost * revealedItem.multiplier).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Control Console (Open Count, Fast Open, Unbox Button) */}
      <div className="bg-gradient-to-b from-stone-900 via-stone-950 to-black p-3 sm:p-4 rounded-3xl border border-stone-800 shadow-2xl flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 mb-3">
        {/* Left: Open Count (1x, 5x, 10x) */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-cinzel font-bold text-stone-400">AMOUNT:</span>
          <div className="flex items-center gap-1.5">
            {([1, 5, 10] as const).map((cnt) => (
              <button
                key={cnt}
                onClick={() => {
                  if (!isOpening) setOpenCount(cnt);
                }}
                disabled={isOpening}
                className={`px-3 py-1.5 rounded-xl font-cinzel font-bold text-xs border transition-all cursor-pointer ${
                  openCount === cnt
                    ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                    : 'border-stone-800 bg-stone-900 text-stone-400 hover:border-stone-700'
                }`}
              >
                {cnt}x
              </button>
            ))}
          </div>
        </div>

        {/* Right: Fast Open Toggle & Main Open Button */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => setFastOpen(!fastOpen)}
            disabled={isOpening}
            className={`p-2.5 rounded-xl border flex items-center gap-1 text-xs font-cinzel font-bold transition-all cursor-pointer ${
              fastOpen
                ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
            }`}
            title="Fast Open without reel delay"
          >
            <Zap className={`w-4 h-4 ${fastOpen ? 'text-amber-400 fill-amber-400' : ''}`} />
            <span className="hidden sm:inline">FAST</span>
          </button>

          <button
            id="btn-unbox-chest"
            onClick={handleOpenChest}
            disabled={isOpening || balance < totalCost}
            className={`flex-1 sm:flex-none sm:w-64 h-12 sm:h-14 rounded-2xl font-cinzel font-black tracking-widest text-sm sm:text-base flex items-center justify-center gap-2 border shadow-2xl transition-all select-none ${
              isOpening
                ? 'bg-stone-800 border-stone-700 text-stone-500 cursor-not-allowed'
                : balance < totalCost
                ? 'bg-stone-800 border-red-900 text-red-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 border-yellow-200 text-stone-950 shadow-[0_0_25px_rgba(245,158,11,0.5)] cursor-pointer active:scale-95'
            }`}
          >
            <Package className="w-5 h-5 text-stone-950" />
            <span>{isOpening ? 'OPENING...' : `UNBOX (${openCount}x) - $${totalCost}`}</span>
          </button>
        </div>
      </div>

      {/* Live Drops Ticker */}
      {recentDrops.length > 0 && (
        <div className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-2.5 flex items-center gap-2 overflow-hidden shadow">
          <span className="text-[10px] font-cinzel font-black text-amber-400 uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RECENT DROPS:</span>
          </span>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {recentDrops.map((drop) => {
              const rConf = RARITY_CONFIG[drop.item.rarity];
              return (
                <div
                  key={drop.id}
                  className={`px-2 py-1 rounded-lg border flex items-center gap-1.5 flex-shrink-0 ${rConf.bgColor} ${rConf.borderColor}`}
                >
                  <span className={`text-[10px] font-cinzel font-bold ${rConf.textColor}`}>
                    {drop.item.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-300">
                    +${drop.payout.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </>
      )}

      {/* Odds & Drop Matrix Modal */}
      {showOddsModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-stone-900 via-stone-950 to-black border border-amber-500/80 rounded-3xl p-6 max-w-xl w-full shadow-2xl text-stone-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-cinzel text-xl font-bold text-amber-300">
                  {activeChest.name} Odds & Contents
                </h3>
                {(() => {
                  const totalWeight = activeChest.items.reduce((acc, i) => acc + i.weight, 0);
                  const totalEV = activeChest.items.reduce(
                    (acc, i) => acc + (i.weight / totalWeight) * i.multiplier,
                    0
                  );
                  const rtpPct = (totalEV * 100).toFixed(1);
                  return (
                    <p className="text-xs text-stone-400 font-cinzel">
                      Theoretical RTP: <span className="text-emerald-400 font-mono font-bold">{rtpPct}%</span> • Verified Provably Fair Probability Weights
                    </p>
                  );
                })()}
              </div>
              <button
                onClick={() => setShowOddsModal(false)}
                className="text-stone-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
              {(() => {
                const totalWeight = activeChest.items.reduce((acc, i) => acc + i.weight, 0);
                return activeChest.items.map((item) => {
                  const rConf = RARITY_CONFIG[item.rarity];
                  const pctVal = (item.weight / totalWeight) * 100;
                  const dropPct = pctVal < 0.01 ? '<0.01' : pctVal.toFixed(2);
                  const oneInN = Math.round(totalWeight / item.weight);
                  const itemValue = activeChest.cost * item.multiplier;

                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${rConf.bgColor} ${rConf.borderColor}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg bg-stone-950/70 ${rConf.textColor}`}>
                          {renderItemIcon(item.icon, 'w-5 h-5')}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-cinzel font-bold text-xs text-stone-200">
                              {item.name}
                            </span>
                            <span
                              className={`text-[9px] font-cinzel font-bold px-1.5 py-0.2 rounded border ${rConf.borderColor} ${rConf.textColor}`}
                            >
                              {rConf.label}
                            </span>
                          </div>
                          <div className="text-[10px] text-stone-400 font-cinzel">
                            {item.description}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-xs text-amber-300">
                          {item.multiplier}x (${itemValue.toFixed(2)})
                        </div>
                        <div className="text-[10px] font-mono text-stone-400">
                          {dropPct}% (1 in {oneInN.toLocaleString()})
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            <button
              onClick={() => setShowOddsModal(false)}
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
