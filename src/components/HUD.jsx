// ═══════════════════════════════════════════════════════════════
// MONAD PANTHEON — Classical marble and bronze HUD
// Position: fixed full-screen overlay, pointer-events: none
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useRef } from 'react';
import { DEITIES, GRID_SIZE } from '../game/constants.js';

const TOTAL = GRID_SIZE * GRID_SIZE - 16;
const DEITY_ICONS = ['⚡', '𓂀', '🐙', '☀'];
const ROMAN_RANKS = ['I', 'II', 'III', 'IV'];
const SKILL_NAMES = ['Lightning Blink', 'Golden Sandstorm', 'Ink Nova', 'Solar Dash'];

export default function HUD({ gameState, onSkill, playerId = 'local' }) {
  const [tick, setTick] = useState(0);
  const rafRef = useRef(null);

  // Force re-render every 250ms for live cooldown
  useEffect(() => {
    const id = setInterval(() => setTick(n => n + 1), 250);
    return () => clearInterval(id);
  }, []);

  if (!gameState) return null;

  const { timeRemaining, players } = gameState;
  const sorted = Object.values(players).sort((a, b) => b.tileCount - a.tileCount);
  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const isUrgent = timeRemaining <= 10;
  const localPlayer = players[playerId];
  const localDeity = localPlayer ? DEITIES[localPlayer.deityIndex] : null;
  const cooldown = localPlayer?.skillReadyAt ? Math.max(0, Math.ceil((localPlayer.skillReadyAt - Date.now()) / 1000)) : 0;
  const localRank = sorted.findIndex(p => p.id === (localPlayer?.id)) + 1;

  return (
    <div
      id="esports-hud"
      style={{
        position: 'fixed', inset: 0, zIndex: 20,
        pointerEvents: 'none',
        fontFamily: "Georgia, 'Times New Roman', serif",
        overflow: 'hidden',
      }}
    >
      {/* ════════════════════════════════════════
          TOP BAR — 4 Angled Broadcast Banners
          ════════════════════════════════════════ */}
      <div className="hud-score-row" style={{ position: 'absolute', top: 8, left: 8, right: 8, display: 'flex', height: 76, gap: 6 }}>
        {sorted.map((player, idx) => {
          const d = DEITIES[player.deityIndex];
          const pct = TOTAL > 0 ? (player.tileCount / TOTAL) * 100 : 0;
          const isFirst = idx === 0;
          return (
            <div
              key={player.id}
              id={`hud-banner-${idx}`}
              className="hud-score-card"
              style={{
                flex: 1,
                position: 'relative',
                clipPath: 'none',
                background: 'linear-gradient(180deg, #f3ead8 0%, #dccab0 100%)',
                border: '2px solid #b58a43',
                borderBottom: '4px solid #785c28',
                borderRadius: 8,
                padding: '7px 16px 8px',
                overflow: 'hidden',
                marginRight: 0,
                zIndex: 4 - idx,
                boxShadow: '0 6px 0 #785c28, 0 12px 24px rgba(0,0,0,0.24)',
              }}
            >
              {isFirst && (
                <div className="hud-score-highlight" style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: 'radial-gradient(ellipse at 50% 0%, rgba(181,138,67,0.22) 0%, transparent 70%)',
                }} />
              )}

              <div className="hud-score-content" style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                {/* Deity Crest */}
                <div className="hud-player-crest" style={{
                  position: 'relative', width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: 'linear-gradient(145deg, #fff8e9, #c8ad7e)',
                  border: '2px solid #b58a43',
                  boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.75), 0 2px 3px rgba(74,52,25,0.3)',
                  color: '#57432a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17, marginTop: 2,
                }}>
                  {DEITY_ICONS[player.deityIndex]}
                  <span className="hud-rank-medallion" style={{
                    position: 'absolute', right: -5, bottom: -5, width: 16, height: 16,
                    borderRadius: '50%', border: '1px solid #8f682e',
                    background: 'linear-gradient(145deg, #fff1bd, #c69b50)',
                    color: '#49351d', fontSize: 8, fontWeight: 900,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}>
                    {ROMAN_RANKS[idx]}
                  </span>
                </div>

                <div style={{ minWidth: 0 }}>
                  {/* Rank + Name */}
                  <div className="hud-score-name" style={{
                    fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
                    color: '#705632',
                    lineHeight: 1, marginBottom: 1,
                    textShadow: '0 1px 0 rgba(255,255,255,0.7)',
                  }}>
                    {isFirst ? '♛ ' : ''}{d.name.split('-')[0]}
                  </div>

                  {/* Big territory % */}
                  <div className="hud-score-percent" style={{
                    fontSize: 20, fontWeight: 900, fontStyle: 'italic', lineHeight: 1,
                    color: '#392918',
                    textShadow: '0 1px 0 rgba(255,255,255,0.7)',
                    letterSpacing: '-0.02em',
                  }}>
                    {pct.toFixed(1)}<span style={{ fontSize: 11, fontStyle: 'normal', opacity: 0.8 }}>%</span>
                  </div>

                  {/* Tile count */}
                  <div className="hud-score-count" style={{
                    fontSize: 9, fontWeight: 700, color: '#896a3e',
                    letterSpacing: '0.08em', marginTop: 1,
                  }}>
                    {player.tileCount} TILES
                  </div>
                </div>

                {/* Power-up indicator */}
                {player.hasPowerUp && (
                  <div style={{
                    position: 'absolute', top: 0, right: 4,
                    fontSize: 10, color: '#9b6d18',
                    animation: 'hud-pulse 0.6s ease-in-out infinite',
                  }}>⚡</div>
                )}
              </div>

              <div style={{ height: 7, background: '#9c8765', border: '1px solid #856b43', borderRadius: 4, marginTop: 5, overflow: 'hidden', padding: 1 }}>
                <div style={{
                  height: '100%', width: `${Math.max(pct, 1.5)}%`,
                  background: `linear-gradient(90deg, ${d.color} 0%, ${d.accent || d.color} 100%)`,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
                  borderRadius: 3,
                  transition: 'width 0.35s ease-out',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.22), transparent)',
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top-center Olympic sundial chronometer */}
      <div className="hud-sundial" style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'flex-start', zIndex: 10,
        pointerEvents: 'none',
      }}>
        <div className="hud-sundial-medallion" style={{ position: 'relative', width: 82, height: 82, flexShrink: 0, filter: 'drop-shadow(0 5px 4px rgba(69,47,18,0.35))' }}>
          <svg width="82" height="82" viewBox="0 0 82 82" style={{ position: 'absolute', top: 0, left: 0 }}>
            <defs>
              <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isUrgent ? '#f2d0bc' : '#fff7e8'} stopOpacity="1" />
                <stop offset="100%" stopColor={isUrgent ? '#a94b37' : '#d7bc8c'} stopOpacity="1" />
              </linearGradient>
            </defs>
            <circle cx="41" cy="41" r="37" fill="url(#shieldGrad)" stroke="#9b722f" strokeWidth="4" />
            <circle cx="41" cy="41" r="31" fill="none" stroke="#d5aa56" strokeWidth="1.5" />
            <path d="M41 9v8M41 65v8M9 41h8M65 41h8" stroke="#9b722f" strokeWidth="2" />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
          }}>
            <div style={{
              fontSize: 16, fontFamily: 'Georgia, serif', fontWeight: 900,
              color: isUrgent ? '#7c261e' : '#49351d',
              textShadow: '0 1px 0 rgba(255,255,255,0.7)',
              letterSpacing: '0.04em',
              animation: isUrgent ? 'hud-pulse 0.45s ease-in-out infinite' : 'none',
            }}>
              {timeStr}
            </div>
            <div style={{ fontSize: 7, color: '#806744', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              BLITZ
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          BOTTOM CENTER — MOBA Skill Bar
          ════════════════════════════════════════ */}
      {localDeity && (
        <div style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'flex-end', gap: 8,
          padding: '0 0 10px',
          pointerEvents: 'auto',
        }}>
          {/* WASD Key Grid */}
          <div style={{
            background: 'linear-gradient(135deg, #f3ead8, #dccab0)',
            border: '2px solid #b58a43',
            borderTop: '3px solid #d5aa56',
            borderRadius: 8,
            padding: '8px 12px 10px',
            boxShadow: '0 5px 0 #785c28, 0 8px 18px rgba(0,0,0,0.22)',
          }}>
            <div style={{ fontSize: 8, color: '#806744', textAlign: 'center', marginBottom: 5, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Move</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,22px)', gridTemplateRows: 'repeat(2,22px)', gap: 2, justifyContent: 'center' }}>
              {[null, 'W', null, 'A', 'S', 'D'].map((k, i) => (
                <div key={i} style={{
                  height: 22, borderRadius: 5,
                  background: k ? '#e8d9bd' : 'transparent',
                  border: k ? '1px solid #b58a43' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: '#49351d',
                  fontFamily: 'monospace',
                }}>
                  {k}
                </div>
              ))}
            </div>
          </div>

          {/* Deity Portrait */}
          <div style={{
            background: 'linear-gradient(135deg, #fff8e9, #dccab0)',
            border: '2px solid #b58a43',
            borderTop: '3px solid #d5aa56',
            borderRadius: 8,
            padding: '10px 16px 12px',
            textAlign: 'center',
            boxShadow: '0 5px 0 #785c28, 0 8px 18px rgba(0,0,0,0.22)',
            minWidth: 80,
          }}>
            <div style={{
              width: 46, height: 46, borderRadius: '50%', margin: '0 auto 6px',
              background: 'linear-gradient(145deg, #fff8e9, #c8ad7e)',
              border: '2px solid #b58a43',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
              boxShadow: 'inset 0 1px 4px rgba(255,255,255,0.7)',
            }}>
              {DEITY_ICONS[localPlayer?.deityIndex ?? 0]}
            </div>
            <div style={{
              fontSize: 8, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#604821', textShadow: '0 1px 0 rgba(255,255,255,0.7)',
            }}>
              {localDeity.name.split('-')[0]}
            </div>
            <div style={{
              fontSize: 10, fontWeight: 900, fontStyle: 'italic', marginTop: 3,
              color: localRank === 1 ? '#9b6d18' : '#806744',
              textShadow: '0 1px 0 rgba(255,255,255,0.7)',
            }}>
              {localRank === 1 ? '👑 #1' : `#${localRank}`}
            </div>
          </div>

          {/* Divine Skill Button */}
          <button
            id="divine-skill-btn"
            onClick={onSkill}
            disabled={!gameState.isRunning || cooldown > 0}
            style={{
              background: cooldown > 0
                ? 'linear-gradient(135deg, #e4d6bd, #cbb997)'
                : 'linear-gradient(135deg, #f3ead8, #dccab0)',
              border: '2px solid #b58a43',
              borderTop: '3px solid #d5aa56',
              borderRadius: 8,
              padding: '10px 20px 12px',
              textAlign: 'center',
              cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
              boxShadow: '0 5px 0 #785c28, 0 8px 18px rgba(0,0,0,0.22)',
              minWidth: 110,
              transition: 'all 0.2s ease',
              pointerEvents: 'auto',
            }}
          >
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.18em', color: '#806744', marginBottom: 3, textTransform: 'uppercase' }}>
              [SPACE]
            </div>

            {cooldown > 0 ? (
              <>
                <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'monospace', color: '#604821', lineHeight: 1 }}>
                  {cooldown}s
                </div>
                <div style={{ fontSize: 8, color: '#806744', marginTop: 3, letterSpacing: '0.1em' }}>
                  RECHARGING
                </div>
                {/* Cooldown drain bar */}
                <div style={{ height: 3, background: '#a8916b', borderRadius: 2, marginTop: 4 }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.max(((cooldown) / 5) * 100, 5)}%`,
                    background: localDeity.color,
                    borderRadius: 2,
                    opacity: 0.5,
                    transition: 'width 0.25s ease',
                  }} />
                </div>
              </>
            ) : (
              <>
                <div style={{
                  fontSize: 11, fontWeight: 900, color: '#49351d', letterSpacing: '0.06em',
                  textShadow: '0 1px 0 rgba(255,255,255,0.7)',
                  lineHeight: 1, marginBottom: 2,
                }}>
                  DIVINE DASH
                </div>
                <div style={{
                  fontSize: 8, fontWeight: 700, color: '#896a3e',
                  letterSpacing: '0.14em', textShadow: '0 1px 0 rgba(255,255,255,0.7)',
                  textTransform: 'uppercase',
                }}>
                  ✦ READY ✦
                </div>
              </>
            )}
          </button>

          {/* Live Stats Panel */}
          <div style={{
            background: 'linear-gradient(135deg, #f3ead8, #dccab0)',
            border: '2px solid #b58a43',
            borderTop: '3px solid #d5aa56',
            borderRadius: 8,
            padding: '8px 14px 10px',
            boxShadow: '0 5px 0 #785c28, 0 8px 18px rgba(0,0,0,0.22)',
            textAlign: 'center',
            minWidth: 78,
          }}>
            <div style={{ fontSize: 7, color: '#806744', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>Territory</div>
            <div style={{
              fontSize: 18, fontWeight: 900, fontStyle: 'italic',
              color: localDeity.color,
              textShadow: '0 1px 0 rgba(255,255,255,0.7)',
              lineHeight: 1,
            }}>
              {TOTAL > 0 ? ((localPlayer?.tileCount || 0) / TOTAL * 100).toFixed(1) : '0.0'}
              <span style={{ fontSize: 9, fontStyle: 'normal', opacity: 0.7 }}>%</span>
            </div>
            <div style={{ fontSize: 9, color: '#806744', marginTop: 3, fontFamily: 'monospace' }}>
              {localPlayer?.tileCount || 0} tiles
            </div>
          </div>
        </div>
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes hud-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
