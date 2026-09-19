import { Card, Rank, Suit, SideBetPairResult, SideBet21Plus3Result } from '../types/casino';

const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export function createShoe(numDecks: number = 6): Card[] {
  const shoe: Card[] = [];
  for (let d = 0; d < numDecks; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        let value = parseInt(rank, 10);
        if (['J', 'Q', 'K'].includes(rank)) value = 10;
        if (rank === 'A') value = 11;
        shoe.push({ suit, rank, value });
      }
    }
  }

  // Fisher-Yates Shuffle
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
  }

  return shoe;
}

export function calculateHandScore(cards: Card[]): { score: number; isSoft: boolean; isBust: boolean } {
  let score = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.rank === 'A') {
      aces += 1;
      score += 11;
    } else if (['J', 'Q', 'K'].includes(card.rank)) {
      score += 10;
    } else {
      score += parseInt(card.rank, 10);
    }
  }

  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }

  return {
    score,
    isSoft: aces > 0 && score <= 21,
    isBust: score > 21,
  };
}

export function isNaturalBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && calculateHandScore(cards).score === 21;
}

// Side Bet: Perfect Pairs evaluation on player's first 2 cards
export function evaluatePerfectPairs(card1: Card, card2: Card): {
  type: SideBetPairResult;
  payoutMultiplier: number;
  label: string;
} {
  if (card1.rank !== card2.rank) {
    return { type: 'none', payoutMultiplier: 0, label: 'No Pair' };
  }

  // Same Rank! Check suits
  if (card1.suit === card2.suit) {
    // Exact same suit & rank (possible in multi-deck shoe)
    return { type: 'perfect_pair', payoutMultiplier: 25, label: 'Perfect Pair! (25:1)' };
  }

  const isCard1Red = card1.suit === 'hearts' || card1.suit === 'diamonds';
  const isCard2Red = card2.suit === 'hearts' || card2.suit === 'diamonds';

  if (isCard1Red === isCard2Red) {
    // Same color (both red or both black), different suit
    return { type: 'colored_pair', payoutMultiplier: 12, label: 'Colored Pair! (12:1)' };
  }

  // Different color, different suit
  return { type: 'mixed_pair', payoutMultiplier: 6, label: 'Mixed Pair! (6:1)' };
}

// Side Bet: 21+3 evaluation on player's 2 cards + dealer's upcard
const RANK_ORDER: Record<Rank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

export function evaluate21Plus3(
  c1: Card,
  c2: Card,
  dealerUp: Card
): {
  type: SideBet21Plus3Result;
  payoutMultiplier: number;
  label: string;
} {
  const cards = [c1, c2, dealerUp];
  const suits = cards.map((c) => c.suit);
  const ranks = cards.map((c) => c.rank);
  const orderValues = cards.map((c) => RANK_ORDER[c.rank]).sort((a, b) => a - b);

  const isFlush = suits[0] === suits[1] && suits[1] === suits[2];
  const isThreeOfAKind = ranks[0] === ranks[1] && ranks[1] === ranks[2];

  // Straight check: consecutive order, or Ace low (A-2-3 => 14, 2, 3)
  let isStraight = false;
  if (
    orderValues[1] === orderValues[0] + 1 &&
    orderValues[2] === orderValues[1] + 1
  ) {
    isStraight = true;
  } else if (orderValues[0] === 2 && orderValues[1] === 3 && orderValues[2] === 14) {
    // A-2-3 wrap
    isStraight = true;
  }

  // Suited Trips (identical rank and identical suit)
  if (isThreeOfAKind && isFlush) {
    return {
      type: 'suited_trips',
      payoutMultiplier: 100,
      label: 'Suited Trips! (100:1)',
    };
  }

  // Straight Flush
  if (isStraight && isFlush) {
    return {
      type: 'straight_flush',
      payoutMultiplier: 40,
      label: 'Straight Flush! (40:1)',
    };
  }

  // Three of a Kind
  if (isThreeOfAKind) {
    return {
      type: 'three_of_a_kind',
      payoutMultiplier: 30,
      label: 'Three of a Kind! (30:1)',
    };
  }

  // Straight
  if (isStraight) {
    return {
      type: 'straight',
      payoutMultiplier: 10,
      label: 'Straight! (10:1)',
    };
  }

  // Flush
  if (isFlush) {
    return {
      type: 'flush',
      payoutMultiplier: 5,
      label: 'Flush! (5:1)',
    };
  }

  return { type: 'none', payoutMultiplier: 0, label: 'No 21+3 Hand' };
}
