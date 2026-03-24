import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TopAppBar } from "./components/TopAppBar";
import { SideNavBar } from "./components/SideNavBar";
import { BottomNavBar } from "./components/BottomNavBar";
import { MainMenuView } from "./views/MainMenuView";
import { InventoryView } from "./views/InventoryView";
import { GameHUDView } from "./views/GameHUDView";
import { JungleEscapeView } from "./views/JungleEscapeView";
import { SpectralBounceView } from "./views/SpectralBounceView";
import { SpectralOverdriveView } from "./views/SpectralOverdriveView";
import { NeonVoidView } from "./views/NeonVoidView";
import { SpectralDefenseView } from "./views/SpectralDefenseView";
import { ShadowBladeView } from "./views/ShadowBladeView";
import { EchoesOfLightView } from "./views/EchoesOfLightView";
import { SpectralOdysseyView } from "./views/SpectralOdysseyView";
import { AirstrikeView } from "./views/AirstrikeView";
import { RacingGameView } from "./views/RacingGameView";
import { VictoryView } from "./views/VictoryView";
import { ProfileView } from "./views/ProfileView";

type ViewState = "menu" | "inventory" | "game" | "victory" | "jungle-escape" | "spectral-odyssey" | "airstrike" | "racing-game" | "neon-void" | "spectral-defense" | "shadow-blade" | "echoes-of-light" | "spectral-bounce" | "spectral-overdrive" | "profile";

export default function App() {
  const [view, setView] = useState<ViewState>("menu");
  const [activeTab, setActiveTab] = useState("encyclopedia");
  const [finalScore, setFinalScore] = useState(0);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (view !== "inventory") {
      setView("inventory");
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-on-surface font-sans overflow-hidden">
      {/* Shared Navigation */}
      <AnimatePresence>
        {view !== "game" && view !== "jungle-escape" && view !== "spectral-odyssey" && view !== "airstrike" && view !== "racing-game" && view !== "neon-void" && view !== "spectral-defense" && view !== "shadow-blade" && view !== "echoes-of-light" && view !== "spectral-bounce" && view !== "spectral-overdrive" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="z-50"
          >
            <TopAppBar onBackToMenu={() => setView("menu")} onProfile={() => setView("profile")} />
            <SideNavBar activeTab={activeTab} onTabChange={handleTabChange} />
            <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Viewport */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full"
        >
          {view === "menu" && (
            <MainMenuView onStart={() => setView("game")} onLoad={() => setView("inventory")} />
          )}
          {view === "inventory" && (
            <InventoryView 
              activeTab={activeTab} 
              onTabChange={handleTabChange} 
              onBack={() => setView("menu")} 
              onPlayGame={(gameId) => {
                if (gameId === 'jungle-escape') setView('jungle-escape');
                if (gameId === 'neon-void') setView('neon-void');
                if (gameId === 'spectral-defense') setView('spectral-defense');
                if (gameId === 'shadow-blade') setView('shadow-blade');
                if (gameId === 'echoes-of-light') setView('echoes-of-light');
                if (gameId === 'spectral-odyssey') setView('spectral-odyssey');
                if (gameId === 'airstrike') setView('airstrike');
                if (gameId === 'racing-game') setView('racing-game');
                if (gameId === 'spectral-bounce') setView('spectral-bounce');
                if (gameId === 'spectral-overdrive') setView('spectral-overdrive');
                if (gameId === 'spectral-runner') setView('game');
              }}
            />
          )}
          {view === "game" && (
            <GameHUDView onGameOver={(score) => { setFinalScore(score); setView("victory"); }} onBack={() => setView("menu")} />
          )}
          {view === "jungle-escape" && (
            <JungleEscapeView onBack={() => setView("inventory")} />
          )}
          {view === "neon-void" && (
            <NeonVoidView onBack={() => setView("inventory")} />
          )}
          {view === "spectral-defense" && (
            <SpectralDefenseView onBack={() => setView("inventory")} />
          )}
          {view === "shadow-blade" && (
            <ShadowBladeView onBack={() => setView("inventory")} />
          )}
          {view === "echoes-of-light" && (
            <EchoesOfLightView onBack={() => setView("inventory")} />
          )}
          {view === "spectral-bounce" && (
            <SpectralBounceView onBack={() => setView("inventory")} />
          )}
          {view === "spectral-overdrive" && (
            <SpectralOverdriveView onBack={() => setView("inventory")} />
          )}
          {view === "spectral-odyssey" && (
            <SpectralOdysseyView onBack={() => setView("inventory")} />
          )}
          {view === "airstrike" && (
            <AirstrikeView onBack={() => setView("inventory")} />
          )}
          {view === "racing-game" && (
            <RacingGameView onBack={() => setView("inventory")} />
          )}
          {view === "profile" && (
            <ProfileView onBack={() => setView("menu")} />
          )}
          {view === "victory" && (
            <VictoryView 
              score={finalScore}
              onRestart={() => setView("game")} 
              onMainMenu={() => setView("menu")} 
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Global Cinematic Noise Overlay */}
      <div className="pointer-events-none fixed inset-0 z-[100] opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
    </div>
  );
}
