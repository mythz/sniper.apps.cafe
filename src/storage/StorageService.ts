import { GameState, GameSettings, SaveData } from '../types/game.types';
import { IndexedDBManager } from './IndexedDBManager';

export class StorageService {
  private idb: IndexedDBManager;
  private lastSaveTime: number = 0;
  private autoSaveInterval: number = 30000; // 30 seconds

  constructor() {
    this.idb = new IndexedDBManager();
  }

  async init(): Promise<void> {
    await this.idb.init();
  }

  async autoSave(gameState: GameState): Promise<void> {
    const now = Date.now();
    if (now - this.lastSaveTime < this.autoSaveInterval) {
      return;
    }

    const saveData: SaveData = {
      currentLevel: gameState.currentLevel,
      maxLevelReached: gameState.currentLevel,
      totalKills: gameState.totalKills,
      totalDeaths: 0, // This should be tracked elsewhere
      playTime: 0, // This should be tracked elsewhere
      settings: this.loadSettings(),
      totalScore: gameState.score,
      bestKillStreak: gameState.killStreak,
      shotsFired: 0, // This should be tracked elsewhere
      shotsHit: 0, // This should be tracked elsewhere
      healthPickupsCollected: 0 // This should be tracked elsewhere
    };

    await this.idb.saveProgress(saveData);
    this.lastSaveTime = now;
  }

  async loadGame(): Promise<SaveData | null> {
    try {
      return await this.idb.loadProgress();
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  async saveGame(saveData: SaveData): Promise<void> {
    try {
      await this.idb.saveProgress(saveData);
      this.saveSettings(saveData.settings);
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }

  saveSettings(settings: GameSettings): void {
    try {
      localStorage.setItem('gameSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  loadSettings(): GameSettings {
    try {
      const stored = localStorage.getItem('gameSettings');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }

    // Return default settings
    return {
      soundEnabled: true,
      musicEnabled: true,
      volume: 0.7,
      difficulty: 'normal'
    };
  }

  async clearAllData(): Promise<void> {
    await this.idb.clearAllData();
    localStorage.removeItem('gameSettings');
  }
}
