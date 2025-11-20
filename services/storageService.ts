
import { AppSettings, Song } from '../types';

const SETTINGS_KEY = 'luma_app_settings_v5'; // Bumped version for new defaults
const COMPOSED_SONGS_KEY = 'luma_composed_library';

const DEFAULT_SETTINGS: AppSettings = {
  defaultSpeed: 1.0,
  enableLooping: false,
  showNoteLabels: true,
  strictMode: false,
  micSensitivity: 1.2,
  masterVolume: 0.5,
  enableTTS: true, // Lyrics singing remains enabled
  enableVoiceFeedback: false, // AI speaking DISABLED by default
  enableParticleEffects: true,
  showDebugInfo: false,
  autoSaveSongs: true,
  inputSource: 'auto',
  themeColor: 'blue',
  darkMode: true, // Dark mode enabled by default
  noteDisplayStyle: 'Standard',
  accidentalStyle: 'Sharp'
};

export const storageService = {
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
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
    // Prevent duplicates by ID
    if (!current.find(s => s.id === song.id)) {
      current.unshift(song); // Add to top
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
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
  }
};
