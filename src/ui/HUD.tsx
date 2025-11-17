import { useGameStore } from '../store/gameStore';
import './HUD.css';

export const HUD: React.FC = () => {
  const gameState = useGameStore(state => state.gameState);

  const healthPercentage = (gameState.player.health / gameState.player.maxHealth) * 100;
  const healthColor = healthPercentage > 50 ? '#00FF00' : '#FF0000';

  return (
    <div className="hud">
      <div className="top-bar">
        <div className="health-display">
          <label>Health:</label>
          <div className="health-bar">
            <div
              className="health-fill"
              style={{
                width: `${healthPercentage}%`,
                backgroundColor: healthColor
              }}
            />
          </div>
          <span className="health-text">
            {gameState.player.health} / {gameState.player.maxHealth}
          </span>
        </div>

        <div className="level-info">
          <span className="level-text">Level {gameState.currentLevel} / 1000</span>
        </div>

        <div className="enemies-display">
          <span className="enemies-text">Enemies: {gameState.kidnappers.length}</span>
        </div>
      </div>

      <div className="controls-hint">
        WASD: Move | Mouse: Aim | Click: Shoot | ESC: Pause
      </div>
    </div>
  );
};
