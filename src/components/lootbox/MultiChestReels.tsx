import React, { useRef, useEffect, useState } from 'react';
import { LootChestConfig, LootItem, UnboxResult } from '../../types/casino';
import { RARITY_CONFIG } from '../../utils/lootboxEngine';
import { Trophy, Crown } from 'lucide-react';

export const MULTI_CARD_WIDTH = 100; // 92px card + 8px gap
export const MULTI_TARGET_INDEX = 28;
export const MULTI_REEL_COUNT = 36;

export interface MultiLaneData {
  laneId: number;
  items: LootItem[];
  winningItem: LootItem;
  payout: number;
  targetOffset: number;
  jitter: number;
}

interface MultiChestReelsProps {
  openCount: 5 | 10;
  activeChest: LootChestConfig;
  isOpening: boolean;
  lanes: MultiLaneData[];
  progress: number; // 0 to 1
  multiResults: UnboxResult[];
  renderItemIcon: (iconName: string, className?: string) => React.ReactNode;
}

export const MultiChestReels: React.FC<MultiChestReelsProps> = ({
  openCount,
  activeChest,
  isOpening,
  lanes,
  progress,
  multiResults,
  renderItemIcon,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [laneWidth, setLaneWidth] = useState<number>(400);

  // Measure active lane width for exact center alignment
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const firstLane = containerRef.current.querySelector<HTMLDivElement>('.multi-reel-lane');
        if (firstLane && firstLane.clientWidth > 0) {
          setLaneWidth(firstLane.clientWidth);
        } else {
          setLaneWidth(containerRef.current.clientWidth);
        }
      }
    };

    updateWidth();
    const timer = setTimeout(updateWidth, 50);
    window.addEventListener('resize', updateWidth);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateWidth);
    };
  }, [openCount, lanes.length]);

  // Deceleration easing formula
  const easeOut = 1 - Math.pow(1 - progress, 3.5);

  // Find best won item if finished
  const bestResult = multiResults.reduce(
    (best: UnboxResult | null, curr: UnboxResult) => {
      if (!best || curr.payout > best.payout) return curr;
      return best;
    },
    null as UnboxResult | null
  );

  const totalWon = multiResults.reduce((acc, r) => acc + r.payout, 0);
  const totalCost = activeChest.cost * openCount;
  const netProfit = totalWon - totalCost;

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-3">
      {/* Multi-Reel Lanes Grid */}
      <div
        className={`w-full ${
          openCount === 10
            ? 'grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[440px] overflow-y-auto pr-1 custom-scrollbar'
            : 'flex flex-col gap-2'
        }`}
      >
        {lanes.map((lane) => {
          // Calculate center offset for this specific lane
          const laneTargetOffset =
            MULTI_TARGET_INDEX * MULTI_CARD_WIDTH +
            MULTI_CARD_WIDTH / 2 -
            laneWidth / 2 +
            lane.jitter;

          // Compute current scroll position
          let currentOffset = 0;
          if (isOpening) {
            currentOffset = Math.round(laneTargetOffset * easeOut);
          } else if (multiResults.length > 0) {
            currentOffset = Math.round(laneTargetOffset);
          } else {
            // Idle initial preview offset
            currentOffset = 0;
          }

          const hasLanded = !isOpening && multiResults.length > 0;
          const winningRarity = hasLanded ? RARITY_CONFIG[lane.winningItem.rarity] : null;

          return (
            <div
              key={`lane-${lane.laneId}`}
              className={`multi-reel-lane relative w-full overflow-hidden rounded-2xl bg-stone-950 border transition-all h-[62px] sm:h-[68px] flex items-center shadow-inner select-none ${
                hasLanded && lane.winningItem.multiplier >= 2
                  ? 'border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'border-stone-800'
              }`}
            >
              {/* Lane Badge Indicator */}
              <div className="absolute left-2 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-stone-900/90 border border-stone-800 text-[10px] font-cinzel font-bold text-stone-300 backdrop-blur-md shadow-md pointer-events-none">
                <span className="text-amber-400">#{lane.laneId + 1}</span>
                {hasLanded && winningRarity && (
                  <span className={`font-mono font-black ${winningRarity.textColor}`}>
                    ${(activeChest.cost * lane.winningItem.multiplier).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Center Needle Selector */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,1)] z-20 pointer-events-none" />
              <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-amber-400 z-20 pointer-events-none" />
              <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[7px] border-b-amber-400 z-20 pointer-events-none" />

              {/* Edge Gradient Vignettes */}
              <div className="absolute inset-y-0 left-0 w-14 sm:w-20 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-14 sm:w-20 bg-gradient-to-l from-stone-950 via-stone-950/80 to-transparent z-10 pointer-events-none" />

              {/* Scrolling Strip */}
              <div
                className="flex items-center gap-2 px-2 transition-transform ease-out will-change-transform"
                style={{
                  transform: `translateX(-${currentOffset}px)`,
                }}
              >
                {lane.items.map((item, itemIdx) => {
                  const rarity = RARITY_CONFIG[item.rarity];
                  const isWonTarget = itemIdx === MULTI_TARGET_INDEX && hasLanded;

                  return (
                    <div
                      key={`lane-${lane.laneId}-item-${itemIdx}`}
                      className={`w-[92px] h-[50px] sm:h-[54px] rounded-xl border flex-shrink-0 flex items-center gap-1.5 px-2 transition-all ${
                        rarity.bgColor
                      } ${rarity.borderColor} ${
                        isWonTarget
                          ? 'ring-2 ring-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.9)] scale-105 z-10'
                          : 'opacity-90'
                      }`}
                    >
                      <div
                        className={`p-1 rounded-lg bg-stone-950/70 ${rarity.textColor} flex-shrink-0`}
                      >
                        {renderItemIcon(item.icon, 'w-4 h-4')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-cinzel font-bold text-[9px] text-stone-200 truncate leading-tight">
                          {item.name}
                        </div>
                        <div className="font-mono text-[9px] font-black text-amber-300">
                          {item.multiplier}x
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* When Finished: Summary Banner & Item Grid */}
      {multiResults.length > 0 && !isOpening && (
        <div className="w-full flex flex-col gap-3 mt-1">
          {/* Celebratory Payout Header */}
          <div className="w-full p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-stone-900 via-amber-950/40 to-stone-900 border-2 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.35)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300">
                <Trophy className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-cinzel text-xs font-bold text-stone-300 uppercase">
                    UNBOXED {multiResults.length} CHESTS
                  </span>
                  {bestResult && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-cinzel font-bold bg-amber-400 text-stone-950 flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      <span>TOP: {bestResult.item.name}</span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-stone-400 font-cinzel">
                  All {multiResults.length} items collected into your inventory
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] font-cinzel text-stone-400 uppercase block">
                  Total Payout
                </span>
                <span className="text-lg sm:text-xl font-mono font-black text-emerald-400">
                  +${totalWon.toFixed(2)}
                </span>
              </div>

              <div className="text-right pl-3 border-l border-stone-800">
                <span className="text-[10px] font-cinzel text-stone-400 uppercase block">
                  Net Return
                </span>
                <span
                  className={`text-sm sm:text-base font-mono font-black ${
                    netProfit >= 0 ? 'text-amber-300' : 'text-stone-400'
                  }`}
                >
                  {netProfit >= 0 ? `+$${netProfit.toFixed(2)}` : `-$${Math.abs(netProfit).toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>

          {/* Grid of Won Items */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {multiResults.map((res, mIdx) => {
              const rConf = RARITY_CONFIG[res.item.rarity];
              const isBest = bestResult && res.id === bestResult.id;

              return (
                <div
                  key={mIdx}
                  className={`relative p-2.5 rounded-2xl border-2 flex flex-col items-center text-center transition-all ${
                    rConf.bgColor
                  } ${rConf.borderColor} ${
                    isBest ? 'ring-2 ring-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.6)]' : 'shadow-md'
                  }`}
                >
                  {isBest && (
                    <div className="absolute -top-2 px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[9px] font-cinzel font-black uppercase tracking-wider flex items-center gap-1 shadow">
                      <Crown className="w-3 h-3" />
                      <span>BEST WIN</span>
                    </div>
                  )}

                  <div className={`text-[9px] font-cinzel font-bold ${rConf.textColor} mb-1`}>
                    {rConf.label}
                  </div>
                  <div className={`p-2 rounded-xl bg-stone-950/70 ${rConf.textColor} my-1`}>
                    {renderItemIcon(res.item.icon, 'w-6 h-6')}
                  </div>
                  <div className="font-cinzel font-bold text-[11px] text-stone-200 truncate w-full">
                    {res.item.name}
                  </div>
                  <div className="font-mono text-[11px] font-black text-amber-300 mt-1">
                    ${res.payout.toFixed(2)} ({res.item.multiplier}x)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
