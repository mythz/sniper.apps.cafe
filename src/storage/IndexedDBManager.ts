import { SaveData, LevelStats } from '../types/game.types';

export class IndexedDBManager {
  private dbName = 'RooftopRescueDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('levels')) {
          db.createObjectStore('levels', { keyPath: 'level' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      };
    });
  }

  async saveProgress(data: SaveData): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['progress'], 'readwrite');
      const store = transaction.objectStore('progress');
      const request = store.put({ id: 'main', ...data });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async loadProgress(): Promise<SaveData | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['progress'], 'readonly');
      const store = transaction.objectStore('progress');
      const request = store.get('main');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          const { id, ...data } = result;
          resolve(data as SaveData);
        } else {
          resolve(null);
        }
      };
    });
  }

  async saveLevelCompletion(level: number, stats: LevelStats): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['levels'], 'readwrite');
      const store = transaction.objectStore('levels');
      const request = store.put({ ...stats, level });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getLevelStats(level: number): Promise<LevelStats | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['levels'], 'readonly');
      const store = transaction.objectStore('levels');
      const request = store.get(level);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async clearAllData(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['progress', 'levels', 'settings'], 'readwrite');

      const progressStore = transaction.objectStore('progress');
      const levelsStore = transaction.objectStore('levels');
      const settingsStore = transaction.objectStore('settings');

      progressStore.clear();
      levelsStore.clear();
      settingsStore.clear();

      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();
    });
  }
}
