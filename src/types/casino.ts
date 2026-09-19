export type GameView = 'lobby' | 'slots' | 'blackjack' | 'keno' | 'lootbox';

// --- BLACKJACK TYPES ---
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank =
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K'
  | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number; // for Aces, evaluated dynamically
  isFaceDown?: boolean;
}

export interface BlackjackHand {
  cards: Card[];
  score: number;
  isSoft: boolean;
  isBust: boolean;
  isBlackjack: boolean;
  isStanding: boolean;
}

export type SideBetPairResult =
  | 'none'
  | 'mixed_pair' // 6:1 (different color, different suit, same rank)
  | 'colored_pair' // 12:1 (same color, different suit, same rank)
  | 'perfect_pair'; // 25:1 (same suit, same rank)

export type SideBet21Plus3Result =
  | 'none'
  | 'flush' // 5:1 (3 cards of same suit)
  | 'straight' // 10:1 (3 cards in sequence)
  | 'three_of_a_kind' // 30:1 (3 cards of same rank)
  | 'straight_flush' // 40:1 (3 cards in sequence and same suit)
  | 'suited_trips'; // 100:1 (3 cards identical in rank and suit)

export type GameOutcome =
  | 'player_blackjack'
  | 'player_win'
  | 'dealer_bust'
  | 'push'
  | 'dealer_win'
  | 'player_bust'
  | 'dealer_blackjack';

// --- KENO TYPES ---
export type KenoDifficulty = 'guardian' | 'noble' | 'dragon';

export interface KenoDifficultyConfig {
  id: KenoDifficulty;
  name: string;
  subtitle: string;
  badgeColor: string;
  borderColor: string;
  description: string;
  // Multipliers table: keyed by spots picked (1..10), array of multipliers for [0 hits, 1 hit, 2 hits, ..., n hits]
  payouts: Record<number, number[]>;
}

// --- LOOTBOX TYPES ---
export type ChestTier =
  | 'squire'
  | 'knight'
  | 'royal'
  | 'mythic'
  | 'gem_emerald'
  | 'gem_sapphire'
  | 'gem_ruby'
  | 'gem_diamond';

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface LootItem {
  id: string;
  name: string;
  rarity: ItemRarity;
  multiplier: number; // multiplier against chest cost
  icon: string; // icon type/key
  weight: number; // probability weight
  description: string;
}

export interface LootChestConfig {
  id: ChestTier;
  name: string;
  subtitle: string;
  category: 'relics' | 'gems';
  cost: number;
  badgeColor: string;
  borderColor: string;
  glowColor: string;
  description: string;
  topMultiplier: number;
  items: LootItem[];
}

export interface UnboxResult {
  id: string;
  chestTier: ChestTier;
  chestName: string;
  item: LootItem;
  payout: number;
  cost: number;
  timestamp: number;
}
