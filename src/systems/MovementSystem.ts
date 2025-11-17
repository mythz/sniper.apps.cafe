import { Entity, Player, InputState, Rectangle, Vector2D as IVector2D } from '../types/game.types';
import { Vector2D } from '../utils/Vector2D';

export class MovementSystem {
  updatePosition(entity: Entity, deltaTime: number): Entity {
    return {
      ...entity,
      position: {
        x: entity.position.x + entity.velocity.x * deltaTime,
        y: entity.position.y + entity.velocity.y * deltaTime
      }
    };
  }

  moveToward(
    entity: Entity,
    target: IVector2D,
    speed: number,
    deltaTime: number
  ): Entity {
    const direction = Vector2D.subtract(target, entity.position);
    const distance = Vector2D.length(direction);

    if (distance < 5) {
      // Close enough, stop moving
      return {
        ...entity,
        velocity: { x: 0, y: 0 }
      };
    }

    const normalized = Vector2D.normalize(direction);
    const velocity = Vector2D.multiply(normalized, speed);

    return {
      ...entity,
      velocity,
      position: {
        x: entity.position.x + velocity.x * deltaTime,
        y: entity.position.y + velocity.y * deltaTime
      }
    };
  }

  handlePlayerMovement(
    player: Player,
    input: InputState,
    deltaTime: number
  ): Player {
    let vx = 0;
    let vy = 0;

    if (input.moveUp) vy -= 1;
    if (input.moveDown) vy += 1;
    if (input.moveLeft) vx -= 1;
    if (input.moveRight) vx += 1;

    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      const length = Math.sqrt(vx * vx + vy * vy);
      vx /= length;
      vy /= length;
    }

    const velocity = {
      x: vx * player.speed,
      y: vy * player.speed
    };

    // Calculate rotation to face mouse
    const dx = input.mousePosition.x - player.position.x;
    const dy = input.mousePosition.y - player.position.y;
    const rotation = Math.atan2(dy, dx);

    return {
      ...player,
      velocity,
      rotation,
      position: {
        x: player.position.x + velocity.x * deltaTime,
        y: player.position.y + velocity.y * deltaTime
      }
    };
  }

  rotateToward(entity: Entity, target: IVector2D): Entity {
    const dx = target.x - entity.position.x;
    const dy = target.y - entity.position.y;
    const rotation = Math.atan2(dy, dx);

    return {
      ...entity,
      rotation
    };
  }

  constrainToBounds(entity: Entity, bounds: Rectangle): Entity {
    const x = Math.max(
      bounds.x + entity.radius,
      Math.min(entity.position.x, bounds.x + bounds.width - entity.radius)
    );
    const y = Math.max(
      bounds.y + entity.radius,
      Math.min(entity.position.y, bounds.y + bounds.height - entity.radius)
    );

    return {
      ...entity,
      position: { x, y }
    };
  }
}
