import { Entity, Obstacle } from '../types/game.types';
import { Vector2D } from './Vector2D';

export class CollisionUtils {
  // Check circle-circle collision
  static checkCircleCollision(a: Entity, b: Entity): boolean {
    const distance = Vector2D.distance(a.position, b.position);
    return distance < (a.radius + b.radius);
  }

  // Check circle-rectangle collision (for obstacles)
  static checkObstacleCollision(entity: Entity, obstacle: Obstacle): boolean {
    // Find the closest point on the rectangle to the circle
    const closestX = Math.max(
      obstacle.position.x,
      Math.min(entity.position.x, obstacle.position.x + obstacle.width)
    );
    const closestY = Math.max(
      obstacle.position.y,
      Math.min(entity.position.y, obstacle.position.y + obstacle.height)
    );

    // Calculate distance from closest point to circle center
    const distanceX = entity.position.x - closestX;
    const distanceY = entity.position.y - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;

    return distanceSquared < entity.radius * entity.radius;
  }

  // Resolve circle-rectangle collision by pushing entity out
  static resolveObstacleCollision(entity: Entity, obstacle: Obstacle): Entity {
    if (!this.checkObstacleCollision(entity, obstacle)) {
      return entity;
    }

    // Find the closest point on the rectangle to the circle
    const closestX = Math.max(
      obstacle.position.x,
      Math.min(entity.position.x, obstacle.position.x + obstacle.width)
    );
    const closestY = Math.max(
      obstacle.position.y,
      Math.min(entity.position.y, obstacle.position.y + obstacle.height)
    );

    // Calculate push-out direction
    const pushX = entity.position.x - closestX;
    const pushY = entity.position.y - closestY;
    const distance = Math.sqrt(pushX * pushX + pushY * pushY);

    if (distance === 0) {
      // Entity center is inside obstacle, push in arbitrary direction
      return {
        ...entity,
        position: {
          x: entity.position.x + entity.radius,
          y: entity.position.y
        }
      };
    }

    // Normalize and scale by the overlap amount
    const overlap = entity.radius - distance;
    const pushNormalizedX = (pushX / distance) * overlap;
    const pushNormalizedY = (pushY / distance) * overlap;

    return {
      ...entity,
      position: {
        x: entity.position.x + pushNormalizedX,
        y: entity.position.y + pushNormalizedY
      }
    };
  }
}
