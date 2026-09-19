import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameView } from './types/casino';
import { sound } from './utils/sound';
import { Lobby } from './components/lobby/Lobby';
import { SlotGame } from './components/slot/SlotGame';
import { BlackjackGame } from './components/blackjack/BlackjackGame';
import { KenoGame } from './components/keno/KenoGame';
import { LootboxGame } from './components/lootbox/LootboxGame';

const INITIAL_BALANCE = 1000.0;

export default function App() {
  const [currentView, setCurrentView] = useState<GameView>('lobby');
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('kingdom_grand_casino_balance') || localStorage.getItem('kingdom_cascades_balance');
    return saved ? parseFloat(saved) : INITIAL_BALANCE;
  });
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.isMuted());

  // Save balance to localStorage
  useEffect(() => {
    localStorage.setItem('kingdom_grand_casino_balance', balance.toString());
    localStorage.setItem('kingdom_cascades_balance', balance.toString());
  }, [balance]);

  // Sound mute toggle
  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  // Quick refill gold
  const handleAddGold = () => {
    sound.playFreeSpinsTrigger();
    setBalance((prev) => prev + 500.0);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-between font-cinzel selection:bg-amber-500 selection:text-stone-950 relative overflow-x-hidden">
      {/* Ambient background medieval castle stone pattern and vignette */}
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-black/80" />

      {/* Main Content Area with View Transition */}
      <main className="w-full flex-1 flex flex-col items-center justify-center z-10 relative">
        <AnimatePresence mode="wait">
          {currentView === 'lobby' && (
            <motion.div
              key="view-lobby"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <Lobby
                balance={balance}
                onSelectGame={(game) => {
                  sound.playChip();
                  setCurrentView(game);
                }}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
                handleAddGold={handleAddGold}
              />
            </motion.div>
          )}

          {currentView === 'slots' && (
            <motion.div
              key="view-slots"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <SlotGame
                balance={balance}
                setBalance={setBalance}
                onBackToLobby={() => setCurrentView('lobby')}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
                handleAddGold={handleAddGold}
              />
            </motion.div>
          )}

          {currentView === 'blackjack' && (
            <motion.div
              key="view-blackjack"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <BlackjackGame
                balance={balance}
                setBalance={setBalance}
                onBackToLobby={() => setCurrentView('lobby')}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
                handleAddGold={handleAddGold}
              />
            </motion.div>
          )}

          {currentView === 'keno' && (
            <motion.div
              key="view-keno"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <KenoGame
                balance={balance}
                setBalance={setBalance}
                onBackToLobby={() => setCurrentView('lobby')}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
                handleAddGold={handleAddGold}
              />
            </motion.div>
          )}

          {currentView === 'lootbox' && (
            <motion.div
              key="view-lootbox"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <LootboxGame
                balance={balance}
                setBalance={setBalance}
                onBackToLobby={() => setCurrentView('lobby')}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
                handleAddGold={handleAddGold}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
