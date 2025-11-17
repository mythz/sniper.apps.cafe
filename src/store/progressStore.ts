import { create } from 'zustand';
import { SaveData } from '../types/game.types';
import { StorageService } from '../storage/StorageService';

const storageService = new StorageService();

const createInitialSaveData = (): SaveData => ({
  currentLevel: 1,
  maxLevelReached: 1,
  totalKills: 0,
  totalDeaths: 0,
  playTime: 0,
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    volume: 0.7,
    difficulty: 'normal'
  },
  totalScore: 0,
  bestKillStreak: 0,
  shotsFired: 0,
  shotsHit: 0,
  healthPickupsCollected: 0
});

interface ProgressStore {
  saveData: SaveData;
  isLoaded: boolean;

  updateProgress: (level: number) => void;
  incrementKills: () => void;
  incrementDeaths: () => void;
  updatePlayTime: (seconds: number) => void;
  loadSavedData: () => Promise<void>;
  saveProgress: () => Promise<void>;
  resetProgress: () => void;
  addScore: (score: number) => void;
  updateBestKillStreak: (streak: number) => void;
  incrementShotsFired: () => void;
  incrementShotsHit: () => void;
  incrementHealthPickups: () => void;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  saveData: createInitialSaveData(),
  isLoaded: false,

  updateProgress: (level: number) => {
    set((state) => {
      const newSaveData = {
        ...state.saveData,
        currentLevel: level,
        maxLevelReached: Math.max(state.saveData.maxLevelReached, level)
      };

      // Save to storage
      storageService.saveGame(newSaveData);

      return { saveData: newSaveData };
    });
  },

  incrementKills: () => {
    set((state) => ({
      saveData: {
        ...state.saveData,
        totalKills: state.saveData.totalKills + 1
      }
    }));
  },

  incrementDeaths: () => {
    set((state) => ({
      saveData: {
        ...state.saveData,
        totalDeaths: state.saveData.totalDeaths + 1
      }
    }));
  },

  updatePlayTime: (seconds: number) => {
    set((state) => ({
      saveData: {
        ...state.saveData,
        playTime: state.saveData.playTime + seconds
      }
    }));
  },

  loadSavedData: async () => {
    try {
      await storageService.init();
      const data = await storageService.loadGame();

      if (data) {
        set({ saveData: data, isLoaded: true });
      } else {
        set({ saveData: createInitialSaveData(), isLoaded: true });
      }
    } catch (error) {
      console.error('Failed to load saved data:', error);
      set({ saveData: createInitialSaveData(), isLoaded: true });
    }
  },

  saveProgress: async () => {
    try {
      await storageService.saveGame(get().saveData);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  },

  resetProgress: () => {
    const newData = createInitialSaveData();
    set({ saveData: newData });
    storageService.saveGame(newData);
  },

  addScore: (score: number) => {
    set((state) => ({
      saveData: {
        ...state.saveData,
        totalScore: state.saveData.totalScore + score
      }
    }));
  },

  updateBestKillStreak: (streak: number) => {
    set((state) => ({
      saveData: {
        ...state.saveData,
        bestKillStreak: Math.max(state.saveData.bestKillStreak, streak)
      }
    }));
  },

  incrementShotsFired: () => {
    set((state) => ({
      saveData: {
        ...state.saveData,
        shotsFired: state.saveData.shotsFired + 1
      }
    }));
  },

  incrementShotsHit: () => {
    set((state) => ({
      saveData: {
        ...state.saveData,
        shotsHit: state.saveData.shotsHit + 1
      }
    }));
  },

  incrementHealthPickups: () => {
    set((state) => ({
      saveData: {
        ...state.saveData,
        healthPickupsCollected: state.saveData.healthPickupsCollected + 1
      }
    }));
  }
}));
