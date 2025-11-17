import { useEffect, useState, useCallback } from 'react';
import { useGameStore } from './store/gameStore';
import { useProgressStore } from './store/progressStore';
import { GameCanvas } from './game/GameCanvas';
import { GameLoop } from './game/GameLoop';
import { MainMenu } from './ui/MainMenu';
import { HUD } from './ui/HUD';
import { LevelComplete } from './ui/LevelComplete';
import { GameOver } from './ui/GameOver';
import { PauseMenu } from './ui/PauseMenu';
import { InputManager } from './utils/InputManager';
import './App.css';

function App() {
  const gameStatus = useGameStore(state => state.gameState.gameStatus);
  const loadSavedData = useProgressStore(state => state.loadSavedData);
  const isLoaded = useProgressStore(state => state.isLoaded);

  const [inputManager, setInputManager] = useState<InputManager | null>(null);

  useEffect(() => {
    // Initialize storage and load saved data
    loadSavedData();
  }, [loadSavedData]);

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    // Create input manager when canvas is ready
    const manager = new InputManager(canvas);
    setInputManager(manager);

    return () => {
      manager.cleanup();
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="app loading">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="app">
      {gameStatus === 'menu' && <MainMenu />}

      {gameStatus === 'playing' && (
        <>
          <GameCanvas onCanvasReady={handleCanvasReady} />
          <GameLoop inputManager={inputManager} />
          <HUD />
        </>
      )}

      {gameStatus === 'paused' && (
        <>
          <GameCanvas onCanvasReady={handleCanvasReady} />
          <HUD />
          <PauseMenu />
        </>
      )}

      {gameStatus === 'levelComplete' && (
        <>
          <GameCanvas onCanvasReady={handleCanvasReady} />
          <LevelComplete />
        </>
      )}

      {gameStatus === 'gameOver' && (
        <>
          <GameCanvas onCanvasReady={handleCanvasReady} />
          <GameOver />
        </>
      )}
    </div>
  );
}

export default App;
