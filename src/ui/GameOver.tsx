import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useProgressStore } from '../store/progressStore';
import './Modal.css';

export const GameOver: React.FC = () => {
  const gameState = useGameStore(state => state.gameState);
  const startLevel = useGameStore(state => state.startLevel);
  const returnToMenu = useGameStore(state => state.returnToMenu);
  const incrementDeaths = useProgressStore(state => state.incrementDeaths);

  useEffect(() => {
    incrementDeaths();
  }, [incrementDeaths]);

  const handleRetry = () => {
    startLevel(gameState.currentLevel);
  };

  const handleMenu = () => {
    returnToMenu();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="modal-title failure">MISSION FAILED</h2>
        <p className="modal-message">The kidnappers eliminated you!</p>

        <div className="modal-buttons">
          <button className="modal-btn primary" onClick={handleRetry}>
            Retry Level
          </button>
          <button className="modal-btn" onClick={handleMenu}>
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};
