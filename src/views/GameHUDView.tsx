import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface GameHUDViewProps {
  onGameOver: (score: number) => void;
  onBack: () => void;
}

export function GameHUDView({ onGameOver, onBack }: GameHUDViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [selectedMode, setSelectedMode] = useState<'endless' | 'hyper' | 'boss'>('endless');
  
  const gameState = useRef({
    player: { x: 100, y: 0, vy: 0, jumping: false, ducking: false, size: 50 },
    obstacles: [] as { x: number, y: number, width: number, height: number, type: 'low' | 'high' }[],
    speed: 6,
    distance: 0,
    animationFrame: 0,
    isGameOver: false,
    particles: [] as { x: number, y: number, vx: number, vy: number, life: number }[],
    bgTrees: [] as { x: number, y: number, scale: number, speed: number }[],
  });

  const startGame = () => {
    setIsStarted(true);
    gameState.current.isGameOver = false;
    gameState.current.distance = 0;
    gameState.current.obstacles = [];
    
    // Set base speed based on difficulty
    const baseSpeed = selectedDifficulty === 'easy' ? 5 : selectedDifficulty === 'hard' ? 9 : 7;
    gameState.current.speed = selectedMode === 'hyper' ? baseSpeed * 1.5 : selectedMode === 'boss' ? baseSpeed * 1.3 : baseSpeed;
    
    gameState.current.player.y = 0;
    gameState.current.player.vy = 0;
    gameState.current.player.jumping = false;
    gameState.current.player.ducking = false;
    setScore(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isStarted) return;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        if (!gameState.current.player.jumping) {
          gameState.current.player.vy = -18;
          gameState.current.player.jumping = true;
        }
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        gameState.current.player.ducking = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        gameState.current.player.ducking = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isStarted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Initialize background trees with layers for parallax
      gameState.current.bgTrees = Array.from({ length: 30 }).map(() => ({
        x: Math.random() * canvas.width,
        y: canvas.height * 0.75,
        scale: Math.random() * 0.8 + 0.2,
        speed: 0 // Will be set based on scale for parallax
      }));
      gameState.current.bgTrees.forEach(t => t.speed = t.scale * 0.5);
    };
    resize();
    window.addEventListener('resize', resize);

    const update = () => {
      if (!isStarted || gameState.current.isGameOver) return;

      const p = gameState.current.player;
      const groundY = canvas.height * 0.75;

      // Physics
      p.y += p.vy;
      p.vy += 0.9; // Gravity

      if (p.y > 0) {
        p.y = 0;
        p.vy = 0;
        p.jumping = false;
      }

      // Move obstacles
      gameState.current.obstacles.forEach(obs => {
        obs.x -= gameState.current.speed;
      });

      // Spawn obstacles
      if (gameState.current.distance % 100 === 0) {
        const type = Math.random() > 0.4 ? 'low' : 'high';
        gameState.current.obstacles.push({
          x: canvas.width,
          y: type === 'low' ? groundY - 50 : groundY - 140,
          width: 50,
          height: 50,
          type
        });
      }

      // Cleanup obstacles
      gameState.current.obstacles = gameState.current.obstacles.filter(obs => obs.x > -100);

      // Collision
      const playerRect = {
        x: p.x + 10,
        y: groundY + p.y - (p.ducking ? p.size / 2 : p.size) + 5,
        w: p.size - 20,
        h: (p.ducking ? p.size / 2 : p.size) - 10
      };

      gameState.current.obstacles.forEach(obs => {
        if (
          playerRect.x < obs.x + obs.width &&
          playerRect.x + playerRect.w > obs.x &&
          playerRect.y < obs.y + obs.height &&
          playerRect.y + playerRect.h > obs.y
        ) {
          gameState.current.isGameOver = true;
          onGameOver(Math.floor(gameState.current.distance / 10));
        }
      });

      gameState.current.distance += 1;
      setScore(Math.floor(gameState.current.distance / 10));
      gameState.current.speed += 0.001;

      // Background movement (Parallax)
      gameState.current.bgTrees.forEach(tree => {
        tree.x -= gameState.current.speed * tree.speed;
        if (tree.x < -200) tree.x = canvas.width + 200;
      });

      // Particles
      if (Math.random() > 0.5) {
        gameState.current.particles.push({
          x: p.x + 10,
          y: groundY + p.y - 10,
          vx: -Math.random() * 3 - 2,
          vy: -Math.random() * 2,
          life: 1
        });
      }
      gameState.current.particles.forEach((part, i) => {
        part.x += part.vx;
        part.y += part.vy;
        part.life -= 0.02;
        if (part.life <= 0) gameState.current.particles.splice(i, 1);
      });
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#050510');
      skyGrad.addColorStop(1, '#101025');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const groundY = canvas.height * 0.75;

      // Draw Background Trees (Forest with Layers)
      gameState.current.bgTrees.sort((a, b) => a.scale - b.scale).forEach(tree => {
        const alpha = tree.scale * 0.3;
        ctx.fillStyle = `rgba(77, 238, 225, ${alpha})`;
        
        // Tree Trunk
        ctx.fillRect(tree.x - 5 * tree.scale, tree.y - 20 * tree.scale, 10 * tree.scale, 20 * tree.scale);
        
        // Tree Foliage (Triangles)
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(tree.x, tree.y - 150 * tree.scale + i * 30 * tree.scale);
          ctx.lineTo(tree.x - 40 * tree.scale + i * 5 * tree.scale, tree.y - 20 * tree.scale + i * 10 * tree.scale);
          ctx.lineTo(tree.x + 40 * tree.scale - i * 5 * tree.scale, tree.y - 20 * tree.scale + i * 10 * tree.scale);
          ctx.fill();
        }
      });

      // Draw Ground
      ctx.strokeStyle = '#4DEEE1';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(canvas.width, groundY);
      ctx.stroke();
      
      // Ground Detail
      ctx.fillStyle = 'rgba(77, 238, 225, 0.05)';
      ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

      // Draw Particles
      gameState.current.particles.forEach(part => {
        ctx.fillStyle = `rgba(255, 255, 0, ${part.life})`;
        ctx.beginPath();
        ctx.arc(part.x, part.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Player
      const p = gameState.current.player;
      ctx.save();
      ctx.translate(p.x, groundY + p.y);
      
      // Glow
      ctx.shadowBlur = 40;
      ctx.shadowColor = '#4DEEE1';
      
      // 3D Character Rendering: Multi-segment Body
      const pX = p.size / 2;
      const pY = -p.size / 2;
      const pR = p.size / 2;

      // Body Gradient (3D Shading)
      const bodyGrad = ctx.createRadialGradient(
        pX - pR * 0.3, pY - pR * 0.3, pR * 0.1,
        pX, pY, pR
      );
      bodyGrad.addColorStop(0, '#ffffff'); // Highlight
      bodyGrad.addColorStop(0.4, '#4DEEE1'); // Base
      bodyGrad.addColorStop(1, '#004444'); // Shadow

      ctx.fillStyle = bodyGrad;
      
      if (p.ducking) {
        ctx.beginPath();
        ctx.ellipse(p.size/2, -p.size/4, p.size * 0.8, p.size/4, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Head
        ctx.beginPath();
        ctx.arc(pX, pY - pR * 0.2, pR * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        // Torso
        ctx.beginPath();
        ctx.ellipse(pX, pY + pR * 0.4, pR * 0.6, pR * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Eyes for "Realism"
      ctx.fillStyle = '#000000';
      if (!p.ducking) {
        const eyeY = pY - pR * 0.3;
        // Left Eye
        ctx.beginPath();
        ctx.arc(pX + pR * 0.2, eyeY, 4, 0, Math.PI * 2);
        ctx.fill();
        // Right Eye
        ctx.beginPath();
        ctx.arc(pX + pR * 0.6, eyeY, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye Highlights
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(pX + pR * 0.25, eyeY - 1, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pX + pR * 0.65, eyeY - 1, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Spectral Aura (3D Glow)
      const auraGrad = ctx.createRadialGradient(pX, pY, pR, pX, pY, pR + 25 + Math.sin(time/150) * 10);
      auraGrad.addColorStop(0, 'rgba(77, 238, 225, 0.5)');
      auraGrad.addColorStop(1, 'rgba(77, 238, 225, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(pX, pY, pR + 30, 0, Math.PI * 2);
      ctx.fill();

      // Running Animation: Legs & Arms
      if (!p.jumping && !p.ducking) {
        const legPhase = time / 70;
        ctx.strokeStyle = '#4DEEE1';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        
        // Leg 1
        ctx.beginPath();
        ctx.moveTo(pX - pR * 0.3, pY + pR * 0.8);
        ctx.lineTo(pX - pR * 0.3 + Math.sin(legPhase) * 25, groundY + p.y - (groundY + p.y) + 15 + Math.abs(Math.cos(legPhase)) * 8);
        ctx.stroke();
        
        // Leg 2
        ctx.beginPath();
        ctx.moveTo(pX + pR * 0.3, pY + pR * 0.8);
        ctx.lineTo(pX + pR * 0.3 + Math.sin(legPhase + Math.PI) * 25, groundY + p.y - (groundY + p.y) + 15 + Math.abs(Math.cos(legPhase + Math.PI)) * 8);
        ctx.stroke();

        // Arms
        ctx.strokeStyle = 'rgba(77, 238, 225, 0.6)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(pX, pY + pR * 0.2);
        ctx.lineTo(pX + Math.sin(legPhase + Math.PI) * 20, pY + pR * 0.5 + Math.cos(legPhase + Math.PI) * 10);
        ctx.stroke();
      }
      
      // "SPECTRAL" Label
      ctx.fillStyle = '#4DEEE1';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("SPECTRAL", pX, pY - pR * 1.5 + Math.sin(time/100) * 5);
      
      ctx.restore();

      // Draw Obstacles
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#FF0000';
      ctx.fillStyle = '#FF4D4D';
      gameState.current.obstacles.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        // Spikes
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y);
        ctx.lineTo(obs.x + obs.width/2, obs.y - 15);
        ctx.lineTo(obs.x + obs.width, obs.y);
        ctx.fill();
      });

      gameState.current.animationFrame = requestAnimationFrame(draw);
      update();
    };

    gameState.current.animationFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(gameState.current.animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, [isStarted, onGameOver]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* HUD */}
      <div className="absolute top-12 left-12 z-20">
        <div className="text-spectral text-xs uppercase tracking-[0.4em] font-bold mb-1">Resonance</div>
        <div className="text-5xl font-headline italic text-on-surface drop-shadow-lg">{score.toLocaleString()}</div>
      </div>

      <button 
        onClick={onBack}
        className="absolute top-12 right-12 z-20 p-4 bg-surface/40 backdrop-blur-md rounded-full border border-on-surface-variant/20 text-spectral hover:bg-surface/60 transition-all shadow-xl"
      >
        <ArrowLeft size={32} />
      </button>

      {/* Start Screen */}
      <AnimatePresence>
        {!isStarted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <div className="max-w-md w-full p-12 text-center bg-surface/20 rounded-3xl border border-spectral/20">
              <h2 className="text-5xl font-headline italic font-bold text-on-surface mb-8 tracking-tight">Spectral Runner</h2>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                {(['endless', 'hyper', 'boss'] as const).map(mode => (
                  <button 
                    key={mode}
                    onClick={() => setSelectedMode(mode)}
                    className={`py-3 rounded-xl border transition-all uppercase text-[10px] font-bold tracking-widest ${selectedMode === mode ? 'bg-spectral text-black border-spectral shadow-[0_0_20px_#4DEEE1]' : 'bg-surface-container border-on-surface-variant/10 text-on-surface-variant'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-8">
                {(['easy', 'normal', 'hard'] as const).map(diff => (
                  <button 
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`py-2 rounded-lg border transition-all uppercase text-[9px] font-bold tracking-widest ${selectedDifficulty === diff ? 'bg-on-surface text-background border-on-surface' : 'bg-surface-container border-on-surface-variant/10 text-on-surface-variant'}`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              <button 
                onClick={startGame}
                className="w-full py-6 bg-spectral text-background font-black uppercase tracking-[0.5em] rounded-2xl shadow-[0_0_40px_rgba(77,238,225,0.4)] hover:scale-105 transition-all text-xl"
              >
                Start Run
              </button>
              
              <div className="mt-8 space-y-2">
                <p className="text-on-surface-variant text-[10px] uppercase tracking-widest opacity-70">
                  SPACE / UP to Jump
                </p>
                <p className="text-on-surface-variant text-[10px] uppercase tracking-widest opacity-70">
                  DOWN to Duck
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
