// ═══════════════════════════════════════════════════════════════
// MONAD PANTHEON — Game Canvas (3D WebGL container + Mobile D-Pad)
// ═══════════════════════════════════════════════════════════════
import { useRef, useEffect, useCallback } from 'react';
import { renderGame } from '../game/renderer3d.js';
import { CANVAS_SIZE } from '../game/constants.js';

export default function GameCanvas({ gameState, onMove, onSkill, playerId = 'local' }) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // ── Render loop ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;

    const render = () => {
      renderGame(canvas, gameState);
      // Screen-shake on impact
      canvas.style.transform = gameState.shakeUntil > Date.now()
        ? `translate(${(Math.random() - 0.5) * 7}px, ${(Math.random() - 0.5) * 7}px)`
        : '';
      animFrameRef.current = requestAnimationFrame(render);
    };
    render();
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [gameState]);

  // ── Keyboard controls ────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'BUTTON'].includes(e.target.tagName)) return;
      if (e.code === 'Space') { e.preventDefault(); if (!e.repeat) onSkill(); return; }
      const keyMap = {
        ArrowUp: { dx: 0, dy: -1 }, ArrowDown: { dx: 0, dy: 1 },
        ArrowLeft: { dx: -1, dy: 0 }, ArrowRight: { dx: 1, dy: 0 },
        w: { dx: 0, dy: -1 }, W: { dx: 0, dy: -1 },
        s: { dx: 0, dy: 1 },  S: { dx: 0, dy: 1 },
        a: { dx: -1, dy: 0 }, A: { dx: -1, dy: 0 },
        d: { dx: 1, dy: 0 },  D: { dx: 1, dy: 0 },
      };
      const move = keyMap[e.key];
      if (move) { e.preventDefault(); onMove(move.dx, move.dy); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onMove, onSkill]);

  // ── Touch D-pad ──────────────────────────────────────────────
  const handleDPad = useCallback((dx, dy) => { onMove(dx, dy); }, [onMove]);

  return (
    <div className="flex flex-col items-center">
      {/* 3D WebGL Canvas */}
      <div
        className="arena-canvas-frame relative rounded-xl overflow-hidden"
        style={{ boxShadow: '0 12px 34px rgba(69,47,18,0.28)' }}
      >
        <canvas
          ref={canvasRef}
          id="arena-canvas"
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="block"
          style={{ width: '100%', maxWidth: CANVAS_SIZE + 'px', aspectRatio: '1' }}
        />
      </div>

      {/* Mobile D-Pad (hidden on desktop) */}
      <div className="mt-3 sm:hidden">
        <div className="grid grid-cols-3 gap-1 w-32">
          <div />
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDPad(0, -1); }}
            onMouseDown={() => handleDPad(0, -1)}
            className="w-10 h-10 rounded-lg bg-white/10 active:bg-white/25 flex items-center justify-center text-white/60 text-lg font-bold transition-all cursor-pointer mx-auto"
          >▲</button>
          <div />
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDPad(-1, 0); }}
            onMouseDown={() => handleDPad(-1, 0)}
            className="w-10 h-10 rounded-lg bg-white/10 active:bg-white/25 flex items-center justify-center text-white/60 text-lg font-bold transition-all cursor-pointer"
          >◄</button>
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mx-auto">
            <span className="text-white/20 text-xs">●</span>
          </div>
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDPad(1, 0); }}
            onMouseDown={() => handleDPad(1, 0)}
            className="w-10 h-10 rounded-lg bg-white/10 active:bg-white/25 flex items-center justify-center text-white/60 text-lg font-bold transition-all cursor-pointer"
          >►</button>
          <div />
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDPad(0, 1); }}
            onMouseDown={() => handleDPad(0, 1)}
            className="w-10 h-10 rounded-lg bg-white/10 active:bg-white/25 flex items-center justify-center text-white/60 text-lg font-bold transition-all cursor-pointer mx-auto"
          >▼</button>
          <div />
        </div>
        <p className="text-center text-[9px] text-gray-600 mt-1">Touch D-Pad</p>
      </div>
    </div>
  );
}
