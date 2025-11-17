import { Vector2D as IVector2D } from '../types/game.types';

export class Vector2D implements IVector2D {
  constructor(public x: number, public y: number) {}

  static add(a: IVector2D, b: IVector2D): Vector2D {
    return new Vector2D(a.x + b.x, a.y + b.y);
  }

  static subtract(a: IVector2D, b: IVector2D): Vector2D {
    return new Vector2D(a.x - b.x, a.y - b.y);
  }

  static multiply(v: IVector2D, scalar: number): Vector2D {
    return new Vector2D(v.x * scalar, v.y * scalar);
  }

  static distance(a: IVector2D, b: IVector2D): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static normalize(v: IVector2D): Vector2D {
    const length = Math.sqrt(v.x * v.x + v.y * v.y);
    if (length === 0) return new Vector2D(0, 0);
    return new Vector2D(v.x / length, v.y / length);
  }

  static angle(v: IVector2D): number {
    return Math.atan2(v.y, v.x);
  }

  static fromAngle(angle: number, length: number = 1): Vector2D {
    return new Vector2D(
      Math.cos(angle) * length,
      Math.sin(angle) * length
    );
  }

  static lerp(a: IVector2D, b: IVector2D, t: number): Vector2D {
    return new Vector2D(
      a.x + (b.x - a.x) * t,
      a.y + (b.y - a.y) * t
    );
  }

  static dot(a: IVector2D, b: IVector2D): number {
    return a.x * b.x + a.y * b.y;
  }

  static length(v: IVector2D): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }
}
