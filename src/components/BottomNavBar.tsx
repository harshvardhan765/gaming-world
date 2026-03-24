import { motion } from "motion/react";
import { Archive, Sparkles, Flame, User } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface BottomNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavBar({ activeTab, onTabChange }: BottomNavBarProps) {
  const items = [
    { id: 'encyclopedia', label: 'Archive', icon: Archive },
    { id: 'codex', label: 'Codex', icon: Sparkles },
    { id: 'gate', label: 'Void Gate', icon: Flame, special: true },
    { id: 'map', label: 'Map', icon: User },
    { id: 'new-games', label: 'New', icon: Sparkles },
    { id: 'more-games', label: 'Games', icon: Archive },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full h-20 z-50 flex justify-around items-center px-4 pb-safe bg-surface/80 backdrop-blur-2xl rounded-t-lg shadow-[0_-8px_20px_rgba(0,0,0,0.8)]">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={cn(
            "flex flex-col items-center justify-center transition-all active:scale-90",
            item.special 
              ? "bg-gradient-to-br from-spectral-dim/20 to-spectral/10 text-spectral rounded-xl px-6 py-2 border border-spectral/30"
              : activeTab === item.id 
                ? "text-spectral opacity-100" 
                : "text-on-surface-variant opacity-60 hover:opacity-100 hover:text-spectral"
          )}
        >
          <item.icon size={24} />
          <span className="font-space uppercase tracking-widest text-[10px] mt-1">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
