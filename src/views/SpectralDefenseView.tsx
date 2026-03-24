import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, RotateCcw, Shield, Zap, Target, Swords, Heart } from 'lucide-react';

interface SpectralDefenseViewProps {
  onBack: () => void;
}

export function SpectralDefenseView({ onBack }: SpectralDefenseViewProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(20);
  const [resonance, setResonance] = useState(100);
  const [wave, setWave] = useState(1);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('spectral-defense-highscore')) || 0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef({
    enemies: [] as any[],
    towers: [] as any[],
    projectiles: [] as any[],
    tick: 0,
    mouse: { x: 0, y: 0, clicked: false },
    selectedTowerType: 'basic' as 'basic' | 'sniper' | 'slow',
  });

  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSound = (type: 'shoot' | 'hit' | 'build' | 'wave') => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'shoot') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start();
      osc.stop(now + 0.1);
    } else if (type === 'hit') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.1);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start();
      osc.stop(now + 0.1);
    }
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let animId: number;

    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    const path = [
      { x: -50, y: 300 },
      { x: 300, y: 300 },
      { x: 300, y: 600 },
      { x: 700, y: 600 },
      { x: 700, y: 200 },
      { x: 1100, y: 200 },
      { x: 1100, y: 500 },
      { x: window.innerWidth + 50, y: 500 },
    ];

    const loop = () => {
      const g = gameRef.current;
      g.tick++;

      ctx.fillStyle = '#020205';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Path
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 60;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      path.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();

      // Spawn Enemies
      if (g.tick % Math.max(20, 60 - wave * 2) === 0) {
        g.enemies.push({
          x: path[0].x,
          y: path[0].y,
          pathIndex: 0,
          health: 10 + wave * 5,
          maxHealth: 10 + wave * 5,
          speed: 1.5 + Math.random() * 0.5,
          reward: 10,
          type: Math.random() > 0.8 ? 'fast' : 'normal'
        });
      }

      // Update Enemies
      for (let i = g.enemies.length - 1; i >= 0; i--) {
        const e = g.enemies[i];
        const target = path[e.pathIndex + 1];
        if (!target) {
          setHealth(h => {
            if (h <= 1) setGameState('gameover');
            return h - 1;
          });
          g.enemies.splice(i, 1);
          continue;
        }

        const dx = target.x - e.x;
        const dy = target.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const move = e.type === 'fast' ? e.speed * 1.5 : e.speed;
        
        if (dist < move) {
          e.pathIndex++;
        } else {
          e.x += (dx / dist) * move;
          e.y += (dy / dist) * move;
        }

        // Draw Enemy
        ctx.fillStyle = e.type === 'fast' ? '#ff4d4d' : '#4DEEE1';
        ctx.beginPath();
        ctx.arc(e.x, e.y, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Health Bar
        ctx.fillStyle = '#333';
        ctx.fillRect(e.x - 15, e.y - 20, 30, 4);
        ctx.fillStyle = '#4DEEE1';
        ctx.fillRect(e.x - 15, e.y - 20, (e.health / e.maxHealth) * 30, 4);
      }

      // Update Towers
      g.towers.forEach(t => {
        // Find target
        let target = null;
        let minDist = t.range;
        g.enemies.forEach(e => {
          const d = Math.sqrt((e.x - t.x) ** 2 + (e.y - t.y) ** 2);
          if (d < minDist) {
            minDist = d;
            target = e;
          }
        });

        if (target && g.tick % t.cooldown === 0) {
          g.projectiles.push({
            x: t.x,
            y: t.y,
            target: target,
            speed: 8,
            damage: t.damage
          });
          playSound('shoot');
        }

        // Draw Tower
        ctx.fillStyle = '#1a1a2e';
        ctx.strokeStyle = '#4DEEE1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(t.x - 20, t.y - 20, 40, 40);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#4DEEE1';
        ctx.beginPath();
        ctx.arc(t.x, t.y, 8, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update Projectiles
      for (let i = g.projectiles.length - 1; i >= 0; i--) {
        const p = g.projectiles[i];
        const dx = p.target.x - p.x;
        const dy = p.target.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 10) {
          p.target.health -= p.damage;
          if (p.target.health <= 0) {
            const idx = g.enemies.indexOf(p.target);
            if (idx > -1) {
              setResonance(r => r + p.target.reward);
              setScore(s => s + 100);
              g.enemies.splice(idx, 1);
            }
          }
          g.projectiles.splice(i, 1);
          playSound('hit');
          continue;
        }

        p.x += (dx / dist) * p.speed;
        p.y += (dy / dist) * p.speed;

        ctx.fillStyle = '#4DEEE1';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Placement Preview
      if (g.mouse.x > 0) {
        ctx.strokeStyle = resonance >= 50 ? '#4DEEE1' : '#ff4d4d';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(g.mouse.x, g.mouse.y, 100, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animId = requestAnimationFrame(loop);
    };

    loop();

    const handleMouseMove = (e: MouseEvent) => {
      gameRef.current.mouse.x = e.clientX;
      gameRef.current.mouse.y = e.clientY;
    };

    const handleClick = () => {
      const g = gameRef.current;
      if (resonance >= 50) {
        setResonance(r => r - 50);
        g.towers.push({
          x: g.mouse.x,
          y: g.mouse.y,
          range: 150,
          cooldown: 30,
          damage: 5,
          type: 'basic'
        });
        playSound('build');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleClick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleClick);
    };
  }, [gameState, wave]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setHealth(20);
    setResonance(100);
    setWave(1);
    gameRef.current.enemies = [];
    gameRef.current.towers = [];
    gameRef.current.projectiles = [];
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden font-sans">
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* HUD */}
      {gameState === 'playing' && (
        <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-spectral/30">
                <div className="text-[10px] uppercase tracking-widest text-spectral font-bold">Resonance</div>
                <div className="text-3xl font-headline italic text-on-surface">{resonance}</div>
              </div>
              <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-error/30">
                <div className="text-[10px] uppercase tracking-widest text-error font-bold">Integrity</div>
                <div className="text-3xl font-headline italic text-on-surface">{health}</div>
              </div>
              <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-on-surface-variant/20">
                <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Wave</div>
                <div className="text-3xl font-headline italic text-on-surface">{wave}</div>
              </div>
            </div>

            <button 
              onClick={onBack}
              className="pointer-events-auto p-4 bg-black/40 backdrop-blur-md rounded-full border border-on-surface-variant/20 text-on-surface-variant hover:text-spectral transition-all"
            >
              <ArrowLeft size={24} />
            </button>
          </div>

          <div className="flex justify-center gap-4 pointer-events-auto">
            <div className="bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-spectral/20 flex gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-spectral/10 rounded-lg flex items-center justify-center border border-spectral/40 mb-1">
                  <Swords className="text-spectral" size={20} />
                </div>
                <div className="text-[8px] text-spectral uppercase font-bold">Basic (50)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menus */}
      <AnimatePresence>
        {gameState === 'menu' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <div className="max-w-md w-full text-center space-y-8">
              <div className="space-y-2">
                <h1 className="text-6xl font-headline italic text-spectral tracking-tighter">SPECTRAL DEFENSE</h1>
                <p className="text-on-surface-variant uppercase tracking-[0.5em] text-xs">Void Perimeter Security</p>
              </div>
              <button 
                onClick={startGame}
                className="w-full py-5 bg-spectral text-background font-bold rounded-2xl uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(77,238,225,0.4)] transition-all"
              >
                <Play size={20} fill="currentColor" />
                Initialize Defense
              </button>
              <button onClick={onBack} className="text-on-surface-variant hover:text-spectral transition-colors uppercase tracking-widest text-xs">Return</button>
            </div>
          </motion.div>
        )}

        {gameState === 'gameover' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-error/10 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className="max-w-md w-full text-center space-y-8 bg-black/90 p-12 rounded-[3rem] border-2 border-error/40">
              <h2 className="text-5xl font-headline italic text-error tracking-tighter">PERIMETER BREACHED</h2>
              <div className="text-6xl font-headline italic text-on-surface">{score.toLocaleString()}</div>
              <button 
                onClick={startGame}
                className="w-full py-5 bg-error text-white font-bold rounded-2xl uppercase tracking-[0.2em] flex items-center justify-center gap-3"
              >
                <RotateCcw size={20} />
                Restart Protocol
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
