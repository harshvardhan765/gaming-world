import { motion } from "motion/react";
import { Settings, UserCircle } from "lucide-react";

interface TopAppBarProps {
  onBackToMenu?: () => void;
  onProfile?: () => void;
}

export function TopAppBar({ onBackToMenu, onProfile }: TopAppBarProps) {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-xl border-b border-on-surface-variant/15 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)] flex justify-between items-center px-6 h-16">
      <div 
        onClick={onBackToMenu}
        className="text-2xl font-bold font-headline italic tracking-tighter text-spectral drop-shadow-[0_0_8px_rgba(77,238,225,0.4)] cursor-pointer hover:scale-105 transition-transform"
      >
        SPECTRAL NOCTURNE
      </div>
      
      <nav className="hidden md:flex items-center gap-x-8">
        {['System', 'Network'].map((item) => (
          <button
            key={item}
            className="text-on-surface-variant hover:text-spectral hover:bg-spectral/10 transition-all duration-300 px-3 py-1 rounded cursor-pointer text-xs font-medium uppercase tracking-widest active:scale-95"
          >
            {item}
          </button>
        ))}
        <div className="flex items-center gap-4 ml-4">
          <button className="text-spectral hover:bg-spectral/10 p-1.5 rounded-full transition-all active:scale-95">
            <Settings size={20} />
          </button>
          <button 
            onClick={onProfile}
            className="text-spectral hover:bg-spectral/10 p-1.5 rounded-full transition-all active:scale-95"
          >
            <UserCircle size={20} />
          </button>
        </div>
      </nav>
    </header>
  );
}
