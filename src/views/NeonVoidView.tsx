import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, RotateCcw, Shield, Zap, Target } from 'lucide-react';

interface NeonVoidViewProps {
  onBack: () => void;
}

export function NeonVoidView({ onBack }: NeonVoidViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('neon-void-highscore')) || 0);

  const gameRef = useRef({
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    renderer: null as THREE.WebGLRenderer | null,
    player: null as THREE.Group | null,
    asteroids: [] as THREE.Mesh[],
    lasers: [] as THREE.Mesh[],
    stars: null as THREE.Points | null,
    keys: {} as Record<string, boolean>,
    tick: 0,
    lastShot: 0,
    speed: 1,
    difficulty: 1,
  });

  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSound = (type: 'laser' | 'explosion' | 'hit' | 'powerup') => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'laser') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start();
      osc.stop(now + 0.1);
    } else if (type === 'explosion') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(10, now + 0.5);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start();
      osc.stop(now + 0.5);
    } else if (type === 'hit') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start();
      osc.stop(now + 0.2);
    }
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020205);
    scene.fog = new THREE.FogExp2(0x020205, 0.002);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current!, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x4DEEE1, 2);
    directionalLight.position.set(1, 1, 2);
    scene.add(directionalLight);

    // Player Ship
    const playerGroup = new THREE.Group();
    
    // Ship Body
    const bodyGeo = new THREE.ConeGeometry(2, 6, 4);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4DEEE1, emissive: 0x4DEEE1, emissiveIntensity: 0.5 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    playerGroup.add(body);

    // Wings
    const wingGeo = new THREE.BoxGeometry(6, 0.5, 2);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const wings = new THREE.Mesh(wingGeo, wingMat);
    wings.position.z = -1;
    playerGroup.add(wings);

    // Engine Glow
    const engineGeo = new THREE.SphereGeometry(0.8, 8, 8);
    const engineMat = new THREE.MeshBasicMaterial({ color: 0xff4d4d });
    const engine = new THREE.Mesh(engineGeo, engineMat);
    engine.position.z = -3;
    playerGroup.add(engine);

    scene.add(playerGroup);

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starCount = 5000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 2000;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    gameRef.current = {
      ...gameRef.current,
      scene,
      camera,
      renderer,
      player: playerGroup,
      asteroids: [],
      lasers: [],
      stars,
      tick: 0,
      lastShot: 0,
      speed: 1,
      difficulty: 1,
    };

    const handleKeyDown = (e: KeyboardEvent) => gameRef.current.keys[e.code] = true;
    const handleKeyUp = (e: KeyboardEvent) => gameRef.current.keys[e.code] = false;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animId: number;
    const loop = () => {
      const g = gameRef.current;
      if (!g.scene || !g.camera || !g.renderer || !g.player) return;

      g.tick++;
      g.difficulty = 1 + Math.floor(g.tick / 1000) * 0.2;

      // Player Movement
      const moveSpeed = 1.2;
      if (g.keys['ArrowLeft'] || g.keys['KeyA']) g.player.position.x -= moveSpeed;
      if (g.keys['ArrowRight'] || g.keys['KeyD']) g.player.position.x += moveSpeed;
      if (g.keys['ArrowUp'] || g.keys['KeyW']) g.player.position.y += moveSpeed;
      if (g.keys['ArrowDown'] || g.keys['KeyS']) g.player.position.y -= moveSpeed;

      // Clamp player position
      g.player.position.x = Math.max(-60, Math.min(60, g.player.position.x));
      g.player.position.y = Math.max(-40, Math.min(40, g.player.position.y));

      // Tilt ship
      g.player.rotation.z = - (g.player.position.x / 60) * 0.5;
      g.player.rotation.x = (g.player.position.y / 40) * 0.3;

      // Shooting
      if ((g.keys['Space'] || g.keys['Enter']) && g.tick - g.lastShot > 10) {
        const laserGeo = new THREE.BoxGeometry(0.2, 0.2, 4);
        const laserMat = new THREE.MeshBasicMaterial({ color: 0x4DEEE1 });
        const laser = new THREE.Mesh(laserGeo, laserMat);
        laser.position.copy(g.player.position);
        laser.position.z -= 4;
        g.scene.add(laser);
        g.lasers.push(laser);
        g.lastShot = g.tick;
        playSound('laser');
      }

      // Update Lasers
      for (let i = g.lasers.length - 1; i >= 0; i--) {
        const laser = g.lasers[i];
        laser.position.z -= 5;
        if (laser.position.z < -500) {
          g.scene.remove(laser);
          g.lasers.splice(i, 1);
        }
      }

      // Spawn Asteroids
      if (g.tick % Math.max(5, Math.floor(30 / g.difficulty)) === 0) {
        const size = 2 + Math.random() * 8;
        const astGeo = new THREE.IcosahedronGeometry(size, 1);
        const astMat = new THREE.MeshStandardMaterial({ 
          color: 0x444444, 
          flatShading: true,
          roughness: 0.8
        });
        const asteroid = new THREE.Mesh(astGeo, astMat);
        asteroid.position.set(
          (Math.random() - 0.5) * 200,
          (Math.random() - 0.5) * 150,
          -1000
        );
        asteroid.userData = {
          rotX: Math.random() * 0.05,
          rotY: Math.random() * 0.05,
          speed: (2 + Math.random() * 3) * g.difficulty
        };
        g.scene.add(asteroid);
        g.asteroids.push(asteroid);
      }

      // Update Asteroids
      for (let i = g.asteroids.length - 1; i >= 0; i--) {
        const ast = g.asteroids[i];
        ast.position.z += ast.userData.speed;
        ast.rotation.x += ast.userData.rotX;
        ast.rotation.y += ast.userData.rotY;

        // Collision with player
        const dist = ast.position.distanceTo(g.player.position);
        if (dist < (ast.geometry as THREE.IcosahedronGeometry).parameters.radius + 2) {
          setHealth(prev => {
            const next = prev - 20;
            if (next <= 0) {
              setGameState('gameover');
              playSound('explosion');
            } else {
              playSound('hit');
            }
            return next;
          });
          g.scene.remove(ast);
          g.asteroids.splice(i, 1);
          continue;
        }

        // Collision with lasers
        for (let j = g.lasers.length - 1; j >= 0; j--) {
          const laser = g.lasers[j];
          const lDist = ast.position.distanceTo(laser.position);
          if (lDist < (ast.geometry as THREE.IcosahedronGeometry).parameters.radius + 1) {
            setScore(prev => prev + 100);
            g.scene.remove(ast);
            g.asteroids.splice(i, 1);
            g.scene.remove(laser);
            g.lasers.splice(j, 1);
            playSound('explosion');
            break;
          }
        }

        if (ast.position.z > 100) {
          g.scene.remove(ast);
          g.asteroids.splice(i, 1);
        }
      }

      // Move Stars
      if (g.stars) {
        g.stars.position.z += 1;
        if (g.stars.position.z > 1000) g.stars.position.z = 0;
      }

      g.renderer.render(g.scene, g.camera);
      animId = requestAnimationFrame(loop);
    };

    loop();

    const handleResize = () => {
      const g = gameRef.current;
      if (g.camera && g.renderer) {
        g.camera.aspect = window.innerWidth / window.innerHeight;
        g.camera.updateProjectionMatrix();
        g.renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      if (renderer) renderer.dispose();
      if (scene) {
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach(m => m.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'gameover' && score > highScore) {
      setHighScore(score);
      localStorage.setItem('neon-void-highscore', score.toString());
    }
  }, [gameState, score, highScore]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setHealth(100);
  };

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black overflow-hidden font-sans">
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* HUD */}
      {gameState === 'playing' && (
        <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-spectral/30">
                <Target className="text-spectral" size={24} />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-spectral font-bold">Resonance Score</div>
                  <div className="text-3xl font-headline italic text-on-surface">{score.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-error/30">
                <Shield className="text-error" size={24} />
                <div className="flex-1 min-w-[150px]">
                  <div className="text-[10px] uppercase tracking-widest text-error font-bold">Hull Integrity</div>
                  <div className="h-2 bg-error/20 rounded-full mt-1 overflow-hidden">
                    <motion.div 
                      className="h-full bg-error shadow-[0_0_10px_#ff4d4d]" 
                      animate={{ width: `${health}%` }}
                    />
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

          <div className="flex justify-center">
            <div className="bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-spectral/20 text-[10px] uppercase tracking-[0.3em] text-spectral/60">
              Sector: Neon Void Alpha
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
                <h1 className="text-6xl font-headline italic text-spectral tracking-tighter">NEON VOID</h1>
                <p className="text-on-surface-variant uppercase tracking-[0.5em] text-xs">Spectral Intercept Protocol</p>
              </div>

              <div className="p-8 bg-surface-container-low/40 rounded-3xl border border-spectral/30 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-black/40 rounded-2xl border border-on-surface-variant/10">
                    <div className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">High Score</div>
                    <div className="text-2xl font-headline italic text-on-surface">{highScore.toLocaleString()}</div>
                  </div>
                  <div className="p-4 bg-black/40 rounded-2xl border border-on-surface-variant/10">
                    <div className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Difficulty</div>
                    <div className="text-2xl font-headline italic text-spectral">Adaptive</div>
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <Zap size={16} className="text-spectral" />
                    <span>WASD / Arrows to Move</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <Target size={16} className="text-spectral" />
                    <span>Space to Fire Lasers</span>
                  </div>
                </div>

                <button 
                  onClick={startGame}
                  className="w-full py-5 bg-spectral text-background font-bold rounded-2xl uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(77,238,225,0.4)] transition-all group"
                >
                  <Play size={20} fill="currentColor" />
                  Initiate Launch
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
            <div className="max-w-md w-full text-center space-y-8 bg-black/90 p-12 rounded-[3rem] border-2 border-error/40 shadow-[0_0_100px_rgba(255,77,77,0.2)]">
              <div className="space-y-2">
                <h2 className="text-5xl font-headline italic text-error tracking-tighter">HULL BREACHED</h2>
                <p className="text-on-surface-variant uppercase tracking-widest text-xs">Mission Terminated</p>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">Final Resonance</div>
                <div className="text-6xl font-headline italic text-on-surface">{score.toLocaleString()}</div>
              </div>

              {score >= highScore && score > 0 && (
                <div className="text-spectral font-bold uppercase tracking-[0.3em] text-xs animate-pulse">
                  New Sector Record Established
                </div>
              )}

              <div className="flex flex-col gap-4">
                <button 
                  onClick={startGame}
                  className="w-full py-5 bg-error text-white font-bold rounded-2xl uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(255,77,77,0.4)] transition-all"
                >
                  <RotateCcw size={20} />
                  Re-Initiate
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
