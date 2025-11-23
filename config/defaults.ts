
import { AppSettings } from '../types';

export const DEFAULT_APP_SETTINGS: AppSettings = {
  defaultSpeed: 1.0,
  enableLooping: false,
  showNoteLabels: true,
  strictMode: false,
  micSensitivity: 1.2,
  masterVolume: 0.5,
  enableTTS: false, // Lyrics singing DISABLED by default
  enableVoiceFeedback: false, // AI speaking DISABLED by default
  enableParticleEffects: true,
  showDebugInfo: false,
  autoSaveSongs: true,
  inputSource: 'auto',
  themeColor: 'blue',
  darkMode: true, // Dark mode enabled by default
  noteDisplayStyle: 'Standard',
  accidentalStyle: 'Sharp',
  
  flowMode: false, // Default to Stop & Wait (Strict)
  sheetMusicZoom: 100 // Default zoom level
};
