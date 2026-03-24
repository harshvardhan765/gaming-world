import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft } from "lucide-react";

interface SpectralOdysseyViewProps {
  onBack: () => void;
}

export function SpectralOdysseyView({ onBack }: SpectralOdysseyViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"title" | "playing" | "gameover">("title");
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const gameRef = useRef<any>(null);

  const initGame = (W: number, H: number) => {
    if (W === 0 || H === 0) return;
    gameRef.current = {
      W,
      H,
      player: { x: W / 2, y: H / 2, r: 15, angle: 0, speed: 0, vx: 0, vy: 0 },
      stars: Array.from({ length: 100 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        z: Math.random() * W,
        size: Math.random() * 2
      })),
      enemies: [] as any[],
      bullets: [] as any[],
      particles: [] as any[],
      score: 0,
      health: 100,
      tick: 0,
      keys: {} as any
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
      if (!gameRef.current) return;
      gameRef.current.keys[e.key] = true;
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
      if (g.keys["ArrowLeft"] || g.keys["a"]) p.angle -= 0.08;
      if (g.keys["ArrowRight"] || g.keys["d"]) p.angle += 0.08;
      if (g.keys["ArrowUp"] || g.keys["w"]) {
        p.vx += Math.cos(p.angle) * 0.2;
        p.vy += Math.sin(p.angle) * 0.2;
      }
      if (g.keys[" "]) {
        if (g.tick % 10 === 0) {
          g.bullets.push({ x: p.x, y: p.y, vx: Math.cos(p.angle) * 8, vy: Math.sin(p.angle) * 8, life: 60 });
        }
      }

      // Physics
      p.vx *= 0.98; p.vy *= 0.98;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      // Stars
      g.stars.forEach((s: any) => {
        s.z -= 2;
        if (s.z <= 0) s.z = W;
      });

      // Enemies
      if (g.tick % 60 === 0) {
        const side = Math.floor(Math.random() * 4);
        let ex, ey;
        if (side === 0) { ex = Math.random() * W; ey = -50; }
        else if (side === 1) { ex = W + 50; ey = Math.random() * H; }
        else if (side === 2) { ex = Math.random() * W; ey = H + 50; }
        else { ex = -50; ey = Math.random() * H; }
        g.enemies.push({ x: ex, y: ey, vx: (p.x - ex) * 0.01, vy: (p.y - ey) * 0.01, r: 20 });
      }

      g.enemies.forEach((e: any, i: number) => {
        e.x += e.vx; e.y += e.vy;
        const dx = p.x - e.x;
        const dy = p.y - e.y;
        if (Math.sqrt(dx * dx + dy * dy) < p.r + e.r) {
          g.health -= 10;
          g.enemies.splice(i, 1);
          if (g.health <= 0) setGameState("gameover");
        }
      });

      // Bullets
      g.bullets.forEach((b: any, bi: number) => {
        b.x += b.vx; b.y += b.vy;
        b.life--;
        g.enemies.forEach((e: any, ei: number) => {
          const dx = b.x - e.x;
          const dy = b.y - e.y;
          if (Math.sqrt(dx * dx + dy * dy) < e.r) {
            g.score += 100;
            g.enemies.splice(ei, 1);
            g.bullets.splice(bi, 1);
            for (let k = 0; k < 8; k++) {
              g.particles.push({ x: e.x, y: e.y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 30, color: "#4DEEE1" });
            }
          }
        });
      });
      g.bullets = g.bullets.filter((b: any) => b.life > 0);

      // Particles
      g.particles.forEach((pt: any) => {
        pt.x += pt.vx; pt.y += pt.vy;
        pt.life--;
      });
      g.particles = g.particles.filter((pt: any) => pt.life > 0);

      // Draw
      ctx.fillStyle = "#0a0a0a"; // Brighter space
      ctx.fillRect(0, 0, W, H);

      // Stars
      ctx.fillStyle = "#ffffff";
      g.stars.forEach((s: any) => {
        const sx = (s.x - W / 2) * (W / s.z) + W / 2;
        const sy = (s.y - H / 2) * (W / s.z) + H / 2;
        const size = (1 - s.z / W) * 3;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Player
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      
      // Engine Glow
      if (g.keys["ArrowUp"] || g.keys["w"]) {
        const engineGrd = ctx.createRadialGradient(-15, 0, 0, -15, 0, 15);
        engineGrd.addColorStop(0, "#4DEEE1");
        engineGrd.addColorStop(1, "transparent");
        ctx.fillStyle = engineGrd;
        ctx.beginPath();
        ctx.arc(-15, 0, 15 + Math.sin(g.tick * 0.5) * 5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = "#4DEEE1";
      ctx.lineWidth = 2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#4DEEE1";
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(-10, 10);
      ctx.lineTo(-10, -10);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Enemies
      g.enemies.forEach((e: any) => {
        const enemyGrd = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r);
        enemyGrd.addColorStop(0, "#ff4d4d");
        enemyGrd.addColorStop(1, "#880000");
        ctx.fillStyle = enemyGrd;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ff4d4d";
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r + Math.sin(g.tick * 0.1) * 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Bullets
      ctx.fillStyle = "#4DEEE1";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#4DEEE1";
      g.bullets.forEach((b: any) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Particles
      g.particles.forEach((pt: any) => {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.life / 30;
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
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState]);

  const startRun = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      initGame(canvas.width, canvas.height);
    }
    setGameState("playing");
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
            <h1 className="text-6xl font-headline italic mb-8 tracking-tighter text-spectral">SPECTRAL ODYSSEY</h1>
            <button
              onClick={startRun}
              className="px-12 py-4 border-2 border-spectral text-spectral hover:bg-spectral hover:text-black transition-all uppercase tracking-widest font-bold"
            >
              Initiate Jump
            </button>
            <p className="mt-8 opacity-50 text-xs">WASD to Move | SPACE to Fire</p>
          </motion.div>
        )}

        {gameState === "playing" && (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full">
            <div className="absolute top-8 left-8 flex flex-col gap-2">
              <div className="text-xs uppercase tracking-widest opacity-50">Resonance</div>
              <div className="text-3xl font-bold">{score}</div>
              <div className="w-48 h-1 bg-white/10 mt-4">
                <div className="h-full bg-spectral transition-all" style={{ width: `${health}%` }} />
              </div>
            </div>
            <button onClick={onBack} className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-full transition-all">
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
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md z-[60]"
          >
            <h2 className="text-5xl font-headline italic mb-4 text-error">MISSION FAILED</h2>
            <p className="mb-8 opacity-70">Final Resonance: {score}</p>
            <div className="flex gap-4">
              <button
                onClick={startRun}
                className="px-8 py-3 bg-spectral text-black font-bold uppercase tracking-widest"
              >
                Retry
              </button>
              <button
                onClick={onBack}
                className="px-8 py-3 border border-white/20 hover:bg-white/10 transition-all font-bold uppercase tracking-widest"
              >
                Abort
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
