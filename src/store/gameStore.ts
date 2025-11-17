import { create } from 'zustand';
import { GameState, Player, Kidnapper, Bullet } from '../types/game.types';
import { LevelGenerator } from '../utils/LevelGenerator';

const levelGenerator = new LevelGenerator();

const createInitialPlayer = (): Player => ({
  id: 'player',
  position: { x: 100, y: 100 },
  velocity: { x: 0, y: 0 },
  rotation: 0,
  radius: 20,
  health: 100,
  maxHealth: 100,
  speed: 200,
  fireRate: 300,
  lastShotTime: 0
});

const createInitialState = (): GameState => ({
  currentLevel: 1,
  player: createInitialPlayer(),
  kidnappers: [],
  hostages: [],
  bullets: [],
  gameStatus: 'menu',
  score: 0,
  killCount: 0,
  totalKills: 0,
  levelConfig: null
});

interface GameStore {
  gameState: GameState;

  // Actions
  initializeGame: () => void;
  startLevel: (levelNumber: number) => void;
  updatePlayer: (updates: Partial<Player>) => void;
  updateKidnappers: (kidnappers: Kidnapper[]) => void;
  addBullet: (bullet: Bullet) => void;
  removeBullet: (bulletId: string) => void;
  updateBullets: (bullets: Bullet[]) => void;
  damagePlayer: (damage: number) => void;
  killKidnapper: (kidnapperId: string) => void;
  completeLevel: () => void;
  gameOver: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetLevel: () => void;
  returnToMenu: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: createInitialState(),

  initializeGame: () => {
    set({ gameState: createInitialState() });
  },

  startLevel: (levelNumber: number) => {
    const levelConfig = levelGenerator.generateLevel(levelNumber);
    const player = createInitialPlayer();

    // Position player at spawn zone
    const playerSpawn = levelConfig.rooftopLayout.spawnZones.find(z => z.type === 'player');
    if (playerSpawn) {
      player.position = { ...playerSpawn.position };
    }

    // Create kidnappers
    const kidnappers: Kidnapper[] = [];
    const kidnapperSpawns = levelConfig.rooftopLayout.spawnZones.filter(z => z.type === 'kidnapper');

    for (let i = 0; i < levelConfig.kidnapperCount; i++) {
      const spawn = kidnapperSpawns[i % kidnapperSpawns.length];
      const kidnapper: Kidnapper = {
        id: `kidnapper-${i}`,
        position: {
          x: spawn.position.x + (Math.random() - 0.5) * spawn.radius,
          y: spawn.position.y + (Math.random() - 0.5) * spawn.radius
        },
        velocity: { x: 0, y: 0 },
        rotation: Math.random() * Math.PI * 2,
        radius: 20,
        health: 1,
        state: 'patrolling',
        viewDistance: 300 + levelConfig.difficulty * 50,
        viewAngle: Math.PI / 3,
        patrolPoints: levelGenerator.generatePatrolRoute(levelConfig.rooftopLayout),
        currentPatrolIndex: 0,
        alertness: 0,
        shootCooldown: 1500 - levelConfig.difficulty * 100,
        lastShotTime: 0,
        targetPosition: null
      };
      kidnappers.push(kidnapper);
    }

    // Create hostage
    const hostages = [{
      id: 'hostage-1',
      position: { ...levelConfig.rooftopLayout.hostagePosition },
      velocity: { x: 0, y: 0 },
      rotation: 0,
      radius: 15,
      rescued: false
    }];

    set({
      gameState: {
        currentLevel: levelNumber,
        player,
        kidnappers,
        hostages,
        bullets: [],
        gameStatus: 'playing',
        score: 0,
        killCount: 0,
        totalKills: get().gameState.totalKills,
        levelConfig
      }
    });
  },

  updatePlayer: (updates: Partial<Player>) => {
    set((state) => ({
      gameState: {
        ...state.gameState,
        player: { ...state.gameState.player, ...updates }
      }
    }));
  },

  updateKidnappers: (kidnappers: Kidnapper[]) => {
    set((state) => ({
      gameState: {
        ...state.gameState,
        kidnappers
      }
    }));
  },

  addBullet: (bullet: Bullet) => {
    set((state) => ({
      gameState: {
        ...state.gameState,
        bullets: [...state.gameState.bullets, bullet]
      }
    }));
  },

  removeBullet: (bulletId: string) => {
    set((state) => ({
      gameState: {
        ...state.gameState,
        bullets: state.gameState.bullets.filter(b => b.id !== bulletId)
      }
    }));
  },

  updateBullets: (bullets: Bullet[]) => {
    set((state) => ({
      gameState: {
        ...state.gameState,
        bullets
      }
    }));
  },

  damagePlayer: (damage: number) => {
    set((state) => ({
      gameState: {
        ...state.gameState,
        player: {
          ...state.gameState.player,
          health: Math.max(0, state.gameState.player.health - damage)
        }
      }
    }));
  },

  killKidnapper: (kidnapperId: string) => {
    set((state) => ({
      gameState: {
        ...state.gameState,
        kidnappers: state.gameState.kidnappers.filter(k => k.id !== kidnapperId),
        killCount: state.gameState.killCount + 1,
        totalKills: state.gameState.totalKills + 1,
        score: state.gameState.score + 100
      }
    }));
  },

  completeLevel: () => {
    set((state) => ({
      gameState: {
        ...state.gameState,
        gameStatus: 'levelComplete'
      }
    }));
  },

  gameOver: () => {
    set((state) => ({
      gameState: {
        ...state.gameState,
        gameStatus: 'gameOver'
      }
    }));
  },

  pauseGame: () => {
    set((state) => ({
      gameState: {
        ...state.gameState,
        gameStatus: 'paused'
      }
    }));
  },

  resumeGame: () => {
    set((state) => ({
      gameState: {
        ...state.gameState,
        gameStatus: 'playing'
      }
    }));
  },

  resetLevel: () => {
    const { currentLevel } = get().gameState;
    get().startLevel(currentLevel);
  },

  returnToMenu: () => {
    set((state) => ({
      gameState: {
        ...state.gameState,
        gameStatus: 'menu'
      }
    }));
  }
}));
