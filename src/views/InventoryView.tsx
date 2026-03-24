import { motion } from "motion/react";
import { Plus, Trash2, ArrowLeft, Filter } from "lucide-react";
import { cn } from "@/src/lib/utils";

const ITEMS = [
  {
    id: 'relic',
    title: 'Ancient Relic',
    type: 'Cursed Artifact',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTbpYlKCo2Zj7MeSxU_E0WRLBSpZIx3ISKu3yhJUTpYBMs401MRkh0hVQIMTElztOXvOckqa7YltRO1vZV7E6bhTGWxCeLB6ioQYJnflSvdCUAqFllsMzg0TBR52ZwipVJn8zqtSVSBGeLdloDAy_ZY5t2yetTAVqqwzY3RgapzZTcW3EGh15RGeB_KZ5kybwMzm6zn3jT0MFXQMrVXZzIotXSzQ2GfuYcvnfap9KXk2rGjLeC_Ej0lYurKddG-kDBP4k5ZFZXzrc',
    description: 'A fragmented artifact humming with a low-frequency psychic vibration. Found near the Whispering Basin. It appears to react to the presence of nearby spectral entities, pulsating with a pale blue light.',
    class: 'Spectral Class A',
    tags: ['Quest Item'],
    weight: '0.4 kg',
    value: 'Priceless',
    bond: 'Stable'
  },
  {
    id: 'herb',
    title: 'Healing Herb',
    type: 'Consumable',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLk6xETDNNVjs6dKtqpYliyt4qRFb1yhzBl6fKmSmC18fAe-WO2L1ICBBGb52dJMSxmHugY8lOKBZq8csUVlED7CbmW8hMYLWNCqvI1rblf_xRFLziS6yU4d7eD-ApV6-G1iVpixNHG_sS8mKvKg9N3dZ6rmGnpTEnoY5WYmWbCXsHOD0cRY1dvZFJtmmyBddgyYNU0TbsYj47Gl7rRVZC_McC7Ll3-zi4w9YKwIoa3CUEWrbwirYksYBo9nkseawgy74KnV60TjM'
  },
  {
    id: 'flashlight',
    title: 'Flashlight',
    type: 'Essential Tool',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb9W4CtgQ5bO1BVZbmuUMT4cbpvVH15X81utr8Q94zg9fpQ2vQszaSQXowO7scaYam8ELnvjxOOUD1w62gcBhf_XKFrKVSYCwfpfyBP1djtaZGnugOiLkZe6al6sEyD9cUjMmnlkFXmRqI8YRwDw3equI8H_3QSNdM4iCaXZCZBrSRUhWSTtij5HEvJEPMgAbtPm3IQ-ZW66Enp7vQ1Af3wlmo-onFHp8DrKlGgyyK6IRAsLkGhFyrcVRabvOqHTkkMq8O5-ZOXsg'
  },
  {
    id: 'journal',
    title: 'Faded Journal',
    type: 'Lore',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPRA3HhqU1fYb5cgtbb2KzU3BlMvcu2tP0KI0H3vkwX7egv_kZzTiRlO8IOpT9TgzJ1_AT3N_HSQPszbMYQtEIsCrnCNyRO_8M8KvLOSjyYfO6UmLe2p5C60px-Eg6GimWShZuw0BpaYBmaJS0xyVF48WUVi9vYuE9A1nEBon2VgDmo8YWP85ov1TJs6H6A2hLpJODrqdJPcaAWquzmvBB-4OiAtrkDPvke8aLZinxe7dlESOcD9KR57wxKdHNOpv5uTpLDJOJv24'
  },
  {
    id: 'vial',
    title: 'Essence Vial',
    type: 'Spectral',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgKpLmSgbxDNSn4FMIRJK9Axu0Ag_kzpMfhwmZsZ_9YFbFUkoorOubKXErNIDbeqQgF_dCO4EKffQq2xjG5xuJwA9gTIkxtlLwYTqE4vItmaW4n9bJK2tsSv8nbFieEj1eUcv23YLPbwlQmHKP9fxj72TJCjGD4KyKbg2u6sD4xuTPhBqszgNdiUaw8CvglW4N8-eTIuZYoeRO9benEY27S821FItJ-6YQd4_h_-en62aJLIH61FxuqM55_l9XFS2oaWsYTP6BH9k'
  },
  {
    id: 'key',
    title: 'Gate Key',
    type: 'Key Item',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAh7uiJzbk0C2U_cBB-EuLX8AiiQWceHYJmhhmpSb-Kkg70uw91O4xcjtgW_JjBhEq3sg707HfpFGmPoX558s3jKBdI8VkKaAI5ss5qLTIWnkRkbGjWYolwqGL9s4fGKZMzvsN1QDE-QQCFBmsD1HvP-kqlYkbIVQDWCgbOWum5ZMvoyNKHHo7Bdskyj1lIAB-VSYH2-t8lEt69efJJrCtA-VK0YTFQTv-Rw3rePr5SzIVOpCtO74jvV_gznVQcGYgJ3kutYT2ykVE'
  }
];

interface InventoryViewProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onBack: () => void;
  onPlayGame: (gameId: string) => void;
}

export function InventoryView({ activeTab, onTabChange, onBack, onPlayGame }: InventoryViewProps) {
  const selectedItem = ITEMS[0];

  const renderContent = () => {
    switch (activeTab) {
      case 'codex':
        return (
          <section className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-4">
            <div className="mb-8">
              <h1 className="font-headline text-4xl italic text-on-surface mb-2">The Spectral Codex</h1>
              <div className="h-0.5 w-24 bg-spectral/30" />
            </div>
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-6 bg-surface-container-low/60 backdrop-blur-md rounded-xl border border-on-surface-variant/20">
                  <h3 className="text-spectral font-bold uppercase tracking-widest text-xs mb-2">Entry #{i}04</h3>
                  <h2 className="text-2xl font-headline italic text-on-surface mb-4">The Whispering Shadows</h2>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    Ancient texts speak of entities that exist between the folds of light. They do not hunt, but they do consume the resonance of those who wander too far into the void.
                  </p>
                </div>
              ))}
            </div>
          </section>
        );
      case 'gate':
        return (
          <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-64 h-64 rounded-full border-4 border-spectral/40 flex items-center justify-center relative mb-8 bg-black/20">
              <div className="absolute inset-0 rounded-full border-2 border-spectral animate-ping opacity-20" />
              <div className="w-48 h-48 rounded-full bg-spectral/10 flex items-center justify-center">
                <div className="text-spectral font-headline italic text-6xl">0%</div>
              </div>
            </div>
            <h2 className="text-3xl font-headline italic text-on-surface mb-4">The Void Gate</h2>
            <p className="text-on-surface-variant max-w-md mb-8">
              The gate remains sealed. Collect 10,000 Resonance to initiate the stabilization sequence.
            </p>
            <button className="px-12 py-4 bg-spectral text-background font-bold rounded-xl uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_30px_rgba(77,238,225,0.3)]">
              Attempt Stabilization
            </button>
          </section>
        );
      case 'map':
        return (
          <section className="relative z-10 flex-1 overflow-hidden flex flex-col">
            <div className="mb-8">
              <h1 className="font-headline text-4xl italic text-on-surface mb-2">Astral Projection</h1>
              <div className="h-0.5 w-24 bg-spectral/30" />
            </div>
            <div className="flex-1 bg-surface-container-lowest/40 rounded-3xl border border-on-surface-variant/20 relative overflow-hidden">
              {/* Simple Map Grid */}
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-20">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className="border border-on-surface-variant/20" />
                ))}
              </div>
              {/* Map Points */}
              <div className="absolute top-1/4 left-1/3 w-6 h-6 bg-spectral rounded-full shadow-[0_0_20px_#4DEEE1]" />
              <div className="absolute top-1/2 left-2/3 w-4 h-4 bg-error rounded-full shadow-[0_0_15px_#ff4d4d] opacity-70" />
              <div className="absolute top-2/3 left-1/4 w-4 h-4 bg-on-surface-variant rounded-full opacity-50" />
              
              <div className="absolute bottom-8 left-8 bg-black/40 p-4 rounded-xl backdrop-blur-md">
                <span className="text-[10px] uppercase tracking-widest text-spectral font-bold">Current Sector</span>
                <div className="text-2xl font-headline italic text-on-surface">Whispering Basin</div>
              </div>
            </div>
          </section>
        );
      case 'new-games':
        return (
          <section className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-4 pb-24">
            <div className="mb-8">
              <h1 className="font-headline text-4xl italic text-on-surface mb-2">New Games</h1>
              <div className="h-0.5 w-24 bg-spectral/30" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'jungle-escape', title: 'Jungle Escape', desc: 'Ghost hunt survival in the deep jungle.', icon: '👻', isNew: true },
                { id: 'echoes-of-light', title: 'Echoes of Light', desc: 'Solve puzzles using resonance and light.', icon: '💡', isNew: true },
                { id: 'shadow-blade', title: 'Shadow Blade', desc: 'Master the art of spectral combat.', icon: '⚔️', isNew: true },
                { id: 'neon-void', title: 'Neon Void', desc: '3D space shooter. Intercept spectral asteroids.', icon: '🚀', isNew: true },
                { id: 'spectral-defense', title: 'Spectral Defense', desc: 'Void perimeter security. Build towers.', icon: '🛡️', isNew: true },
              ].map((game, i) => (
                <div 
                  key={i} 
                  onClick={() => onPlayGame(game.id)}
                  className="p-6 bg-surface-container-low/60 backdrop-blur-md rounded-xl border border-spectral/40 hover:border-spectral transition-all group cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-spectral text-background text-[10px] font-bold px-3 py-1 uppercase tracking-widest">New</div>
                  <div className="text-4xl mb-4">{game.icon}</div>
                  <h3 className="text-xl font-headline italic text-on-surface mb-2 group-hover:text-spectral transition-colors">{game.title}</h3>
                  <p className="text-on-surface-variant text-sm">{game.desc}</p>
                </div>
              ))}
            </div>
          </section>
        );
      case 'more-games':
        return (
          <section className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-4 pb-24">
            <div className="mb-8">
              <h1 className="font-headline text-4xl italic text-on-surface mb-2">More Games</h1>
              <div className="h-0.5 w-24 bg-spectral/30" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'jungle-escape', title: 'Jungle Escape', desc: 'Ghost hunt survival in the deep jungle.', icon: '👻', isNew: true },
                { id: 'echoes-of-light', title: 'Echoes of Light', desc: 'Solve puzzles using resonance and light.', icon: '💡', isNew: true },
                { id: 'spectral-bounce', title: 'Spectral Bounce', desc: 'High-speed resonance bouncing.', icon: '🎾', isNew: true },
                { id: 'spectral-overdrive', title: 'Spectral Overdrive', desc: 'Realistic high-speed overtaking.', icon: '🏎️', isNew: true },
                { id: 'shadow-blade', title: 'Shadow Blade', desc: 'Master the art of spectral combat.', icon: '⚔️', isNew: true },
                { id: 'neon-void', title: 'Neon Void', desc: '3D space shooter. Intercept spectral asteroids.', icon: '🚀', isNew: true },
                { id: 'spectral-defense', title: 'Spectral Defense', desc: 'Void perimeter security. Build towers.', icon: '🛡️', isNew: true },
                { id: 'spectral-runner', title: 'Spectral Runner', desc: 'The original odyssey. Escape the void.', icon: '🏃' },
                { id: 'spectral-odyssey', title: 'Spectral Odyssey', desc: 'Embark on a journey through the astral plane.', icon: '🌌' },
              ].map((game, i) => (
                <div 
                  key={i} 
                  onClick={() => onPlayGame(game.id)}
                  className="p-6 bg-surface-container-low/60 backdrop-blur-md rounded-xl border border-on-surface-variant/20 hover:border-spectral/40 transition-all group cursor-pointer relative overflow-hidden"
                >
                  {game.isNew && <div className="absolute top-0 right-0 bg-spectral text-background text-[10px] font-bold px-3 py-1 uppercase tracking-widest">New</div>}
                  <div className="text-4xl mb-4">{game.icon}</div>
                  <h3 className="text-xl font-headline italic text-on-surface mb-2 group-hover:text-spectral transition-colors">{game.title}</h3>
                  <p className="text-on-surface-variant text-sm">{game.desc}</p>
                </div>
              ))}
            </div>
          </section>
        );
      default: // encyclopedia / inventory
        return (
          <section className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-4">
            <div className="mb-8">
              <h1 className="font-headline text-4xl italic text-on-surface mb-2">Collected Oddities</h1>
              <div className="h-0.5 w-24 bg-spectral/30" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {ITEMS.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  className="group relative bg-surface-container-low/60 backdrop-blur-md rounded-xl p-4 border border-on-surface-variant/20 hover:bg-surface-container-highest/80 transition-all cursor-pointer"
                >
                  <div className="aspect-square bg-surface-container-highest/50 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    <img 
                      className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700" 
                      src={item.image} 
                      alt={item.title}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-spectral mb-1">{item.type}</p>
                  <h3 className="font-headline italic text-lg text-on-surface">{item.title}</h3>
                </motion.div>
              ))}

              {/* Empty Slot */}
              <div className="bg-surface-container-lowest/40 rounded-xl p-4 border border-dashed border-on-surface-variant/30 flex flex-col items-center justify-center h-full min-h-[200px]">
                <Plus className="text-on-surface-variant/40 mb-2" size={32} />
                <span className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest">Empty Slot</span>
              </div>
            </div>
          </section>
        );
    }
  };

  return (
    <div className="h-screen pt-24 pb-8 px-6 md:ml-72 flex flex-col md:flex-row gap-8 relative overflow-hidden">
      {/* Background Cinematic Scene - Brighter for visibility */}
      <div className="fixed inset-0 z-0">
        <img 
          className="w-full h-full object-cover" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnyoMA2ccOBdEmI1F0u1lt0jlFRvhn9ht89URn4DSXUq7F4YXRbONsUl__mAIBQNEBwgUlW7CjxJpKGI8LDBclE_WsZhrTVi3iPbFNk4Y6z3nsmiTzIVVTqvKPqxAvVP9pm1WfFEK1a9gQawxkbN-sL4erwRx2hancjn-vwHGMCY8fIlJ6FDrkNHvHAd7Y5QySuSCDl7Dy9zQkNaDCHTqWP4_mQIT2SW_BeBBo1QR9pOZjMi4DXj4Ozdsmj6FPIf0bjCSeD2RMfT8"
          referrerPolicy="no-referrer"
          alt="Jungle Background"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 w-full z-50 flex justify-between items-center p-6 bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={onBack} className="p-2 bg-surface/40 rounded-full backdrop-blur-md">
          <ArrowLeft className="text-spectral" />
        </button>
        <h2 className="font-headline italic text-xl text-spectral uppercase tracking-widest">
          {activeTab === 'codex' ? 'Codex' : activeTab === 'gate' ? 'The Gate' : activeTab === 'map' ? 'Astral Map' : activeTab === 'new-games' ? 'New Games' : 'Inventory'}
        </h2>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Dynamic Content Section */}
      <div className="flex-1 flex flex-col min-h-0">
        {renderContent()}
      </div>

      {/* Item Detail Inspector Section (Only for Inventory) */}
      {(activeTab === 'encyclopedia' || activeTab === '') && (
        <section className="relative z-10 w-full md:w-96 bg-surface/80 backdrop-blur-xl rounded-t-3xl md:rounded-3xl p-8 border-l border-on-surface-variant/20 flex flex-col h-full overflow-y-auto custom-scrollbar">
          <div className="relative mb-6">
            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-spectral/40 bg-black">
              <img 
                className="w-full h-full object-cover opacity-100" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuu4wucWB2GlgbEyZFIGPgDkK_9Beuo7RjJXyNjmGdo-aR8ik-vZMOu3dTktKJNp3N1D_xeWnlAg8xsGUPHPBOS5fKrSGt_uuZFxhRPcIULMbNKmLLgP9TyiTt-xQifrrWsdPudXdHWGRgD7m8-RlGmUyffSC6U70DWSd5q3hAkErAOLUmGEt6lJkGdIjTaUk5-cs2uJQuiE2gW2GkaudqPXyT1zVORBK9A-eQWSZkcJvXW2C8KFaPCjDqgcUH1H8cBf11rAGdWW0" 
                alt="Detail"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute top-4 right-4 bg-surface-container-highest px-3 py-1 rounded-full shadow-[inset_0_0_12px_#4DEEE1] border border-spectral/50">
              <span className="text-[9px] uppercase tracking-widest text-spectral font-bold">Resonance Detected</span>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-6">
              <h2 className="font-headline text-3xl text-spectral italic mb-2">{selectedItem.title}</h2>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 bg-spectral/20 text-spectral text-[10px] uppercase tracking-widest rounded border border-spectral/40">
                  {selectedItem.class}
                </span>
                {selectedItem.tags?.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-surface-container-highest text-on-surface-variant text-[10px] uppercase tracking-widest rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed font-light">
                {selectedItem.description}
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-xs border-b border-on-surface-variant/20 pb-2">
                <span className="text-on-surface-variant/60 uppercase tracking-widest">Weight</span>
                <span className="text-on-surface">{selectedItem.weight}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-on-surface-variant/10 pb-2">
                <span className="text-on-surface-variant/60 uppercase tracking-widest">Value</span>
                <span className="text-spectral">{selectedItem.value}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant/60 uppercase tracking-widest">Spectral Bond</span>
                <span className="text-spectral">{selectedItem.bond}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 bg-gradient-to-r from-spectral to-spectral-dim text-surface font-bold py-3 rounded-md uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(77,238,225,0.4)] transition-all">
              Examine
            </button>
            <button className="w-14 h-12 flex items-center justify-center border border-on-surface-variant/20 rounded-md text-on-surface-variant hover:text-error hover:border-error/30 transition-all">
              <Trash2 size={20} />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
