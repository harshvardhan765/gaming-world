import { motion } from "motion/react";
import { ChevronRight, History, Trophy, Settings2 } from "lucide-react";

interface MainMenuViewProps {
  onStart: () => void;
  onLoad: () => void;
}

export function MainMenuView({ onStart, onLoad }: MainMenuViewProps) {
  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD--uBRjrG8efx4ymbFAR72IYBW2YGZBCwmXKpRICpWr07ggM0WHUxMJp53ACtOaT5x9E60M9YGa_YTG1xu1ukxsSoW6cpgFtwwoox9WD4p2jmchaaT_q8dlUb-xLIwgs47rKgvg9lhO12FBW8SXtRQuYIXxOlHt38ud4lbhOvGUEKVN4e7KxQtc8E0RQKDn5246YPI7ulhMbSdOzJGb-M_CFSeoYGe7BYcvBlwTDMpg7A2jGbNfkxOCRjbGdMYkT7on7AvXtTVzfw" 
          alt="Dark Jungle" 
          className="w-full h-full object-cover grayscale-[0.5] brightness-[0.25]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_10%,rgba(0,0,0,0.9)_100%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[#0a2e2b]/60 backdrop-blur-[2px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-spectral/5 to-spectral/15 pointer-events-none" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-16"
        >
          <h1 className="font-headline italic text-7xl md:text-9xl text-on-surface tracking-tighter mb-2 opacity-90 drop-shadow-[0_0_15px_rgba(77,238,225,0.4)]">
            Spectral Descent
          </h1>
          <p className="font-sans text-spectral uppercase tracking-[0.5em] text-xs md:text-sm opacity-60">
            A Cinematic Adventure in the Deep
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-6">
          {/* Primary Action */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            className="md:col-span-2 group relative overflow-hidden bg-gradient-to-r from-spectral/20 to-spectral/5 backdrop-blur-xl border border-spectral/20 rounded-xl p-8 text-left transition-all hover:bg-spectral/15 spectral-glow"
          >
            <div className="flex justify-between items-end">
              <div>
                <span className="text-spectral text-xs font-medium uppercase tracking-widest block mb-2 opacity-70">Begin the unknown</span>
                <h2 className="text-spectral font-headline italic text-4xl">Start Journey</h2>
              </div>
              <ChevronRight className="text-spectral w-10 h-10 group-hover:translate-x-2 transition-transform" />
            </div>
          </motion.button>

          {/* Secondary Actions */}
          <motion.button 
            whileHover={{ y: -2 }}
            onClick={onLoad}
            className="group bg-surface-container/40 backdrop-blur-md border border-on-surface-variant/20 rounded-xl p-6 text-left transition-all hover:bg-surface-container-highest/60"
          >
            <div className="flex flex-col gap-4">
              <History className="text-spectral" />
              <div>
                <h3 className="text-on-surface font-headline text-xl italic">Load Game</h3>
                <p className="text-on-surface-variant text-xs opacity-60">Continue from last echo</p>
              </div>
            </div>
          </motion.button>

          <motion.button 
            whileHover={{ y: -2 }}
            className="group bg-surface-container/40 backdrop-blur-md border border-on-surface-variant/20 rounded-xl p-6 text-left transition-all hover:bg-surface-container-highest/60"
          >
            <div className="flex flex-col gap-4">
              <Trophy className="text-spectral" />
              <div>
                <h3 className="text-on-surface font-headline text-xl italic">Leaderboard</h3>
                <p className="text-on-surface-variant text-xs opacity-60">View survivors of the mist</p>
              </div>
            </div>
          </motion.button>

          <motion.button 
            className="md:col-span-2 group bg-surface-container-lowest/30 backdrop-blur-sm border border-on-surface-variant/10 rounded-xl p-4 flex justify-between items-center transition-all hover:bg-surface-container-low/50"
          >
            <div className="flex items-center gap-4">
              <Settings2 className="text-on-surface-variant" size={18} />
              <span className="text-on-surface-variant font-medium uppercase tracking-widest text-sm">Environmental Options</span>
            </div>
            <span className="text-on-surface-variant/40 text-[10px] italic">v1.0.4 - Nocturne Build</span>
          </motion.button>
        </div>
      </main>

      {/* Footer Stats Teaser */}
      <footer className="absolute bottom-0 w-full px-12 py-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6 pointer-events-none mb-20 md:mb-0">
        <div className="flex flex-col gap-1 max-w-xs">
          <div className="h-[1px] w-24 bg-gradient-to-r from-spectral/60 to-transparent" />
          <p className="text-spectral text-[10px] uppercase tracking-[0.2em] opacity-50">
            Latent Presence Detected: 84%
          </p>
        </div>

        <div className="flex items-center gap-8 bg-surface-container-low/20 backdrop-blur-lg px-8 py-3 rounded-full border border-on-surface-variant/5">
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-spectral uppercase tracking-tighter opacity-40">Health</span>
            <div className="w-16 h-1 bg-surface-container-highest rounded-full mt-1 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "92%" }}
                className="bg-spectral h-full shadow-[0_0_8px_rgba(77,238,225,0.6)]" 
              />
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-spectral uppercase tracking-tighter opacity-40">Sanity</span>
            <div className="w-16 h-1 bg-surface-container-highest rounded-full mt-1 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "45%" }}
                className="bg-spectral h-full opacity-70" 
              />
            </div>
          </div>
        </div>
      </footer>

      {/* Ambient Particles */}
      <div className="absolute inset-0 z-5 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-spectral/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-spectral/10 blur-[100px] rounded-full" />
      </div>
    </div>
  );
}
