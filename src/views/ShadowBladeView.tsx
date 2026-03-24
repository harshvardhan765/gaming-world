import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, RotateCcw, Swords, Heart, Zap, Shield } from 'lucide-react';

interface ShadowBladeViewProps {
  onBack: () => void;
}

export function ShadowBladeView({ onBack }: ShadowBladeViewProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [combo, setCombo] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('shadow-blade-highscore')) || 0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef({
    player: {
      x: 400,
      y: 500,
      vx: 0,
      vy: 0,
      width: 40,
      height: 60,
      facing: 1, // 1 for right, -1 for left
      isJumping: false,
      isAttacking: false,
      attackFrame: 0,
      attackCooldown: 0,
      dashCooldown: 0,
    },
    enemies: [] as any[],
    particles: [] as any[],
    tick: 0,
    keys: {} as Record<string, boolean>,
    cameraX: 0,
  });

  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSound = (type: 'swing' | 'hit' | 'jump' | 'death') => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'swing') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start();
      osc.stop(now + 0.1);
    } else if (type === 'hit') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start();
      osc.stop(now + 0.1);
    } else if (type === 'jump') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
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

    const loop = () => {
      const g = gameRef.current;
      const p = g.player;
      g.tick++;

      // Clear
      ctx.fillStyle = '#020205';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Background (Parallax)
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 2;
      for (let i = 0; i < 10; i++) {
        const x = (i * 200 - g.cameraX * 0.5) % (canvas.width + 200);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Ground
      ctx.fillStyle = '#0a0a15';
      ctx.fillRect(0, 600, canvas.width, canvas.height - 600);
      ctx.strokeStyle = '#4DEEE1';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 600);
      ctx.lineTo(canvas.width, 600);
      ctx.stroke();

      // Input Handling
      const accel = 1.5;
      const friction = 0.85;
      if (g.keys['ArrowLeft'] || g.keys['KeyA']) {
        p.vx -= accel;
        p.facing = -1;
      }
      if (g.keys['ArrowRight'] || g.keys['KeyD']) {
        p.vx += accel;
        p.facing = 1;
      }
      if ((g.keys['ArrowUp'] || g.keys['KeyW'] || g.keys['Space']) && !p.isJumping) {
        p.vy = -20;
        p.isJumping = true;
        playSound('jump');
      }
      if ((g.keys['KeyJ'] || g.keys['KeyF'] || g.keys['Enter']) && p.attackCooldown <= 0) {
        p.isAttacking = true;
        p.attackFrame = 0;
        p.attackCooldown = 20;
        playSound('swing');
      }

      // Physics
      p.vx *= friction;
      p.x += p.vx;
      p.vy += 1; // Gravity
      p.y += p.vy;

      if (p.y > 600 - p.height) {
        p.y = 600 - p.height;
        p.vy = 0;
        p.isJumping = false;
      }

      // Camera Follow
      g.cameraX += (p.x - canvas.width / 2 - g.cameraX) * 0.1;

      // Attack Logic
      if (p.isAttacking) {
        p.attackFrame++;
        if (p.attackFrame > 15) {
          p.isAttacking = false;
        }
        // Hit detection
        const attackRange = 60;
        const attackX = p.facing === 1 ? p.x + p.width : p.x - attackRange;
        
        g.enemies.forEach(e => {
          if (!e.dead && Math.abs(e.x - (attackX + attackRange/2)) < attackRange && Math.abs(e.y - p.y) < 100) {
            e.health -= 50;
            playSound('hit');
            // Particles
            for (let i = 0; i < 5; i++) {
              g.particles.push({
                x: e.x,
                y: e.y + 30,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 20,
                color: '#4DEEE1'
              });
            }
            if (e.health <= 0) {
              e.dead = true;
              setScore(s => s + 100);
              setCombo(c => c + 1);
            }
          }
        });
      }
      if (p.attackCooldown > 0) p.attackCooldown--;

      // Spawn Enemies
      if (g.tick % Math.max(30, 120 - Math.floor(score / 1000) * 5) === 0) {
        const side = Math.random() > 0.5 ? 1 : -1;
        g.enemies.push({
          x: p.x + side * (canvas.width / 2 + 100),
          y: 600 - 60,
          vx: -side * (2 + Math.random() * 2),
          health: 100,
          dead: false,
          type: Math.random() > 0.8 ? 'heavy' : 'normal'
        });
      }

      // Update Enemies
      for (let i = g.enemies.length - 1; i >= 0; i--) {
        const e = g.enemies[i];
        if (e.dead) {
          g.enemies.splice(i, 1);
          continue;
        }

        e.x += e.vx;

        // Collision with player
        if (Math.abs(e.x - p.x) < 30 && Math.abs(e.y - p.y) < 50) {
          setHealth(h => {
            const next = h - 0.5;
            if (next <= 0) setGameState('gameover');
            return next;
          });
          setCombo(0);
        }

        // Draw Enemy
        ctx.save();
        ctx.translate(-g.cameraX, 0);
        ctx.fillStyle = e.type === 'heavy' ? '#ff4d4d' : '#888';
        ctx.shadowBlur = 10;
        ctx.shadowColor = ctx.fillStyle as string;
        ctx.fillRect(e.x - 20, e.y, 40, 60);
        
        // Enemy Eyes
        ctx.fillStyle = '#fff';
        ctx.fillRect(e.x + (e.vx > 0 ? 5 : -15), e.y + 15, 10, 5);
        ctx.restore();
      }

      // Draw Particles
      for (let i = g.particles.length - 1; i >= 0; i--) {
        const part = g.particles[i];
        part.x += part.vx;
        part.y += part.vy;
        part.life--;
        if (part.life <= 0) {
          g.particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.translate(-g.cameraX, 0);
        ctx.fillStyle = part.color;
        ctx.globalAlpha = part.life / 20;
        ctx.fillRect(part.x, part.y, 4, 4);
        ctx.restore();
      }

      // Draw Player
      ctx.save();
      ctx.translate(p.x - g.cameraX, p.y);
      
      // Shadow Trail
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#4DEEE1';
      ctx.fillRect(-p.vx * 2 - 20, 5, 40, 60);
      ctx.globalAlpha = 1.0;

      // Body
      ctx.fillStyle = '#fff';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#4DEEE1';
      ctx.fillRect(-20, 0, 40, 60);

      // Blade
      if (p.isAttacking) {
        ctx.strokeStyle = '#4DEEE1';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        const angle = (p.attackFrame / 15) * Math.PI - Math.PI/2;
        ctx.beginPath();
        ctx.moveTo(0, 30);
        ctx.lineTo(Math.cos(angle) * 80 * p.facing, Math.sin(angle) * 80 + 30);
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#4DEEE1';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(10 * p.facing, 40);
        ctx.lineTo(20 * p.facing, 10);
        ctx.stroke();
      }

      // Eyes
      ctx.fillStyle = '#000';
      ctx.fillRect(5 * p.facing, 15, 10, 5);

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    loop();

    const handleKeyDown = (e: KeyboardEvent) => gameRef.current.keys[e.code] = true;
    const handleKeyUp = (e: KeyboardEvent) => gameRef.current.keys[e.code] = false;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setHealth(100);
    setCombo(0);
    gameRef.current.enemies = [];
    gameRef.current.particles = [];
    gameRef.current.player.x = 400;
    gameRef.current.player.vx = 0;
    gameRef.current.player.vy = 0;
  };

  useEffect(() => {
    if (gameState === 'gameover' && score > highScore) {
      setHighScore(score);
      localStorage.setItem('shadow-blade-highscore', score.toString());
    }
  }, [gameState, score, highScore]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden font-sans">
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* HUD */}
      {gameState === 'playing' && (
        <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-spectral/30">
                <Swords className="text-spectral" size={24} />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-spectral font-bold">Resonance Score</div>
                  <div className="text-3xl font-headline italic text-on-surface">{score.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-error/30 w-64">
                <Heart className="text-error" size={24} />
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-widest text-error font-bold">Vitality</div>
                  <div className="h-2 bg-error/20 rounded-full mt-1 overflow-hidden">
                    <motion.div 
                      className="h-full bg-error" 
                      animate={{ width: `${health}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-4">
              <button 
                onClick={onBack}
                className="pointer-events-auto p-4 bg-black/40 backdrop-blur-md rounded-full border border-on-surface-variant/20 text-on-surface-variant hover:text-spectral transition-all"
              >
                <ArrowLeft size={24} />
              </button>
              
              {combo > 1 && (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  key={combo}
                  className="bg-spectral/20 border border-spectral/40 px-6 py-2 rounded-xl"
                >
                  <div className="text-spectral font-headline italic text-2xl">{combo}x COMBO</div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-8">
            <div className="flex items-center gap-2 text-on-surface-variant/60 text-[10px] uppercase tracking-widest">
              <Zap size={12} /> WASD to Move
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant/60 text-[10px] uppercase tracking-widest">
              <Swords size={12} /> J to Attack
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
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <div className="max-w-md w-full text-center space-y-8">
              <div className="space-y-2">
                <h1 className="text-6xl font-headline italic text-spectral tracking-tighter">SHADOW BLADE</h1>
                <p className="text-on-surface-variant uppercase tracking-[0.5em] text-xs">Spectral Combat Protocol</p>
              </div>

              <div className="p-8 bg-surface-container-low/40 rounded-3xl border border-spectral/30 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-black/40 rounded-2xl border border-on-surface-variant/10">
                    <div className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">High Score</div>
                    <div className="text-2xl font-headline italic text-on-surface">{highScore.toLocaleString()}</div>
                  </div>
                  <div className="p-4 bg-black/40 rounded-2xl border border-on-surface-variant/10">
                    <div className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Rank</div>
                    <div className="text-2xl font-headline italic text-spectral">Novice</div>
                  </div>
                </div>

                <button 
                  onClick={startGame}
                  className="w-full py-5 bg-spectral text-background font-bold rounded-2xl uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(77,238,225,0.4)] transition-all group"
                >
                  <Play size={20} fill="currentColor" />
                  Enter the Fray
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

        {gameState === 'gameover' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-error/10 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className="max-w-md w-full text-center space-y-8 bg-black/90 p-12 rounded-[3rem] border-2 border-error/40">
              <h2 className="text-5xl font-headline italic text-error tracking-tighter">FALLEN</h2>
              <div className="text-6xl font-headline italic text-on-surface">{score.toLocaleString()}</div>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={startGame}
                  className="w-full py-5 bg-error text-white font-bold rounded-2xl uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                >
                  <RotateCcw size={20} />
                  Rise Again
                </button>
                <button 
                  onClick={() => setGameState('menu')}
                  className="w-full py-4 border border-on-surface-variant/20 text-on-surface-variant font-bold rounded-2xl uppercase tracking-[0.2em] hover:bg-white/5 transition-all"
                >
                  Command Menu
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
