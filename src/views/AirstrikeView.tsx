import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Shield, Zap, Target } from "lucide-react";

interface AirstrikeViewProps {
  onBack: () => void;
}

export function AirstrikeView({ onBack }: AirstrikeViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"title" | "playing" | "gameover">("title");
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(150);
  const [isPaused, setIsPaused] = useState(false);
  const gameRef = useRef<any>(null);

  const initGame = (W: number, H: number) => {
    if (W === 0 || H === 0) return;
    gameRef.current = {
      W,
      H,
      player: { x: W / 2 - 20, y: H - 100, w: 40, h: 40, speed: 8 },
      bullets: [] as any[],
      enemies: [] as any[],
      particles: [] as any[],
      score: 0,
      health: 150,
      maxHealth: 150,
      tick: 0,
      keys: {} as any,
      spawnTimer: 0,
      shootTimer: 0,
      stars: Array.from({ length: 50 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        speed: 1 + Math.random() * 3,
        size: Math.random() * 2
      }))
    };
  };

  useEffect(() => {
    if (gameState !== "playing" || isPaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        if (!gameRef.current || gameRef.current.W === 0) {
          initGame(canvas.width, canvas.height);
        }
      }
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(canvas);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameRef.current) return;
      gameRef.current.keys[e.key] = true;
      if (e.key === 'p' || e.key === 'P') setIsPaused(prev => !prev);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!gameRef.current) return;
      gameRef.current.keys[e.key] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const loop = () => {
      if (!canvas || !ctx) return;
      const W = canvas.width;
      const H = canvas.height;
      const g = gameRef.current;
      if (!g) {
        animId = requestAnimationFrame(loop);
        return;
      }
      const p = g.player;

      g.tick++;

      // Input
      if (g.keys["ArrowLeft"] || g.keys["a"]) p.x = Math.max(0, p.x - p.speed);
      if (g.keys["ArrowRight"] || g.keys["d"]) p.x = Math.min(W - p.w, p.x + p.speed);
      
      // Shooting
      g.shootTimer++;
      if ((g.keys[" "] || g.keys["ArrowUp"] || g.keys["w"]) && g.shootTimer >= 10) {
        g.bullets.push({ x: p.x + p.w / 2 - 2, y: p.y, w: 4, h: 15, speed: 12 });
        g.shootTimer = 0;
      }

      // Stars
      g.stars.forEach((s: any) => {
        s.y += s.speed;
        if (s.y > H) s.y = -10;
      });

      // Enemies
      g.spawnTimer++;
      if (g.spawnTimer >= 30) {
        g.enemies.push({
          x: Math.random() * (W - 40),
          y: -50,
          w: 40,
          h: 40,
          speed: 3 + Math.random() * 2,
          hp: 1,
          type: Math.random() > 0.8 ? 'heavy' : 'normal'
        });
        g.spawnTimer = 0;
      }

      g.enemies.forEach((e: any, i: number) => {
        e.y += e.speed;
        
        // Collision with player
        if (
          p.x < e.x + e.w &&
          p.x + p.w > e.x &&
          p.y < e.y + e.h &&
          p.y + p.h > e.y
        ) {
          g.health -= 20;
          g.enemies.splice(i, 1);
          createExplosion(e.x + e.w/2, e.y + e.h/2, "#ff4d4d");
          if (g.health <= 0) setGameState("gameover");
        }

        // Reach bottom
        if (e.y > H) {
          g.health -= 5;
          g.enemies.splice(i, 1);
          if (g.health <= 0) setGameState("gameover");
        }
      });

      // Bullets
      g.bullets.forEach((b: any, bi: number) => {
        b.y -= b.speed;
        if (b.y < -20) g.bullets.splice(bi, 1);

        g.enemies.forEach((e: any, ei: number) => {
          if (
            b.x < e.x + e.w &&
            b.x + b.w > e.x &&
            b.y < e.y + e.h &&
            b.y + b.h > e.y
          ) {
            g.score += 10;
            g.enemies.splice(ei, 1);
            g.bullets.splice(bi, 1);
            createExplosion(e.x + e.w/2, e.y + e.h/2, "#4DEEE1");
          }
        });
      });

      // Particles
      g.particles.forEach((pt: any, i: number) => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;
        if (pt.life <= 0) g.particles.splice(i, 1);
      });

      function createExplosion(x: number, y: number, color: string) {
        for (let i = 0; i < 12; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 4;
          g.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 20 + Math.random() * 20,
            color
          });
        }
      }

      // Draw
      ctx.fillStyle = "#0a0a18"; // Brighter space
      ctx.fillRect(0, 0, W, H);

      // Stars
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)"; // Brighter stars
      g.stars.forEach((s: any) => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Player
      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      
      // Engine Glow
      const engineGrd = ctx.createRadialGradient(0, 20, 0, 0, 20, 20);
      engineGrd.addColorStop(0, "#4DEEE1");
      engineGrd.addColorStop(1, "transparent");
      ctx.fillStyle = engineGrd;
      ctx.beginPath();
      ctx.arc(0, 25 + Math.sin(g.tick * 0.5) * 5, 15, 0, Math.PI * 2);
      ctx.fill();

      // Ship Body
      ctx.fillStyle = "#4DEEE1";
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#4DEEE1";
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(-20, 20);
      ctx.lineTo(0, 10);
      ctx.lineTo(20, 20);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Enemies
      g.enemies.forEach((e: any) => {
        ctx.save();
        ctx.translate(e.x + e.w/2, e.y + e.h/2);
        ctx.rotate(g.tick * 0.05);
        
        const enemyGrd = ctx.createRadialGradient(0, 0, 0, 0, 0, e.w/2);
        enemyGrd.addColorStop(0, "#ff4d4d");
        enemyGrd.addColorStop(1, "#880000");
        ctx.fillStyle = enemyGrd;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#ff4d4d";
        
        // Modern Drone Shape
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2;
          ctx.lineTo(Math.cos(angle) * 20, Math.sin(angle) * 20);
          ctx.lineTo(Math.cos(angle + 0.4) * 10, Math.sin(angle + 0.4) * 10);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // Bullets
      ctx.fillStyle = "#4DEEE1";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#4DEEE1";
      g.bullets.forEach((b: any) => {
        ctx.fillRect(b.x, b.y, b.w, b.h);
      });

      // Particles
      g.particles.forEach((pt: any) => {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.life / 40;
        ctx.fillRect(pt.x, pt.y, 2, 2);
      });
      ctx.globalAlpha = 1;

      setScore(g.score);
      setHealth(g.health);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, isPaused]);

  const startRun = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      initGame(canvas.width, canvas.height);
    } else {
      initGame(window.innerWidth, window.innerHeight);
    }
    setGameState("playing");
  };

  return (
    <div className="relative w-full h-screen bg-[#050510] overflow-hidden font-mono text-spectral">
      <AnimatePresence mode="wait">
        {gameState === "title" && (
          <motion.div
            key="title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50"
          >
            <div className="relative mb-8">
              <Target className="w-24 h-24 text-spectral animate-pulse mb-4 mx-auto" />
              <h1 className="text-7xl font-headline italic tracking-tighter text-spectral drop-shadow-[0_0_30px_#4DEEE1]">AIRSTRIKE</h1>
              <p className="text-center text-spectral/60 tracking-[0.5em] uppercase text-xs mt-2">Tactical Intercept</p>
            </div>
            
            <button
              onClick={startRun}
              className="px-12 py-4 bg-spectral text-black hover:scale-110 transition-all uppercase tracking-widest font-black rounded-sm shadow-[0_0_40px_rgba(77,238,225,0.4)]"
            >
              Engage
            </button>
            
            <div className="mt-12 grid grid-cols-2 gap-8 text-[10px] uppercase tracking-widest opacity-40">
              <div className="text-right">AD / ARROWS</div>
              <div className="text-left">Move</div>
              <div className="text-right">SPACE / W</div>
              <div className="text-left">Fire</div>
              <div className="text-right">P</div>
              <div className="text-left">Pause</div>
            </div>
          </motion.div>
        )}

        {gameState === "playing" && (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full">
            {/* Tech HUD */}
            <div className="absolute top-8 left-8 flex flex-col gap-4 z-40">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-spectral/10 border border-spectral/30 rounded">
                  <Target size={20} className="text-spectral" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest opacity-50">Score</div>
                  <div className="text-3xl font-bold tracking-tighter">{score}</div>
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] uppercase tracking-widest opacity-50">
                  <span>Integrity</span>
                  <span>{Math.round((health / 150) * 100)}%</span>
                </div>
                <div className="w-64 h-2 bg-white/5 border border-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-spectral to-spectral-dim shadow-[0_0_15px_#4DEEE1]"
                    animate={{ width: `${(health / 150) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="absolute top-8 right-8 flex gap-4 z-40">
              <button 
                onClick={() => setIsPaused(!isPaused)}
                className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all"
              >
                <Zap size={20} className={isPaused ? "text-yellow-400" : "text-spectral"} />
              </button>
              <button 
                onClick={onBack} 
                className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all"
              >
                <ArrowLeft size={20} />
              </button>
            </div>

            {isPaused && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="text-center">
                  <h2 className="text-4xl font-headline italic text-spectral mb-4">TACTICAL PAUSE</h2>
                  <button 
                    onClick={() => setIsPaused(false)}
                    className="px-8 py-2 bg-spectral text-black font-bold uppercase tracking-widest"
                  >
                    Resume
                  </button>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} className="block w-full h-full" />
            
            {/* Radar Decoration */}
            <div className="absolute bottom-8 left-8 w-32 h-32 border border-spectral/20 rounded-full flex items-center justify-center opacity-30">
              <div className="w-full h-[1px] bg-spectral/20 absolute rotate-45" />
              <div className="w-full h-[1px] bg-spectral/20 absolute -rotate-45" />
              <div className="w-16 h-16 border border-spectral/20 rounded-full animate-ping" />
            </div>
          </motion.div>
        )}

        {gameState === "gameover" && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl z-[60]"
          >
            <div className="p-12 border border-error/30 bg-error/5 rounded-3xl text-center max-w-md w-full">
              <h2 className="text-6xl font-headline italic mb-2 text-error tracking-tighter">SIGNAL LOST</h2>
              <p className="text-xs uppercase tracking-[0.4em] text-error/60 mb-8">Vessel Integrity Compromised</p>
              
              <div className="grid grid-cols-2 gap-4 mb-12">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-[10px] uppercase opacity-40 mb-1">Final Score</div>
                  <div className="text-2xl font-bold text-spectral">{score}</div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-[10px] uppercase opacity-40 mb-1">Rank</div>
                  <div className="text-2xl font-bold text-spectral">{score > 1000 ? 'ACE' : 'PILOT'}</div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={startRun}
                  className="w-full py-4 bg-spectral text-black font-black uppercase tracking-widest rounded hover:brightness-110 transition-all"
                >
                  Re-Engage
                </button>
                <button
                  onClick={onBack}
                  className="w-full py-4 border border-white/10 text-white font-bold uppercase tracking-widest rounded hover:bg-white/5 transition-all"
                >
                  Return to Hangar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
