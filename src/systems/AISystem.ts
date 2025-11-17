import { Kidnapper, Player, Obstacle, Bullet, Vector2D as IVector2D } from '../types/game.types';
import { VisionSystem } from './VisionSystem';
import { Vector2D } from '../utils/Vector2D';

export class AISystem {
  private visionSystem: VisionSystem;

  constructor() {
    this.visionSystem = new VisionSystem();
  }

  update(
    kidnappers: Kidnapper[],
    player: Player,
    obstacles: Obstacle[],
    deltaTime: number
  ): Kidnapper[] {
    return kidnappers.map(k => this.updateKidnapper(k, player, kidnappers, obstacles, deltaTime));
  }

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
      default:
        return kidnapper;
    }
  }

  private handlePatrol(
    kidnapper: Kidnapper,
    player: Player,
    allKidnappers: Kidnapper[],
    obstacles: Obstacle[],
    deltaTime: number
  ): Kidnapper {
    // 1. Check if player is visible
    if (this.visionSystem.canSee(kidnapper, player, obstacles)) {
      return {
        ...kidnapper,
        state: 'alerted',
        targetPosition: { ...player.position },
        alertness: 100
      };
    }

    // 2. Check if any other kidnapper in sight is alerted
    for (const other of allKidnappers) {
      if (other.id !== kidnapper.id && (other.state === 'alerted' || other.state === 'shooting')) {
        if (this.visionSystem.canSee(kidnapper, other, obstacles)) {
          return {
            ...kidnapper,
            state: 'alerted',
            alertness: 100,
            targetPosition: other.targetPosition
          };
        }
      }
    }

    // 3. Move along patrol route
    if (kidnapper.patrolPoints.length === 0) {
      return kidnapper;
    }

    const targetPoint = kidnapper.patrolPoints[kidnapper.currentPatrolIndex];
    const distance = Vector2D.distance(kidnapper.position, targetPoint);

    if (distance < 30) {
      // Reached patrol point, move to next
      return {
        ...kidnapper,
        currentPatrolIndex: (kidnapper.currentPatrolIndex + 1) % kidnapper.patrolPoints.length
      };
    }

    // Move toward current patrol point
    const direction = Vector2D.subtract(targetPoint, kidnapper.position);
    const normalized = Vector2D.normalize(direction);
    const speed = 50; // patrol speed
    const velocity = Vector2D.multiply(normalized, speed);

    // Update rotation to face direction
    const rotation = Vector2D.angle(direction);

    return {
      ...kidnapper,
      state: 'patrolling',
      velocity,
      rotation,
      position: {
        x: kidnapper.position.x + velocity.x * deltaTime,
        y: kidnapper.position.y + velocity.y * deltaTime
      }
    };
  }

  private handleAlerted(
    kidnapper: Kidnapper,
    player: Player,
    obstacles: Obstacle[],
    deltaTime: number
  ): Kidnapper {
    // 1. If player visible, switch to shooting
    if (this.visionSystem.canSee(kidnapper, player, obstacles)) {
      return {
        ...kidnapper,
        state: 'shooting',
        targetPosition: { ...player.position }
      };
    }

    // 2. Move toward last known position
    if (!kidnapper.targetPosition) {
      // No target, return to patrol
      return {
        ...kidnapper,
        state: 'patrolling',
        alertness: 0
      };
    }

    const distance = Vector2D.distance(kidnapper.position, kidnapper.targetPosition);

    if (distance < 50) {
      // Reached last known position, decrease alertness
      const newAlertness = Math.max(0, kidnapper.alertness - 20 * deltaTime);
      if (newAlertness === 0) {
        return {
          ...kidnapper,
          state: 'patrolling',
          alertness: 0,
          targetPosition: null
        };
      }
      return {
        ...kidnapper,
        alertness: newAlertness
      };
    }

    // Move toward target
    const direction = Vector2D.subtract(kidnapper.targetPosition, kidnapper.position);
    const normalized = Vector2D.normalize(direction);
    const speed = 100; // alert movement speed
    const velocity = Vector2D.multiply(normalized, speed);
    const rotation = Vector2D.angle(direction);

    return {
      ...kidnapper,
      velocity,
      rotation,
      position: {
        x: kidnapper.position.x + velocity.x * deltaTime,
        y: kidnapper.position.y + velocity.y * deltaTime
      }
    };
  }

  private handleShooting(
    kidnapper: Kidnapper,
    player: Player,
    obstacles: Obstacle[],
    _deltaTime: number
  ): Kidnapper {
    // 1. Check if player still visible
    if (!this.visionSystem.canSee(kidnapper, player, obstacles)) {
      return {
        ...kidnapper,
        state: 'alerted',
        targetPosition: { ...player.position }
      };
    }

    // 2. Rotate to face player
    const direction = Vector2D.subtract(player.position, kidnapper.position);
    const rotation = Vector2D.angle(direction);

    // 3. Update target position
    return {
      ...kidnapper,
      rotation,
      targetPosition: { ...player.position },
      velocity: { x: 0, y: 0 }
    };
  }

  getBulletsToSpawn(kidnappers: Kidnapper[], currentTime: number): Bullet[] {
    const bullets: Bullet[] = [];

    for (const kidnapper of kidnappers) {
      if (kidnapper.state === 'shooting') {
        // Check if enough time has passed since last shot
        if (currentTime - kidnapper.lastShotTime >= kidnapper.shootCooldown) {
          // Create bullet
          const direction = Vector2D.fromAngle(kidnapper.rotation, 1);
          const bulletSpeed = 400;

          const bullet: Bullet = {
            id: `bullet-${kidnapper.id}-${currentTime}`,
            position: { ...kidnapper.position },
            velocity: Vector2D.multiply(direction, bulletSpeed),
            rotation: kidnapper.rotation,
            radius: 5,
            damage: 5,
            ownerId: kidnapper.id,
            lifespan: 3000,
            createdAt: currentTime
          };

          bullets.push(bullet);

          // Update kidnapper's last shot time (this will be done in game loop)
          kidnapper.lastShotTime = currentTime;
        }
      }
    }

    return bullets;
  }

  alertNearbyKidnappers(
    deadKidnapperId: string,
    deadPosition: IVector2D,
    kidnappers: Kidnapper[],
    obstacles: Obstacle[]
  ): Kidnapper[] {
    return kidnappers.map(kidnapper => {
      // Create a temporary entity to check vision
      const deadEntity = {
        id: deadKidnapperId,
        position: deadPosition,
        velocity: { x: 0, y: 0 },
        rotation: 0,
        radius: 20
      };

      if (this.visionSystem.canSee(kidnapper, deadEntity, obstacles)) {
        return {
          ...kidnapper,
          state: 'alerted',
          alertness: 100,
          targetPosition: { ...deadPosition }
        };
      }

      return kidnapper;
    });
  }
}
