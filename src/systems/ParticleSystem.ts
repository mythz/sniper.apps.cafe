import { Particle, Vector2D } from '../types/game.types';

export class ParticleSystem {
  private nextId = 0;

  createBulletImpact(position: Vector2D, color: string = '#FFFFFF'): Particle[] {
    const particles: Particle[] = [];
    const count = 8;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 100 + Math.random() * 100;

      particles.push({
        id: `particle-${this.nextId++}`,
        position: { ...position },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        color,
        size: 3 + Math.random() * 2,
        life: 0.5,
        maxLife: 0.5,
        alpha: 1
      });
    }

    return particles;
  }

  createDeathExplosion(position: Vector2D, color: string = '#FF0000'): Particle[] {
    const particles: Particle[] = [];
    const count = 20;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 200;

      particles.push({
        id: `particle-${this.nextId++}`,
        position: { ...position },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        color,
        size: 2 + Math.random() * 4,
        life: 0.8 + Math.random() * 0.4,
        maxLife: 0.8 + Math.random() * 0.4,
        alpha: 1
      });
    }

    return particles;
  }

  createMuzzleFlash(position: Vector2D, rotation: number): Particle[] {
    const particles: Particle[] = [];
    const count = 6;

    for (let i = 0; i < count; i++) {
      const spread = 0.3;
      const angle = rotation + (Math.random() - 0.5) * spread;
      const speed = 200 + Math.random() * 100;

      particles.push({
        id: `particle-${this.nextId++}`,
        position: {
          x: position.x + Math.cos(rotation) * 20,
          y: position.y + Math.sin(rotation) * 20
        },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        color: '#FFFF00',
        size: 2 + Math.random() * 2,
        life: 0.2,
        maxLife: 0.2,
        alpha: 1
      });
    }

    return particles;
  }

  createHealthPickupEffect(position: Vector2D): Particle[] {
    const particles: Particle[] = [];
    const count = 12;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 80 + Math.random() * 40;

      particles.push({
        id: `particle-${this.nextId++}`,
        position: { ...position },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        color: '#00FF00',
        size: 3,
        life: 0.6,
        maxLife: 0.6,
        alpha: 1
      });
    }

    return particles;
  }

  updateParticles(particles: Particle[], deltaTime: number): Particle[] {
    return particles
      .map(p => {
        const newLife = p.life - deltaTime;
        const alpha = newLife / p.maxLife;

        return {
          ...p,
          position: {
            x: p.position.x + p.velocity.x * deltaTime,
            y: p.position.y + p.velocity.y * deltaTime
          },
          velocity: {
            x: p.velocity.x * 0.95, // Friction
            y: p.velocity.y * 0.95
          },
          life: newLife,
          alpha
        };
      })
      .filter(p => p.life > 0);
  }
}
