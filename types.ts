
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

export interface NoteEvent {
  note: NoteName;
  octave: number;
  duration: number; // in beats
  startTime: number; // absolute time in sequence
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
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  bpm: number;
  notes: NoteEvent[];
  backingTrack?: BackingTrackEvent[];
  description?: string;
  preferredInstrument?: Instrument;
  category?: 'Song' | 'Course' | 'Workout';
}

export interface AudioAnalysisResult {
  pitch: number; // Frequency in Hz
  note: NoteName | null;
  octave: number | null;
  clarity: number; // 0 to 1, confidence of pitch
  volume: number; // RMS
  source?: 'mic' | 'midi'; 
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
  WORKOUT = 'WORKOUT'
}
