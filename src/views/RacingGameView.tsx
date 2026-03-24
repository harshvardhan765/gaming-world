import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Trophy, Gauge, AlertTriangle } from "lucide-react";

interface RacingGameViewProps {
  onBack: () => void;
}

export function RacingGameView({ onBack }: RacingGameViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"title" | "playing" | "gameover">("title");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const gameRef = useRef<any>(null);

  const initGame = (W: number, H: number) => {
    if (W === 0 || H === 0) return;
    const roadWidth = Math.min(W * 0.7, 450);
    const laneLeft = W / 2 - roadWidth / 4;
    const laneRight = W / 2 + roadWidth / 4;

    gameRef.current = {
      W,
      H,
      roadWidth,
      laneLeft,
      laneRight,
      player: { x: laneRight, y: H - 150, w: 50, h: 90, targetX: laneRight },
      enemy: { x: laneLeft, y: -200, w: 50, h: 90, speed: 5 },
      particles: [] as any[],
      score: 0,
      level: 1,
      tick: 0,
      keys: {} as any,
      roadOffset: 0,
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
      const g = gameRef.current;
      if (!g) return;
      if (e.key === "ArrowLeft" || e.key === "a") g.player.targetX = g.laneLeft;
      if (e.key === "ArrowRight" || e.key === "d") g.player.targetX = g.laneRight;
    };
    window.addEventListener("keydown", handleKeyDown);

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
      const e = g.enemy;

      g.tick++;
      g.roadOffset = (g.roadOffset + e.speed) % 100;

      // Player Smooth Movement
      p.x += (p.targetX - p.x) * 0.2;

      // Enemy Logic
      e.y += e.speed;
      if (e.y > H + 100) {
        e.y = -200;
        e.x = Math.random() > 0.5 ? g.laneLeft : g.laneRight;
        g.score += 5;
        if (g.score % 10 === 0) {
          g.level++;
          e.speed += 0.8;
        }
        setScore(g.score);
        setLevel(g.level);
      }

      // Collision
      const px = p.x - p.w / 2;
      const py = p.y - p.h / 2;
      const ex = e.x - e.w / 2;
      const ey = e.y - e.h / 2;

      if (
        px < ex + e.w &&
        px + p.w > ex &&
        py < ey + e.h &&
        py + p.h > ey
      ) {
        setGameState("gameover");
      }

      // Draw
      ctx.fillStyle = "#12121a"; // Brighter background
      ctx.fillRect(0, 0, W, H);

      // Grass/Side
      ctx.fillStyle = "#1a2a1a"; // Brighter grass
      ctx.fillRect(0, 0, W / 2 - g.roadWidth / 2, H);
      ctx.fillRect(W / 2 + g.roadWidth / 2, 0, W / 2 - g.roadWidth / 2, H);

      // Road
      ctx.fillStyle = "#25252a"; // Brighter road
      ctx.fillRect(W / 2 - g.roadWidth / 2, 0, g.roadWidth, H);
      
      // Road Edges (Glow)
      ctx.fillStyle = "#4DEEE1";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#4DEEE1";
      ctx.fillRect(W / 2 - g.roadWidth / 2 - 2, 0, 2, H);
      ctx.fillRect(W / 2 + g.roadWidth / 2, 0, 2, H);
      ctx.shadowBlur = 0;

      // Road Marks
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.setLineDash([40, 60]);
      ctx.lineDashOffset = -g.roadOffset;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.setLineDash([]);

      // Player Car
      drawCar(ctx, p.x, p.y, "#4DEEE1", true);

      // Enemy Car
      drawCar(ctx, e.x, e.y, "#ff4d4d", false);

      function drawCar(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, isPlayer: boolean) {
        ctx.save();
        ctx.translate(x, y);
        if (!isPlayer) ctx.rotate(Math.PI);

        // Body
        ctx.fillStyle = color;
        ctx.shadowBlur = 30;
        ctx.shadowColor = color;
        ctx.beginPath();
        // Custom rounded rect for compatibility
        const r = 8;
        const rw = 40;
        const rh = 80;
        const rx = -20;
        const ry = -40;
        ctx.moveTo(rx + r, ry);
        ctx.lineTo(rx + rw - r, ry);
        ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
        ctx.lineTo(rx + rw, ry + rh - r);
        ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
        ctx.lineTo(rx + r, ry + rh);
        ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
        ctx.lineTo(rx, ry + r);
        ctx.quadraticCurveTo(rx, ry, rx + r, ry);
        ctx.closePath();
        ctx.fill();

        // Cockpit
        ctx.fillStyle = "#000";
        ctx.fillRect(-10, -10, 20, 15);

        // Wheels
        ctx.fillStyle = "#333";
        ctx.fillRect(-18, -25, 6, 12);
        ctx.fillRect(12, -25, 6, 12);
        ctx.fillRect(-18, 15, 6, 12);
        ctx.fillRect(12, 15, 6, 12);

        // Lights
        if (isPlayer) {
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(-10, -28, 3, 0, Math.PI * 2);
          ctx.arc(10, -28, 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = "#ff0000";
          ctx.beginPath();
          ctx.arc(-10, -28, 3, 0, Math.PI * 2);
          ctx.arc(10, -28, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSize);
      window.removeEventListener("keydown", handleKeyDown);
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
            <div className="text-center mb-12">
              <h1 className="text-7xl font-headline italic tracking-tighter text-spectral mb-2 drop-shadow-[0_0_30px_#4DEEE1]">MERRIMENT'S</h1>
              <h2 className="text-4xl font-headline italic tracking-widest text-white/80">RACING CARS</h2>
              <div className="h-1 w-48 bg-spectral mx-auto mt-4 opacity-50" />
            </div>
            
            <button
              onClick={startRun}
              className="group relative px-16 py-5 bg-spectral text-black font-black uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">Ignition</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            </button>

            <div className="mt-16 grid grid-cols-2 gap-12 text-[10px] uppercase tracking-[0.4em] opacity-40">
              <div className="text-right">A / LEFT</div>
              <div className="text-left">Lane Left</div>
              <div className="text-right">D / RIGHT</div>
              <div className="text-left">Lane Right</div>
            </div>
          </motion.div>
        )}

        {gameState === "playing" && (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full">
            {/* HUD */}
            <div className="absolute top-12 left-12 flex flex-col gap-6 z-40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-spectral/10 border border-spectral/30 rounded-lg">
                  <Trophy size={24} className="text-spectral" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] opacity-50 mb-1">Resonance</div>
                  <div className="text-4xl font-bold tracking-tighter">{score}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-spectral/10 border border-spectral/30 rounded-lg">
                  <Gauge size={24} className="text-spectral" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] opacity-50 mb-1">Velocity Level</div>
                  <div className="text-4xl font-bold tracking-tighter">{level}</div>
                </div>
              </div>
            </div>

            <button 
              onClick={onBack}
              className="absolute top-12 right-12 p-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all z-40"
            >
              <ArrowLeft size={24} />
            </button>

            <canvas ref={canvasRef} className="block w-full h-full" />
            
            {/* Decorative Side Elements */}
            <div className="absolute inset-y-0 left-0 w-24 border-r border-white/5 bg-gradient-to-r from-black to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 border-l border-white/5 bg-gradient-to-l from-black to-transparent pointer-events-none" />
          </motion.div>
        )}

        {gameState === "gameover" && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-2xl z-[60]"
          >
            <div className="max-w-md w-full p-12 border border-error/20 bg-error/5 rounded-3xl text-center">
              <AlertTriangle className="w-20 h-20 text-error mx-auto mb-6 animate-pulse" />
              <h2 className="text-6xl font-headline italic text-error mb-2 tracking-tighter">CRITICAL COLLISION</h2>
              <p className="text-xs uppercase tracking-[0.5em] text-error/60 mb-12">System Integrity Zero</p>
              
              <div className="bg-white/5 rounded-2xl p-6 mb-12 border border-white/10">
                <div className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-2">Final Resonance</div>
                <div className="text-5xl font-bold text-spectral tracking-tighter">{score}</div>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={startRun}
                  className="w-full py-5 bg-spectral text-black font-black uppercase tracking-[0.3em] rounded-lg hover:brightness-110 transition-all"
                >
                  Re-Ignite
                </button>
                <button
                  onClick={onBack}
                  className="w-full py-5 border border-white/10 text-white font-bold uppercase tracking-[0.3em] rounded-lg hover:bg-white/5 transition-all"
                >
                  Abort Mission
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
