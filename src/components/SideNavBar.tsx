import { motion } from "motion/react";
import { BookOpen, ScrollText, DoorOpen, Compass, Settings2, Shield, Sparkles } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface SideNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function SideNavBar({ activeTab, onTabChange }: SideNavBarProps) {
  const navItems = [
    { id: 'encyclopedia', label: 'Encyclopedia', icon: BookOpen },
    { id: 'codex', label: 'Codex', icon: ScrollText },
    { id: 'gate', label: 'The Gate', icon: DoorOpen },
    { id: 'map', label: 'Astral Map', icon: Compass },
    { id: 'new-games', label: 'New Games', icon: Sparkles },
    { id: 'more-games', label: 'More Games', icon: Shield },
  ];

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-72 bg-surface border-r border-on-surface-variant/15 flex-col py-8 gap-4 z-40 pt-20 font-manrope">
      <div className="px-8 mb-4">
        <h2 className="font-headline text-xl text-spectral italic">The Archivist</h2>
        <p className="text-on-surface-variant text-[10px] uppercase tracking-widest opacity-60">Vessel-09</p>
      </div>
      
      <nav className="flex flex-col flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "px-8 py-4 flex items-center gap-4 transition-all duration-200 text-left group",
              activeTab === item.id 
                ? "bg-gradient-to-r from-spectral/10 to-transparent text-spectral border-l-4 border-spectral font-bold"
                : "text-on-surface-variant hover:bg-surface-container-highest/20 hover:translate-x-1"
            )}
          >
            <item.icon size={18} className={cn(activeTab === item.id ? "fill-spectral/20" : "")} />
            <span className="tracking-widest text-sm uppercase">{item.label}</span>
          </button>
        ))}
        
        <button className="text-on-surface-variant px-8 py-4 mt-auto hover:bg-surface-container-highest/20 hover:translate-x-1 transition-transform duration-200 flex items-center gap-4 font-light">
          <Settings2 size={18} />
          <span className="tracking-widest text-sm uppercase">Settings</span>
        </button>
      </nav>

      <div className="mt-auto mx-4 p-6 bg-surface-container-highest/10 rounded-xl border border-on-surface-variant/15">
        <div className="flex justify-between items-end">
          <div>
            <span className="block text-[10px] uppercase text-on-surface-variant font-bold tracking-widest mb-1">Spectral Essence</span>
            <span className="text-3xl font-headline italic font-bold text-spectral">14,280</span>
          </div>
          <div className="text-right">
            <span className="block text-[8px] uppercase text-on-surface-variant">Multiplier</span>
            <span className="text-lg font-bold text-spectral">x2.5</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
