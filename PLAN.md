# Rooftop Rescue: Complete Implementation Plan

## 1. Project Overview

A top-down shooter game where players must eliminate kidnappers to rescue hostages across 1000 progressively challenging levels. The game features stealth mechanics, tactical combat, and persistent progression using browser storage.

## 2. Tech Stack & Setup

### 2.1 Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

### 2.2 Project Structure
```
src/
├── main.tsx
├── App.tsx
├── game/
│   ├── GameCanvas.tsx
│   ├── GameLoop.tsx
│   └── GameRenderer.tsx
├── entities/
│   ├── Player.ts
│   ├── Kidnapper.ts
│   ├── Hostage.ts
│   └── Bullet.ts
├── systems/
│   ├── CollisionSystem.ts
│   ├── AISystem.ts
│   ├── MovementSystem.ts
│   └── VisionSystem.ts
├── store/
│   ├── gameStore.ts
│   └── progressStore.ts
├── storage/
│   ├── IndexedDBManager.ts
│   └── StorageService.ts
├── ui/
│   ├── MainMenu.tsx
│   ├── HUD.tsx
│   ├── LevelComplete.tsx
│   ├── GameOver.tsx
│   └── PauseMenu.tsx
├── utils/
│   ├── Vector2D.ts
│   ├── Collision.ts
│   └── LevelGenerator.ts
└── types/
    └── game.types.ts
```

## 3. Core Type Definitions

### 3.1 game.types.ts
```typescript
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
}

export interface LevelConfig {
  levelNumber: number;
  kidnapperCount: number;
  rooftopLayout: RooftopLayout;
  difficulty: number;
}

export interface RooftopLayout {
  width: number;
  height: number;
  obstacles: Obstacle[];
  spawnZones: SpawnZone[];
  hostagePosition: Vector2D;
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

export interface SaveData {
  currentLevel: number;
  maxLevelReached: number;
  totalKills: number;
  totalDeaths: number;
  playTime: number;
  settings: GameSettings;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  difficulty: 'normal' | 'hard' | 'expert';
}
```

## 4. Storage System

### 4.1 IndexedDBManager.ts
```typescript
// Manages IndexedDB operations for persistent game data
class IndexedDBManager {
  private dbName = 'RooftopRescueDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  // Initialize database with stores: 'progress', 'levels', 'settings'
  async init(): Promise<void>
  
  // Save game progress
  async saveProgress(data: SaveData): Promise<void>
  
  // Load game progress
  async loadProgress(): Promise<SaveData | null>
  
  // Save level completion data
  async saveLevelCompletion(level: number, stats: LevelStats): Promise<void>
  
  // Get level completion data
  async getLevelStats(level: number): Promise<LevelStats | null>
  
  // Clear all data
  async clearAllData(): Promise<void>
}
```

### 4.2 StorageService.ts
```typescript
// High-level storage API combining IndexedDB and localStorage
class StorageService {
  private idb: IndexedDBManager;
  
  // Auto-save every 30 seconds during gameplay
  async autoSave(gameState: GameState): Promise<void>
  
  // Load complete game state
  async loadGame(): Promise<SaveData | null>
  
  // Save settings to localStorage for quick access
  saveSettings(settings: GameSettings): void
  
  // Load settings from localStorage
  loadSettings(): GameSettings
}
```

## 5. Game State Management

### 5.1 gameStore.ts (Zustand)
```typescript
interface GameStore {
  // State
  gameState: GameState;
  isPaused: boolean;
  
  // Actions
  initializeGame: () => void;
  startLevel: (levelNumber: number) => void;
  updatePlayer: (updates: Partial<Player>) => void;
  updateKidnappers: (kidnappers: Kidnapper[]) => void;
  addBullet: (bullet: Bullet) => void;
  removeBullet: (bulletId: string) => void;
  damagePlayer: (damage: number) => void;
  killKidnapper: (kidnapperId: string) => void;
  completeLevel: () => void;
  gameOver: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetLevel: () => void;
}
```

### 5.2 progressStore.ts (Zustand)
```typescript
interface ProgressStore {
  saveData: SaveData;
  
  updateProgress: (level: number) => void;
  incrementKills: () => void;
  incrementDeaths: () => void;
  updatePlayTime: (seconds: number) => void;
  loadSavedData: () => Promise<void>;
  resetProgress: () => void;
}
```

## 6. Core Game Systems

### 6.1 LevelGenerator.ts
```typescript
class LevelGenerator {
  // Generate level configuration based on level number
  generateLevel(levelNumber: number): LevelConfig {
    // Kidnapper count: Math.min(10, Math.floor(1 + levelNumber / 100))
    // Gradually increase from 1 to 10 over 1000 levels
    
    // Create procedural rooftop layout:
    // - Size increases every 100 levels
    // - Obstacles increase with difficulty
    // - Patrol patterns become more complex
    
    // Difficulty scaling:
    // - Kidnapper view distance increases
    // - Patrol speed increases
    // - Reaction time decreases
    // - Shooting accuracy increases
  }
  
  // Generate patrol points for kidnappers
  generatePatrolRoute(layout: RooftopLayout): Vector2D[]
  
  // Place obstacles procedurally
  generateObstacles(width: number, height: number, density: number): Obstacle[]
  
  // Find valid spawn positions
  findSpawnPositions(layout: RooftopLayout, count: number): Vector2D[]
}
```

### 6.2 VisionSystem.ts
```typescript
class VisionSystem {
  // Check if kidnapper can see target (player or another kidnapper)
  canSee(
    kidnapper: Kidnapper,
    target: Entity,
    obstacles: Obstacle[]
  ): boolean {
    // 1. Calculate distance to target
    // 2. Check if within view distance
    // 3. Check if within view cone (angle)
    // 4. Perform raycast to check for obstacles blocking line of sight
    // 5. Return true if all checks pass
  }
  
  // Raycast for line of sight
  raycast(from: Vector2D, to: Vector2D, obstacles: Obstacle[]): boolean
  
  // Check if point is in view cone
  isInViewCone(
    observer: Vector2D,
    observerRotation: number,
    target: Vector2D,
    viewAngle: number
  ): boolean
}
```

### 6.3 AISystem.ts
```typescript
class AISystem {
  private visionSystem: VisionSystem;
  
  // Update all kidnappers each frame
  update(
    kidnappers: Kidnapper[],
    player: Player,
    obstacles: Obstacle[],
    deltaTime: number
  ): Kidnapper[] {
    return kidnappers.map(k => this.updateKidnapper(k, player, kidnappers, obstacles, deltaTime));
  }
  
  // Update individual kidnapper AI
  private updateKidnapper(
    kidnapper: Kidnapper,
    player: Player,
    allKidnappers: Kidnapper[],
    obstacles: Obstacle[],
    deltaTime: number
  ): Kidnapper {
    switch (kidnapper.state) {
      case 'idle':
      case 'patrolling':
        return this.handlePatrol(kidnapper, player, allKidnappers, obstacles, deltaTime);
      case 'alerted':
        return this.handleAlerted(kidnapper, player, obstacles, deltaTime);
      case 'shooting':
        return this.handleShooting(kidnapper, player, obstacles, deltaTime);
    }
  }
  
  // Patrol behavior
  private handlePatrol(
    kidnapper: Kidnapper,
    player: Player,
    allKidnappers: Kidnapper[],
    obstacles: Obstacle[],
    deltaTime: number
  ): Kidnapper {
    // 1. Check if player is visible
    if (this.visionSystem.canSee(kidnapper, player, obstacles)) {
      return { ...kidnapper, state: 'alerted', targetPosition: player.position };
    }
    
    // 2. Check if any other kidnapper in sight is dead/alerted
    for (const other of allKidnappers) {
      if (other.id !== kidnapper.id && other.state === 'alerted') {
        if (this.visionSystem.canSee(kidnapper, other, obstacles)) {
          return { ...kidnapper, state: 'alerted', alertness: 100 };
        }
      }
    }
    
    // 3. Move along patrol route
    // Move toward current patrol point
    // When reached, increment to next patrol point
    // Update position and rotation
  }
  
  // Alert behavior - move toward last known player position
  private handleAlerted(
    kidnapper: Kidnapper,
    player: Player,
    obstacles: Obstacle[],
    deltaTime: number
  ): Kidnapper {
    // 1. If player visible, switch to shooting
    if (this.visionSystem.canSee(kidnapper, player, obstacles)) {
      return { ...kidnapper, state: 'shooting', targetPosition: player.position };
    }
    
    // 2. Move toward last known position
    // 3. If reached, search area briefly then return to patrol
  }
  
  // Shooting behavior
  private handleShooting(
    kidnapper: Kidnapper,
    player: Player,
    obstacles: Obstacle[],
    deltaTime: number
  ): Kidnapper {
    // 1. Check if player still visible
    if (!this.visionSystem.canSee(kidnapper, player, obstacles)) {
      return { ...kidnapper, state: 'alerted', targetPosition: player.position };
    }
    
    // 2. Rotate to face player
    // 3. Fire bullet if cooldown elapsed (return bullet to spawn in game loop)
    // 4. Track player position
  }
  
  // Calculate bullets to spawn (called by game loop)
  getBulletsToSpawn(kidnappers: Kidnapper[], currentTime: number): Bullet[]
}
```

### 6.4 MovementSystem.ts
```typescript
class MovementSystem {
  // Update entity position based on velocity
  updatePosition(entity: Entity, deltaTime: number): Entity
  
  // Calculate movement toward target
  moveToward(
    entity: Entity,
    target: Vector2D,
    speed: number,
    deltaTime: number
  ): Entity
  
  // Handle player input movement (WASD)
  handlePlayerMovement(
    player: Player,
    input: InputState,
    deltaTime: number
  ): Player
  
  // Rotate entity to face direction
  rotateToward(entity: Entity, target: Vector2D): Entity
  
  // Constrain entity within bounds
  constrainToBounds(entity: Entity, bounds: Rectangle): Entity
}
```

### 6.5 CollisionSystem.ts
```typescript
class CollisionSystem {
  // Check circle-circle collision
  checkCircleCollision(a: Entity, b: Entity): boolean
  
  // Check circle-rectangle collision (for obstacles)
  checkObstacleCollision(entity: Entity, obstacle: Obstacle): boolean
  
  // Resolve all collisions for entities
  resolveCollisions(
    entities: Entity[],
    obstacles: Obstacle[]
  ): Entity[]
  
  // Check bullet collisions
  checkBulletCollisions(
    bullets: Bullet[],
    player: Player,
    kidnappers: Kidnapper[]
  ): {
    playerHits: Bullet[];
    kidnapperHits: Map<string, Bullet[]>;
    remainingBullets: Bullet[];
  }
}
```

## 7. Game Loop

### 7.1 GameLoop.tsx
```typescript
// Main game loop component using requestAnimationFrame
const GameLoop: React.FC = () => {
  const gameState = useGameStore(state => state.gameState);
  const [lastTime, setLastTime] = useState(0);
  
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') return;
    
    let animationFrameId: number;
    
    const loop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      setLastTime(currentTime);
      
      // Update game systems
      updateGame(deltaTime);
      
      animationFrameId = requestAnimationFrame(loop);
    };
    
    animationFrameId = requestAnimationFrame(loop);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState.gameStatus, lastTime]);
  
  const updateGame = (deltaTime: number) => {
    // 1. Handle input
    const input = getInputState();
    
    // 2. Update player
    let updatedPlayer = movementSystem.handlePlayerMovement(
      gameState.player,
      input,
      deltaTime
    );
    
    // Handle player shooting
    if (input.shooting && canShoot(updatedPlayer)) {
      const bullet = createPlayerBullet(updatedPlayer);
      addBullet(bullet);
      updatedPlayer = { ...updatedPlayer, lastShotTime: Date.now() };
    }
    
    // 3. Update AI
    const updatedKidnappers = aiSystem.update(
      gameState.kidnappers,
      updatedPlayer,
      gameState.obstacles,
      deltaTime
    );
    
    // 4. Spawn kidnapper bullets
    const newBullets = aiSystem.getBulletsToSpawn(updatedKidnappers, Date.now());
    newBullets.forEach(addBullet);
    
    // 5. Update bullets
    const updatedBullets = gameState.bullets
      .map(b => movementSystem.updatePosition(b, deltaTime))
      .filter(b => Date.now() - b.createdAt < b.lifespan);
    
    // 6. Check collisions
    const collisionResults = collisionSystem.checkBulletCollisions(
      updatedBullets,
      updatedPlayer,
      updatedKidnappers
    );
    
    // Apply damage to player
    if (collisionResults.playerHits.length > 0) {
      damagePlayer(collisionResults.playerHits.length * 5);
      updatedPlayer = { ...updatedPlayer, health: gameState.player.health - (collisionResults.playerHits.length * 5) };
    }
    
    // Remove killed kidnappers
    const survivingKidnappers = updatedKidnappers.filter(
      k => !collisionResults.kidnapperHits.has(k.id)
    );
    
    // Alert nearby kidnappers when one is killed
    collisionResults.kidnapperHits.forEach((bullets, kidnapperId) => {
      killKidnapper(kidnapperId);
      alertNearbyKidnappers(kidnapperId, survivingKidnappers);
    });
    
    // 7. Update store
    updatePlayer(updatedPlayer);
    updateKidnappers(survivingKidnappers);
    // Update bullets in store
    
    // 8. Check win/lose conditions
    if (updatedPlayer.health <= 0) {
      gameOver();
    } else if (survivingKidnappers.length === 0) {
      completeLevel();
    }
  };
  
  return null; // This component doesn't render anything
};
```

## 8. Rendering

### 8.1 GameCanvas.tsx
```typescript
// Main canvas component
const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useGameStore(state => state.gameState);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Render game
    renderGame(ctx, gameState);
  }, [gameState]);
  
  return (
    <canvas
      ref={canvasRef}
      width={1280}
      height={720}
      style={{ border: '2px solid #333' }}
    />
  );
};
```

### 8.2 GameRenderer.tsx
```typescript
class GameRenderer {
  // Render complete game state
  render(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    // 1. Draw rooftop background
    this.drawBackground(ctx, gameState.level.layout);
    
    // 2. Draw obstacles
    gameState.level.layout.obstacles.forEach(obs => 
      this.drawObstacle(ctx, obs)
    );
    
    // 3. Draw hostage
    gameState.hostages.forEach(h => this.drawHostage(ctx, h));
    
    // 4. Draw bullets
    gameState.bullets.forEach(b => this.drawBullet(ctx, b));
    
    // 5. Draw kidnappers with vision cones
    gameState.kidnappers.forEach(k => {
      this.drawVisionCone(ctx, k);
      this.drawKidnapper(ctx, k);
    });
    
    // 6. Draw player
    this.drawPlayer(ctx, gameState.player);
  }
  
  private drawBackground(ctx: CanvasRenderingContext2D, layout: RooftopLayout): void {
    // Draw rooftop texture/gradient
    // Draw grid lines
    // Draw edge walls
  }
  
  private drawPlayer(ctx: CanvasRenderingContext2D, player: Player): void {
    // Draw player circle with direction indicator
    // Color: #00FF00 (green)
    // Draw aiming line
  }
  
  private drawKidnapper(ctx: CanvasRenderingContext2D, kidnapper: Kidnapper): void {
    // Draw kidnapper circle
    // Color based on state:
    //   - idle/patrolling: #FFA500 (orange)
    //   - alerted: #FFFF00 (yellow)
    //   - shooting: #FF0000 (red)
    // Draw direction indicator
  }
  
  private drawVisionCone(ctx: CanvasRenderingContext2D, kidnapper: Kidnapper): void {
    // Draw semi-transparent cone showing vision range
    // Opacity based on alertness
  }
  
  private drawHostage(ctx: CanvasRenderingContext2D, hostage: Hostage): void {
    // Draw hostage icon/sprite
    // Color: #00FFFF (cyan)
  }
  
  private drawBullet(ctx: CanvasRenderingContext2D, bullet: Bullet): void {
    // Draw small circle or line
    // Player bullets: white
    // Enemy bullets: red
  }
  
  private drawObstacle(ctx: CanvasRenderingContext2D, obstacle: Obstacle): void {
    // Draw based on obstacle type
    // Add shadows for depth
  }
}
```

## 9. UI Components

### 9.1 MainMenu.tsx
```typescript
const MainMenu: React.FC = () => {
  const { startLevel, loadSavedData } = useGameStore();
  const { saveData } = useProgressStore();
  
  const handleContinue = () => {
    startLevel(saveData.currentLevel);
  };
  
  const handleNewGame = () => {
    // Confirm if progress exists
    startLevel(1);
  };
  
  return (
    <div className="main-menu">
      <h1>ROOFTOP RESCUE</h1>
      <div className="menu-buttons">
        {saveData.currentLevel > 1 && (
          <button onClick={handleContinue}>
            Continue (Level {saveData.currentLevel})
          </button>
        )}
        <button onClick={handleNewGame}>New Game</button>
        <button onClick={() => {}}>Level Select</button>
        <button onClick={() => {}}>Settings</button>
        <button onClick={() => {}}>Statistics</button>
      </div>
    </div>
  );
};
```

### 9.2 HUD.tsx
```typescript
const HUD: React.FC = () => {
  const gameState = useGameStore(state => state.gameState);
  
  return (
    <div className="hud">
      <div className="top-bar">
        <div className="health-bar">
          <label>Health:</label>
          <div className="bar">
            <div 
              className="fill"
              style={{ 
                width: `${(gameState.player.health / gameState.player.maxHealth) * 100}%`,
                backgroundColor: gameState.player.health > 50 ? '#00FF00' : '#FF0000'
              }}
            />
          </div>
          <span>{gameState.player.health} / {gameState.player.maxHealth}</span>
        </div>
        
        <div className="level-info">
          Level {gameState.currentLevel} / 1000
        </div>
        
        <div className="enemies-remaining">
          Enemies: {gameState.kidnappers.length}
        </div>
      </div>
      
      <div className="minimap">
        {/* Optional: Mini-map showing positions */}
      </div>
      
      <div className="controls-hint">
        WASD: Move | Mouse: Aim | Click: Shoot | ESC: Pause
      </div>
    </div>
  );
};
```

### 9.3 LevelComplete.tsx
```typescript
const LevelComplete: React.FC = () => {
  const { currentLevel, killCount } = useGameStore();
  const { updateProgress } = useProgressStore();
  
  const handleNextLevel = () => {
    updateProgress(currentLevel + 1);
    startLevel(currentLevel + 1);
  };
  
  const handleRetry = () => {
    startLevel(currentLevel);
  };
  
  const handleMenu = () => {
    // Return to main menu
  };
  
  return (
    <div className="level-complete-modal">
      <h2>LEVEL {currentLevel} COMPLETE!</h2>
      
      <div className="stats">
        <div>Enemies Eliminated: {killCount}</div>
        <div>Health Remaining: {gameState.player.health}</div>
        <div>Time: {formatTime(levelTime)}</div>
      </div>
      
      <div className="buttons">
        <button className="primary" onClick={handleNextLevel}>
          Next Level
        </button>
        <button onClick={handleRetry}>Retry</button>
        <button onClick={handleMenu}>Main Menu</button>
      </div>
    </div>
  );
};
```

### 9.4 GameOver.tsx
```typescript
const GameOver: React.FC = () => {
  const { currentLevel } = useGameStore();
  const { incrementDeaths } = useProgressStore();
  
  useEffect(() => {
    incrementDeaths();
  }, []);
  
  const handleRetry = () => {
    startLevel(currentLevel);
  };
  
  const handleMenu = () => {
    // Return to main menu
  };
  
  return (
    <div className="game-over-modal">
      <h2>MISSION FAILED</h2>
      <p>The kidnappers eliminated you!</p>
      
      <div className="buttons">
        <button className="primary" onClick={handleRetry}>
          Retry Level
        </button>
        <button onClick={handleMenu}>Main Menu</button>
      </div>
    </div>
  );
};
```

### 9.5 PauseMenu.tsx
```typescript
const PauseMenu: React.FC = () => {
  const { resumeGame, resetLevel } = useGameStore();
  
  return (
    <div className="pause-menu-modal">
      <h2>PAUSED</h2>
      
      <div className="buttons">
        <button className="primary" onClick={resumeGame}>
          Resume
        </button>
        <button onClick={resetLevel}>Restart Level</button>
        <button onClick={() => {}}>Settings</button>
        <button onClick={() => {}}>Main Menu</button>
      </div>
    </div>
  );
};
```

## 10. Input Handling

### 10.1 Input System
```typescript
interface InputState {
  moveUp: boolean;
  moveDown: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  shooting: boolean;
  mousePosition: Vector2D;
  pausePressed: boolean;
}

class InputManager {
  private state: InputState = {
    moveUp: false,
    moveDown: false,
    moveLeft: false,
    moveRight: false,
    shooting: false,
    mousePosition: { x: 0, y: 0 },
    pausePressed: false
  };
  
  constructor(canvas: HTMLCanvasElement) {
    this.setupEventListeners(canvas);
  }
  
  private setupEventListeners(canvas: HTMLCanvasElement): void {
    // Keyboard events
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    
    // Mouse events
    canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e, canvas));
    canvas.addEventListener('mousedown', () => this.state.shooting = true);
    canvas.addEventListener('mouseup', () => this.state.shooting = false);
    canvas.addEventListener('mouseleave', () => this.state.shooting = false);
  }
  
  private handleKeyDown(e: KeyboardEvent): void {
    switch(e.key.toLowerCase()) {
      case 'w': this.state.moveUp = true; break;
      case 's': this.state.moveDown = true; break;
      case 'a': this.state.moveLeft = true; break;
      case 'd': this.state.moveRight = true; break;
      case 'escape': this.state.pausePressed = true; break;
    }
  }
  
  private handleKeyUp(e: KeyboardEvent): void {
    switch(e.key.toLowerCase()) {
      case 'w': this.state.moveUp = false; break;
      case 's': this.state.moveDown = false; break;
      case 'a': this.state.moveLeft = false; break;
      case 'd': this.state.moveRight = false; break;
      case 'escape': this.state.pausePressed = false; break;
    }
  }
  
  private handleMouseMove(e: MouseEvent, canvas: HTMLCanvasElement): void {
    const rect = canvas.getBoundingClientRect();
    this.state.mousePosition = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }
  
  getState(): InputState {
    return { ...this.state };
  }
  
  resetPausePressed(): void {
    this.state.pausePressed = false;
  }
}
```

## 11. Utility Functions

### 11.1 Vector2D.ts
```typescript
export class Vector2D {
  constructor(public x: number, public y: number) {}
  
  static add(a: Vector2D, b: Vector2D): Vector2D {
    return new Vector2D(a.x + b.x, a.y + b.y);
  }
  
  static subtract(a: Vector2D, b: Vector2D): Vector2D {
    return new Vector2D(a.x - b.x, a.y - b.y);
  }
  
  static multiply(v: Vector2D, scalar: number): Vector2D {
    return new Vector2D(v.x * scalar, v.y * scalar);
  }
  
  static distance(a: Vector2D, b: Vector2D): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  static normalize(v: Vector2D): Vector2D {
    const length = Math.sqrt(v.x * v.x + v.y * v.y);
    if (length === 0) return new Vector2D(0, 0);
    return new Vector2D(v.x / length, v.y / length);
  }
  
  static angle(v: Vector2D): number {
    return Math.atan2(v.y, v.x);
  }
  
  static fromAngle(angle: number, length: number = 1): Vector2D {
    return new Vector2D(
      Math.cos(angle) * length,
      Math.sin(angle) * length
    );
  }
  
  static lerp(a: Vector2D, b: Vector2D, t: number): Vector2D {
    return new Vector2D(
      a.x + (b.x - a.x) * t,
      a.y + (b.y - a.y) * t
    );
  }
}
```

## 12. App Structure

### 12.1 App.tsx
```typescript
const App: React.FC = () => {
  const gameStatus = useGameStore(state => state.gameState.gameStatus);
  const { loadSavedData } = useProgressStore();
  
  useEffect(() => {
    // Initialize storage and load saved data
    loadSavedData();
  }, []);
  
  return (
    <div className="app">
      {gameStatus === 'menu' && <MainMenu />}
      
      {gameStatus === 'playing' && (
        <>
          <GameCanvas />
          <GameLoop />
          <HUD />
        </>
      )}
      
      {gameStatus === 'paused' && (
        <>
          <GameCanvas />
          <HUD />
          <PauseMenu />
        </>
      )}
      
      {gameStatus === 'levelComplete' && (
        <>
          <GameCanvas />
          <LevelComplete />
        </>
      )}
      
      {gameStatus === 'gameOver' && (
        <>
          <GameCanvas />
          <GameOver />
        </>
      )}
    </div>
  );
};
```

## 13. Styling Guidelines

### 13.1 Global Styles
```css
/* Dark tactical theme */
:root {
  --bg-dark: #0a0e1a;
  --bg-medium: #1a1f35;
  --bg-light: #2a3050;
  --accent-green: #00ff00;
  --accent-red: #ff0000;
  --accent-yellow: #ffff00;
  --text-light: #ffffff;
  --text-dim: #8892b0;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Courier New', monospace;
  background: var(--bg-dark);
  color: var(--text-light);
  overflow: hidden;
}

.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* Buttons */
button {
  background: var(--bg-light);
  border: 2px solid var(--accent-green);
  color: var(--text-light);
  padding: 12px 24px;
  font-size: 16px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
}

button:hover {
  background: var(--accent-green);
  color: var(--bg-dark);
  box-shadow: 0 0 20px var(--accent-green);
}

button.primary {
  background: var(--accent-green);
  color: var(--bg-dark);
}

button.primary:hover {
  box-shadow: 0 0 30px var(--accent-green);
}

/* Modals */
.modal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg-medium);
  border: 3px solid var(--accent-green);
  padding: 40px;
  min-width: 400px;
  text-align: center;
  box-shadow: 0 0 50px rgba(0, 255, 0, 0.3);
  z-index: 1000;
}

/* HUD */
.hud {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(to bottom, rgba(10, 14, 26, 0.9), transparent);
  z-index: 100;
}

.health-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bar {
  width: 200px;
  height: 20px;
  background: var(--bg-dark);
  border: 2px solid var(--accent-green);
  position: relative;
}

.bar .fill {
  height: 100%;
  transition: width 0.3s, background-color 0.3s;
}
```

## 14. Performance Optimizations

### 14.1 Optimization Strategies
1. **Entity Pooling**: Reuse bullet objects instead of creating new ones
2. **Spatial Partitioning**: Use grid-based system for collision detection
3. **Culling**: Only render entities within viewport
4. **Request Animation Frame**: Use proper frame timing
5. **Memoization**: Use React.memo for UI components
6. **Web Workers**: Consider offloading AI calculations for high kidnapper counts
7. **Canvas Optimization**: Use layered canvases (background, entities, UI)

### 14.2 Storage Optimization
1. **Compress Save Data**: Use JSON compression for IndexedDB
2. **Lazy Loading**: Only load level data when needed
3. **Debounce Auto-save**: Save every 30 seconds, not every frame
4. **IndexedDB Transactions**: Batch writes for better performance

## 15. Game Balance Parameters

### 15.1 Core Values
```typescript
const GAME_BALANCE = {
  PLAYER: {
    MAX_HEALTH: 100,
    SPEED: 200, // pixels per second
    FIRE_RATE: 300, // milliseconds between shots
    RADIUS: 20
  },
  
  KIDNAPPER: {
    BASE_HEALTH: 1,
    BASE_SPEED: 80,
    BASE_VIEW_DISTANCE: 300,
    BASE_VIEW_ANGLE: Math.PI / 3, // 60 degrees
    BASE_FIRE_RATE: 1500,
    RADIUS: 20,
    
    // Scaling per 100 levels
    SPEED_SCALE: 10,
    VIEW_DISTANCE_SCALE: 50,
    FIRE_RATE_REDUCTION: 100
  },
  
  BULLET: {
    PLAYER_SPEED: 600,
    PLAYER_DAMAGE: 999, // Instant kill
    ENEMY_SPEED: 400,
    ENEMY_DAMAGE: 5,
    LIFESPAN: 3000, // milliseconds
    RADIUS: 5
  },
  
  LEVEL: {
    BASE_WIDTH: 1280,
    BASE_HEIGHT: 720,
    SIZE_INCREASE_PER_100_LEVELS: 200,
    MIN_KIDNAPPERS: 1,
    MAX_KIDNAPPERS: 10,
    KIDNAPPER_INCREASE_RATE: 0.01 // Per level
  }
};
```

## 16. Testing Checklist

### 16.1 Core Functionality
- [ ] Player movement (WASD)
- [ ] Player shooting (mouse aim + click)
- [ ] Kidnapper patrol behavior
- [ ] Kidnapper alert when seeing player
- [ ] Kidnapper alert when seeing killed kidnapper
- [ ] Kidnapper shooting at player
- [ ] Bullet collision detection
- [ ] Health system
- [ ] Level completion
- [ ] Game over
- [ ] Pause/resume

### 16.2 Progression
- [ ] Level generation (1-1000)
- [ ] Kidnapper count scaling
- [ ] Difficulty scaling
- [ ] Save progress
- [ ] Load progress
- [ ] Level selection
- [ ] Statistics tracking

### 16.3 Edge Cases
- [ ] Multiple kidnappers alerted simultaneously
- [ ] Player death during level completion
- [ ] Bullets off-screen
- [ ] Collision with obstacles
- [ ] IndexedDB quota exceeded
- [ ] Browser storage disabled
- [ ] Tab visibility changes

## 17. Implementation Order

### Phase 1: Core Setup (1-2 hours)
1. Create Vite + React + TypeScript project
2. Set up type definitions
3. Create basic folder structure
4. Install Zustand

### Phase 2: Game State & Storage (2-3 hours)
1. Implement IndexedDBManager
2. Create Zustand stores
3. Implement StorageService
4. Test save/load functionality

### Phase 3: Core Systems (4-5 hours)
1. Implement Vector2D utilities
2. Create MovementSystem
3. Create CollisionSystem
4. Create VisionSystem
5. Create basic AISystem

### Phase 4: Level Generation (2-3 hours)
1. Implement LevelGenerator
2. Create procedural layouts
3. Test level scaling

### Phase 5: Game Loop & Rendering (3-4 hours)
1. Create GameLoop component
2. Implement GameRenderer
3. Create GameCanvas
4. Test rendering

### Phase 6: Input & Player Control (1-2 hours)
1. Implement InputManager
2. Wire up player controls
3. Test shooting mechanics

### Phase 7: AI Implementation (3-4 hours)
1. Complete AISystem
2. Implement patrol behavior
3. Implement alert behavior
4. Implement shooting behavior
5. Test vision system

### Phase 8: UI Components (2-3 hours)
1. Create MainMenu
2. Create HUD
3. Create LevelComplete
4. Create GameOver
5. Create PauseMenu

### Phase 9: Game Balance & Polish (2-3 hours)
1. Tune difficulty parameters
2. Add visual effects
3. Add sound effects (optional)
4. Optimize performance

### Phase 10: Testing & Bug Fixes (2-3 hours)
1. Test all 1000 levels
2. Fix bugs
3. Test edge cases
4. Optimize storage

**Total Estimated Time: 22-32 hours**

## 18. Key Implementation Notes

1. **Vision System**: The critical feature - kidnappers must see line-of-sight to player or other alerted kidnappers
2. **Cascade Alert**: When a kidnapper is killed, nearby kidnappers who can see the body must alert
3. **Health Reset**: Player health resets to 100 at start of each level
4. **Instant Kill**: Player bullets instantly kill kidnappers (no health bar needed for them)
5. **Static Hosting**: No backend APIs, all data in IndexedDB/localStorage
6. **1000 Levels**: Use procedural generation with difficulty scaling
7. **Save System**: Auto-save progress, allow level selection up to max reached
8. **Performance**: Must handle 10 kidnappers with AI calculations at 60fps

This plan provides complete specifications for an LLM to implement the entire game. Each system is clearly defined with its responsibilities, methods, and integration points.