import { LevelConfig, RooftopLayout, Obstacle, SpawnZone, Vector2D, HealthPickup } from '../types/game.types';

export class LevelGenerator {
  generateLevel(levelNumber: number): LevelConfig {
    const difficulty = Math.floor(levelNumber / 100);

    // Kidnapper count increases from 1 to 10 over 1000 levels
    const kidnapperCount = Math.min(10, Math.max(1, Math.floor(1 + levelNumber / 100)));

    const rooftopLayout = this.generateRooftopLayout(levelNumber, difficulty);

    return {
      levelNumber,
      kidnapperCount,
      rooftopLayout,
      difficulty
    };
  }

  private generateRooftopLayout(levelNumber: number, difficulty: number): RooftopLayout {
    // Base size increases every 100 levels
    const baseWidth = 1280;
    const baseHeight = 720;
    const sizeIncrease = Math.floor(levelNumber / 100) * 200;

    const width = baseWidth + sizeIncrease;
    const height = baseHeight + sizeIncrease;

    // Generate obstacles - density increases with difficulty
    const obstacleDensity = 0.001 + difficulty * 0.0005;
    const obstacles = this.generateObstacles(width, height, obstacleDensity);

    // Generate spawn zones
    const spawnZones = this.generateSpawnZones(width, height, obstacles, difficulty);

    // Place hostage in a safe location
    const hostagePosition = this.findSafePosition(width, height, obstacles, spawnZones);

    // Generate health pickups (more on harder levels)
    const healthPickups = this.generateHealthPickups(width, height, obstacles, spawnZones, difficulty);

    return {
      width,
      height,
      obstacles,
      spawnZones,
      hostagePosition,
      healthPickups
    };
  }

  generateObstacles(width: number, height: number, density: number): Obstacle[] {
    const obstacles: Obstacle[] = [];
    const obstacleCount = Math.floor(width * height * density);
    const obstacleTypes: Array<'wall' | 'crate' | 'hvac' | 'watertank'> = ['wall', 'crate', 'hvac', 'watertank'];

    // Add perimeter walls
    const wallThickness = 20;
    obstacles.push(
      { position: { x: 0, y: 0 }, width: width, height: wallThickness, type: 'wall' },
      { position: { x: 0, y: 0 }, width: wallThickness, height: height, type: 'wall' },
      { position: { x: width - wallThickness, y: 0 }, width: wallThickness, height: height, type: 'wall' },
      { position: { x: 0, y: height - wallThickness }, width: width, height: wallThickness, type: 'wall' }
    );

    // Add random obstacles
    for (let i = 0; i < obstacleCount; i++) {
      const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      const obstacleWidth = 50 + Math.random() * 100;
      const obstacleHeight = 50 + Math.random() * 100;

      const obstacle: Obstacle = {
        position: {
          x: wallThickness + Math.random() * (width - obstacleWidth - wallThickness * 2),
          y: wallThickness + Math.random() * (height - obstacleHeight - wallThickness * 2)
        },
        width: obstacleWidth,
        height: obstacleHeight,
        type
      };

      // Check if it overlaps with existing obstacles
      const overlaps = obstacles.some(existing => this.obstaclesOverlap(obstacle, existing));
      if (!overlaps) {
        obstacles.push(obstacle);
      }
    }

    return obstacles;
  }

  private obstaclesOverlap(a: Obstacle, b: Obstacle): boolean {
    return !(
      a.position.x + a.width < b.position.x ||
      b.position.x + b.width < a.position.x ||
      a.position.y + a.height < b.position.y ||
      b.position.y + b.height < a.position.y
    );
  }

  private generateSpawnZones(
    width: number,
    height: number,
    _obstacles: Obstacle[],
    difficulty: number
  ): SpawnZone[] {
    const zones: SpawnZone[] = [];
    const wallPadding = 100;

    // Player spawn zone - always in a corner
    const playerSpawn: SpawnZone = {
      position: {
        x: wallPadding,
        y: wallPadding
      },
      radius: 50,
      type: 'player'
    };
    zones.push(playerSpawn);

    // Kidnapper spawn zones - distributed across the map
    const kidnapperZoneCount = Math.max(3, Math.floor(difficulty / 2) + 3);
    for (let i = 0; i < kidnapperZoneCount; i++) {
      let attempts = 0;
      while (attempts < 20) {
        const position: Vector2D = {
          x: wallPadding + Math.random() * (width - wallPadding * 2),
          y: wallPadding + Math.random() * (height - wallPadding * 2)
        };

        // Check distance from player spawn
        const distFromPlayer = Math.sqrt(
          Math.pow(position.x - playerSpawn.position.x, 2) +
          Math.pow(position.y - playerSpawn.position.y, 2)
        );

        if (distFromPlayer > 200) {
          const zone: SpawnZone = {
            position,
            radius: 80,
            type: 'kidnapper'
          };
          zones.push(zone);
          break;
        }
        attempts++;
      }
    }

    return zones;
  }

  private findSafePosition(
    width: number,
    height: number,
    _obstacles: Obstacle[],
    spawnZones: SpawnZone[]
  ): Vector2D {
    const wallPadding = 100;

    // Place hostage away from spawn zones
    for (let i = 0; i < 50; i++) {
      const position: Vector2D = {
        x: wallPadding + Math.random() * (width - wallPadding * 2),
        y: wallPadding + Math.random() * (height - wallPadding * 2)
      };

      // Check distance from all spawn zones
      const farEnoughFromSpawns = spawnZones.every(zone => {
        const dist = Math.sqrt(
          Math.pow(position.x - zone.position.x, 2) +
          Math.pow(position.y - zone.position.y, 2)
        );
        return dist > 150;
      });

      if (farEnoughFromSpawns) {
        return position;
      }
    }

    // Fallback position
    return { x: width / 2, y: height / 2 };
  }

  generatePatrolRoute(layout: RooftopLayout): Vector2D[] {
    const points: Vector2D[] = [];
    const patrolPointCount = 3 + Math.floor(Math.random() * 3); // 3-5 points
    const wallPadding = 100;

    for (let i = 0; i < patrolPointCount; i++) {
      points.push({
        x: wallPadding + Math.random() * (layout.width - wallPadding * 2),
        y: wallPadding + Math.random() * (layout.height - wallPadding * 2)
      });
    }

    return points;
  }

  findSpawnPositions(layout: RooftopLayout, count: number): Vector2D[] {
    const positions: Vector2D[] = [];
    const kidnapperZones = layout.spawnZones.filter(z => z.type === 'kidnapper');

    for (let i = 0; i < count; i++) {
      const zone = kidnapperZones[i % kidnapperZones.length];
      positions.push({
        x: zone.position.x + (Math.random() - 0.5) * zone.radius,
        y: zone.position.y + (Math.random() - 0.5) * zone.radius
      });
    }

    return positions;
  }

  private generateHealthPickups(
    width: number,
    height: number,
    obstacles: Obstacle[],
    spawnZones: SpawnZone[],
    difficulty: number
  ): HealthPickup[] {
    const pickups: HealthPickup[] = [];
    const wallPadding = 100;

    // More pickups on harder levels (1-3 pickups)
    const pickupCount = Math.min(3, 1 + Math.floor(difficulty / 2));

    for (let i = 0; i < pickupCount; i++) {
      let attempts = 0;
      while (attempts < 30) {
        const position: Vector2D = {
          x: wallPadding + Math.random() * (width - wallPadding * 2),
          y: wallPadding + Math.random() * (height - wallPadding * 2)
        };

        // Check distance from spawn zones
        const farEnoughFromSpawns = spawnZones.every(zone => {
          const dist = Math.sqrt(
            Math.pow(position.x - zone.position.x, 2) +
            Math.pow(position.y - zone.position.y, 2)
          );
          return dist > 200;
        });

        // Check distance from obstacles
        const notInObstacle = !obstacles.some(obs => {
          return (
            position.x >= obs.position.x &&
            position.x <= obs.position.x + obs.width &&
            position.y >= obs.position.y &&
            position.y <= obs.position.y + obs.height
          );
        });

        if (farEnoughFromSpawns && notInObstacle) {
          pickups.push({
            id: `health-${i}`,
            position,
            velocity: { x: 0, y: 0 },
            rotation: 0,
            radius: 15,
            amount: 30, // Restores 30 HP
            collected: false
          });
          break;
        }
        attempts++;
      }
    }

    return pickups;
  }
}
