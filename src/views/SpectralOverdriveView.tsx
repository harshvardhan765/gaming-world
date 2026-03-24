import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Trophy, Gauge, AlertTriangle, Zap } from "lucide-react";

interface SpectralOverdriveViewProps {
  onBack: () => void;
}

export function SpectralOverdriveView({ onBack }: SpectralOverdriveViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"title" | "playing" | "gameover">("title");
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(0);
  const gameRef = useRef<any>(null);

  const initGame = (W: number, H: number) => {
    if (W === 0 || H === 0) return;
    const roadWidth = Math.min(W * 0.8, 600);
    const laneWidth = roadWidth / 4;
    const laneCenters = [
      W / 2 - laneWidth * 1.5,
      W / 2 - laneWidth * 0.5,
      W / 2 + laneWidth * 0.5,
      W / 2 + laneWidth * 1.5
    ];

    gameRef.current = {
      W,
      H,
      roadWidth,
      laneWidth,
      laneCenters,
      player: { 
        x: laneCenters[1], 
        y: H - 180, 
        w: 45, 
        h: 85, 
        targetX: laneCenters[1],
        lane: 1,
        speed: 0,
        maxSpeed: 15,
        accel: 0.1,
        decel: 0.05
      },
      enemies: [] as any[],
      particles: [] as any[],
      score: 0,
      tick: 0,
      keys: {} as any,
      roadOffset: 0,
      worldSpeed: 0,
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
      g.keys[e.code] = true;
      
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        if (g.player.lane > 0) {
          g.player.lane--;
          g.player.targetX = g.laneCenters[g.player.lane];
        }
      }
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        if (g.player.lane < 3) {
          g.player.lane++;
          g.player.targetX = g.laneCenters[g.player.lane];
        }
      }
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

      const p = g.player;

      // Player Speed Logic
      if (g.keys["ArrowUp"] || g.keys["KeyW"]) {
        p.speed += p.accel;
      } else if (g.keys["ArrowDown"] || g.keys["KeyS"]) {
        p.speed -= p.accel * 2;
      } else {
        p.speed -= p.decel;
      }
      
      p.speed = Math.max(2, Math.min(p.speed, p.maxSpeed));
      g.worldSpeed = p.speed;
      setSpeed(Math.floor(p.speed * 20));

      // Player Smooth Movement
      p.x += (p.targetX - p.x) * 0.15;

      // Road Animation
      g.roadOffset = (g.roadOffset + g.worldSpeed) % 200;

      // Enemy Spawning
      g.tick++;
      if (g.tick % 60 === 0) {
        const lane = Math.floor(Math.random() * 4);
        const enemySpeed = 3 + Math.random() * 5;
        g.enemies.push({
          x: g.laneCenters[lane],
          y: -150,
          w: 45,
          h: 85,
          speed: enemySpeed,
          color: `hsl(${Math.random() * 360}, 70%, 60%)`,
          passed: false
        });
      }

      // Enemy Logic
      g.enemies = g.enemies.filter((e: any) => e.y < H + 200);
      g.enemies.forEach((e: any) => {
        // Relative speed
        e.y += (g.worldSpeed - e.speed);

        // Overtake Score
        if (!e.passed && e.y > p.y + p.h) {
          e.passed = true;
          g.score += 10;
          setScore(g.score);
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
      });

      // Draw
      ctx.fillStyle = "#0a0a0f";
      ctx.fillRect(0, 0, W, H);

      // Road
      const rx = W / 2 - g.roadWidth / 2;
      ctx.fillStyle = "#1a1a20";
      ctx.fillRect(rx, 0, g.roadWidth, H);

      // Road Edges
      ctx.fillStyle = "#4DEEE1";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#4DEEE1";
      ctx.fillRect(rx - 4, 0, 4, H);
      ctx.fillRect(rx + g.roadWidth, 0, 4, H);
      ctx.shadowBlur = 0;

      // Lane Lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.setLineDash([40, 60]);
      ctx.lineDashOffset = -g.roadOffset;
      ctx.lineWidth = 2;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(rx + i * g.laneWidth, 0);
        ctx.lineTo(rx + i * g.laneWidth, H);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Draw Enemies
      g.enemies.forEach((e: any) => {
        drawCar(ctx, e.x, e.y, e.color, false);
      });

      // Draw Player
      drawCar(ctx, p.x, p.y, "#4DEEE1", true);

      function drawCar(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, isPlayer: boolean) {
        ctx.save();
        ctx.translate(x, y);
        
        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.beginPath();
        ctx.ellipse(0, 45, 25, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = color;
        if (isPlayer) {
          ctx.shadowBlur = 25;
          ctx.shadowColor = color;
        }
        
        // Car Shape
        ctx.beginPath();
        const w = 40;
        const h = 80;
        
        // Custom rounded rect for compatibility
        const r = 10;
        const rx = -w/2;
        const ry = -h/2;
        ctx.moveTo(rx + r, ry);
        ctx.lineTo(rx + w - r, ry);
        ctx.quadraticCurveTo(rx + w, ry, rx + w, ry + r);
        ctx.lineTo(rx + w, ry + h - r);
        ctx.quadraticCurveTo(rx + w, ry + h, rx + w - r, ry + h);
        ctx.lineTo(rx + r, ry + h);
        ctx.quadraticCurveTo(rx, ry + h, rx, ry + h - r);
        ctx.lineTo(rx, ry + r);
        ctx.quadraticCurveTo(rx, ry, rx + r, ry);
        ctx.closePath();
        
        ctx.fill();
        ctx.shadowBlur = 0;

        // Details
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(-15, -10, 30, 20); // Windshield
        
        // Lights
        if (isPlayer) {
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(-12, -35, 4, 0, Math.PI * 2);
          ctx.arc(12, -35, 4, 0, Math.PI * 2);
          ctx.fill();
          
          // Tail lights
          ctx.fillStyle = "#ff0000";
          ctx.fillRect(-15, 35, 8, 4);
          ctx.fillRect(7, 35, 8, 4);
        } else {
          ctx.fillStyle = "#ff0000";
          ctx.fillRect(-15, -38, 8, 4);
          ctx.fillRect(7, -38, 8, 4);
        }

        ctx.restore();
      }

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
              <h1 className="text-7xl font-headline italic tracking-tighter text-spectral mb-2 drop-shadow-[0_0_30px_#4DEEE1]">OVERDRIVE</h1>
              <h2 className="text-4xl font-headline italic tracking-widest text-white/80">SPECTRAL RACER</h2>
              <div className="h-1 w-48 bg-spectral mx-auto mt-4 opacity-50" />
            </div>
            
            <button
              onClick={startGame}
              className="group relative px-16 py-5 bg-spectral text-black font-black uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">Ignition</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            </button>

            <div className="mt-16 grid grid-cols-2 gap-8 text-[10px] uppercase tracking-[0.4em] opacity-40">
              <div className="text-right">WASD / ARROWS</div>
              <div className="text-left">Control Car</div>
              <div className="text-right">SPACE</div>
              <div className="text-left">Emergency Brake</div>
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
                  <div className="text-[10px] uppercase tracking-[0.3em] opacity-50 mb-1">Overtakes</div>
                  <div className="text-4xl font-bold tracking-tighter">{score}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-spectral/10 border border-spectral/30 rounded-lg">
                  <Gauge size={24} className="text-spectral" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] opacity-50 mb-1">Velocity</div>
                  <div className="text-4xl font-bold tracking-tighter">{speed} <span className="text-sm opacity-50">KM/H</span></div>
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
              <h2 className="text-6xl font-headline italic text-error mb-2 tracking-tighter">TOTAL WRECK</h2>
              <p className="text-xs uppercase tracking-[0.5em] text-error/60 mb-12">Chassis Compromised</p>
              
              <div className="bg-white/5 rounded-2xl p-6 mb-12 border border-white/10">
                <div className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-2">Overtakes</div>
                <div className="text-5xl font-bold text-spectral tracking-tighter">{score}</div>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={startGame}
                  className="w-full py-5 bg-spectral text-black font-black uppercase tracking-[0.3em] rounded-lg hover:brightness-110 transition-all"
                >
                  Restart Engine
                </button>
                <button
                  onClick={onBack}
                  className="w-full py-5 border border-white/10 text-white font-bold uppercase tracking-[0.3em] rounded-lg hover:bg-white/5 transition-all"
                >
                  Back to Base
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
