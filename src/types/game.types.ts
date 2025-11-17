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
  type: 'normal' | 'scout' | 'heavy';
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

export interface HealthPickup extends Entity {
  amount: number;
  collected: boolean;
}

export interface Particle {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  alpha: number;
}

export interface RooftopLayout {
  width: number;
  height: number;
  obstacles: Obstacle[];
  spawnZones: SpawnZone[];
  hostagePosition: Vector2D;
  healthPickups: HealthPickup[];
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
  healthPickups: HealthPickup[];
  particles: Particle[];
  gameStatus: 'menu' | 'playing' | 'paused' | 'levelComplete' | 'gameOver';
  score: number;
  killCount: number;
  totalKills: number;
  levelConfig: LevelConfig | null;
  killStreak: number;
  lastKillTime: number;
  scoreMultiplier: number;
  cameraShake: number;
  showTutorial: boolean;
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
  totalScore: number;
  bestKillStreak: number;
  shotsFired: number;
  shotsHit: number;
  healthPickupsCollected: number;
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
