import { motion } from "motion/react";
import { RefreshCw, Home, Skull, Timer, Sparkles, Star } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface VictoryViewProps {
  score: number;
  onRestart: () => void;
  onMainMenu: () => void;
}

export function VictoryView({ score, onRestart, onMainMenu }: VictoryViewProps) {
  return (
    <div className="relative h-screen w-screen overflow-hidden flex flex-col items-center justify-center px-4">
      {/* Background Cinematic Asset */}
      <div className="absolute inset-0 z-0">
        <img 
          className="w-full h-full object-cover opacity-50 grayscale-[0.2]" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuUzIybCq9UiUpogGN30kYJvpGMVB-GXvZ61aKCfqo-AyN4vu2SrXdeys0QD8FXeqGV-DNC6TWEZwhLJPZ2Cdx-s0XVjIiLvKGY1J4hxbyW5xvgejJv0p_oPcCO2a_xn8GRzy37TC6wRsrsuCCLdyZ1hOTSBVLquHRfTzc8I-lRXCT989BEOtIIyhsSzvgcYP60zGJzgbkqdKP0rx6RIcH5XeDNT8DhJHt5NL4a0IV3z3cHsWP8LYZoTqrw8rIiXm7Dd0tzcOWn9s"
          alt="Victory Background"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-12"
        >
          <p className="text-spectral font-medium tracking-[0.3em] uppercase text-xs mb-4 opacity-70">Run Summary</p>
          <h1 className="font-headline italic text-5xl md:text-8xl text-spectral drop-shadow-[0_0_20px_rgba(77,238,225,0.4)] tracking-tighter">
            The Nocturne Claimed You
          </h1>
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-spectral/50 to-transparent mx-auto mt-8" />
        </motion.div>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-16">
          <StatCard icon={Star} label="Distance Traveled" value={`${score}m`} fill />
          <StatCard icon={Skull} label="Spirits Outrun" value={Math.floor(score / 15).toString()} />
          <StatCard icon={Sparkles} label="Spectral Resonance" value={`${Math.floor(score * 1.2)}`} />
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRestart}
            className="group relative px-10 py-4 bg-gradient-to-r from-spectral to-spectral-dim text-surface font-bold uppercase tracking-widest rounded-md overflow-hidden transition-all duration-300 hover:shadow-[0_0_35px_rgba(77,238,225,0.4)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              <RefreshCw size={20} />
              Restart
            </span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMainMenu}
            className="px-10 py-4 border border-spectral/30 text-on-surface font-medium uppercase tracking-widest rounded-md hover:bg-spectral/10 transition-all duration-300 flex items-center gap-2"
          >
            <Home size={20} />
            Main Menu
          </motion.button>
        </div>
      </main>

      {/* Side Decoration */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 hidden xl:block opacity-40">
        <div className="flex flex-col gap-12 items-center">
          <div className="h-24 w-px bg-gradient-to-t from-spectral/50 to-transparent" />
          <p className="[writing-mode:vertical-lr] font-headline italic text-spectral text-sm tracking-widest uppercase">The woods remember your name</p>
          <div className="h-24 w-px bg-gradient-to-b from-spectral/50 to-transparent" />
        </div>
      </div>

      {/* New Unlock Toast */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-24 right-12 z-50"
      >
        <div className="glass-panel border-l-4 border-spectral p-4 flex items-center gap-4 max-w-xs animate-pulse">
          <Star className="text-spectral fill-spectral" size={24} />
          <div>
            <p className="text-[10px] uppercase font-medium tracking-tighter text-on-surface-variant">New Unlock</p>
            <p className="text-xs font-bold text-spectral">PHANTOM VEIL SHOTGUN</p>
          </div>
        </div>
      </motion.div>

      {/* Noise Overlay */}
      <div className="pointer-events-none fixed inset-0 z-[60] opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, fill = false }: { icon: any, label: string, value: string, fill?: boolean }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-panel p-8 rounded-xl border border-spectral/10 flex flex-col items-center justify-center group hover:border-spectral/40 transition-all duration-500 shadow-xl"
    >
      <Icon size={40} className={cn("text-spectral/80 mb-4 group-hover:scale-110 transition-transform", fill && "fill-spectral/80")} />
      <p className="font-medium text-xs uppercase tracking-widest text-on-surface-variant mb-1">{label}</p>
      <p className="font-headline italic text-3xl text-on-surface">{value}</p>
    </motion.div>
  );
}
