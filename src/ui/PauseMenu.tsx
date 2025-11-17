import { useGameStore } from '../store/gameStore';
import './Modal.css';

export const PauseMenu: React.FC = () => {
  const resumeGame = useGameStore(state => state.resumeGame);
  const resetLevel = useGameStore(state => state.resetLevel);
  const returnToMenu = useGameStore(state => state.returnToMenu);

  const handleResume = () => {
    resumeGame();
  };

  const handleRestart = () => {
    resetLevel();
  };

  const handleMenu = () => {
    returnToMenu();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2 className="modal-title">PAUSED</h2>

        <div className="modal-buttons">
          <button className="modal-btn primary" onClick={handleResume}>
            Resume
          </button>
          <button className="modal-btn" onClick={handleRestart}>
            Restart Level
          </button>
          <button className="modal-btn" onClick={handleMenu}>
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};
