import { useGameStore } from '../store/gameStore';
import { useProgressStore } from '../store/progressStore';
import './Modal.css';

export const LevelComplete: React.FC = () => {
  const gameState = useGameStore(state => state.gameState);
  const startLevel = useGameStore(state => state.startLevel);
  const returnToMenu = useGameStore(state => state.returnToMenu);
  const updateProgress = useProgressStore(state => state.updateProgress);

  const handleNextLevel = () => {
    const nextLevel = gameState.currentLevel + 1;
    if (nextLevel <= 1000) {
      updateProgress(nextLevel);
      startLevel(nextLevel);
    } else {
      // Game complete!
      alert('Congratulations! You completed all 1000 levels!');
      returnToMenu();
    }
  };

  const handleRetry = () => {
    startLevel(gameState.currentLevel);
  };

  const handleMenu = () => {
    returnToMenu();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="modal-title success">LEVEL {gameState.currentLevel} COMPLETE!</h2>

        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">Enemies Eliminated:</span>
            <span className="stat-value">{gameState.killCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Health Remaining:</span>
            <span className="stat-value">{gameState.player.health}</span>
          </div>
        </div>

        <div className="modal-buttons">
          <button className="modal-btn primary" onClick={handleNextLevel}>
            {gameState.currentLevel < 1000 ? 'Next Level' : 'Finish Game'}
          </button>
          <button className="modal-btn" onClick={handleRetry}>
            Retry
          </button>
          <button className="modal-btn" onClick={handleMenu}>
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};
