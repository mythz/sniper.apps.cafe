import { Kidnapper, Entity, Obstacle, Vector2D as IVector2D } from '../types/game.types';
import { Vector2D } from '../utils/Vector2D';

export class VisionSystem {
  canSee(
    kidnapper: Kidnapper,
    target: Entity,
    obstacles: Obstacle[]
  ): boolean {
    // 1. Calculate distance to target
    const distance = Vector2D.distance(kidnapper.position, target.position);

    // 2. Check if within view distance
    if (distance > kidnapper.viewDistance) {
      return false;
    }

    // 3. Check if within view cone (angle)
    if (!this.isInViewCone(
      kidnapper.position,
      kidnapper.rotation,
      target.position,
      kidnapper.viewAngle
    )) {
      return false;
    }

    // 4. Perform raycast to check for obstacles blocking line of sight
    if (this.raycast(kidnapper.position, target.position, obstacles)) {
      return false;
    }

    // 5. All checks passed
    return true;
  }

  raycast(from: IVector2D, to: IVector2D, obstacles: Obstacle[]): boolean {
    // Simple raycast - check if line intersects any obstacle
    for (const obstacle of obstacles) {
      if (this.lineIntersectsRect(from, to, obstacle)) {
        return true; // Blocked
      }
    }
    return false; // Not blocked
  }

  isInViewCone(
    observer: IVector2D,
    observerRotation: number,
    target: IVector2D,
    viewAngle: number
  ): boolean {
    const toTarget = Vector2D.subtract(target, observer);
    const angleToTarget = Vector2D.angle(toTarget);

    // Calculate the difference between the observer's rotation and the angle to target
    let angleDiff = angleToTarget - observerRotation;

    // Normalize angle difference to [-PI, PI]
    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

    // Check if within view cone
    return Math.abs(angleDiff) <= viewAngle / 2;
  }

  private lineIntersectsRect(from: IVector2D, to: IVector2D, rect: Obstacle): boolean {
    // Check if line intersects with any of the four edges of the rectangle
    const rectLeft = rect.position.x;
    const rectRight = rect.position.x + rect.width;
    const rectTop = rect.position.y;
    const rectBottom = rect.position.y + rect.height;

    // Check intersection with each edge
    const edges = [
      { x1: rectLeft, y1: rectTop, x2: rectRight, y2: rectTop },      // Top
      { x1: rectRight, y1: rectTop, x2: rectRight, y2: rectBottom },  // Right
      { x1: rectLeft, y1: rectBottom, x2: rectRight, y2: rectBottom }, // Bottom
      { x1: rectLeft, y1: rectTop, x2: rectLeft, y2: rectBottom }     // Left
    ];

    for (const edge of edges) {
      if (this.lineSegmentsIntersect(
        from.x, from.y, to.x, to.y,
        edge.x1, edge.y1, edge.x2, edge.y2
      )) {
        return true;
      }
    }

    return false;
  }

  private lineSegmentsIntersect(
    x1: number, y1: number, x2: number, y2: number,
    x3: number, y3: number, x4: number, y4: number
  ): boolean {
    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denom === 0) return false;

    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
  }
}
