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
  }
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
  }
}));
