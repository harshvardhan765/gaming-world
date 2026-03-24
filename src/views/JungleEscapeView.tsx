import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, RotateCcw, Heart, Zap, Ghost, Trees } from 'lucide-react';

interface JungleEscapeViewProps {
  onBack: () => void;
}

// Game Engine Types
interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  health: number;
  stamina: number;
  dead: boolean;
}

interface GameGhost {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'stalker' | 'dasher';
}

interface GameState {
  player: Player;
  ghosts: GameGhost[];
  trees: { x: number, y: number, size: number }[];
  score: number;
  distance: number;
  tick: number;
  keys: Record<string, boolean>;
}

export function JungleEscapeView({ onBack }: JungleEscapeViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'TITLE' | 'PLAYING' | 'OVER' | 'WIN'>('TITLE');
  const [stats, setStats] = useState({ score: 0, distance: 0, health: 100, stamina: 100, ghosts: 0 });
  const gameRef = useRef<GameState | null>(null);

  const initGame = (w: number, h: number): GameState => {
    return {
      player: { x: w / 2, y: h / 2, vx: 0, vy: 0, health: 100, stamina: 100, dead: false },
      ghosts: [],
      trees: Array.from({ length: 50 }, () => ({
        x: Math.random() * w * 2 - w,
        y: Math.random() * h * 2 - h,
        size: 20 + Math.random() * 40
      })),
      score: 0,
      distance: 0,
      tick: 0,
      keys: {}
    };
  };

  const updateGame = (g: GameState, w: number, h: number) => {
    g.tick++;
    const p = g.player;

    // Movement
    const speed = g.keys['ShiftLeft'] && p.stamina > 0 ? 5 : 3;
    if (g.keys['ShiftLeft'] && p.stamina > 0) p.stamina -= 0.5;
    else if (p.stamina < 100) p.stamina += 0.2;

    let dx = 0;
    let dy = 0;
    if (g.keys['KeyW'] || g.keys['ArrowUp']) dy -= 1;
    if (g.keys['KeyS'] || g.keys['ArrowDown']) dy += 1;
    if (g.keys['KeyA'] || g.keys['ArrowLeft']) dx -= 1;
    if (g.keys['KeyD'] || g.keys['ArrowRight']) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const mag = Math.sqrt(dx * dx + dy * dy);
      p.vx = (dx / mag) * speed;
      p.vy = (dy / mag) * speed;
      g.distance += speed / 10;
      g.score += Math.floor(speed / 5);
    } else {
      p.vx *= 0.8;
      p.vy *= 0.8;
    }

    p.x += p.vx;
    p.y += p.vy;

    // Keep player in bounds relative to "world"
    // For this simple version, we'll just wrap or scroll
    // Let's spawn ghosts
    if (g.tick % 100 === 0 && g.ghosts.length < 10) {
      const angle = Math.random() * Math.PI * 2;
      g.ghosts.push({
        x: p.x + Math.cos(angle) * 500,
        y: p.y + Math.sin(angle) * 500,
        vx: 0,
        vy: 0,
        type: Math.random() > 0.8 ? 'dasher' : 'stalker'
      });
    }

    // Update Ghosts
    g.ghosts.forEach(gh => {
      const angle = Math.atan2(p.y - gh.y, p.x - gh.x);
      const gSpeed = gh.type === 'dasher' ? 4 : 2;
      gh.vx = Math.cos(angle) * gSpeed;
      gh.vy = Math.sin(angle) * gSpeed;
      gh.x += gh.vx;
      gh.y += gh.vy;

      // Collision
      const dist = Math.sqrt((p.x - gh.x) ** 2 + (p.y - gh.y) ** 2);
      if (dist < 30) {
        p.health -= 0.5;
        if (p.health <= 0) p.dead = true;
      }
    });

    // Trees wrap around player to create infinite feel
    g.trees.forEach(t => {
      if (t.x - p.x < -w) t.x += w * 2;
      if (t.x - p.x > w) t.x -= w * 2;
      if (t.y - p.y < -h) t.y += h * 2;
      if (t.y - p.y > h) t.y -= h * 2;
    });
  };

  const drawGame = (ctx: CanvasRenderingContext2D, g: GameState, w: number, h: number) => {
    ctx.fillStyle = '#051a05'; // Dark jungle green
    ctx.fillRect(0, 0, w, h);

    const offsetX = w / 2 - g.player.x;
    const offsetY = h / 2 - g.player.y;

    // Draw Trees
    ctx.fillStyle = '#0a2a0a';
    g.trees.forEach(t => {
      ctx.beginPath();
      ctx.arc(t.x + offsetX, t.y + offsetY, t.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Ghosts
    g.ghosts.forEach(gh => {
      ctx.fillStyle = gh.type === 'dasher' ? 'rgba(255, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.3)';
      ctx.shadowBlur = 15;
      ctx.shadowColor = ctx.fillStyle as string;
      ctx.beginPath();
      ctx.arc(gh.x + offsetX, gh.y + offsetY, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw Player
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#4DEEE1';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const startGame = () => {
    gameRef.current = initGame(window.innerWidth, window.innerHeight);
    setGameState('PLAYING');
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let animId: number;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameRef.current) gameRef.current.keys[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameRef.current) gameRef.current.keys[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const loop = () => {
      const g = gameRef.current;
      if (!g) return;
      
      updateGame(g, canvas.width, canvas.height);
      
      setStats({
        score: Math.floor(g.score),
        distance: Math.floor(g.distance),
        health: Math.floor(g.player.health),
        stamina: Math.floor(g.player.stamina),
        ghosts: g.ghosts.length
      });

      if (g.player.dead) setGameState('OVER');
      if (g.score >= 5000) setGameState('WIN');

      drawGame(ctx, g, canvas.width, canvas.height);
      
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden font-sans">
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* HUD */}
      {gameState === 'PLAYING' && (
        <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-spectral/30">
                <Trees className="text-spectral" size={24} />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-spectral font-bold">Survival Score</div>
                  <div className="text-3xl font-headline italic text-on-surface">{stats.score.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="space-y-2 w-64">
                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-error/30">
                  <Heart className="text-error" size={16} />
                  <div className="flex-1 h-1.5 bg-error/20 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-error" animate={{ width: `${stats.health}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-spectral/30">
                  <Zap className="text-spectral" size={16} />
                  <div className="flex-1 h-1.5 bg-spectral/20 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-spectral" animate={{ width: `${stats.stamina}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={onBack}
              className="pointer-events-auto p-4 bg-black/40 backdrop-blur-md rounded-full border border-on-surface-variant/20 text-on-surface-variant hover:text-spectral transition-all"
            >
              <ArrowLeft size={24} />
            </button>
          </div>

          <div className="flex justify-center gap-8 text-on-surface-variant/60 text-[10px] uppercase tracking-widest">
            <div className="flex items-center gap-2"><Zap size={12} /> WASD to Move</div>
            <div className="flex items-center gap-2"><Zap size={12} /> Shift to Sprint</div>
            <div className="flex items-center gap-2"><Ghost size={12} /> Avoid the Shadows</div>
          </div>
        </div>
      )}

      {/* Screens */}
      <AnimatePresence>
        {gameState === 'TITLE' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <div className="max-w-md w-full text-center space-y-8">
              <div className="space-y-2">
                <h1 className="text-6xl font-headline italic text-spectral tracking-tighter">JUNGLE ESCAPE</h1>
                <p className="text-on-surface-variant uppercase tracking-[0.5em] text-xs">Spectral Survival Protocol</p>
              </div>

              <div className="p-8 bg-surface-container-low/40 rounded-3xl border border-spectral/30 space-y-6">
                <p className="text-on-surface-variant text-sm">The jungle is alive with spectral shadows. Navigate the darkness and survive the hunt.</p>
                <button 
                  onClick={startGame}
                  className="w-full py-5 bg-spectral text-background font-bold rounded-2xl uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(77,238,225,0.4)] transition-all"
                >
                  <Play size={20} fill="currentColor" />
                  Enter Jungle
                </button>
              </div>

              <button 
                onClick={onBack}
                className="text-on-surface-variant hover:text-spectral transition-colors uppercase tracking-widest text-xs"
              >
                Return to Command
              </button>
            </div>
          </motion.div>
        )}

        {(gameState === 'OVER' || gameState === 'WIN') && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`absolute inset-0 ${gameState === 'WIN' ? 'bg-spectral/10' : 'bg-error/10'} backdrop-blur-md flex items-center justify-center p-6`}
          >
            <div className="max-w-md w-full text-center space-y-8 bg-black/90 p-12 rounded-[3rem] border-2 border-spectral/40">
              <h2 className={`text-5xl font-headline italic ${gameState === 'WIN' ? 'text-spectral' : 'text-error'} tracking-tighter`}>
                {gameState === 'WIN' ? 'ESCAPED' : 'PERISHED'}
              </h2>
              <div className="text-6xl font-headline italic text-on-surface">{stats.score.toLocaleString()}</div>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={startGame}
                  className="w-full py-5 bg-spectral text-background font-bold rounded-2xl uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                >
                  <RotateCcw size={20} />
                  Try Again
                </button>
                <button 
                  onClick={() => setGameState('TITLE')}
                  className="w-full py-4 border border-on-surface-variant/20 text-on-surface-variant font-bold rounded-2xl uppercase tracking-[0.2em] hover:bg-white/5 transition-all"
                >
                  Title Menu
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
