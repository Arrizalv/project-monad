import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import GameCanvas from './GameCanvas.jsx';
import HUD from './HUD.jsx';
import VictoryModal from './VictoryModal.jsx';
import { GameEngine } from '../game/engine.js';
import { DEITIES } from '../game/constants.js';

export default function GameArena({ config, onBackToLobby }) {
  const [gameState, setGameState] = useState(null);
  const [networkError, setNetworkError] = useState('');
  const engineRef = useRef(null);
  const lastStateSentRef = useRef(0);
  const isMultiplayer = config.mode === 'multiplayer';
  const isHost = !isMultiplayer || config.isHost;

  const initializeEngine = useCallback(() => {
    engineRef.current?.destroy();
    const engine = new GameEngine(
      config.deityIndex,
      (state) => {
        setGameState({ ...state });
        if (isMultiplayer && isHost && config.roomTransport) {
          const now = Date.now();
          if (now - lastStateSentRef.current >= 100 || state.isFinished) {
            lastStateSentRef.current = now;
            config.roomTransport.send('state', state);
          }
        }
      },
      config.mode,
      { isHost, playerId: config.playerId, roster: config.roster }
    );
    engineRef.current = engine;
    const playerId = isMultiplayer ? config.playerId : 'local';
    if (config.walletAddress && engine.players[playerId]) {
      engine.players[playerId].walletAddress = config.walletAddress;
    }
    engine.start();
    setGameState(engine.getState());
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      window.__endGameForTest = () => engine.endGame();
    }
  }, [config, isHost, isMultiplayer]);

  useEffect(() => {
    if (!isMultiplayer || !config.roomTransport) {
      initializeEngine();
      return () => engineRef.current?.destroy();
    }
    if (isHost) { initializeEngine(); } else { setGameState(null); }

    config.roomTransport.setMessageHandler((message) => {
      if (!message || message.senderId === config.playerId) return;
      if (isHost) {
        if (message.type === 'move') engineRef.current?.movePlayer(message.payload?.playerId, message.payload?.dx, message.payload?.dy);
        else if (message.type === 'skill') engineRef.current?.activateSkill(message.payload?.playerId);
        else if (message.type === 'restartRequest') {
          config.roomTransport.send('restart', { roster: config.roster });
          initializeEngine();
        }
      } else if (message.type === 'state') {
        setGameState(message.payload);
      } else if (message.type === 'restart') {
        setGameState(null);
      }
    });
    return () => { engineRef.current?.destroy(); };
  }, [config, initializeEngine, isHost, isMultiplayer]);

  const handleMove = useCallback((dx, dy) => {
    if (isHost) engineRef.current?.movePlayer(isMultiplayer ? config.playerId : 'local', dx, dy);
    else config.roomTransport?.send('move', { playerId: config.playerId, dx, dy });
  }, [config, isHost, isMultiplayer]);

  const handleSkill = useCallback(() => {
    if (isHost) engineRef.current?.activateSkill(isMultiplayer ? config.playerId : 'local');
    else config.roomTransport?.send('skill', { playerId: config.playerId });
  }, [config, isHost, isMultiplayer]);

  const handlePlayAgain = useCallback(() => {
    if (isMultiplayer && !isHost) {
      config.roomTransport?.send('restartRequest', {});
      setNetworkError('Sent a rematch request to the room host.');
      return;
    }
    initializeEngine();
  }, [config, initializeEngine, isHost, isMultiplayer]);

  const currentPlayer = isMultiplayer ? config.roster?.find(p => p.id === config.playerId) : null;
  const localDeity = DEITIES[config.deityIndex];
  const playerId = isMultiplayer ? config.playerId : 'local';

  return (
    <div className="game-arena-screen min-h-screen bg-[#08041a] text-white flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden arena-atmosphere">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full" />
      </div>

      {/* Compact top navigation (sits behind HUD, low z-index) */}
      <div className="relative z-5 w-full max-w-[640px] flex items-center justify-between px-4 pt-3 pb-1">
        <button
          onClick={onBackToLobby}
          className="arena-nav flex items-center gap-1 text-[11px] text-gray-500 hover:text-white transition-colors cursor-pointer"
          style={{ pointerEvents: 'auto', zIndex: 30 }}
        >
          <ArrowLeft size={13} /> Lobby
        </button>
        <h1 className="text-[11px] font-bold text-amber-800 tracking-widest">
          {isMultiplayer ? `ROOM ${config.roomCode}` : 'MONAD PANTHEON'}
        </h1>
        <div className="text-[10px] font-semibold" style={{ color: localDeity.color }}>
          {currentPlayer?.walletAddress ? `${currentPlayer.walletAddress.slice(0, 6)}...` : localDeity.name}
        </div>
      </div>

      {/* Waiting state */}
      {!gameState && isMultiplayer && !isHost ? (
        <div className="relative z-10 mt-16 text-center text-sm text-cyan-200">
          Waiting for the room host to sync the arena…
        </div>
      ) : (
        <div className="relative z-10 w-full flex justify-center">
          <GameCanvas
            gameState={gameState}
            onMove={handleMove}
            onSkill={handleSkill}
            playerId={playerId}
          />
        </div>
      )}

      {/* Arena Feed (top-right) */}
      {gameState?.events?.length > 0 && (
        <div className="arena-feed fixed right-3 top-20 z-30 w-60 max-w-[42vw] space-y-1 rounded-xl border border-white/8 bg-black/55 p-2 backdrop-blur pointer-events-none">
          <p className="text-[8px] font-bold uppercase tracking-widest text-cyan-300 mb-1">Arena Feed</p>
          {gameState.events.slice(0, 4).map(ev => (
            <p key={ev.id} className="truncate text-[9px] text-gray-400">{ev.text}</p>
          ))}
        </div>
      )}

      {/* Esports HUD Overlay (fixed full-screen) */}
      {gameState && (
        <HUD
          gameState={gameState}
          onSkill={handleSkill}
          playerId={playerId}
        />
      )}

      {networkError && (
        <p role="status" className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 text-xs text-amber-300 bg-black/70 px-3 py-1.5 rounded-lg">
          {networkError}
        </p>
      )}

      {gameState?.isFinished && (
        <VictoryModal
          gameState={gameState}
          walletAddress={config.walletAddress}
          walletMode={config.walletMode}
          onPlayAgain={handlePlayAgain}
          onBackToLobby={onBackToLobby}
        />
      )}
    </div>
  );
}
