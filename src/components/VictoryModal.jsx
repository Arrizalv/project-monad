// ═══════════════════════════════════════════════════════════════
// MONAD PANTHEON — Imperial Olympus Victory Modal (End-of-Round)
// ═══════════════════════════════════════════════════════════════
import { useState, useRef, useEffect } from 'react';
import {
  Trophy, Crown, ExternalLink, Loader2, CheckCircle2,
  AlertCircle, RotateCcw, Sparkles, Swords
} from 'lucide-react';
import { DEITIES, GRID_SIZE, MONAD_TESTNET } from '../game/constants.js';
import { claimVictoryOnChain, connectWallet, encodeVictoryData } from '../web3/wallet.js';
import { renderDeityPreview } from '../game/renderer3d.js';

// ── Classical Greek Meander Frieze Component ───────────────────
function GreekMeanderFrieze({ className = '' }) {
  return (
    <div className={`w-full overflow-hidden h-3 flex items-center opacity-85 select-none ${className}`}>
      <svg className="w-full h-3" preserveAspectRatio="repeat" viewBox="0 0 480 12">
        <defs>
          <pattern id="greek-meander-pattern" width="24" height="12" patternUnits="userSpaceOnUse">
            <path
              d="M0,11 H18 V1 H6 V7 H12 V5 H10"
              fill="none"
              stroke="#c99e32"
              strokeWidth="1.8"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </pattern>
        </defs>
        <rect width="100%" height="12" fill="url(#greek-meander-pattern)" />
      </svg>
    </div>
  );
}

// ── Classical Greek Meander Corner Bracket ────────────────────
function GreekCorner({ position = 'top-left' }) {
  const positionClasses = {
    'top-left': 'top-2.5 left-2.5',
    'top-right': 'top-2.5 right-2.5 rotate-90',
    'bottom-left': 'bottom-2.5 left-2.5 -rotate-90',
    'bottom-right': 'bottom-2.5 right-2.5 rotate-180',
  }[position];

  return (
    <div className={`absolute ${positionClasses} pointer-events-none z-20 opacity-70`}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M1 1h20v4H5v16H1V1z" fill="#c99e32" />
        <path d="M7 5h10v2h-6v8h6v2H7V5z" fill="#ffd700" />
      </svg>
    </div>
  );
}

// ── Golden Olympic Laurel Branch SVG ──────────────────────────
function GoldenLaurelBranch({ flip = false }) {
  return (
    <svg
      width="44"
      height="86"
      viewBox="0 0 44 86"
      fill="none"
      className={`filter drop-shadow-[0_0_8px_rgba(255,215,0,0.55)] shrink-0 ${flip ? 'scale-x-[-1]' : ''}`}
    >
      <defs>
        <linearGradient id={`laurelGoldGrad-${flip ? 'r' : 'l'}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff9c4" />
          <stop offset="35%" stopColor="#ffd700" />
          <stop offset="80%" stopColor="#c99e32" />
          <stop offset="100%" stopColor="#8c6014" />
        </linearGradient>
      </defs>
      {/* Main Curved Laurel Branch */}
      <path
        d="M38,82 C28,68 12,48 18,10"
        stroke="#d4af37"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Outer Leaves */}
      <path d="M18,12 C10,8 4,12 8,20 C13,22 18,18 18,12 Z" fill={`url(#laurelGoldGrad-${flip ? 'r' : 'l'})`} stroke="#fff" strokeWidth="0.5" />
      <path d="M16,26 C6,24 2,30 7,37 C13,39 17,33 16,26 Z" fill={`url(#laurelGoldGrad-${flip ? 'r' : 'l'})`} stroke="#fff" strokeWidth="0.5" />
      <path d="M19,42 C8,42 5,50 11,56 C17,58 20,50 19,42 Z" fill={`url(#laurelGoldGrad-${flip ? 'r' : 'l'})`} stroke="#fff" strokeWidth="0.5" />
      <path d="M25,58 C14,60 12,68 18,74 C24,76 27,66 25,58 Z" fill={`url(#laurelGoldGrad-${flip ? 'r' : 'l'})`} stroke="#fff" strokeWidth="0.5" />
      <path d="M33,72 C24,76 24,82 30,86 C36,86 37,78 33,72 Z" fill={`url(#laurelGoldGrad-${flip ? 'r' : 'l'})`} stroke="#fff" strokeWidth="0.5" />
      {/* Inner Leaves */}
      <path d="M22,18 C25,10 33,12 30,20 C28,24 22,22 22,18 Z" fill={`url(#laurelGoldGrad-${flip ? 'r' : 'l'})`} stroke="#fff" strokeWidth="0.5" />
      <path d="M23,33 C27,26 36,28 34,36 C32,40 25,38 23,33 Z" fill={`url(#laurelGoldGrad-${flip ? 'r' : 'l'})`} stroke="#fff" strokeWidth="0.5" />
      <path d="M27,49 C32,43 40,46 38,54 C36,58 29,55 27,49 Z" fill={`url(#laurelGoldGrad-${flip ? 'r' : 'l'})`} stroke="#fff" strokeWidth="0.5" />
      {/* Laurel Berries */}
      <circle cx="19" cy="22" r="2.2" fill="#fff59d" stroke="#b8860b" strokeWidth="0.5" />
      <circle cx="23" cy="38" r="2.4" fill="#fff59d" stroke="#b8860b" strokeWidth="0.5" />
      <circle cx="26" cy="54" r="2.4" fill="#fff59d" stroke="#b8860b" strokeWidth="0.5" />
    </svg>
  );
}

// ── 3D Roman Numeral Metallic Medallion Component ─────────────
function RomanMedallion({ rank }) {
  const numeral = rank === 0 ? 'I' : rank === 1 ? 'II' : rank === 2 ? 'III' : 'IV';

  if (rank === 0) {
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center font-['Cinzel'] font-black text-sm shrink-0"
        style={{
          background: 'linear-gradient(135deg, #ffe066 0%, #d4af37 50%, #b8860b 100%)',
          border: '2px solid #fff9c4',
          boxShadow: '0 3px 0 #784a05, 0 0 12px rgba(255, 215, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.85)',
          color: '#382103',
          textShadow: '0 1px 0 rgba(255,255,255,0.7)',
        }}
        title="Rank I — Supreme Deity"
      >
        {numeral}
      </div>
    );
  }

  if (rank === 1) {
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center font-['Cinzel'] font-black text-sm shrink-0"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 45%, #94a3b8 100%)',
          border: '2px solid #ffffff',
          boxShadow: '0 3px 0 #334155, 0 0 8px rgba(200, 220, 240, 0.45), inset 0 1px 0 #ffffff',
          color: '#0f172a',
          textShadow: '0 1px 0 rgba(255,255,255,0.8)',
        }}
        title="Rank II — Silver Deity"
      >
        {numeral}
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center font-['Cinzel'] font-black text-sm shrink-0"
        style={{
          background: 'linear-gradient(135deg, #fcd34d 0%, #d97706 45%, #78350f 100%)',
          border: '2px solid #fde68a',
          boxShadow: '0 3px 0 #451a03, 0 0 8px rgba(180, 83, 9, 0.35), inset 0 1px 0 #ffffff',
          color: '#291003',
          textShadow: '0 1px 0 rgba(255,255,255,0.5)',
        }}
        title="Rank III — Bronze Deity"
      >
        {numeral}
      </div>
    );
  }

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center font-['Cinzel'] font-black text-xs shrink-0"
      style={{
        background: 'linear-gradient(135deg, #dfcfb2 0%, #a89070 55%, #6f593e 100%)',
        border: '2px solid #f3ebd9',
        boxShadow: '0 3px 0 #423221, inset 0 1px 0 #ffffff',
        color: '#24160a',
        textShadow: '0 1px 0 rgba(255,255,255,0.4)',
      }}
      title="Rank IV — Sandstone Deity"
    >
      {numeral}
    </div>
  );
}

export default function VictoryModal({ gameState, walletAddress, walletMode, onPlayAgain, onBackToLobby }) {
  const [claimStatus, setClaimStatus] = useState('idle'); // idle | loading | success | error
  const [txHash, setTxHash] = useState(null);
  const [claimError, setClaimError] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [simulatedClaim, setSimulatedClaim] = useState(false);
  const [simulatedData, setSimulatedData] = useState('');

  const canvasRef = useRef(null);

  if (!gameState || !gameState.winner) return null;

  const { winner, players } = gameState;
  const winnerDeity = DEITIES[winner.deityIndex];
  const totalTiles = GRID_SIZE * GRID_SIZE - 16;
  const sorted = Object.values(players).sort((a, b) => b.tileCount - a.tileCount);

  // Mount 3D deity preview inside the victory header
  useEffect(() => {
    const timer = setTimeout(() => {
      if (canvasRef.current && winner) {
        renderDeityPreview(canvasRef.current, winner.deityIndex);
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [winner?.deityIndex]);

  const handleClaim = async () => {
    setClaimStatus('loading');
    setClaimError('');
    setSimulatedClaim(false);

    try {
      if (walletMode === 'simulated' && (typeof window === 'undefined' || !window.ethereum)) {
        if (contractAddress.trim() && !/^0x[a-fA-F0-9]{40}$/.test(contractAddress.trim())) {
          throw new Error('Enter a valid contract address, or leave it empty to use the simulated wallet address.');
        }
        setSimulatedData(encodeVictoryData(winnerDeity.name, winner.tileCount));
        setSimulatedClaim(true);
        setClaimStatus('success');
        return;
      }
      let from = walletAddress;
      if (walletMode !== 'wallet' || !/^0x[a-fA-F0-9]{40}$/.test(from || '')) {
        const connection = await connectWallet();
        from = connection.address;
      }
      const { txHash: hash } = await claimVictoryOnChain(
        from,
        winner.tileCount,
        winnerDeity.name,
        contractAddress.trim()
      );
      setTxHash(hash);
      setClaimStatus('success');
    } catch (err) {
      setClaimError(err.message || 'Transaction failed');
      setClaimStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md overflow-y-auto">
      {/* 3D Imperial Travertine Marble & Gold Shrine Tablet Container */}
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden my-auto select-none"
        style={{
          background: 'linear-gradient(165deg, #fbf6ec 0%, #eadbc2 55%, #d6be98 100%)',
          border: '3px solid #c99e32',
          boxShadow: '0 12px 0 #6e5219, 0 25px 60px rgba(20, 14, 5, 0.65), inset 0 2px 0 #fffdf7',
        }}
      >
        {/* Classical Greek Fret Corner Accents */}
        <GreekCorner position="top-left" />
        <GreekCorner position="top-right" />
        <GreekCorner position="bottom-left" />
        <GreekCorner position="bottom-right" />

        {/* ── Top Golden Temple Pediment Trim & Architectural Header ── */}
        <div className="relative w-full bg-[#271a0b] border-b-2 border-[#c99e32] py-1.5 px-4 flex items-center justify-between text-[#e8d5b5]">
          <div className="flex items-center gap-2 pl-4">
            <div className="w-2 h-2 rotate-45 bg-[#ffd700] shadow-[0_0_6px_#ffd700]" />
            <span className="font-['Cinzel'] font-extrabold text-[10px] tracking-[0.25em] text-[#f2e2cb] uppercase">
              Temple of the Sun • Mount Olympus
            </span>
          </div>
          <div className="flex items-center gap-1.5 pr-4 text-[#ffd700]">
            <Crown size={12} className="text-[#ffd700]" />
            <span className="font-['Cinzel'] font-black text-[9px] tracking-widest text-[#ffd700]">
              MONAD ARENA
            </span>
          </div>
        </div>

        {/* Top Greek Meander Frieze */}
        <GreekMeanderFrieze />

        {/* ── HEROIC "SUPREME DEITY" HEADER WITH 3D MODEL & LAURELS ── */}
        <div
          className="relative py-4 px-6 text-center overflow-hidden border-b-3 border-[#d4af37]"
          style={{
            background: 'radial-gradient(circle at 50% 15%, #3d2c14 0%, #1c150b 100%)',
            boxShadow: 'inset 0 6px 18px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {/* Animated Golden Embers / Sparkles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(14)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float"
                style={{
                  left: `${(i * 19) % 100}%`,
                  top: `${(i * 23) % 100}%`,
                  animationDuration: `${(i % 3) + 2.5}s`,
                  animationDelay: `${(i % 4) * 0.5}s`,
                }}
              >
                <Sparkles size={8} style={{ color: '#ffd700', opacity: 0.35 }} />
              </div>
            ))}
          </div>

          {/* Radiant Sunburst Glow Behind Pedestal */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2 w-44 h-44 rounded-full pointer-events-none opacity-30 bg-[radial-gradient(circle,#ffd700_0%,#c99e32_45%,transparent_75%)] blur-md" />

          {/* Rotating Sunburst Rays SVG */}
          <svg
            className="absolute left-1/2 -translate-x-1/2 -top-4 w-48 h-48 pointer-events-none opacity-20 animate-spin"
            style={{ animationDuration: '35s' }}
            viewBox="0 0 100 100"
          >
            <g fill="none" stroke="#ffd700" strokeWidth="1" strokeDasharray="3 7">
              <circle cx="50" cy="50" r="46" />
              <circle cx="50" cy="50" r="38" />
            </g>
            {[...Array(16)].map((_, i) => (
              <line
                key={i}
                x1="50"
                y1="50"
                x2={50 + 48 * Math.cos((i * 22.5 * Math.PI) / 180)}
                y2={50 + 48 * Math.sin((i * 22.5 * Math.PI) / 180)}
                stroke="#ffd700"
                strokeWidth="1.2"
                strokeOpacity="0.5"
              />
            ))}
          </svg>

          {/* Central 3D Deity Shrine Pedestal flanked by Golden Olympic Laurel Wreaths */}
          <div className="relative flex items-center justify-center gap-1 sm:gap-2 my-1">
            <GoldenLaurelBranch />

            {/* Circular Shrine Pedestal with live rotating 3D model */}
            <div
              className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
              style={{
                border: '3px solid #ffd700',
                background: 'radial-gradient(circle at 50% 30%, #4a3617 0%, #150f06 100%)',
                boxShadow: '0 0 22px rgba(255,215,0,0.55), inset 0 3px 10px rgba(0,0,0,0.85)',
              }}
            >
              <canvas
                ref={canvasRef}
                width={88}
                height={88}
                className="w-full h-full block"
              />
            </div>

            <GoldenLaurelBranch flip />
          </div>

          {/* Majestic Classical Roman Titles */}
          <div className="relative mt-1">
            <h2
              className="text-lg sm:text-xl font-black tracking-[0.24em] font-['Cinzel'] uppercase"
              style={{
                background: 'linear-gradient(180deg, #fff9db 0%, #ffd700 40%, #e6a817 70%, #996515 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 10px rgba(255, 215, 0, 0.65))',
              }}
            >
              SUPREME DEITY
            </h2>
            <p
              className="text-2xl sm:text-3xl font-black mt-0.5 font-['Cinzel'] tracking-wide"
              style={{
                color: '#fff9ed',
                textShadow: `0 2px 4px rgba(0,0,0,0.95), 0 0 16px ${winnerDeity.color}88, 0 0 30px rgba(245, 158, 11, 0.45)`,
              }}
            >
              {winnerDeity.name}
            </p>
            <p
              className="text-[10px] sm:text-[11px] font-semibold mt-0.5 uppercase tracking-[0.2em] font-['Cinzel']"
              style={{ color: '#d8c39e' }}
            >
              {winnerDeity.title}
            </p>
          </div>
        </div>

        {/* ── 3D ENGRAVED STONE STANDINGS & MEDALLIONS ── */}
        <div className="px-5 py-3">
          <div className="flex items-center justify-between mb-2 border-b border-[#b58a43]/35 pb-1.5">
            <h3 className="text-xs font-black font-['Cinzel'] uppercase tracking-widest text-[#4d3619] flex items-center gap-2">
              <Swords size={14} className="text-[#996515]" />
              Final Standings
            </h3>
            <span className="text-[10px] font-['Cinzel'] text-[#785a2b] font-bold uppercase tracking-wider">
              Imperial Arena Results
            </span>
          </div>

          <div className="space-y-1.5">
            {sorted.map((player, idx) => {
              const deity = DEITIES[player.deityIndex];
              const pct = totalTiles > 0 ? ((player.tileCount / totalTiles) * 100).toFixed(1) : '0.0';
              const isWin = idx === 0;

              return (
                <div
                  key={player.id}
                  className="relative px-3 py-1.5 rounded-xl transition-all"
                  style={
                    isWin
                      ? {
                          background: 'linear-gradient(90deg, #fffbeb 0%, #fde68a 100%)',
                          border: '2px solid #d97706',
                          boxShadow: '0 3px 10px rgba(217, 119, 6, 0.25), inset 0 1px 0 #fffdf7',
                        }
                      : {
                          background: 'rgba(255, 250, 240, 0.82)',
                          border: '1.5px solid #c9b48c',
                          boxShadow: '0 2px 4px rgba(60, 40, 15, 0.08), inset 0 1px 0 #ffffff',
                        }
                  }
                >
                  {/* Victor Crest Ribbon */}
                  {isWin && (
                    <div className="absolute -top-2 right-3 px-2 py-0.5 rounded-full text-[9px] font-['Cinzel'] font-black uppercase tracking-widest bg-gradient-to-r from-[#b45309] to-[#d97706] text-[#fffbeb] border border-[#fef08a] shadow-[0_2px_4px_rgba(0,0,0,0.25)] flex items-center gap-1">
                      <Crown size={10} className="text-[#fef08a]" /> Victor
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <RomanMedallion rank={idx} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="font-['Cinzel'] font-extrabold text-sm truncate"
                          style={{ color: isWin ? '#422006' : '#2b1b0e' }}
                        >
                          {deity.name}
                        </span>
                        <div className="text-right shrink-0">
                          <span className="font-['Cinzel'] font-black text-sm text-[#3d2b14] mr-1.5">
                            {pct}%
                          </span>
                          <span className="font-['Cinzel'] font-bold text-[10px] text-[#785a2b] uppercase">
                            ({player.tileCount} TILES)
                          </span>
                        </div>
                      </div>

                      {/* Inlaid Gemstone Territory Bar */}
                      <div className="w-full h-1.5 rounded-full mt-1 p-[1px] bg-[#3a2810]/20 border border-[#b58a43]/40 shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
                          style={{
                            width: `${Math.max(Number(pct), 3)}%`,
                            background: `linear-gradient(90deg, ${deity.color}, ${deity.accent || deity.color})`,
                            boxShadow: `0 0 8px ${deity.color}99`,
                          }}
                        >
                          {/* Gemstone gloss reflection strip */}
                          <div className="absolute inset-x-0 top-0 h-[45%] bg-white/45 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── POWERFUL "CLAIM VICTORY ON-CHAIN" ALTAR ── */}
        <div className="px-5 py-3 border-t-2 border-[#c99e32]/40 bg-[#f7eedc]/60">
          {claimStatus === 'idle' && (
            <div className="space-y-2.5">
              <label className="block text-[11px] font-['Cinzel'] font-bold text-[#5c4322] tracking-wide">
                📜 Temple Smart Contract Address
                <span className="block font-sans text-[10px] font-normal text-[#785e3a] mt-0.5">
                  (Optional — leave blank for instant self-attestation on Monad Testnet)
                </span>
                <input
                  value={contractAddress}
                  onChange={(event) => setContractAddress(event.target.value)}
                  placeholder="0x…"
                  spellCheck="false"
                  className="mt-1 w-full rounded-lg border border-[#b48a2e] bg-[#231b10] px-3 py-1.5 font-mono text-xs text-[#fde68a] placeholder-[#8c6b2d] outline-none shadow-[inset_0_2px_5px_rgba(0,0,0,0.6)] focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]"
                />
              </label>

              <button
                onClick={handleClaim}
                className="group relative w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-['Cinzel'] font-black text-sm uppercase tracking-wider
                  border-2 border-[#fde047] text-[#fffdf2] transition-all cursor-pointer
                  shadow-[0_5px_0_#5b3708,0_10px_20px_rgba(217,119,6,0.45)]
                  active:translate-y-1 active:shadow-[0_1px_0_#5b3708]
                  overflow-hidden animate-gold-sweep"
                style={{
                  background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 50%, #92400e 100%)',
                  textShadow: '0 1px 3px rgba(0,0,0,0.7), 0 0 10px rgba(255,215,0,0.4)',
                }}
              >
                <Trophy size={17} className="text-[#fff3a8] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                <span>Claim Victory On-Chain (Monad)</span>
              </button>

              {walletMode === 'simulated' && (
                <p className="text-center font-['Cinzel'] text-[10px] text-[#85530e] font-semibold">
                  ⚡ Simulation is active — broadcasts a zero-gas simulation payload on Monad.
                </p>
              )}
            </div>
          )}

          {claimStatus === 'loading' && (
            <div className="flex flex-col items-center justify-center py-3 text-[#784a05] gap-1.5">
              <Loader2 size={22} className="animate-spin text-[#d97706]" />
              <span className="font-['Cinzel'] font-extrabold text-xs tracking-wide">
                Inscribing Victory on Monad Testnet Ledger...
              </span>
              <span className="text-[10px] text-[#8c6014]">
                Consulting the Oracle & confirming block inclusion...
              </span>
            </div>
          )}

          {claimStatus === 'success' && simulatedClaim && (
            <div className="space-y-2 p-2.5 rounded-xl border border-[#b48a2e] bg-[#231b10] text-[#fde68a]">
              <div className="flex items-center gap-2 text-[#fbbf24] text-xs font-['Cinzel'] font-bold">
                <CheckCircle2 size={15} />
                <span>Sacred Inscription Simulated Successfully!</span>
              </div>
              <p className="text-[10px] text-[#d4af37]/80 font-mono">
                Encoded victory payload (ABI packed):
              </p>
              <code className="block break-all rounded bg-black/50 p-1.5 text-[9px] text-[#fef08a] font-mono border border-[#b48a2e]/40">
                {simulatedData}
              </code>
            </div>
          )}

          {claimStatus === 'success' && txHash && !simulatedClaim && (
            <div className="space-y-1.5 p-2.5 rounded-xl border-2 border-[#16a34a] bg-[#14532d]/20 text-[#15803d]">
              <div className="flex items-center gap-2 text-green-700 text-xs font-['Cinzel'] font-black">
                <CheckCircle2 size={16} className="text-green-600" />
                <span>Triumph Forever Inscribed On-Chain!</span>
              </div>
              <a
                href={`${MONAD_TESTNET.blockExplorerUrls[0]}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[#b45309] hover:text-[#78350f] font-mono font-bold transition-colors"
              >
                <ExternalLink size={12} />
                <span className="truncate">Transaction Hash: {txHash}</span>
              </a>
            </div>
          )}

          {claimStatus === 'error' && (
            <div className="space-y-1.5 p-2.5 rounded-xl border border-red-500/40 bg-red-900/10 text-red-800">
              <div className="flex items-center gap-2 text-xs font-['Cinzel'] font-bold">
                <AlertCircle size={15} className="text-red-600 shrink-0" />
                <span className="text-xs">{claimError}</span>
              </div>
              <button
                onClick={() => setClaimStatus('idle')}
                className="text-xs font-['Cinzel'] font-extrabold text-[#784a05] hover:text-[#3d2303] underline cursor-pointer"
              >
                Return to Altar (Try Again)
              </button>
            </div>
          )}
        </div>

        {/* ── 3D CARVED TRAVERTINE STONE ACTION BUTTONS ── */}
        <div className="flex gap-2.5 px-5 pb-4 pt-1">
          <button
            onClick={onPlayAgain}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl
              border-2 border-[#a38960] text-xs font-['Cinzel'] font-extrabold text-[#2c2011]
              shadow-[0_4px_0_#755f3d,0_6px_12px_rgba(45,30,10,0.18)]
              hover:brightness-105 transition-all cursor-pointer
              active:translate-y-1 active:shadow-[0_1px_0_#755f3d]"
            style={{
              background: 'linear-gradient(180deg, #f5ebd6 0%, #d8c39e 100%)',
            }}
          >
            <RotateCcw size={14} className="text-[#634824]" />
            <span>Play Again</span>
          </button>
          <button
            onClick={onBackToLobby}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl
              border-2 border-[#a38960] text-xs font-['Cinzel'] font-extrabold text-[#2c2011]
              shadow-[0_4px_0_#755f3d,0_6px_12px_rgba(45,30,10,0.18)]
              hover:brightness-105 transition-all cursor-pointer
              active:translate-y-1 active:shadow-[0_1px_0_#755f3d]"
            style={{
              background: 'linear-gradient(180deg, #f5ebd6 0%, #d8c39e 100%)',
            }}
          >
            <span>Back to Lobby</span>
          </button>
        </div>
      </div>
    </div>
  );
}
