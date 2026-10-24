// ═══════════════════════════════════════════════════════════════
// MONAD PANTHEON — Root Application
// ═══════════════════════════════════════════════════════════════
import { useState } from 'react';
import Lobby from './components/Lobby.jsx';
import GameArena from './components/GameArena.jsx';

function App() {
  const [screen, setScreen] = useState('lobby'); // 'lobby' | 'game'
  const [gameConfig, setGameConfig] = useState(null);

  const handleStartGame = (config) => {
    setGameConfig(config);
    setScreen('game');
  };

  const handleBackToLobby = () => {
    gameConfig?.roomTransport?.send('leave', { id: gameConfig.playerId });
    gameConfig?.roomTransport?.close();
    setScreen('lobby');
    setGameConfig(null);
  };

  return (
    <>
      {screen === 'lobby' && (
        <Lobby onStartGame={handleStartGame} />
      )}
      {screen === 'game' && gameConfig && (
        <GameArena config={gameConfig} onBackToLobby={handleBackToLobby} />
      )}
    </>
  );
}

export default App;
