import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, RotateCcw, Zap, Target, Lightbulb, ChevronRight, ChevronLeft } from 'lucide-react';

interface EchoesOfLightViewProps {
  onBack: () => void;
}

type CellType = 'empty' | 'source' | 'target' | 'mirror' | 'wall';
type Direction = 'up' | 'right' | 'down' | 'left';

interface Cell {
  type: CellType;
  direction?: Direction;
  active?: boolean;
}

const LEVELS: { grid: Cell[][], description: string }[] = [
  {
    grid: [
      [{ type: 'source', direction: 'right' }, { type: 'empty' }, { type: 'empty' }, { type: 'target' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }],
    ],
    description: "The first resonance. Direct the beam to the target."
  },
  {
    grid: [
      [{ type: 'source', direction: 'right' }, { type: 'empty' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'target' }],
    ],
    description: "Reflection. Place a mirror to guide the light."
  },
  {
    grid: [
      [{ type: 'source', direction: 'down' }, { type: 'empty' }, { type: 'target' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'empty' }],
      [{ type: 'empty' }, { type: 'empty' }, { type: 'empty' }],
    ],
    description: "Cornering. Use multiple mirrors for complex paths."
  }
];

export function EchoesOfLightView({ onBack }: EchoesOfLightViewProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'victory'>('menu');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [beams, setBeams] = useState<{ x: number, y: number, dir: Direction }[]>([]);
  const [solved, setSolved] = useState(false);

  const initLevel = (idx: number) => {
    const level = LEVELS[idx];
    const newGrid = level.grid.map(row => row.map(cell => ({ ...cell })));
    setGrid(newGrid);
    setSolved(false);
    calculateBeams(newGrid);
  };

  const calculateBeams = (currentGrid: Cell[][]) => {
    const newBeams: { x: number, y: number, dir: Direction }[] = [];
    const visited = new Set<string>();

    // Find sources
    currentGrid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell.type === 'source' && cell.direction) {
          let cx = x;
          let cy = y;
          let cd = cell.direction;

          while (true) {
            const key = `${cx},${cy},${cd}`;
            if (visited.has(key)) break;
            visited.add(key);

            // Move
            if (cd === 'up') cy--;
            else if (cd === 'right') cx++;
            else if (cd === 'down') cy++;
            else if (cd === 'left') cx--;

            // Bounds check
            if (cy < 0 || cy >= currentGrid.length || cx < 0 || cx >= currentGrid[0].length) break;

            newBeams.push({ x: cx, y: cy, dir: cd });

            const targetCell = currentGrid[cy][cx];
            if (targetCell.type === 'mirror') {
              // Simple 45 degree mirror logic
              // For this demo, we'll cycle directions on click, but beams just reflect
              if (targetCell.direction === 'up') { // / mirror
                if (cd === 'right') cd = 'up';
                else if (cd === 'down') cd = 'left';
                else if (cd === 'left') cd = 'down';
                else if (cd === 'up') cd = 'right';
              } else { // \ mirror
                if (cd === 'right') cd = 'down';
                else if (cd === 'up') cd = 'left';
                else if (cd === 'left') cd = 'up';
                else if (cd === 'down') cd = 'right';
              }
            } else if (targetCell.type === 'wall') {
              break;
            } else if (targetCell.type === 'target') {
              // Hit target!
              break;
            }
          }
        }
      });
    });

    setBeams(newBeams);

    // Check win condition
    const allTargetsHit = currentGrid.every((row, y) => 
      row.every((cell, x) => {
        if (cell.type === 'target') {
          return newBeams.some(b => b.x === x && b.y === y);
        }
        return true;
      })
    );

    if (allTargetsHit && currentGrid.some(row => row.some(c => c.type === 'target'))) {
      setSolved(true);
      setTimeout(() => {
        if (currentLevel < LEVELS.length - 1) {
          // Next level or victory
        } else {
          setGameState('victory');
        }
      }, 1500);
    }
  };

  const handleCellClick = (x: number, y: number) => {
    if (solved) return;
    const newGrid = [...grid.map(row => [...row])];
    const cell = newGrid[y][x];

    if (cell.type === 'empty') {
      newGrid[y][x] = { type: 'mirror', direction: 'up' };
    } else if (cell.type === 'mirror') {
      if (cell.direction === 'up') {
        newGrid[y][x] = { ...cell, direction: 'down' };
      } else {
        newGrid[y][x] = { type: 'empty' };
      }
    }

    setGrid(newGrid);
    calculateBeams(newGrid);
  };

  const startLevel = (idx: number) => {
    setCurrentLevel(idx);
    initLevel(idx);
    setGameState('playing');
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden font-sans flex flex-col">
      {/* Header */}
      <div className="p-6 flex justify-between items-center bg-black/40 backdrop-blur-md border-b border-spectral/10 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:text-spectral transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-headline italic text-spectral">ECHOES OF LIGHT</h1>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Resonance Puzzle Protocol</p>
          </div>
        </div>
        {gameState === 'playing' && (
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">Level</div>
              <div className="text-xl font-headline italic text-on-surface">{currentLevel + 1} / {LEVELS.length}</div>
            </div>
            <button onClick={() => initLevel(currentLevel)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all">
              <RotateCcw size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 relative flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {gameState === 'menu' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl w-full space-y-8 text-center"
            >
              <div className="space-y-4">
                <div className="inline-block p-4 bg-spectral/10 rounded-full border border-spectral/30 mb-4">
                  <Lightbulb size={48} className="text-spectral" />
                </div>
                <h2 className="text-5xl font-headline italic text-on-surface tracking-tighter">Harmonize the Void</h2>
                <p className="text-on-surface-variant max-w-md mx-auto">Guide the spectral resonance through the darkness using mirrors and precision.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {LEVELS.map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => startLevel(i)}
                    className="p-8 bg-surface-container-low/40 rounded-3xl border border-on-surface-variant/10 hover:border-spectral/50 transition-all group"
                  >
                    <div className="text-4xl font-headline italic text-on-surface-variant group-hover:text-spectral mb-2">{i + 1}</div>
                    <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">Sequence {i + 1}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="text-center space-y-2 max-w-md">
                <p className="text-on-surface-variant italic text-lg">"{LEVELS[currentLevel].description}"</p>
              </div>

              <div 
                className="relative bg-surface-container-low/20 p-4 rounded-[2rem] border border-on-surface-variant/10 shadow-2xl"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: `repeat(${grid[0]?.length || 0}, 80px)`,
                  gap: '8px'
                }}
              >
                {grid.map((row, y) => row.map((cell, x) => (
                  <button
                    key={`${x}-${y}`}
                    onClick={() => handleCellClick(x, y)}
                    className={`
                      w-20 h-20 rounded-xl border flex items-center justify-center transition-all relative overflow-hidden
                      ${cell.type === 'empty' ? 'bg-black/40 border-white/5 hover:border-white/20' : ''}
                      ${cell.type === 'source' ? 'bg-spectral/10 border-spectral/40' : ''}
                      ${cell.type === 'target' ? 'bg-error/10 border-error/40' : ''}
                      ${cell.type === 'mirror' ? 'bg-white/5 border-white/30 hover:border-spectral/50' : ''}
                    `}
                  >
                    {/* Beam Rendering */}
                    {beams.filter(b => b.x === x && b.y === y).map((b, i) => (
                      <div 
                        key={i}
                        className="absolute bg-spectral shadow-[0_0_15px_#4DEEE1] z-0"
                        style={{
                          width: b.dir === 'left' || b.dir === 'right' ? '100%' : '4px',
                          height: b.dir === 'up' || b.dir === 'down' ? '100%' : '4px',
                          top: b.dir === 'left' || b.dir === 'right' ? 'calc(50% - 2px)' : '0',
                          left: b.dir === 'up' || b.dir === 'down' ? 'calc(50% - 2px)' : '0',
                        }}
                      />
                    ))}

                    <div className="relative z-10">
                      {cell.type === 'source' && <Zap className="text-spectral" size={32} />}
                      {cell.type === 'target' && (
                        <Target 
                          className={beams.some(b => b.x === x && b.y === y) ? "text-spectral animate-pulse" : "text-error/40"} 
                          size={32} 
                        />
                      )}
                      {cell.type === 'mirror' && (
                        <div 
                          className="w-12 h-1 bg-white shadow-[0_0_10px_white] transition-transform duration-300"
                          style={{ transform: `rotate(${cell.direction === 'up' ? '45deg' : '-45deg'})` }}
                        />
                      )}
                    </div>
                  </button>
                )))}
              </div>

              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-xs text-on-surface-variant uppercase tracking-widest">
                  <div className="w-3 h-3 bg-white/20 border border-white/40 rounded-sm" /> Click empty space to place mirror
                </div>
                <div className="flex items-center gap-2 text-xs text-on-surface-variant uppercase tracking-widest">
                  <div className="w-3 h-3 bg-white/20 border border-white/40 rounded-sm rotate-45" /> Click mirror to rotate
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'victory' && (
            <motion.div 
              key="victory"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <div className="text-spectral text-8xl font-headline italic animate-pulse">HARMONIZED</div>
                <h3 className="text-2xl text-on-surface-variant uppercase tracking-[0.4em]">All Resonance Frequencies Aligned</h3>
              </div>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => setGameState('menu')}
                  className="px-8 py-4 bg-spectral text-background font-bold rounded-2xl uppercase tracking-widest hover:shadow-[0_0_30px_rgba(77,238,225,0.4)] transition-all"
                >
                  Sequence Selection
                </button>
                <button 
                  onClick={onBack}
                  className="px-8 py-4 border border-on-surface-variant/20 text-on-surface-variant font-bold rounded-2xl uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Return to Command
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="p-6 text-center text-[10px] uppercase tracking-[0.4em] text-on-surface-variant/40">
        Spectral Resonance Engine v1.0.4 // Echoes of Light
      </div>
    </div>
  );
}
