// ═══════════════════════════════════════════════════════════════
// MONAD PANTHEON — Deity Selection Card (3D Preview)
// ═══════════════════════════════════════════════════════════════
import { useRef, useEffect } from 'react';
import { renderDeityPreview } from '../game/renderer3d.js';
import { Shield } from 'lucide-react';

export default function DeityCard({ deity, index, selected, onSelect }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Give the canvas a moment to mount, then launch the 3D preview loop
    const id = setTimeout(() => {
      if (canvasRef.current) {
        renderDeityPreview(canvasRef.current, index);
      }
    }, 50);
    return () => clearTimeout(id);
  }, [index]);

  const isActive = selected === index;

  return (
    <button
      onClick={() => onSelect(index)}
      className={`
        deity-card group relative flex flex-col items-center p-4 rounded-xl border-2
        transition-all duration-300 cursor-pointer
        ${isActive
          ? 'scale-105'
          : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
        }
      `}
      style={isActive ? {
        borderColor: '#b58a43',
        background: `linear-gradient(160deg, #fff8e9 0%, #e8d9bd 100%)`,
        boxShadow: '0 7px 0 #785c28, 0 12px 22px rgba(69,47,18,0.24)',
      } : {
        borderColor: '#cbb997',
        background: 'linear-gradient(160deg, #f6eddd 0%, #dfcfb2 100%)',
        boxShadow: '0 5px 0 #9b8158, 0 10px 18px rgba(69,47,18,0.18)',
      }}
    >
      {/* Selection ring */}
      {isActive && (
        <div
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: deity.color, boxShadow: `0 0 10px ${deity.color}` }}
        >
          <Shield size={12} className="text-white" />
        </div>
      )}

      {/* 3-D Preview canvas */}
      <div
        className="relative mb-3 rounded-xl overflow-hidden"
        style={{
          width: 100, height: 100,
          background: 'radial-gradient(ellipse at center, #fff9eb 0%, #cbb997 100%)',
          boxShadow: 'inset 0 2px 8px rgba(88,62,31,0.2)',
          border: '1px solid #b58a43',
        }}
      >
        <canvas
          ref={canvasRef}
          width={100}
          height={100}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>

      {/* Name */}
      <h3
        className="font-bold text-sm text-center leading-tight"
        style={{ color: '#44331f', textShadow: isActive ? '0 1px 0 #fff8e9' : 'none', fontFamily: 'Georgia, serif' }}
      >
        {deity.name}
      </h3>

      {/* Title */}
      <p className="text-[10px] mt-1 text-center leading-snug"
        style={{ color: '#746044' }}
      >
        {deity.title}
      </p>

      {/* Lore tooltip on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg
        bg-[#3a2b1b]/95 border border-[#b58a43] text-[10px] text-[#f6eddd] w-48 text-center
        opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        {deity.lore}
      </div>
    </button>
  );
}
