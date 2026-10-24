// ═══════════════════════════════════════════════════════════════
// MONAD PANTHEON — Smart Contract Sacred Archive Tablet
// ═══════════════════════════════════════════════════════════════
import { X, FileCode, ExternalLink, Copy, Check, Scroll } from 'lucide-react';
import { useState } from 'react';
import { SOLIDITY_SOURCE, CONTRACT_ADDRESS } from '../game/constants.js';

export default function ContractModal({ onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SOLIDITY_SOURCE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md"
      onClick={onClose}
    >
      {/* 3D Imperial Marble & Gold Temple Tablet */}
      <div
        className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl select-none"
        style={{
          background: 'linear-gradient(165deg, #fbf6ec 0%, #eadbc2 55%, #d6be98 100%)',
          border: '3px solid #c99e32',
          boxShadow: '0 12px 0 #6e5219, 0 25px 60px rgba(20, 14, 5, 0.65), inset 0 2px 0 #fffdf7',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Classical Greek Meander Ribbon at Top */}
        <div className="w-full overflow-hidden h-3 bg-[#2a1c0d] border-b border-[#c99e32]">
          <svg className="w-full h-3" preserveAspectRatio="repeat" viewBox="0 0 480 12">
            <defs>
              <pattern id="contract-greek-pat" width="24" height="12" patternUnits="userSpaceOnUse">
                <path
                  d="M0,11 H18 V1 H6 V7 H12 V5 H10"
                  fill="none"
                  stroke="#ffd700"
                  strokeWidth="1.6"
                />
              </pattern>
            </defs>
            <rect width="100%" height="12" fill="url(#contract-greek-pat)" />
          </svg>
        </div>

        {/* Sunken Royal Obsidian-Bronze Header */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b-2 border-[#d4af37]"
          style={{
            background: 'radial-gradient(circle at 50% 0%, #3d2c14 0%, #1c150b 100%)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-b from-[#ffd700] to-[#b8860b] text-[#2c1904] shadow-[0_2px_6px_rgba(255,215,0,0.4)]">
              <Scroll size={16} />
            </div>
            <div>
              <h2 className="text-sm font-black font-['Cinzel'] tracking-wider text-[#ffd700] drop-shadow-[0_1px_4px_rgba(255,215,0,0.5)]">
                MonadPantheonArena.sol
              </h2>
              <span className="text-[10px] font-['Cinzel'] tracking-widest text-[#d8c39e] uppercase">
                Sacred Solidity Contract Archive
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-['Cinzel'] font-bold text-[#2c2011]
                border border-[#a38960] shadow-[0_2px_0_#755f3d] transition-all cursor-pointer active:translate-y-0.5 active:shadow-none"
              style={{
                background: 'linear-gradient(180deg, #f5ebd6 0%, #d8c39e 100%)',
              }}
            >
              {copied ? <Check size={12} className="text-emerald-700" /> : <Copy size={12} className="text-[#634824]" />}
              <span>{copied ? 'Inscribed!' : 'Copy'}</span>
            </button>
            <a
              href="https://remix.ethereum.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-['Cinzel'] font-bold text-[#2c2011]
                border border-[#a38960] shadow-[0_2px_0_#755f3d] transition-all cursor-pointer hover:brightness-105 active:translate-y-0.5 active:shadow-none"
              style={{
                background: 'linear-gradient(180deg, #f5ebd6 0%, #d8c39e 100%)',
              }}
            >
              <ExternalLink size={12} className="text-[#634824]" />
              <span>Open Remix</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#d8c39e] hover:text-[#ffd700] hover:bg-white/10 transition-all cursor-pointer"
              title="Close Sacred Archive"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Contract Address & Network Parchment Banner */}
        <div className="px-5 py-2.5 bg-[#f4ebd6] border-b border-[#b58a43]/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[11px] font-['Cinzel'] text-[#4d3619]">
          <div>
            <span className="font-bold text-[#785a2b]">ALTAR CONTRACT: </span>
            <span className="font-mono text-xs font-bold text-[#996515] select-all">{CONTRACT_ADDRESS}</span>
          </div>
          <div>
            <span className="font-bold text-[#785a2b]">SACRED REALM: </span>
            <span className="font-bold text-[#b45309]">Monad Testnet (Chain ID 10143)</span>
          </div>
        </div>

        {/* Code Content in Sacred Obsidian Inscription Style */}
        <div className="flex-1 overflow-auto bg-[#181108] p-4 border-y border-[#b48a2e]/40 select-text">
          <pre className="text-xs text-[#fde68a] leading-relaxed font-mono">
            <code>{SOLIDITY_SOURCE}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-[#ebdcc2] border-t border-[#b58a43]/40 text-center">
          <p className="text-[11px] font-['Cinzel'] font-bold text-[#5c4322] tracking-wide">
            Deploy via Remix IDE → Injected Provider → Select Monad Testnet → Inscribe Contract
          </p>
        </div>
      </div>
    </div>
  );
}
