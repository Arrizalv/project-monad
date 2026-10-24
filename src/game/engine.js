// ═══════════════════════════════════════════════════════════════
// MONAD PANTHEON — Game Engine (State Management)
// ═══════════════════════════════════════════════════════════════
import {
  GRID_SIZE, GAME_DURATION, getObstacleTiles,
  POWERUP_SPAWN_INTERVAL, POWERUP_DURATION, POWERUP_RADIUS,
  BASE_MOVE_COOLDOWN, BOOSTED_MOVE_COOLDOWN, DEITIES,
} from './constants.js';

// ── Create initial empty grid ──────────────────────────────────
function createGrid() {
  const grid = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null)
  );
  // Mark obstacles
  const obs = getObstacleTiles();
  obs.forEach((key) => {
    const [x, y] = key.split(',').map(Number);
    grid[y][x] = 'obstacle';
  });
  return grid;
}

// ── Create a player object ─────────────────────────────────────
function createPlayer(id, deityIndex, startX, startY, isBot = false, walletAddress = null) {
  return {
    id,
    deityIndex,
    deity: DEITIES[deityIndex],
    x: startX,
    y: startY,
    isBot,
    walletAddress: walletAddress || (isBot ? `0xBOT${String(deityIndex).padStart(4, '0')}` : null),
    tileCount: 0,
    hasPowerUp: false,
    powerUpEndTime: 0,
    lastMoveTime: 0,
    score: 0,
  };
}

// ── Spawn positions (corners) ──────────────────────────────────
const SPAWN_POSITIONS = [
  { x: 1, y: 1 },
  { x: 18, y: 1 },
  { x: 1, y: 18 },
  { x: 18, y: 18 },
];

// ── Game Engine Class ──────────────────────────────────────────
export class GameEngine {
  constructor(localDeityIndex, onStateUpdate, mode = 'local', options = {}) {
    this.mode = mode;
    this.isHost = mode !== 'multiplayer' || options.isHost === true;
    this.localPlayerId = options.playerId || 'local';
    this.localDeityIndex = localDeityIndex;
    this.onStateUpdate = onStateUpdate;
    this.grid = createGrid();
    this.players = {};
    this.powerUps = [];
    this.timeRemaining = GAME_DURATION;
    this.isRunning = false;
    this.isFinished = false;
    this.obstacleTiles = getObstacleTiles();
    this.gameLoopId = null;
    this.timerIntervalId = null;
    this.powerUpIntervalId = null;
    this.winner = null;
    this.events = [];
    this.effects = [];
    this.shakeUntil = 0;

    // For local/bot mode: set up all 4 players
    if (mode === 'local') {
      this._initLocalPlayers(localDeityIndex);
    } else if (mode === 'multiplayer') {
      this._initMultiplayerPlayers(options.roster || []);
    }
  }

  _initLocalPlayers(humanDeityIndex) {
    // Human gets the selected deity at spawn 0
    const humanSpawn = SPAWN_POSITIONS[0];
    this.players['local'] = createPlayer('local', humanDeityIndex, humanSpawn.x, humanSpawn.y, false, null);
    this.grid[humanSpawn.y][humanSpawn.x] = humanDeityIndex;

    // Fill 3 AI bots with remaining deities
    const remainingDeities = [0, 1, 2, 3].filter((i) => i !== humanDeityIndex);
    remainingDeities.forEach((deityIdx, i) => {
      const spawn = SPAWN_POSITIONS[i + 1];
      const botId = `bot-${i}`;
      this.players[botId] = createPlayer(botId, deityIdx, spawn.x, spawn.y, true);
      this.grid[spawn.y][spawn.x] = deityIdx;
    });
  }

  _initMultiplayerPlayers(roster) {
    roster.slice(0, SPAWN_POSITIONS.length).forEach((entry, index) => {
      const spawn = SPAWN_POSITIONS[index];
      const player = createPlayer(
        entry.id,
        entry.deityIndex,
        spawn.x,
        spawn.y,
        entry.isBot === true,
        entry.walletAddress
      );
      player.ready = entry.ready === true;
      this.players[player.id] = player;
      this.grid[spawn.y][spawn.x] = player.deityIndex;
    });
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isFinished = false;

    // Countdown timer
    this.timerIntervalId = setInterval(() => {
      this.timeRemaining -= 1;
      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        this.endGame();
      }
      this._notify();
    }, 1000);

    // Power-up spawner
    this.powerUpIntervalId = setInterval(() => {
      this._spawnPowerUp();
    }, POWERUP_SPAWN_INTERVAL);

    // Bot AI tick
    if (this.isHost && Object.values(this.players).some((player) => player.isBot)) {
      this.botIntervalId = setInterval(() => {
        this._tickBots();
      }, 180);
    }

    this._notify();
  }

  endGame() {
    this.isRunning = false;
    this.isFinished = true;
    clearInterval(this.timerIntervalId);
    clearInterval(this.powerUpIntervalId);
    clearInterval(this.botIntervalId);

    // Calculate scores
    this._calculateScores();

    // Determine winner
    const sorted = Object.values(this.players).sort((a, b) => b.tileCount - a.tileCount);
    this.winner = sorted[0];

    this._notify();
  }

  _calculateScores() {
    // Count tiles per deity
    const counts = {};
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const cell = this.grid[y][x];
        if (cell !== null && cell !== 'obstacle') {
          counts[cell] = (counts[cell] || 0) + 1;
        }
      }
    }

    Object.values(this.players).forEach((p) => {
      p.tileCount = counts[p.deityIndex] || 0;
      p.score = p.tileCount;
    });
  }

  movePlayer(playerId, dx, dy) {
    if (!this.isRunning || this.isFinished) return;

    const player = this.players[playerId];
    if (!player) return;

    const now = Date.now();
    if (now < (player.stunUntil || 0)) return;
    const cooldown = now < (player.solarDashUntil || 0)
      ? BASE_MOVE_COOLDOWN / 2
      : player.hasPowerUp ? BOOSTED_MOVE_COOLDOWN : BASE_MOVE_COOLDOWN;
    if (now - player.lastMoveTime < cooldown) return;

    const newX = player.x + dx;
    const newY = player.y + dy;

    // Bounds check
    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) return;

    // Obstacle check
    if (this.obstacleTiles.has(`${newX},${newY}`)) return;

    player.x = newX;
    player.y = newY;
    player.lastMoveTime = now;
    player.facingX = dx;
    player.facingY = dy;

    // Claim tile
    if (player.hasPowerUp && now < player.powerUpEndTime) {
      // Claim 3x3 area
      for (let oy = -POWERUP_RADIUS; oy <= POWERUP_RADIUS; oy++) {
        for (let ox = -POWERUP_RADIUS; ox <= POWERUP_RADIUS; ox++) {
          const tx = newX + ox;
          const ty = newY + oy;
          if (tx >= 0 && tx < GRID_SIZE && ty >= 0 && ty < GRID_SIZE) {
            if (!this.obstacleTiles.has(`${tx},${ty}`)) {
              this._capture(player, tx, ty, false);
            }
          }
        }
      }
    } else {
      this._capture(player, newX, newY, true);
      if (now < (player.solarDashUntil || 0)) {
        for (let step = 1; step <= 3; step++) {
          const tx = newX - dx * step;
          const ty = newY - dy * step;
          if (tx >= 0 && tx < GRID_SIZE && ty >= 0 && ty < GRID_SIZE) {
            this._capture(player, tx, ty, false);
          }
        }
      }
      if (player.hasPowerUp && now >= player.powerUpEndTime) {
        player.hasPowerUp = false;
      }
    }

    // Check power-up pickup
    this.powerUps = this.powerUps.filter((pu) => {
      if (pu.x === newX && pu.y === newY) {
        player.hasPowerUp = true;
        player.powerUpEndTime = now + POWERUP_DURATION;
        return false;
      }
      return true;
    });

    this._calculateScores();
    this._notify();
  }

  activateSkill(playerId) {
    if (!this.isRunning || this.isFinished) return false;
    const player = this.players[playerId];
    if (!player || Date.now() < (player.stunUntil || 0)) return false;
    const now = Date.now();
    if (now < (player.skillReadyAt || 0)) return false;
    player.skillReadyAt = now + 5000;

    const direction = {
      x: player.facingX ?? 1,
      y: player.facingY ?? 0,
    };
    if (player.deityIndex === 0) {
      const origin = { x: player.x, y: player.y };
      let destination = { x: player.x, y: player.y };
      for (let step = 0; step < 3; step++) {
        const x = destination.x + direction.x;
        const y = destination.y + direction.y;
        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE || this.obstacleTiles.has(`${x},${y}`)) break;
        destination = { x, y };
        this._capture(player, x, y);
        this._stunAt(player, x, y);
      }
      player.x = destination.x;
      player.y = destination.y;
      this._captureArea(player, destination.x, destination.y, 1, 1);
      for (let y = destination.y - 1; y <= destination.y + 1; y++) {
        for (let x = destination.x - 1; x <= destination.x + 1; x++) this._stunAt(player, x, y);
      }
      if (origin.x !== destination.x || origin.y !== destination.y) {
        this._capture(player, origin.x, origin.y, false);
      }
      this._emitEvent(`⚡ ${this._playerLabel(player)} used Lightning Blink!`);
    } else if (player.deityIndex === 1) {
      player.shieldUntil = now + 3000;
      this._captureArea(player, player.x, player.y, 1, 1);
      this._emitEvent(`🛡️ ${this._playerLabel(player)} raised a Golden Sandstorm shield!`);
    } else if (player.deityIndex === 2) {
      for (let offset = -2; offset <= 2; offset++) {
        this._capture(player, player.x + offset, player.y, true);
        this._capture(player, player.x, player.y + offset, true);
      }
      this._emitEvent(`🌊 ${this._playerLabel(player)} unleashed Ink Nova!`);
    } else {
      player.solarDashUntil = now + 3000;
      const origin = { x: player.x, y: player.y };
      let destination = { x: player.x, y: player.y };
      for (let step = 0; step < 3; step++) {
        const x = destination.x + direction.x;
        const y = destination.y + direction.y;
        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE || this.obstacleTiles.has(`${x},${y}`)) break;
        destination = { x, y };
        this._capture(player, x, y);
        this._stunAt(player, x, y);
      }
      player.x = destination.x;
      player.y = destination.y;
      this._capture(player, origin.x, origin.y);
      this._emitEvent(`☀️ ${this._playerLabel(player)} activated Solar Dash!`);
    }
    this._calculateScores();
    this._notify();
    return true;
  }

  _capture(player, x, y, addEffect = true) {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE || this.obstacleTiles.has(`${x},${y}`)) return;
    const changed = this.grid[y][x] !== player.deityIndex;
    this.grid[y][x] = player.deityIndex;
    if (changed && addEffect) {
      this.effects.push({ x, y, color: player.deity.color, at: Date.now() });
      if (this.effects.length > 80) this.effects.shift();
    }
  }

  _captureArea(player, centerX, centerY, radiusX, radiusY) {
    for (let y = centerY - radiusY; y <= centerY + radiusY; y++) {
      for (let x = centerX - radiusX; x <= centerX + radiusX; x++) this._capture(player, x, y);
    }
  }

  _stunAt(attacker, x, y) {
    const target = Object.values(this.players).find((player) =>
      player.id !== attacker.id && player.x === x && player.y === y
    );
    if (!target || Date.now() < (target.shieldUntil || 0)) return;
    target.stunUntil = Date.now() + 1500;
    this.shakeUntil = Date.now() + 300;
    this._emitEvent(`⚡ ${this._playerLabel(attacker)} stunned ${this._playerLabel(target)}!`);
  }

  _playerLabel(player) {
    const address = player.walletAddress;
    return address && address.length > 12
      ? `${address.slice(0, 5)}...${address.slice(-3)}`
      : player.deity.name;
  }

  _emitEvent(text) {
    this.events.unshift({ id: `${Date.now()}-${Math.random()}`, text, at: Date.now() });
    this.events = this.events.slice(0, 6);
  }

  _spawnPowerUp() {
    if (!this.isRunning) return;

    // Find random empty tile
    let attempts = 0;
    while (attempts < 100) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      if (
        this.grid[y][x] === null &&
        !this.obstacleTiles.has(`${x},${y}`)
      ) {
        this.powerUps.push({ x, y, spawnTime: Date.now() });
        this._notify();
        return;
      }
      attempts++;
    }
  }

  _tickBots() {
    if (!this.isRunning) return;

    Object.values(this.players).forEach((player) => {
      if (!player.isBot) return;

      // Simple AI: move toward nearest unclaimed or enemy tile, with randomness
      const directions = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
      ];

      // 30% random, 70% strategic
      if (Math.random() < 0.3) {
        const dir = directions[Math.floor(Math.random() * 4)];
        this.movePlayer(player.id, dir.dx, dir.dy);
        return;
      }

      // Check for nearby power-ups first
      let bestDir = null;
      let bestScore = -Infinity;

      // Also check for power-up
      if (this.powerUps.length > 0) {
        const nearest = this.powerUps.reduce((best, pu) => {
          const dist = Math.abs(pu.x - player.x) + Math.abs(pu.y - player.y);
          return dist < best.dist ? { pu, dist } : best;
        }, { pu: null, dist: Infinity });

        if (nearest.dist < 8) {
          const dx = Math.sign(nearest.pu.x - player.x);
          const dy = Math.sign(nearest.pu.y - player.y);
          if (dx !== 0) {
            this.movePlayer(player.id, dx, 0);
            return;
          }
          if (dy !== 0) {
            this.movePlayer(player.id, 0, dy);
            return;
          }
        }
      }

      // Strategic: prefer unclaimed or enemy tiles
      for (const dir of directions) {
        const nx = player.x + dir.dx;
        const ny = player.y + dir.dy;
        if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) continue;
        if (this.obstacleTiles.has(`${nx},${ny}`)) continue;

        let score = 0;
        const cell = this.grid[ny][nx];
        if (cell === null) score = 3; // unclaimed = high priority
        else if (cell !== player.deityIndex && cell !== 'obstacle') score = 2; // enemy tile
        else score = 0; // own tile

        // Add slight randomness
        score += Math.random() * 0.5;

        if (score > bestScore) {
          bestScore = score;
          bestDir = dir;
        }
      }

      if (bestDir) {
        this.movePlayer(player.id, bestDir.dx, bestDir.dy);
      }
    });
  }

  _notify() {
    if (this.onStateUpdate) {
      this.onStateUpdate(this.getState());
    }
  }

  getState() {
    return {
      grid: this.grid,
      players: this.players,
      powerUps: this.powerUps,
      timeRemaining: this.timeRemaining,
      isRunning: this.isRunning,
      isFinished: this.isFinished,
      winner: this.winner,
      events: this.events,
      effects: this.effects,
      shakeUntil: this.shakeUntil,
    };
  }

  destroy() {
    clearInterval(this.timerIntervalId);
    clearInterval(this.powerUpIntervalId);
    clearInterval(this.botIntervalId);
    this.isRunning = false;
  }
}
