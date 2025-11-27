

export enum NoteName {
  C = 'C',
  Cs = 'C#',
  D = 'D',
  Ds = 'D#',
  E = 'E',
  F = 'F',
  Fs = 'F#',
  G = 'G',
  Gs = 'G#',
  A = 'A',
  As = 'A#',
  B = 'B'
}

export enum Instrument {
  PIANO = 'PIANO',
  GUITAR = 'GUITAR'
}

export enum NoteStatus {
  PENDING = 'PENDING',
  CORRECT = 'CORRECT', // Blue
  MISSED = 'MISSED',   // Red
  HINTED = 'HINTED'    // Yellow (Waiting)
}

export type SongCategory = 'Song' | 'Course' | 'Workout' | 'Jam';

export type NoteDisplayStyle = 'Standard' | 'ScaleDegree' | 'Lyrics' | 'NoteName';

export type AccidentalStyle = 'Sharp' | 'Flat';

// Updated to reflect Schaum Books
export type SongStage = 1 | 2 | 3 | 4 | 5 | 6;
export type SchaumBook = 'Pre-A' | 'A' | 'B' | 'C' | 'D' | 'Virtuoso';

export interface NoteEvent {
  note: NoteName;
  octave: number;
  duration: number; // in beats
  startTime: number; // absolute time in sequence
  lyrics?: string; // Lyrics syllable
  hand?: 'l' | 'r';
  finger?: number; // 1 (Thumb) to 5 (Pinky)
}

export interface BackingTrackEvent {
  chordName: string; // e.g. "Cmaj7"
  notes: string[]; // ["C3", "E3", "G3"]
  startTime: number; // in beats
  duration: number; // in beats
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master';
  bpm: number;
  notes: NoteEvent[];
  backingTrack?: BackingTrackEvent[];
  description?: string;
  preferredInstrument?: Instrument;
  category: SongCategory;
  stage?: SongStage; 
  book?: SchaumBook; // Added for Schaum Course
  keySignature?: string; // e.g. "C", "G", "F"
}

export interface DetectedNote {
    note: NoteName;
    octave: number;
    cents: number;
    frequency: number;
    confidence: number;
    midi: number;
}

export interface AudioAnalysisResult {
  activeNotes: DetectedNote[]; // Polyphonic support
  volume: number; // RMS
  snr: number; // Signal-to-Noise Ratio in dB
  clarity: number; // 0.0 - 1.0 (Confidence)
  harmonicity: number; // 0.0 - 1.0 (Tonal strength vs Noise)
  spectralCentroid: number; // Brightness/Timbre
  source: 'mic' | 'midi' | 'none'; 
  chordName?: string; // e.g. "C Major"
  spectrum?: number[]; // 0.0 - 1.0 normalized frequency bins for visualization
}

export interface SongStats {
  stars: number; // 0 to 3
  highScore: number;
  timesPlayed: number;
}

export interface User {
  id: string;
  email: string;
  password: string; // Mock
  name: string;
  tag: string; // Unique handle
  isAdmin: boolean;
  xp: number;
  streak: number;
  level: number;
  progress: Record<string, SongStats>; // Map songId -> Stats
}

export type AuthView = 'signIn' | 'signUp';

export interface LoopRegion {
  start: number; // in beats
  end: number; // in beats
  active: boolean;
}

export interface AppSettings {
  defaultSpeed: number;       // 0.5 - 1.5
  enableLooping: boolean;     // Default loop state
  showNoteLabels: boolean;    // Piano key text
  strictMode: boolean;        // Harder timing window
  micSensitivity: number;     // Input threshold multiplier
  masterVolume: number;       // 0.0 - 1.0
  enableTTS: boolean;         // Sing lyrics (Gameplay)
  enableVoiceFeedback: boolean; // Voice interactions (Welcome, Feedback, Errors)
  enableParticleEffects: boolean; // Visual fluff
  showDebugInfo: boolean;     // Clarity/Pitch overlay
  autoSaveSongs: boolean;     // Save generated songs automatically
  inputSource: 'auto' | 'mic' | 'midi';
  themeColor: 'blue' | 'purple' | 'orange';
  darkMode: boolean;          // Light/Dark mode
  noteDisplayStyle: NoteDisplayStyle;
  accidentalStyle: AccidentalStyle;
  pitchDetectionEnabled: boolean; // Toggle mic usage
  
  // New Settings
  flowMode: boolean;          // If true, game doesn't stop on miss, just marks red
  sheetMusicZoom: number;     // 50 to 200%
}

export enum OnboardingStep {
  WELCOME = 0,
  INSTRUMENT = 1,
  AUDIO_SETUP = 2,
  COMPLETE = 3
}

export enum AppState {
  ONBOARDING = 'ONBOARDING',
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  FEEDBACK = 'FEEDBACK',
  GENERATING = 'GENERATING',
  JAM = 'JAM',
  WORKOUT = 'WORKOUT',
  SETTINGS = 'SETTINGS'
}
