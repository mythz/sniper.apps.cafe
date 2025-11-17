import { Entity, Obstacle, Bullet, Player, Kidnapper } from '../types/game.types';
import { CollisionUtils } from '../utils/Collision';

export class CollisionSystem {
  checkCircleCollision(a: Entity, b: Entity): boolean {
    return CollisionUtils.checkCircleCollision(a, b);
  }

  checkObstacleCollision(entity: Entity, obstacle: Obstacle): boolean {
    return CollisionUtils.checkObstacleCollision(entity, obstacle);
  }

  resolveCollisions(entities: Entity[], obstacles: Obstacle[]): Entity[] {
    return entities.map(entity => {
      let resolved = entity;
      for (const obstacle of obstacles) {
        resolved = CollisionUtils.resolveObstacleCollision(resolved, obstacle);
      }
      return resolved;
    });
  }

  checkBulletCollisions(
    bullets: Bullet[],
    player: Player,
    kidnappers: Kidnapper[]
  ): {
    playerHits: Bullet[];
    kidnapperHits: Map<string, Bullet[]>;
    remainingBullets: Bullet[];
  } {
    const playerHits: Bullet[] = [];
    const kidnapperHits = new Map<string, Bullet[]>();
    const remainingBullets: Bullet[] = [];

    for (const bullet of bullets) {
      let hit = false;

      // Check player hits (only from enemy bullets)
      if (bullet.ownerId !== 'player' && this.checkCircleCollision(bullet, player)) {
        playerHits.push(bullet);
        hit = true;
      }

      // Check kidnapper hits (only from player bullets)
      if (!hit && bullet.ownerId === 'player') {
        for (const kidnapper of kidnappers) {
          if (this.checkCircleCollision(bullet, kidnapper)) {
            if (!kidnapperHits.has(kidnapper.id)) {
              kidnapperHits.set(kidnapper.id, []);
            }
            kidnapperHits.get(kidnapper.id)!.push(bullet);
            hit = true;
            break;
          }
        }
      }

      if (!hit) {
        remainingBullets.push(bullet);
      }
    }

    return { playerHits, kidnapperHits, remainingBullets };
  }

  checkBulletObstacleCollisions(bullets: Bullet[], obstacles: Obstacle[]): Bullet[] {
    return bullets.filter(bullet => {
      for (const obstacle of obstacles) {
        if (this.checkObstacleCollision(bullet, obstacle)) {
          return false;
        }
      }
      return true;
    });
  }
}
