import { useEffect, useState } from 'react';
import {
  Wallet, Gamepad2, Bot, Swords, Zap, Code, ChevronRight, Users,
  Sparkles, Trophy, X, Radio, Crown, CheckCircle2, Link2,
} from 'lucide-react';
import DeityCard from './DeityCard.jsx';
import ContractModal from './ContractModal.jsx';
import { DEITIES } from '../game/constants.js';
import { connectWallet } from '../web3/wallet.js';
import { createRoomTransport, makeId } from '../multiplayer/transport.js';

const SIMULATED_ADDRESS = '0x71c000000000000000000000000000000000089a';
const shortAddress = (address) =>
  address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Guest';

export default function Lobby({ onStartGame }) {
  const [selectedDeity, setSelectedDeity] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletMode, setWalletMode] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletError, setWalletError] = useState('');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [gameMode, setGameMode] = useState('local');
  const [showContract, setShowContract] = useState(false);
  const [roomCode, setRoomCode] = useState('MONAD-101');
  const [serverUrl, setServerUrl] = useState('http://localhost:3001');
  const [transportType, setTransportType] = useState('mqtt');
  const [roomTransport, setRoomTransport] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('idle');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [roomError, setRoomError] = useState('');
  const [roomPlayers, setRoomPlayers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const playerIdRef = useState(() => makeId())[0];

  const handleConnect = async () => {
    setWalletError('');
    if (typeof window === 'undefined' || !window.ethereum) {
      setShowWalletModal(true);
      return;
    }
    setIsConnecting(true);
    try {
      const { address } = await connectWallet();
      setWalletAddress(address);
      setWalletMode('wallet');
    } catch (error) {
      setWalletError(error.message || 'Wallet connection failed.');
    } finally {
      setIsConnecting(false);
    }
  };

  const activateGuest = () => {
    setWalletAddress('guest');
    setWalletMode('guest');
    setShowWalletModal(false);
  };

  const activateSimulatedWallet = () => {
    setWalletAddress(SIMULATED_ADDRESS);
    setWalletMode('simulated');
    setShowWalletModal(false);
    setWalletError('');
  };

  const selfPlayer = {
    id: playerIdRef,
    walletAddress: walletAddress === 'guest' ? null : walletAddress,
    deityIndex: selectedDeity,
    ready: isReady,
    joinedAt: roomPlayers.find((player) => player.id === playerIdRef)?.joinedAt || Date.now(),
  };

  const joinedPlayers = roomPlayers
    .filter((player) => Date.now() - player.lastSeen < 12000)
    .sort((a, b) => a.joinedAt - b.joinedAt);
  const isRoomHost = joinedPlayers[0]?.id === playerIdRef;
  const hasDuplicateDeities = new Set(joinedPlayers.map((player) => player.deityIndex)).size < joinedPlayers.length;

  const handleJoinRoom = () => {
    if (selectedDeity === null || !walletMode) return;
    setRoomError('');
    const normalizedCode = roomCode.trim().toUpperCase();
    try {
      const transport = createRoomTransport({
        roomCode: normalizedCode,
        transport: transportType,
        serverUrl: serverUrl.trim(),
        playerId: playerIdRef,
        onStatus: (status, message) => {
          setConnectionStatus(status);
          setConnectionMessage(message);
        },
        onMessage: (message) => {
          if (!message || message.senderId === playerIdRef) return;
          if (message.type === 'presence') {
            const incoming = { ...message.payload, lastSeen: Date.now() };
            setRoomPlayers((players) => {
              const existing = players.filter((player) => player.id !== incoming.id);
              return [...existing, incoming];
            });
          } else if (message.type === 'leave') {
            setRoomPlayers((players) => players.filter((player) => player.id !== message.payload?.id));
          } else if (message.type === 'start') {
            const currentTransport = transportRef.current;
            const roster = message.payload?.roster;
            if (!currentTransport || !Array.isArray(roster)) return;
            onStartGame({
              mode: 'multiplayer',
              deityIndex: selectedDeity,
              walletAddress,
              playerId: playerIdRef,
              roster,
              isHost: false,
              roomCode: normalizedCode,
              roomTransport: currentTransport,
              walletMode,
            });
          }
        },
      });
      transportRef.current = transport;
      setRoomTransport(transport);
      setRoomPlayers([{
        ...selfPlayer,
        joinedAt: Date.now(),
        lastSeen: Date.now(),
      }]);
      setRoomCode(normalizedCode);
      transport.send('presence', { ...selfPlayer, joinedAt: Date.now() });
    } catch (error) {
      setRoomError(error.message || 'Could not join the room.');
    }
  };

  const transportRef = useState(() => ({ current: null }))[0];

  useEffect(() => {
    if (!roomTransport) return undefined;
    const announce = () => {
      const joinedAt = roomPlayers.find((player) => player.id === playerIdRef)?.joinedAt || Date.now();
      const presence = {
        ...selfPlayer,
        joinedAt,
        lastSeen: Date.now(),
      };
      setRoomPlayers((players) => [
        ...players.filter((player) => player.id !== playerIdRef),
        presence,
      ]);
      roomTransport.send('presence', presence);
    };
    const interval = window.setInterval(announce, 3000);
    return () => window.clearInterval(interval);
  }, [roomTransport, playerIdRef, selectedDeity, walletAddress, walletMode, isReady]);

  const leaveRoom = () => {
    if (roomTransport) {
      roomTransport.send('leave', { id: playerIdRef });
      roomTransport.close();
    }
    transportRef.current = null;
    setRoomTransport(null);
    setRoomPlayers([]);
    setConnectionStatus('idle');
    setConnectionMessage('');
    setIsReady(false);
  };

  const toggleReady = () => {
    const nextReady = !isReady;
    setIsReady(nextReady);
    const updated = { ...selfPlayer, ready: nextReady, lastSeen: Date.now() };
    setRoomPlayers((players) => [
      ...players.filter((player) => player.id !== playerIdRef),
      updated,
    ]);
    roomTransport?.send('presence', updated);
  };

  const startRoomMatch = () => {
    if (hasDuplicateDeities || joinedPlayers.length > 4) {
      setRoomError(joinedPlayers.length > 4
        ? 'This room has more than four players. Create a new room to start.'
        : 'Each player must choose a different deity before the host starts.');
      return;
    }
    const humans = joinedPlayers.map((player) => ({ ...player, isBot: false }));
    const usedDeities = new Set(humans.map((player) => player.deityIndex));
    let deity = 0;
    while (humans.length < 4) {
      while (usedDeities.has(deity)) deity += 1;
      humans.push({
        id: `ai-${humans.length}`,
        deityIndex: deity,
        walletAddress: null,
        isBot: true,
        ready: true,
      });
      usedDeities.add(deity);
      deity += 1;
    }
    const roster = humans.slice(0, 4);
    const payload = { roster };
    roomTransport.send('start', payload);
    onStartGame({
      mode: 'multiplayer',
      deityIndex: selectedDeity,
      walletAddress,
      playerId: playerIdRef,
      roster,
      isHost: true,
      roomCode,
      roomTransport,
      walletMode,
    });
  };

  const handleStartLocal = () => {
    if (selectedDeity === null || !walletMode) return;
    onStartGame({
      deityIndex: selectedDeity,
      mode: 'local',
      walletAddress,
      walletMode,
    });
  };

  return (
    <div className="lobby-screen min-h-screen bg-[#0F0A1C] text-white flex flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-400/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-orange-300/10 blur-[120px]" />
      </div>
      <div className="relative z-10 w-full max-w-3xl mx-auto">
        <header className="text-center mb-7">
          <div className="lobby-kicker inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs mb-4">
            <Sparkles size={12} /> Monad Blockchain Hackathon
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-2">
            <span className="bg-gradient-to-r from-amber-700 via-yellow-600 to-orange-800 bg-clip-text text-transparent">MONAD PANTHEON</span>
          </h1>
          <p className="text-lg text-gray-400 font-medium">Clash of Deities</p>
          <p className="text-xs text-gray-500 mt-1">Real-time Arena · Territory Conquest · Monad Testnet</p>
        </header>

        <section className="mb-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {walletMode ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
              <Wallet size={14} />
              <span className="font-mono">{walletMode === 'guest' ? 'Guest Player' : shortAddress(walletAddress)}</span>
              <span className="text-xs text-green-500/60">· {walletMode === 'simulated' ? 'Simulated' : walletMode === 'guest' ? 'Guest' : 'Monad Testnet'}</span>
              <button onClick={() => { setWalletAddress(null); setWalletMode(null); }} className="ml-1 text-xs text-gray-400 hover:text-white">Change</button>
            </div>
          ) : (
            <>
              <button onClick={handleConnect} disabled={isConnecting} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-semibold text-sm disabled:opacity-50 cursor-pointer">
                <Wallet size={16} /> {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
              </button>
              <button onClick={activateGuest} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-gray-300 cursor-pointer">
                <Gamepad2 size={14} /> Play as Guest
              </button>
            </>
          )}
        </section>
        {walletError && <p role="alert" className="text-center text-red-400 text-xs mb-4">{walletError}</p>}

        <section className="mb-6">
          <h2 className="text-center text-sm font-semibold text-gray-300 mb-3 flex items-center justify-center gap-2"><Swords size={14} className="text-amber-700" />Choose Your Deity</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DEITIES.map((deity, index) => (
              <DeityCard key={deity.id} deity={deity} index={index} selected={selectedDeity} onSelect={setSelectedDeity} />
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-center text-sm font-semibold text-gray-300 mb-3 flex items-center justify-center gap-2"><Zap size={14} className="text-amber-700" />Arena Mode</h2>
          <div className="flex justify-center gap-3">
            <button onClick={() => { setGameMode('local'); leaveRoom(); }} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer ${gameMode === 'local' ? 'border-amber-500/50 bg-amber-500/10 text-amber-300' : 'border-white/10 bg-white/5 text-gray-400 hover:text-gray-200'}`}>
              <Bot size={14} /> Instant Arena (vs 3 AI)
            </button>
            <button onClick={() => setGameMode('multiplayer')} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer ${gameMode === 'multiplayer' ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300' : 'border-white/10 bg-white/5 text-gray-400 hover:text-gray-200'}`}>
              <Users size={14} /> Multiplayer Rooms
            </button>
          </div>
        </section>

        {gameMode === 'local' ? (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleStartLocal}
              disabled={selectedDeity === null || !walletMode}
              className="group relative flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-['Cinzel'] font-black text-base uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed enabled:cursor-pointer border-2 border-[#fde047] text-[#fffdf2] shadow-[0_6px_0_#5b3708,0_12px_24px_rgba(217,119,6,0.4)] enabled:hover:scale-105 active:translate-y-1 active:shadow-[0_2px_0_#5b3708] animate-gold-sweep"
              style={{
                background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 50%, #92400e 100%)',
                textShadow: '0 1px 3px rgba(0,0,0,0.7)',
              }}
            >
              <Trophy size={18} className="text-[#fff3a8]" /> Enter the Arena <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform text-[#fff3a8]" />
            </button>
            <button onClick={() => setShowContract(true)} className="flex items-center gap-1.5 text-xs font-['Cinzel'] font-bold text-[#785a2b] hover:text-[#3d2303] transition-colors cursor-pointer"><Code size={12} />View Sacred Contract Archive</button>
          </div>
        ) : (
          <section className="mx-auto max-w-xl rounded-2xl border border-cyan-500/20 bg-[#13102B]/90 p-5">
            <div className="flex items-center gap-2 mb-4"><Radio size={16} className="text-cyan-300" /><h3 className="font-bold">Waiting Room Lobby</h3></div>
            {!roomTransport ? (
              <div className="space-y-3">
                <label className="block text-xs text-gray-400">Room code
                  <input value={roomCode} onChange={(event) => setRoomCode(event.target.value.toUpperCase())} maxLength={24} placeholder="JOGJA-BLITZ" className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white uppercase outline-none focus:border-cyan-500/50" />
                </label>
                <div className="flex gap-2">
                  <button onClick={() => setTransportType('mqtt')} className={`flex-1 rounded-lg border px-3 py-2 text-xs ${transportType === 'mqtt' ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300' : 'border-white/10 text-gray-400'}`}>Instant public relay</button>
                  <button onClick={() => setTransportType('socket')} className={`flex-1 rounded-lg border px-3 py-2 text-xs ${transportType === 'socket' ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300' : 'border-white/10 text-gray-400'}`}>Socket.io server</button>
                </div>
                {transportType === 'socket' && <label className="block text-xs text-gray-400">Socket.io Server URL<input value={serverUrl} onChange={(event) => setServerUrl(event.target.value)} placeholder="http://localhost:3001" className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50" /></label>}
                <p className="text-[11px] text-gray-500">{transportType === 'mqtt' ? 'Uses the public EMQX MQTT WebSocket relay. Room traffic is unencrypted application data; do not send secrets.' : 'Connects to your own Socket.io relay. Run npm start from the server folder.'}</p>
                <button onClick={handleJoinRoom} disabled={selectedDeity === null || !walletMode} className="w-full rounded-lg bg-cyan-600/80 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"><Link2 size={14} className="mr-2 inline" />Join / Create Room</button>
                {roomError && <p role="alert" className="text-xs text-red-400">{roomError}</p>}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2">
                  <div><span className="text-[10px] text-gray-500">ROOM CODE</span><p className="font-mono font-bold tracking-widest text-cyan-300">{roomCode}</p></div>
                  <span className={`text-[10px] ${connectionStatus === 'connected' ? 'text-green-400' : 'text-amber-300'}`}>{connectionStatus === 'connected' ? '● LIVE' : '◌ CONNECTING'}</span>
                </div>
                {connectionMessage && <p role="status" className="text-[11px] text-gray-400">{connectionMessage}</p>}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-400">Connected Players ({joinedPlayers.length}/4)</h4>
                  {joinedPlayers.map((player) => (
                    <div key={player.id} className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
                      <span className="text-xs font-bold flex-1" style={{ color: DEITIES[player.deityIndex]?.color }}>{DEITIES[player.deityIndex]?.name || 'Unknown deity'}</span>
                      <span className="font-mono text-[10px] text-gray-400">{shortAddress(player.walletAddress)}</span>
                      <span className={`flex items-center gap-1 text-[10px] ${player.ready ? 'text-green-400' : 'text-amber-300'}`}><CheckCircle2 size={11} />{player.ready ? 'Ready' : 'Not ready'}</span>
                      {player.id === joinedPlayers[0]?.id && <Crown size={12} className="text-amber-300" />}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={toggleReady} className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-200 hover:bg-white/10">{isReady ? 'Not Ready' : 'Ready Up'}</button>
                  {isRoomHost && <button onClick={startRoomMatch} disabled={connectionStatus !== 'connected' || hasDuplicateDeities || joinedPlayers.length > 4} className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 px-3 py-2 text-xs font-bold disabled:opacity-40">Start Match for Everyone</button>}
                  <button onClick={leaveRoom} className="rounded-lg border border-red-500/20 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10">Leave</button>
                </div>
                {hasDuplicateDeities && <p role="alert" className="text-[10px] text-amber-300">Choose a different deity; each arena player needs a unique deity.</p>}
                {roomError && <p role="alert" className="text-xs text-red-400">{roomError}</p>}
                {isRoomHost && <p className="text-[10px] text-gray-500">As host, you control the shared match. Empty slots will be filled by AI deities.</p>}
              </div>
            )}
          </section>
        )}
      </div>

      {showWalletModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wallet-modal-title"
        >
          <div
            className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl select-none"
            style={{
              background: 'linear-gradient(165deg, #fbf6ec 0%, #eadbc2 55%, #d6be98 100%)',
              border: '3px solid #c99e32',
              boxShadow: '0 12px 0 #6e5219, 0 25px 60px rgba(20, 14, 5, 0.65), inset 0 2px 0 #fffdf7',
            }}
          >
            {/* Top Meander Trim */}
            <div className="w-full overflow-hidden h-3 bg-[#2a1c0d] border-b border-[#c99e32]">
              <svg className="w-full h-3" preserveAspectRatio="repeat" viewBox="0 0 480 12">
                <defs>
                  <pattern id="wallet-greek-pat" width="24" height="12" patternUnits="userSpaceOnUse">
                    <path d="M0,11 H18 V1 H6 V7 H12 V5 H10" fill="none" stroke="#ffd700" strokeWidth="1.6" />
                  </pattern>
                </defs>
                <rect width="100%" height="12" fill="url(#wallet-greek-pat)" />
              </svg>
            </div>

            {/* Sunken Royal Obsidian Header */}
            <div
              className="relative px-6 py-5 border-b-2 border-[#d4af37] text-center"
              style={{
                background: 'radial-gradient(circle at 50% 0%, #3d2c14 0%, #1c150b 100%)',
              }}
            >
              <button
                onClick={() => setShowWalletModal(false)}
                aria-label="Close wallet dialog"
                className="absolute right-4 top-4 p-1 rounded-lg text-[#d8c39e] hover:text-[#ffd700] hover:bg-white/10 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
              <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-[#ffd700] bg-gradient-to-b from-[#ffd700] to-[#b8860b] text-[#2c1904] shadow-[0_0_15px_rgba(255,215,0,0.5)]">
                <Wallet size={24} />
              </div>
              <h2
                id="wallet-modal-title"
                className="text-base font-black font-['Cinzel'] tracking-wider uppercase text-[#ffd700] drop-shadow-[0_1px_4px_rgba(255,215,0,0.5)]"
              >
                Connect Web3 Altar Wallet
              </h2>
              <p className="text-[10px] font-['Cinzel'] tracking-widest text-[#d8c39e] uppercase mt-0.5">
                Sacred Monad Testnet Inscriptions
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="mb-5 text-xs leading-relaxed text-[#4d3619] font-['Cinzel'] font-semibold">
                MetaMask is blocked inside embedded preview iframes. Open this app in a New Browser Tab to use your real MetaMask extension, OR click <span className="text-[#996515] font-bold">“Simulate Monad Wallet”</span> below to test the wallet flow. Simulation never signs or broadcasts real transactions.
              </p>
              <div className="flex flex-col gap-2.5">
                <a
                  href={typeof window !== 'undefined' ? window.location.href : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border-2 border-[#a38960] py-2.5 px-4 text-center text-xs font-['Cinzel'] font-extrabold text-[#2c2011] shadow-[0_3px_0_#755f3d] transition-all hover:brightness-105 active:translate-y-0.5 active:shadow-none"
                  style={{
                    background: 'linear-gradient(180deg, #f5ebd6 0%, #d8c39e 100%)',
                  }}
                >
                  Open in a New Browser Tab
                </a>
                <button
                  onClick={activateSimulatedWallet}
                  className="relative rounded-xl border-2 border-[#fde047] py-3 px-4 text-center text-xs font-['Cinzel'] font-black uppercase tracking-wider text-[#fffdf2] shadow-[0_5px_0_#5b3708,0_10px_20px_rgba(217,119,6,0.35)] transition-all cursor-pointer animate-gold-sweep active:translate-y-1 active:shadow-[0_1px_0_#5b3708]"
                  style={{
                    background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 50%, #92400e 100%)',
                    textShadow: '0 1px 3px rgba(0,0,0,0.7)',
                  }}
                >
                  Simulate Monad Wallet (0x71C...89A)
                </button>
                <button
                  onClick={activateGuest}
                  className="rounded-lg py-2 text-xs font-['Cinzel'] font-bold text-[#785a2b] hover:text-[#3d2303] transition-colors cursor-pointer text-center"
                >
                  Continue as Guest instead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showContract && <ContractModal onClose={() => setShowContract(false)} />}
    </div>
  );
}
