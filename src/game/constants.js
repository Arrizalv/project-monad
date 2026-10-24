// ═══════════════════════════════════════════════════════════════
// MONAD PANTHEON: CLASH OF DEITIES — Core Constants
// ═══════════════════════════════════════════════════════════════

// ── Map Configuration ──────────────────────────────────────────
export const GRID_SIZE = 20;
export const CANVAS_SIZE = 600;
export const TILE_SIZE = CANVAS_SIZE / GRID_SIZE; // 30px
export const GAME_DURATION = 60; // seconds

// ── Colors ─────────────────────────────────────────────────────
export const BG_COLOR = '#0F0A1C';
export const GRID_LINE_COLOR = 'rgba(255, 255, 255, 0.08)';
export const OBSTACLE_COLOR = '#2A2040';
export const OBSTACLE_ACCENT = '#C4A747';
export const POWERUP_COLOR = '#836EF9';

// ── Obstacles (Sacred Temple Pillars) ──────────────────────────
// Each pillar is a 2x2 block defined by its top-left coordinate
export const OBSTACLES = [
  { x: 5, y: 5 },
  { x: 5, y: 13 },
  { x: 13, y: 5 },
  { x: 13, y: 13 },
];

// Returns all blocked tile coordinates
export function getObstacleTiles() {
  const tiles = new Set();
  OBSTACLES.forEach(({ x, y }) => {
    tiles.add(`${x},${y}`);
    tiles.add(`${x + 1},${y}`);
    tiles.add(`${x},${y + 1}`);
    tiles.add(`${x + 1},${y + 1}`);
  });
  return tiles;
}

// ── Deity Definitions ──────────────────────────────────────────
export const DEITIES = [
  {
    id: 'molandak-zeus',
    name: 'Molandak-Zeus',
    title: 'God of 10,000 TPS',
    lore: 'Greek God Zeus fused with Molandak, the purple hedgehog — lord of parallelized thunder.',
    color: '#836EF9',
    colorRgb: '131, 110, 249',
    accent: '#C4B5FD',
    bgGradient: 'from-purple-900/40 to-indigo-900/40',
    borderColor: 'border-purple-500/50',
  },
  {
    id: 'anubis-chog',
    name: 'Anubis-Chog',
    title: 'Judge of the Mempool',
    lore: 'Egyptian God Anubis fused with Chog — guardian of fair ordering and mempool justice.',
    color: '#F59E0B',
    colorRgb: '245, 158, 11',
    accent: '#FCD34D',
    bgGradient: 'from-amber-900/40 to-yellow-900/40',
    borderColor: 'border-amber-500/50',
  },
  {
    id: 'moyaki-kraken',
    name: 'Moyaki-Kraken',
    title: 'Leviathan of Liquidity',
    lore: "Poseidon's Kraken fused with Moyaki, the purple octopus — titan of deep liquidity pools.",
    color: '#06B6D4',
    colorRgb: '6, 182, 212',
    accent: '#67E8F9',
    bgGradient: 'from-cyan-900/40 to-teal-900/40',
    borderColor: 'border-cyan-500/50',
  },
  {
    id: 'amaterasu-salmonad',
    name: 'Amaterasu-Salmonad',
    title: 'Spirit of Finality',
    lore: 'Japanese Sun Goddess fused with Salmonad — spirit of single-slot finality and solar consensus.',
    color: '#EF4444',
    colorRgb: '239, 68, 68',
    accent: '#FCA5A5',
    bgGradient: 'from-red-900/40 to-orange-900/40',
    borderColor: 'border-red-500/50',
  },
];

// ── Power-Up Config ────────────────────────────────────────────
export const POWERUP_SPAWN_INTERVAL = 15000; // ms
export const POWERUP_DURATION = 4000; // ms
export const POWERUP_RADIUS = 1; // 3x3 area (center ± 1)
export const POWERUP_SPEED_MULTIPLIER = 2;

// ── Movement ───────────────────────────────────────────────────
export const BASE_MOVE_COOLDOWN = 120; // ms between moves
export const BOOSTED_MOVE_COOLDOWN = 60; // ms when powered up

// ── Monad Testnet Configuration ────────────────────────────────
export const MONAD_TESTNET = {
  chainId: '0x279F',  // 10143 in hex
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: ['https://testnet-rpc.monad.xyz'],
  blockExplorerUrls: ['https://testnet.monadexplorer.com'],
};

// ── Smart Contract ─────────────────────────────────────────────
export const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Deploy & replace

export const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: '_tilesConquered', type: 'uint256' },
      { internalType: 'string', name: '_deity', type: 'string' },
    ],
    name: 'claimVictory',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'deityWins',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getHallOfFameCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'hallOfFame',
    outputs: [
      { internalType: 'address', name: 'winner', type: 'address' },
      { internalType: 'string', name: 'deity', type: 'string' },
      { internalType: 'uint256', name: 'tilesConquered', type: 'uint256' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'winner', type: 'address' },
      { indexed: false, internalType: 'string', name: 'deity', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'tilesConquered', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'ThroneClaimed',
    type: 'event',
  },
];

// ── Solidity Source (for in-UI viewer) ─────────────────────────
export const SOLIDITY_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MonadPantheonArena {
    struct VictoryRecord {
        address winner;
        string deity;
        uint256 tilesConquered;
        uint256 timestamp;
    }

    VictoryRecord[] public hallOfFame;
    mapping(address => uint256) public deityWins;

    event ThroneClaimed(
        address indexed winner,
        string deity,
        uint256 tilesConquered,
        uint256 timestamp
    );

    function claimVictory(
        uint256 _tilesConquered,
        string memory _deity
    ) external {
        require(_tilesConquered > 0, "Score must be greater than zero");
        hallOfFame.push(
            VictoryRecord(msg.sender, _deity, _tilesConquered, block.timestamp)
        );
        deityWins[msg.sender] += 1;
        emit ThroneClaimed(msg.sender, _deity, _tilesConquered, block.timestamp);
    }

    function getHallOfFameCount() external view returns (uint256) {
        return hallOfFame.length;
    }
}`;
