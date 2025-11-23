
import { AppSettings, Song, User } from '../types';
import { DEFAULT_APP_SETTINGS } from '../config/defaults';

const SETTINGS_KEY = 'luma_app_settings_v6';
const COMPOSED_SONGS_KEY = 'luma_composed_library';
const USERS_KEY = 'luma_users';

export const storageService = {
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? { ...DEFAULT_APP_SETTINGS, ...JSON.parse(data) } : DEFAULT_APP_SETTINGS;
    } catch {
      return DEFAULT_APP_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  getComposedSongs(): Song[] {
    try {
      const data = localStorage.getItem(COMPOSED_SONGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveComposedSong(song: Song) {
    const current = this.getComposedSongs();
    if (!current.find(s => s.id === song.id)) {
      current.unshift(song);
      localStorage.setItem(COMPOSED_SONGS_KEY, JSON.stringify(current));
    }
  },

  deleteComposedSong(songId: string) {
    const current = this.getComposedSongs();
    const filtered = current.filter(s => s.id !== songId);
    localStorage.setItem(COMPOSED_SONGS_KEY, JSON.stringify(filtered));
    return filtered;
  },
  
  resetSettings() {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_APP_SETTINGS));
      return DEFAULT_APP_SETTINGS;
  },

  exportUserData(): string {
      const data = {
          users: localStorage.getItem(USERS_KEY),
          settings: localStorage.getItem(SETTINGS_KEY),
          songs: localStorage.getItem(COMPOSED_SONGS_KEY),
          timestamp: new Date().toISOString()
      };
      return JSON.stringify(data, null, 2);
  },

  importUserData(jsonString: string): boolean {
      try {
          const data = JSON.parse(jsonString);
          if (data.users) localStorage.setItem(USERS_KEY, data.users);
          if (data.settings) localStorage.setItem(SETTINGS_KEY, data.settings);
          if (data.songs) localStorage.setItem(COMPOSED_SONGS_KEY, data.songs);
          return true;
      } catch (e) {
          console.error("Import failed", e);
          return false;
      }
  }
};
