import { useRef, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { GameRenderer } from './GameRenderer';

const gameRenderer = new GameRenderer();

interface GameCanvasProps {
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onCanvasReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useGameStore(state => state.gameState);

  useEffect(() => {
    if (canvasRef.current && onCanvasReady) {
      onCanvasReady(canvasRef.current);
    }
  }, [onCanvasReady]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Render game
    gameRenderer.render(ctx, gameState);
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      width={1280}
      height={720}
      style={{
        border: '2px solid #333',
        display: 'block',
        backgroundColor: '#0a0e1a'
      }}
    />
  );
};
