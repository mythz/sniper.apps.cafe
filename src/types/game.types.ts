export interface Vector2D {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  radius: number;
}

export interface Player extends Entity {
  health: number;
  maxHealth: number;
  speed: number;
  fireRate: number;
  lastShotTime: number;
}

export interface Kidnapper extends Entity {
  health: number;
  state: 'idle' | 'patrolling' | 'alerted' | 'shooting';
  viewDistance: number;
  viewAngle: number;
  patrolPoints: Vector2D[];
  currentPatrolIndex: number;
  alertness: number;
  shootCooldown: number;
  lastShotTime: number;
  targetPosition: Vector2D | null;
}

export interface Hostage extends Entity {
  rescued: boolean;
}

export interface Bullet extends Entity {
  damage: number;
  ownerId: string;
  lifespan: number;
  createdAt: number;
}

export interface Obstacle {
  position: Vector2D;
  width: number;
  height: number;
  type: 'wall' | 'crate' | 'hvac' | 'watertank';
}

export interface SpawnZone {
  position: Vector2D;
  radius: number;
  type: 'player' | 'kidnapper';
}

export interface RooftopLayout {
  width: number;
  height: number;
  obstacles: Obstacle[];
  spawnZones: SpawnZone[];
  hostagePosition: Vector2D;
}

export interface LevelConfig {
  levelNumber: number;
  kidnapperCount: number;
  rooftopLayout: RooftopLayout;
  difficulty: number;
}

export interface GameState {
  currentLevel: number;
  player: Player;
  kidnappers: Kidnapper[];
  hostages: Hostage[];
  bullets: Bullet[];
  gameStatus: 'menu' | 'playing' | 'paused' | 'levelComplete' | 'gameOver';
  score: number;
  killCount: number;
  totalKills: number;
  levelConfig: LevelConfig | null;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  difficulty: 'normal' | 'hard' | 'expert';
}

export interface SaveData {
  currentLevel: number;
  maxLevelReached: number;
  totalKills: number;
  totalDeaths: number;
  playTime: number;
  settings: GameSettings;
}

export interface LevelStats {
  level: number;
  completionTime: number;
  killCount: number;
  healthRemaining: number;
  completed: boolean;
}

export interface InputState {
  moveUp: boolean;
  moveDown: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  shooting: boolean;
  mousePosition: Vector2D;
  pausePressed: boolean;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}
