import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Trophy, Zap, RefreshCw } from "lucide-react";

interface SpectralBounceViewProps {
  onBack: () => void;
}

export function SpectralBounceView({ onBack }: SpectralBounceViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"title" | "playing" | "gameover">("title");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const gameRef = useRef<any>(null);

  const initGame = (W: number, H: number) => {
    if (W === 0 || H === 0) return;
    gameRef.current = {
      W,
      H,
      ball: {
        x: W / 2,
        y: H / 2,
        radius: 15,
        vx: 4,
        vy: 4,
        color: "#4DEEE1"
      },
      paddle: {
        w: 120,
        h: 15,
        x: W / 2 - 60,
        y: H - 40,
        color: "#fff"
      },
      particles: [] as any[],
      score: 0,
      tick: 0,
      keys: {} as any,
    };
  };

  useEffect(() => {
    if (gameState !== "playing") return;

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
      if (gameRef.current) gameRef.current.keys[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameRef.current) gameRef.current.keys[e.code] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const loop = () => {
      const W = canvas.width;
      const H = canvas.height;
      const g = gameRef.current;
      if (!g) return;

      const b = g.ball;
      const p = g.paddle;

      // Paddle movement
      const paddleSpeed = 8;
      if (g.keys["ArrowLeft"] || g.keys["KeyA"]) p.x -= paddleSpeed;
      if (g.keys["ArrowRight"] || g.keys["KeyD"]) p.x += paddleSpeed;
      
      // Keep paddle in bounds
      if (p.x < 0) p.x = 0;
      if (p.x + p.w > W) p.x = W - p.w;

      // Ball movement
      b.x += b.vx;
      b.y += b.vy;

      // Wall collisions
      if (b.x - b.radius < 0 || b.x + b.radius > W) {
        b.vx *= -1;
        createParticles(b.x, b.y, b.color);
      }
      if (b.y - b.radius < 0) {
        b.vy *= -1;
        createParticles(b.x, b.y, b.color);
      }

      // Paddle collision
      if (
        b.y + b.radius > p.y &&
        b.y - b.radius < p.y + p.h &&
        b.x > p.x &&
        b.x < p.x + p.w
      ) {
        b.vy *= -1.05; // Speed up slightly
        b.vx *= 1.02;
        b.y = p.y - b.radius;
        g.score += 10;
        setScore(g.score);
        createParticles(b.x, b.y, b.color);
      }

      // Game over
      if (b.y + b.radius > H) {
        setGameState("gameover");
        if (g.score > highScore) setHighScore(g.score);
      }

      // Particles
      g.particles = g.particles.filter((p: any) => p.life > 0);
      g.particles.forEach((p: any) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
      });

      function createParticles(x: number, y: number, color: string) {
        for (let i = 0; i < 8; i++) {
          g.particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 1,
            color
          });
        }
      }

      // Draw
      ctx.fillStyle = "#0a0a0f";
      ctx.fillRect(0, 0, W, H);

      // Draw Grid
      ctx.strokeStyle = "rgba(77, 238, 225, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < W; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, H);
        ctx.stroke();
      }
      for (let i = 0; i < H; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(W, i);
        ctx.stroke();
      }

      // Draw Particles
      g.particles.forEach((p: any) => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Draw Paddle
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = p.color;
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.shadowBlur = 0;

      // Draw Ball
      ctx.fillStyle = b.color;
      ctx.shadowBlur = 20;
      ctx.shadowColor = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState]);

  const startGame = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      initGame(canvas.width, canvas.height);
    }
    setGameState("playing");
    setScore(0);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-mono text-spectral">
      <AnimatePresence mode="wait">
        {gameState === "title" && (
          <motion.div
            key="title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50"
          >
            <div className="text-center mb-12">
              <h1 className="text-7xl font-headline italic tracking-tighter text-spectral mb-2 drop-shadow-[0_0_30px_#4DEEE1]">SPECTRAL</h1>
              <h2 className="text-4xl font-headline italic tracking-widest text-white/80">BOUNCE</h2>
              <div className="h-1 w-48 bg-spectral mx-auto mt-4 opacity-50" />
            </div>
            
            <button
              onClick={startGame}
              className="group relative px-16 py-5 bg-spectral text-black font-black uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">Initialize</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            </button>

            <div className="mt-16 text-[10px] uppercase tracking-[0.4em] opacity-40">
              Use A/D or Arrow Keys to move paddle
            </div>
          </motion.div>
        )}

        {gameState === "playing" && (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full">
            <div className="absolute top-12 left-12 flex items-center gap-4 z-40">
              <div className="w-12 h-12 flex items-center justify-center bg-spectral/10 border border-spectral/30 rounded-lg">
                <Trophy size={24} className="text-spectral" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] opacity-50 mb-1">Resonance</div>
                <div className="text-4xl font-bold tracking-tighter">{score}</div>
              </div>
            </div>

            <button 
              onClick={onBack}
              className="absolute top-12 right-12 p-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all z-40"
            >
              <ArrowLeft size={24} />
            </button>

            <canvas ref={canvasRef} className="block w-full h-full" />
          </motion.div>
        )}

        {gameState === "gameover" && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-2xl z-[60]"
          >
            <div className="max-w-md w-full p-12 border border-spectral/20 bg-spectral/5 rounded-3xl text-center">
              <RefreshCw className="w-20 h-20 text-spectral mx-auto mb-6 animate-spin-slow" />
              <h2 className="text-6xl font-headline italic text-spectral mb-2 tracking-tighter">VOID DROP</h2>
              <p className="text-xs uppercase tracking-[0.5em] text-spectral/60 mb-12">Resonance Lost</p>
              
              <div className="grid grid-cols-2 gap-4 mb-12">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-2">Score</div>
                  <div className="text-4xl font-bold text-white tracking-tighter">{score}</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-2">Best</div>
                  <div className="text-4xl font-bold text-spectral tracking-tighter">{highScore}</div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={startGame}
                  className="w-full py-5 bg-spectral text-black font-black uppercase tracking-[0.3em] rounded-lg hover:brightness-110 transition-all"
                >
                  Re-Initialize
                </button>
                <button
                  onClick={onBack}
                  className="w-full py-5 border border-white/10 text-white font-bold uppercase tracking-[0.3em] rounded-lg hover:bg-white/5 transition-all"
                >
                  Exit Void
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
