import { InputState } from '../types/game.types';

export class InputManager {
  private state: InputState = {
    moveUp: false,
    moveDown: false,
    moveLeft: false,
    moveRight: false,
    shooting: false,
    mousePosition: { x: 0, y: 0 },
    pausePressed: false
  };

  private canvas: HTMLCanvasElement | null = null;

  constructor(canvas?: HTMLCanvasElement) {
    if (canvas) {
      this.setupEventListeners(canvas);
    }
  }

  setupEventListeners(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;

    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    // Mouse events
    canvas.addEventListener('mousemove', this.handleMouseMove);
    canvas.addEventListener('mousedown', this.handleMouseDown);
    canvas.addEventListener('mouseup', this.handleMouseUp);
    canvas.addEventListener('mouseleave', this.handleMouseLeave);
  }

  cleanup(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);

    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.handleMouseMove);
      this.canvas.removeEventListener('mousedown', this.handleMouseDown);
      this.canvas.removeEventListener('mouseup', this.handleMouseUp);
      this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
    }
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    switch (e.key.toLowerCase()) {
      case 'w':
        this.state.moveUp = true;
        break;
      case 's':
        this.state.moveDown = true;
        break;
      case 'a':
        this.state.moveLeft = true;
        break;
      case 'd':
        this.state.moveRight = true;
        break;
      case 'escape':
        this.state.pausePressed = true;
        break;
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    switch (e.key.toLowerCase()) {
      case 'w':
        this.state.moveUp = false;
        break;
      case 's':
        this.state.moveDown = false;
        break;
      case 'a':
        this.state.moveLeft = false;
        break;
      case 'd':
        this.state.moveRight = false;
        break;
      case 'escape':
        this.state.pausePressed = false;
        break;
    }
  };

  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    this.state.mousePosition = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  private handleMouseDown = (): void => {
    this.state.shooting = true;
  };

  private handleMouseUp = (): void => {
    this.state.shooting = false;
  };

  private handleMouseLeave = (): void => {
    this.state.shooting = false;
  };

  getState(): InputState {
    return { ...this.state };
  }

  resetPausePressed(): void {
    this.state.pausePressed = false;
  }
}
