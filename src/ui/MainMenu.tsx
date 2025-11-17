import { useGameStore } from '../store/gameStore';
import { useProgressStore } from '../store/progressStore';
import './MainMenu.css';

export const MainMenu: React.FC = () => {
  const startLevel = useGameStore(state => state.startLevel);
  const saveData = useProgressStore(state => state.saveData);

  const handleContinue = () => {
    startLevel(saveData.currentLevel);
  };

  const handleNewGame = () => {
    if (saveData.currentLevel > 1) {
      if (window.confirm('Start a new game? This will reset your progress.')) {
        startLevel(1);
      }
    } else {
      startLevel(1);
    }
  };

  return (
    <div className="main-menu">
      <h1 className="game-title">ROOFTOP RESCUE</h1>
      <p className="game-subtitle">Eliminate the kidnappers. Save the hostages.</p>

      <div className="menu-buttons">
        {saveData.currentLevel > 1 && (
          <button className="menu-btn primary" onClick={handleContinue}>
            Continue (Level {saveData.currentLevel})
          </button>
        )}
        <button className="menu-btn" onClick={handleNewGame}>
          New Game
        </button>
      </div>

      <div className="stats-display">
        <div className="stat">
          <span className="stat-label">Max Level:</span>
          <span className="stat-value">{saveData.maxLevelReached}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Total Kills:</span>
          <span className="stat-value">{saveData.totalKills}</span>
        </div>
      </div>

      <div className="controls-info">
        <h3>Controls</h3>
        <p>WASD - Move</p>
        <p>Mouse - Aim</p>
        <p>Left Click - Shoot</p>
        <p>ESC - Pause</p>
      </div>
    </div>
  );
};
