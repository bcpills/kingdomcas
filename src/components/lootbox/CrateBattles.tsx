import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChestTier, LootChestConfig, LootItem, ItemRarity } from '../../types/casino';
import { LOOT_CHESTS, RARITY_CONFIG, rollLootItem } from '../../utils/lootboxEngine';
import { sound } from '../../utils/sound';
import {
  Swords,
  Users,
  Shield,
  Crown,
  Sparkles,
  Trophy,
  Flame,
  Coins,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  Zap,
  CheckCircle,
  Award,
  Gem,
  Package,
} from 'lucide-react';

export type BattleMode = '1v1' | '2v2' | 'group3' | 'group4';

interface BattleParticipant {
  id: string;
  name: string;
  isUser: boolean;
  avatar: string;
  team?: 'gold' | 'shadow';
  roundPicks: {
    chestTier: ChestTier;
    item: LootItem | null;
    value: number;
    isRevealed: boolean;
  }[];
  totalValue: number;
}

interface CrateBattlesProps {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  onBackToSolo: () => void;
  handleAddGold: () => void;
  isMuted: boolean;
}

const BOT_ROSTER = [
  { name: 'Sir Gareth the Bold', avatar: '🛡️' },
  { name: 'Lady Guinevere', avatar: '✨' },
  { name: 'Baron Valerius', avatar: '🔥' },
  { name: 'Lord Percival', avatar: '👑' },
  { name: 'Shadow Inquisitor', avatar: '🗡️' },
  { name: 'Countess Rowena', avatar: '💎' },
];

const PRESET_LOADOUTS: { name: string; description: string; chests: ChestTier[] }[] = [
  {
    name: 'Squire Duel',
    description: 'Quick low-stakes warm-up (1 Crate)',
    chests: ['squire'],
  },
  {
    name: 'Emerald Clash',
    description: 'Medium risk gem battle (1 Crate)',
    chests: ['gem_emerald'],
  },
  {
    name: 'Knightly Joust',
    description: 'Squire + Knight double clash (2 Crates)',
    chests: ['squire', 'knight'],
  },
  {
    name: 'Royal Relic Gauntlet',
    description: 'Royal + Mythic high-roller battle (2 Crates)',
    chests: ['royal', 'mythic'],
  },
  {
    name: 'Gem Vault Marathon',
    description: 'All 4 Gem Vaults in epic succession (4 Crates)',
    chests: ['gem_emerald', 'gem_sapphire', 'gem_ruby', 'gem_diamond'],
  },
];

export const CrateBattles: React.FC<CrateBattlesProps> = ({
  balance,
  setBalance,
  onBackToSolo,
  handleAddGold,
  isMuted,
}) => {
  const [battleMode, setBattleMode] = useState<BattleMode>('1v1');
  const [selectedChests, setSelectedChests] = useState<ChestTier[]>([]);
  const [isBattling, setIsBattling] = useState<boolean>(false);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [participants, setParticipants] = useState<BattleParticipant[]>([]);
  const [battleFinished, setBattleFinished] = useState<boolean>(false);
  const [winningTeam, setWinningTeam] = useState<'gold' | 'shadow' | null>(null);
  const [winnerIds, setWinnerIds] = useState<string[]>([]);
  const [fastMode, setFastMode] = useState<boolean>(false);

  // Calculate entry cost per player
  const entryCost = selectedChests.reduce((sum, tier) => sum + LOOT_CHESTS[tier].cost, 0);

  const getPlayerCount = (mode: BattleMode): number => {
    switch (mode) {
      case '1v1':
        return 2;
      case '2v2':
        return 4;
      case 'group3':
        return 3;
      case 'group4':
        return 4;
    }
  };

  const totalPot = entryCost * getPlayerCount(battleMode);

  // Add crate to custom loadout
  const handleAddCrate = (tier: ChestTier) => {
    if (isBattling || selectedChests.length >= 5) return;
    sound.playChip();
    setSelectedChests((prev) => [...prev, tier]);
  };

  // Remove crate from loadout
  const handleRemoveCrate = (index: number) => {
    if (isBattling) return;
    sound.playChip();
    setSelectedChests((prev) => prev.filter((_, i) => i !== index));
  };

  // Initialize battle participants
  const setupBattle = () => {
    if (selectedChests.length === 0 || balance < entryCost) return;

    sound.playChip();
    setBalance((prev) => prev - entryCost);

    const playerCount = getPlayerCount(battleMode);
    const newParticipants: BattleParticipant[] = [];

    // User is always player 1
    newParticipants.push({
      id: 'user',
      name: 'You (Champion)',
      isUser: true,
      avatar: '🛡️',
      team: battleMode === '2v2' ? 'gold' : undefined,
      roundPicks: selectedChests.map((tier) => ({
        chestTier: tier,
        item: null,
        value: 0,
        isRevealed: false,
      })),
      totalValue: 0,
    });

    // Create Bot Opponents
    const shuffledBots = [...BOT_ROSTER].sort(() => 0.5 - Math.random());

    for (let i = 1; i < playerCount; i++) {
      const bot = shuffledBots[i - 1];
      const isAlly = battleMode === '2v2' && i === 1; // In 2v2, player index 1 is Gold Ally
      newParticipants.push({
        id: `bot-${i}`,
        name: isAlly ? `${bot.name} (Ally)` : bot.name,
        isUser: false,
        avatar: bot.avatar,
        team: battleMode === '2v2' ? (isAlly ? 'gold' : 'shadow') : undefined,
        roundPicks: selectedChests.map((tier) => ({
          chestTier: tier,
          item: null,
          value: 0,
          isRevealed: false,
        })),
        totalValue: 0,
      });
    }

    setParticipants(newParticipants);
    setCurrentRound(0);
    setIsBattling(true);
    setBattleFinished(false);
    setWinningTeam(null);
    setWinnerIds([]);
  };

  // Execute round simulation
  const playNextRound = async (roundIdx: number, currentParticipants: BattleParticipant[]) => {
    setIsSpinning(true);

    // Roll items for all participants for this round
    const rolledRounds = currentParticipants.map((p) => {
      const tier = p.roundPicks[roundIdx].chestTier;
      const item = rollLootItem(tier);
      const val = +(LOOT_CHESTS[tier].cost * item.multiplier).toFixed(2);
      return { item, val };
    });

    // Animation suspense delay
    const spinDuration = fastMode ? 900 : 2200;
    const tickInterval = 120;
    const ticks = Math.floor(spinDuration / tickInterval);

    for (let t = 0; t < ticks; t++) {
      await new Promise((r) => setTimeout(r, tickInterval));
      if (!isMuted && t % 2 === 0) {
        sound.playChip();
      }
    }

    // Reveal items
    const updatedParticipants = currentParticipants.map((p, idx) => {
      const { item, val } = rolledRounds[idx];
      const newPicks = [...p.roundPicks];
      newPicks[roundIdx] = {
        chestTier: newPicks[roundIdx].chestTier,
        item,
        value: val,
        isRevealed: true,
      };
      const newTotal = +(p.totalValue + val).toFixed(2);
      return {
        ...p,
        roundPicks: newPicks,
        totalValue: newTotal,
      };
    });

    setParticipants(updatedParticipants);
    setIsSpinning(false);
    sound.playWinChime(2);

    // Check if more rounds remain
    if (roundIdx + 1 < selectedChests.length) {
      setCurrentRound(roundIdx + 1);
    } else {
      // Battle finished! Determine winners
      finalizeBattle(updatedParticipants);
    }
  };

  // Finalize battle outcomes
  const finalizeBattle = (finalParticipants: BattleParticipant[]) => {
    setBattleFinished(true);

    if (battleMode === '2v2') {
      const goldTotal = finalParticipants
        .filter((p) => p.team === 'gold')
        .reduce((sum, p) => sum + p.totalValue, 0);
      const shadowTotal = finalParticipants
        .filter((p) => p.team === 'shadow')
        .reduce((sum, p) => sum + p.totalValue, 0);

      if (goldTotal >= shadowTotal) {
        setWinningTeam('gold');
        const winners = finalParticipants.filter((p) => p.team === 'gold').map((p) => p.id);
        setWinnerIds(winners);

        // Gold Team wins all items from all 4 players!
        // User gets 50% split of the total combined unboxed loot!
        const grandTotalLoot = finalParticipants.reduce((sum, p) => sum + p.totalValue, 0);
        const userReward = +(grandTotalLoot / 2).toFixed(2);
        setBalance((prev) => prev + userReward);
        sound.playFreeSpinsTrigger();
      } else {
        setWinningTeam('shadow');
        const winners = finalParticipants.filter((p) => p.team === 'shadow').map((p) => p.id);
        setWinnerIds(winners);
      }
    } else {
      // 1v1 or FFA (group3 / group4): Highest individual total value wins entire pot
      let highestVal = -1;
      let topId = '';

      finalParticipants.forEach((p) => {
        if (p.totalValue > highestVal) {
          highestVal = p.totalValue;
          topId = p.id;
        }
      });

      setWinnerIds([topId]);

      if (topId === 'user') {
        // User won the entire battle! Total unboxed loot of ALL players goes to user!
        const grandTotalLoot = finalParticipants.reduce((sum, p) => sum + p.totalValue, 0);
        setBalance((prev) => prev + grandTotalLoot);
        sound.playFreeSpinsTrigger();
      }
    }
  };

  // Trigger round roll when battle is active and not spinning
  useEffect(() => {
    if (isBattling && !isSpinning && !battleFinished && participants.length > 0) {
      const currentRoundData = participants[0].roundPicks[currentRound];
      if (!currentRoundData.isRevealed) {
        const timer = setTimeout(() => {
          playNextRound(currentRound, participants);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isBattling, currentRound, isSpinning, battleFinished, participants]);

  // Restart or reset battle
  const handleResetBattle = () => {
    setIsBattling(false);
    setBattleFinished(false);
    setParticipants([]);
    setCurrentRound(0);
    setWinnerIds([]);
    setWinningTeam(null);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Controls: Mode Selector & Status */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-4 p-3 rounded-2xl bg-stone-900/90 border border-stone-800 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-b from-red-600 to-amber-600 border border-yellow-300 text-stone-950 font-black shadow-md flex items-center gap-1.5">
            <Swords className="w-5 h-5 text-stone-950 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="font-cinzel text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500">
              CRATE BATTLES ARENA
            </h2>
            <div className="text-[10px] text-stone-400 font-cinzel">
              Winner takes all unboxed loot from all players
            </div>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        {!isBattling && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-950 border border-stone-800 text-xs font-cinzel">
            <button
              id="btn-battle-mode-1v1"
              onClick={() => setBattleMode('1v1')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                battleMode === '1v1'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>1v1 Duel</span>
            </button>

            <button
              id="btn-battle-mode-2v2"
              onClick={() => setBattleMode('2v2')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                battleMode === '2v2'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>2v2 Clash</span>
            </button>

            <button
              id="btn-battle-mode-group3"
              onClick={() => setBattleMode('group3')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                battleMode === 'group3'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>3-Player FFA</span>
            </button>

            <button
              id="btn-battle-mode-group4"
              onClick={() => setBattleMode('group4')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                battleMode === 'group4'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 shadow'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>4-Player FFA</span>
            </button>
          </div>
        )}

        {/* Speed Toggle & Back to Solo */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFastMode(!fastMode)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-cinzel font-bold flex items-center gap-1 cursor-pointer transition-all ${
              fastMode
                ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
            }`}
            title="Fast Unbox Rolls"
          >
            <Zap className={`w-3.5 h-3.5 ${fastMode ? 'text-amber-400 fill-amber-400' : ''}`} />
            <span>FAST</span>
          </button>

          <button
            onClick={onBackToSolo}
            disabled={isBattling && !battleFinished}
            className="px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-400 text-stone-300 hover:text-amber-300 text-xs font-cinzel font-bold transition-all disabled:opacity-40 cursor-pointer"
          >
            Solo Crates
          </button>
        </div>
      </div>

      {/* SETUP PHASE: Choose Loadout and Opponents */}
      {!isBattling ? (
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Left 2 Cols: Crate Loadout Builder */}
          <div className="lg:col-span-2 bg-stone-950 border-2 border-stone-800 rounded-3xl p-4 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-cinzel font-bold text-stone-200 uppercase tracking-wider">
                    Battle Crate Loadout ({selectedChests.length}/5 Rounds)
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300">
                  Cost per player: ${entryCost.toFixed(2)}
                </span>
              </div>

              {/* Selected Crates Sequence */}
              {selectedChests.length === 0 ? (
                <div className="p-6 mb-4 rounded-2xl border-2 border-dashed border-stone-800 bg-stone-900/30 flex flex-col items-center justify-center text-center">
                  <Package className="w-8 h-8 text-stone-600 mb-2" />
                  <span className="font-cinzel font-bold text-xs text-stone-300 uppercase tracking-wider">
                    No Battle Chests Selected
                  </span>
                  <span className="text-[11px] text-stone-500 max-w-sm mt-1">
                    Select chests from the roster below or pick a featured preset to build your battle loadout (1 to 5 rounds).
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-4">
                  {selectedChests.map((tier, idx) => {
                    const chest = LOOT_CHESTS[tier];
                    return (
                      <div
                        key={`loadout-${idx}`}
                        className="relative p-2.5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-stone-700 flex flex-col items-center text-center group"
                      >
                        <span className="text-[9px] font-cinzel font-black text-amber-400 mb-1">
                          ROUND {idx + 1}
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-center mb-1.5">
                          {tier.startsWith('gem_') ? (
                            <Gem className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Package className="w-5 h-5 text-amber-400" />
                          )}
                        </div>
                        <span className="text-[11px] font-cinzel font-bold text-stone-200 line-clamp-1">
                          {chest.name}
                        </span>
                        <span className="text-[10px] font-mono font-black text-amber-400">
                          ${chest.cost}
                        </span>

                        <button
                          onClick={() => handleRemoveCrate(idx)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs opacity-80 hover:opacity-100 shadow cursor-pointer transition-opacity"
                          title="Remove crate"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}

                  {selectedChests.length < 5 && (
                    <div className="p-2.5 rounded-2xl border-2 border-dashed border-stone-800 flex flex-col items-center justify-center text-stone-500 text-[10px] font-cinzel min-h-[100px]">
                      <Plus className="w-4 h-4 mb-1 text-stone-600" />
                      <span>Add Round</span>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Presets */}
              <div className="mb-4">
                <span className="text-[11px] font-cinzel font-bold text-stone-400 uppercase tracking-wider block mb-2">
                  Featured Arena Presets:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESET_LOADOUTS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        sound.playChip();
                        setSelectedChests([...p.chests]);
                      }}
                      className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-400/60 text-left transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-cinzel font-bold text-stone-200">{p.name}</div>
                        <div className="text-[10px] text-stone-400">{p.description}</div>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        ${p.chests.reduce((s, t) => s + LOOT_CHESTS[t].cost, 0)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Crates Palette */}
              <div>
                <span className="text-[11px] font-cinzel font-bold text-stone-400 uppercase tracking-wider block mb-2">
                  Add Crates to Battle (Max 5):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.keys(LOOT_CHESTS) as ChestTier[]).map((tier) => {
                    const c = LOOT_CHESTS[tier];
                    return (
                      <button
                        key={tier}
                        onClick={() => handleAddCrate(tier)}
                        disabled={selectedChests.length >= 5}
                        className="p-2 rounded-xl bg-stone-900/80 border border-stone-800 hover:border-amber-400 text-left transition-all disabled:opacity-40 cursor-pointer flex items-center justify-between"
                      >
                        <span className="text-[11px] font-cinzel font-bold text-stone-300 truncate">
                          {c.name.split(' ')[0]}
                        </span>
                        <span className="text-[10px] font-mono font-black text-amber-400">
                          +${c.cost}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Battle Stakes & Start Button */}
          <div className="bg-gradient-to-b from-stone-900 via-stone-950 to-black border-2 border-stone-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-800">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span className="font-cinzel font-black text-sm text-stone-200 tracking-wider uppercase">
                  Arena Stakes & Rules
                </span>
              </div>

              <div className="space-y-3 text-xs mb-6">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="text-stone-400 font-cinzel">Format:</span>
                  <span className="font-cinzel font-bold text-amber-300">
                    {battleMode === '1v1'
                      ? '1v1 Duel (2 Players)'
                      : battleMode === '2v2'
                      ? '2v2 Clash (Team Gold vs Team Shadow)'
                      : battleMode === 'group3'
                      ? '3-Player Free-For-All'
                      : '4-Player Free-For-All'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="text-stone-400 font-cinzel">Rounds:</span>
                  <span className="font-mono font-bold text-stone-200">
                    {selectedChests.length} Crates per player
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="text-stone-400 font-cinzel">Your Entry Cost:</span>
                  <span className="font-mono font-black text-stone-100 text-sm">
                    ${entryCost.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/40 shadow-inner">
                  <span className="text-amber-400 font-cinzel font-bold">Total Battle Pot:</span>
                  <span className="font-mono font-black text-amber-300 text-base">
                    ${totalPot.toFixed(2)}
                  </span>
                </div>

                <div className="text-[11px] text-stone-400 font-cinzel leading-relaxed p-2 bg-stone-950/60 rounded-xl border border-stone-800/80">
                  {battleMode === '2v2' ? (
                    <span>
                      Team Gold (You + Ally) vs Team Shadow. Winning team splits the entire 4-player pot 50/50!
                    </span>
                  ) : (
                    <span>
                      All participants open identical crate sequences. The player with highest overall unboxed value wins all items!
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Launch Battle CTA */}
            <div>
              {selectedChests.length === 0 ? (
                <div className="mb-2 text-center text-xs text-amber-400/80 font-cinzel">
                  Choose at least 1 chest to enter the arena
                </div>
              ) : balance < entryCost ? (
                <div className="mb-2 text-center text-xs text-red-400 font-cinzel">
                  Insufficient balance for this battle. Refill gold to enter!
                </div>
              ) : null}
              <button
                id="btn-start-crate-battle"
                onClick={setupBattle}
                disabled={balance < entryCost || selectedChests.length === 0}
                className={`w-full h-14 rounded-2xl font-cinzel font-black tracking-widest text-base flex items-center justify-center gap-2 border shadow-2xl transition-all select-none ${
                  selectedChests.length === 0 || balance < entryCost
                    ? 'bg-stone-800 border-stone-700 text-stone-500 cursor-not-allowed opacity-75'
                    : 'bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 hover:from-red-500 hover:to-yellow-400 border-yellow-200 text-stone-950 shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-95 cursor-pointer'
                }`}
              >
                {selectedChests.length === 0 ? (
                  <>
                    <Package className="w-5 h-5 text-stone-500" />
                    <span>SELECT CHESTS TO BATTLE</span>
                  </>
                ) : balance < entryCost ? (
                  <>
                    <Coins className="w-5 h-5 text-stone-500" />
                    <span>INSUFFICIENT GOLD (${entryCost.toFixed(2)})</span>
                  </>
                ) : (
                  <>
                    <Swords className="w-5 h-5 text-stone-950" />
                    <span>START BATTLE (${entryCost.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ACTIVE BATTLE ARENA */
        <div className="w-full flex flex-col items-center">
          {/* Round Header Bar */}
          <div className="w-full flex items-center justify-between mb-4 px-3 py-2.5 rounded-2xl bg-stone-950 border border-stone-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-cinzel font-bold text-stone-400 uppercase">
                Round {currentRound + 1} of {selectedChests.length}:
              </span>
              <span className="text-xs font-cinzel font-black text-amber-300">
                {LOOT_CHESTS[selectedChests[currentRound]].name} (${LOOT_CHESTS[selectedChests[currentRound]].cost})
              </span>
            </div>

            <div className="flex items-center gap-3">
              {isSpinning && (
                <span className="text-xs font-cinzel font-bold text-amber-400 animate-pulse flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>UNBOXING IN PROGRESS...</span>
                </span>
              )}
              <div className="text-xs font-mono font-black text-amber-400">
                Pot: ${totalPot.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Participant Columns */}
          <div
            className={`w-full grid gap-3 mb-6 ${
              participants.length === 2
                ? 'grid-cols-1 md:grid-cols-2'
                : participants.length === 3
                ? 'grid-cols-1 md:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            }`}
          >
            {participants.map((p) => {
              const isWinner = winnerIds.includes(p.id);
              const isTeamWinner = winningTeam && p.team === winningTeam;
              const activePick = p.roundPicks[currentRound];

              return (
                <div
                  key={p.id}
                  className={`relative rounded-3xl p-4 border-2 transition-all flex flex-col justify-between ${
                    isWinner || isTeamWinner
                      ? 'bg-gradient-to-b from-amber-950/60 via-stone-900 to-black border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.5)]'
                      : p.isUser
                      ? 'bg-stone-900/90 border-amber-500/50'
                      : p.team === 'gold'
                      ? 'bg-stone-900/80 border-yellow-600/40'
                      : 'bg-stone-950 border-stone-800'
                  }`}
                >
                  {/* Player Header */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{p.avatar}</span>
                        <div>
                          <div className="text-xs font-cinzel font-black text-stone-200 flex items-center gap-1">
                            <span>{p.name}</span>
                            {p.isUser && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-stone-950">
                                YOU
                              </span>
                            )}
                          </div>
                          {p.team && (
                            <span
                              className={`text-[9px] font-cinzel font-black uppercase ${
                                p.team === 'gold' ? 'text-amber-400' : 'text-purple-400'
                              }`}
                            >
                              {p.team === 'gold' ? 'Team Gold' : 'Team Shadow'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Current Running Score */}
                      <div className="text-right">
                        <div className="text-[9px] text-stone-400 font-cinzel">SCORE</div>
                        <div className="text-sm font-mono font-black text-amber-300">
                          ${p.totalValue.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Active Round Unbox Display */}
                    <div className="my-3 p-3 rounded-2xl bg-stone-950 border border-stone-800/80 flex flex-col items-center justify-center min-h-[140px] relative overflow-hidden">
                      {isSpinning ? (
                        <div className="flex flex-col items-center justify-center py-4 animate-pulse">
                          <Package className="w-10 h-10 text-amber-400 animate-bounce mb-2" />
                          <span className="text-xs font-cinzel font-bold text-stone-300">
                            Rolling Crate...
                          </span>
                        </div>
                      ) : activePick && activePick.item ? (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex flex-col items-center text-center"
                        >
                          <div
                            className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center mb-1.5 shadow-lg ${
                              RARITY_CONFIG[activePick.item.rarity].borderColor
                            } ${RARITY_CONFIG[activePick.item.rarity].bgColor}`}
                          >
                            <Sparkles
                              className={`w-6 h-6 ${RARITY_CONFIG[activePick.item.rarity].textColor}`}
                            />
                          </div>
                          <span
                            className={`text-[9px] font-cinzel font-black uppercase tracking-wider ${
                              RARITY_CONFIG[activePick.item.rarity].textColor
                            }`}
                          >
                            {RARITY_CONFIG[activePick.item.rarity].label}
                          </span>
                          <span className="text-xs font-cinzel font-black text-stone-100 line-clamp-1">
                            {activePick.item.name}
                          </span>
                          <span className="text-xs font-mono font-black text-amber-300 mt-0.5">
                            ${activePick.value.toFixed(2)} ({activePick.item.multiplier}x)
                          </span>
                        </motion.div>
                      ) : (
                        <div className="text-xs text-stone-600 font-cinzel">Ready for Roll</div>
                      )}
                    </div>

                    {/* History of Past Rounds */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {p.roundPicks.map((rp, rIdx) => (
                        <div
                          key={`hist-${rIdx}`}
                          className={`flex-1 min-w-[40px] py-1 px-1.5 rounded-lg border text-center font-mono text-[10px] font-black ${
                            rp.isRevealed
                              ? rp.item && rp.item.multiplier >= 2
                                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                                : 'bg-stone-900 border-stone-800 text-stone-400'
                              : 'bg-stone-950 border-stone-800/40 text-stone-700'
                          }`}
                        >
                          {rp.isRevealed ? `$${rp.value.toFixed(1)}` : `R${rIdx + 1}`}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Winner Banner */}
                  {battleFinished && (isWinner || isTeamWinner) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 py-1.5 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-cinzel font-black text-xs text-center uppercase tracking-wider shadow-lg flex items-center justify-center gap-1"
                    >
                      <Trophy className="w-3.5 h-3.5 text-stone-950" />
                      <span>VICTOR</span>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* End of Battle Summary & Action Buttons */}
          {battleFinished && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-xl p-5 rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-black border-2 border-amber-400/80 shadow-[0_0_40px_rgba(245,158,11,0.4)] text-center flex flex-col items-center"
            >
              <Trophy className="w-12 h-12 text-amber-400 mb-2 animate-bounce" />
              <h3 className="font-cinzel text-xl sm:text-2xl font-black text-amber-300 uppercase tracking-wider mb-1">
                {winnerIds.includes('user') || winningTeam === 'gold'
                  ? 'VICTORY CROWN CLAIMED!'
                  : 'ARENA DEFEAT'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 font-cinzel mb-4">
                {winnerIds.includes('user') || winningTeam === 'gold'
                  ? `Congratulations! You conquered the arena and won the total battle pot of $${(
                      battleMode === '2v2'
                        ? participants.reduce((s, p) => s + p.totalValue, 0) / 2
                        : participants.reduce((s, p) => s + p.totalValue, 0)
                    ).toFixed(2)}!`
                  : `The opponents overpowered your chest pulls. Ready for another clash?`}
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={setupBattle}
                  disabled={balance < entryCost}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-cinzel font-black text-sm uppercase tracking-wider shadow-lg transition-all cursor-pointer disabled:opacity-40"
                >
                  Rematch (${entryCost.toFixed(2)})
                </button>
                <button
                  onClick={handleResetBattle}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-300 font-cinzel font-bold text-sm uppercase tracking-wider transition-all cursor-pointer"
                >
                  New Battle Setup
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
