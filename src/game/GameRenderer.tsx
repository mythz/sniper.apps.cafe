import { GameState, RooftopLayout, Obstacle, Player, Kidnapper, Hostage, Bullet } from '../types/game.types';

export class GameRenderer {
  render(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    if (!gameState.levelConfig) return;

    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 1. Draw rooftop background
    this.drawBackground(ctx, gameState.levelConfig.rooftopLayout);

    // 2. Draw obstacles
    gameState.levelConfig.rooftopLayout.obstacles.forEach(obs =>
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

  private drawBackground(ctx: CanvasRenderingContext2D, _layout: RooftopLayout): void {
    // Draw rooftop gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0, '#1a1f35');
    gradient.addColorStop(1, '#0a0e1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw grid lines
    ctx.strokeStyle = '#2a3050';
    ctx.lineWidth = 1;

    const gridSize = 50;
    for (let x = 0; x < ctx.canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ctx.canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y < ctx.canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.width, y);
      ctx.stroke();
    }
  }

  private drawPlayer(ctx: CanvasRenderingContext2D, player: Player): void {
    ctx.save();

    // Draw player circle
    ctx.fillStyle = '#00FF00';
    ctx.beginPath();
    ctx.arc(player.position.x, player.position.y, player.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw border
    ctx.strokeStyle = '#00CC00';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw direction indicator
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(player.position.x, player.position.y);
    ctx.lineTo(
      player.position.x + Math.cos(player.rotation) * (player.radius + 10),
      player.position.y + Math.sin(player.rotation) * (player.radius + 10)
    );
    ctx.stroke();

    ctx.restore();
  }

  private drawKidnapper(ctx: CanvasRenderingContext2D, kidnapper: Kidnapper): void {
    ctx.save();

    // Color based on state
    let color = '#FFA500'; // orange for idle/patrolling
    if (kidnapper.state === 'alerted') {
      color = '#FFFF00'; // yellow for alerted
    } else if (kidnapper.state === 'shooting') {
      color = '#FF0000'; // red for shooting
    }

    // Draw kidnapper circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(kidnapper.position.x, kidnapper.position.y, kidnapper.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw border
    ctx.strokeStyle = '#CC8800';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw direction indicator
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(kidnapper.position.x, kidnapper.position.y);
    ctx.lineTo(
      kidnapper.position.x + Math.cos(kidnapper.rotation) * (kidnapper.radius + 10),
      kidnapper.position.y + Math.sin(kidnapper.rotation) * (kidnapper.radius + 10)
    );
    ctx.stroke();

    ctx.restore();
  }

  private drawVisionCone(ctx: CanvasRenderingContext2D, kidnapper: Kidnapper): void {
    ctx.save();

    // Calculate opacity based on alertness
    const opacity = 0.1 + (kidnapper.alertness / 100) * 0.2;

    ctx.fillStyle = `rgba(255, 255, 0, ${opacity})`;
    ctx.beginPath();
    ctx.moveTo(kidnapper.position.x, kidnapper.position.y);
    ctx.arc(
      kidnapper.position.x,
      kidnapper.position.y,
      kidnapper.viewDistance,
      kidnapper.rotation - kidnapper.viewAngle / 2,
      kidnapper.rotation + kidnapper.viewAngle / 2
    );
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private drawHostage(ctx: CanvasRenderingContext2D, hostage: Hostage): void {
    ctx.save();

    // Draw hostage
    ctx.fillStyle = '#00FFFF';
    ctx.beginPath();
    ctx.arc(hostage.position.x, hostage.position.y, hostage.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw border
    ctx.strokeStyle = '#00CCCC';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw "H" marker
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('H', hostage.position.x, hostage.position.y);

    ctx.restore();
  }

  private drawBullet(ctx: CanvasRenderingContext2D, bullet: Bullet): void {
    ctx.save();

    // Player bullets: white, Enemy bullets: red
    ctx.fillStyle = bullet.ownerId === 'player' ? '#FFFFFF' : '#FF0000';

    ctx.beginPath();
    ctx.arc(bullet.position.x, bullet.position.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawObstacle(ctx: CanvasRenderingContext2D, obstacle: Obstacle): void {
    ctx.save();

    // Color based on type
    let color = '#4a5070';
    switch (obstacle.type) {
      case 'wall':
        color = '#3a4060';
        break;
      case 'crate':
        color = '#6a5040';
        break;
      case 'hvac':
        color = '#5a6080';
        break;
      case 'watertank':
        color = '#4a6070';
        break;
    }

    ctx.fillStyle = color;
    ctx.fillRect(obstacle.position.x, obstacle.position.y, obstacle.width, obstacle.height);

    // Draw border
    ctx.strokeStyle = '#2a3050';
    ctx.lineWidth = 2;
    ctx.strokeRect(obstacle.position.x, obstacle.position.y, obstacle.width, obstacle.height);

    // Add some depth with shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(
      obstacle.position.x + 5,
      obstacle.position.y + 5,
      obstacle.width,
      obstacle.height
    );

    // Redraw obstacle on top
    ctx.fillStyle = color;
    ctx.fillRect(obstacle.position.x, obstacle.position.y, obstacle.width, obstacle.height);

    ctx.restore();
  }
}
