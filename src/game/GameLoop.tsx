import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { MovementSystem } from '../systems/MovementSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { AISystem } from '../systems/AISystem';
import { InputManager } from '../utils/InputManager';
import { Bullet } from '../types/game.types';
import { Vector2D } from '../utils/Vector2D';

const movementSystem = new MovementSystem();
const collisionSystem = new CollisionSystem();
const aiSystem = new AISystem();

export const GameLoop: React.FC<{ inputManager: InputManager | null }> = ({ inputManager }) => {
  const gameState = useGameStore(state => state.gameState);
  const updatePlayer = useGameStore(state => state.updatePlayer);
  const updateKidnappers = useGameStore(state => state.updateKidnappers);
  const addBullet = useGameStore(state => state.addBullet);
  const updateBullets = useGameStore(state => state.updateBullets);
  const damagePlayer = useGameStore(state => state.damagePlayer);
  const killKidnapper = useGameStore(state => state.killKidnapper);
  const completeLevel = useGameStore(state => state.completeLevel);
  const gameOver = useGameStore(state => state.gameOver);
  const pauseGame = useGameStore(state => state.pauseGame);

  const lastTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (gameState.gameStatus !== 'playing' || !inputManager) {
      return;
    }

    const loop = (currentTime: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1); // Cap at 0.1s
      lastTimeRef.current = currentTime;

      updateGame(deltaTime);

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.gameStatus, inputManager]);

  const updateGame = (deltaTime: number) => {
    if (!inputManager || !gameState.levelConfig) return;

    // 1. Handle input
    const input = inputManager.getState();

    // Check for pause
    if (input.pausePressed) {
      pauseGame();
      inputManager.resetPausePressed();
      return;
    }

    // 2. Update player
    let updatedPlayer = movementSystem.handlePlayerMovement(
      gameState.player,
      input,
      deltaTime
    );

    // Constrain player to bounds
    updatedPlayer = movementSystem.constrainToBounds(updatedPlayer, {
      x: 0,
      y: 0,
      width: gameState.levelConfig.rooftopLayout.width,
      height: gameState.levelConfig.rooftopLayout.height
    }) as typeof updatedPlayer;

    // Resolve collisions with obstacles
    const playerResolvedEntities = collisionSystem.resolveCollisions(
      [updatedPlayer],
      gameState.levelConfig.rooftopLayout.obstacles
    );
    const playerResolved = { ...updatedPlayer, ...playerResolvedEntities[0] };

    // Handle player shooting
    if (input.shooting && canShoot(playerResolved)) {
      const bullet = createPlayerBullet(playerResolved);
      addBullet(bullet);
      updatedPlayer = { ...playerResolved, lastShotTime: Date.now() };
    } else {
      updatedPlayer = playerResolved;
    }

    // 3. Update AI
    let updatedKidnappers = aiSystem.update(
      gameState.kidnappers,
      updatedPlayer,
      gameState.levelConfig.rooftopLayout.obstacles,
      deltaTime
    );

    // Resolve kidnapper collisions with obstacles
    const resolvedKidnapperEntities = collisionSystem.resolveCollisions(
      updatedKidnappers,
      gameState.levelConfig.rooftopLayout.obstacles
    );
    updatedKidnappers = updatedKidnappers.map((k, i) => ({
      ...k,
      ...resolvedKidnapperEntities[i]
    }));

    // 4. Spawn kidnapper bullets
    const newBullets = aiSystem.getBulletsToSpawn(updatedKidnappers, Date.now());
    newBullets.forEach(addBullet);

    // 5. Update bullets
    let updatedBullets = gameState.bullets
      .concat(newBullets)
      .map(b => movementSystem.updatePosition(b, deltaTime) as Bullet)
      .filter(b => Date.now() - b.createdAt < b.lifespan);

    // Remove bullets that hit obstacles
    updatedBullets = collisionSystem.checkBulletObstacleCollisions(
      updatedBullets,
      gameState.levelConfig.rooftopLayout.obstacles
    );

    // 6. Check collisions
    const collisionResults = collisionSystem.checkBulletCollisions(
      updatedBullets,
      updatedPlayer,
      updatedKidnappers
    );

    // Apply damage to player
    if (collisionResults.playerHits.length > 0) {
      const totalDamage = collisionResults.playerHits.reduce((sum, b) => sum + b.damage, 0);
      damagePlayer(totalDamage);
      updatedPlayer = {
        ...updatedPlayer,
        health: Math.max(0, updatedPlayer.health - totalDamage)
      };
    }

    // Remove killed kidnappers and alert nearby ones
    const deadKidnappers: Array<{ id: string; position: typeof updatedKidnappers[0]['position'] }> = [];
    updatedKidnappers = updatedKidnappers.filter(k => {
      if (collisionResults.kidnapperHits.has(k.id)) {
        deadKidnappers.push({ id: k.id, position: k.position });
        killKidnapper(k.id);
        return false;
      }
      return true;
    });

    // Alert nearby kidnappers for each dead kidnapper
    for (const dead of deadKidnappers) {
      updatedKidnappers = aiSystem.alertNearbyKidnappers(
        dead.id,
        dead.position,
        updatedKidnappers,
        gameState.levelConfig.rooftopLayout.obstacles
      );
    }

    // 7. Update store
    updatePlayer(updatedPlayer);
    updateKidnappers(updatedKidnappers);
    updateBullets(collisionResults.remainingBullets);

    // 8. Check win/lose conditions
    if (updatedPlayer.health <= 0) {
      gameOver();
    } else if (updatedKidnappers.length === 0) {
      completeLevel();
    }
  };

  const canShoot = (player: typeof gameState.player): boolean => {
    return Date.now() - player.lastShotTime >= player.fireRate;
  };

  const createPlayerBullet = (player: typeof gameState.player): Bullet => {
    const direction = Vector2D.fromAngle(player.rotation, 1);
    const bulletSpeed = 600;

    return {
      id: `bullet-player-${Date.now()}`,
      position: { ...player.position },
      velocity: Vector2D.multiply(direction, bulletSpeed),
      rotation: player.rotation,
      radius: 5,
      damage: 999,
      ownerId: 'player',
      lifespan: 3000,
      createdAt: Date.now()
    };
  };

  return null;
};
