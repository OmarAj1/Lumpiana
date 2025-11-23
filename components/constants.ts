

import { NoteName, Song, NoteEvent } from './types';

export const STAR_THRESHOLDS = {
    GOLD: 0.97,   // 3 Stars
    SILVER: 0.75, // 2 Stars
    BRONZE: 0.0   // 1 Star (Any completion below 75%)
};

export const NOTE_FREQUENCIES: Record<string, number> = {
  'C1': 32.70, 'C#1': 34.65, 'D1': 36.71, 'D#1': 38.89, 'E1': 41.20, 'F1': 43.65, 'F#1': 46.25, 'G1': 49.00, 'G#1': 51.91, 'A1': 55.00, 'A#1': 58.27, 'B1': 61.74,
  'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
  'C6': 1046.50
};

export const NOTES_ORDER = [
  NoteName.C, NoteName.Cs, NoteName.D, NoteName.Ds, NoteName.E, NoteName.F,
  NoteName.Fs, NoteName.G, NoteName.Gs, NoteName.A, NoteName.As, NoteName.B
];

// --- HELPER TO GENERATE LONG SONGS ---
const shift = (notes: NoteEvent[], beats: number): NoteEvent[] => {
    return notes.map(n => ({ ...n, startTime: n.startTime + beats }));
};

export const DEMO_SONG: Song = {
  id: 'ode-to-joy',
  title: 'Ode to Joy',
  artist: 'Ludwig van Beethoven',
  difficulty: 'Beginner',
  bpm: 60,
  category: 'Song',
  stage: 1,
  notes: [
    { note: NoteName.E, octave: 4, duration: 1, startTime: 0, finger: 3 },
    { note: NoteName.E, octave: 4, duration: 1, startTime: 1, finger: 3 },
    { note: NoteName.F, octave: 4, duration: 1, startTime: 2, finger: 4 },
    { note: NoteName.G, octave: 4, duration: 1, startTime: 3, finger: 5 },
    { note: NoteName.G, octave: 4, duration: 1, startTime: 4, finger: 5 },
    { note: NoteName.F, octave: 4, duration: 1, startTime: 5, finger: 4 },
    { note: NoteName.E, octave: 4, duration: 1, startTime: 6, finger: 3 },
    { note: NoteName.D, octave: 4, duration: 1, startTime: 7, finger: 2 },
    { note: NoteName.C, octave: 4, duration: 1, startTime: 8, finger: 1 },
    { note: NoteName.C, octave: 4, duration: 1, startTime: 9, finger: 1 },
    { note: NoteName.D, octave: 4, duration: 1, startTime: 10, finger: 2 },
    { note: NoteName.E, octave: 4, duration: 1, startTime: 11, finger: 3 },
    { note: NoteName.E, octave: 4, duration: 1.5, startTime: 12, finger: 3 },
    { note: NoteName.D, octave: 4, duration: 0.5, startTime: 13.5, finger: 2 },
    { note: NoteName.D, octave: 4, duration: 2, startTime: 14, finger: 2 },
  ]
};

// ==========================================
// STAGE 1: BEGINNER (Right Hand, Simple)
// ==========================================

const s1_twinkle_theme: NoteEvent[] = [
    { note: NoteName.C, octave: 4, duration: 1, startTime: 0 }, { note: NoteName.C, octave: 4, duration: 1, startTime: 1 },
    { note: NoteName.G, octave: 4, duration: 1, startTime: 2 }, { note: NoteName.G, octave: 4, duration: 1, startTime: 3 },
    { note: NoteName.A, octave: 4, duration: 1, startTime: 4 }, { note: NoteName.A, octave: 4, duration: 1, startTime: 5 },
    { note: NoteName.G, octave: 4, duration: 2, startTime: 6 },
    { note: NoteName.F, octave: 4, duration: 1, startTime: 8 }, { note: NoteName.F, octave: 4, duration: 1, startTime: 9 },
    { note: NoteName.E, octave: 4, duration: 1, startTime: 10 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 11 },
    { note: NoteName.D, octave: 4, duration: 1, startTime: 12 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 13 },
    { note: NoteName.C, octave: 4, duration: 2, startTime: 14 },
];
const s1_twinkle_bridge: NoteEvent[] = [
    { note: NoteName.G, octave: 4, duration: 1, startTime: 0 }, { note: NoteName.G, octave: 4, duration: 1, startTime: 1 },
    { note: NoteName.F, octave: 4, duration: 1, startTime: 2 }, { note: NoteName.F, octave: 4, duration: 1, startTime: 3 },
    { note: NoteName.E, octave: 4, duration: 1, startTime: 4 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 5 },
    { note: NoteName.D, octave: 4, duration: 2, startTime: 6 },
];

const STAGE_1_SONGS: Song[] = [
    {
        id: 's1-twinkle', title: 'Twinkle Twinkle Variations', artist: 'Trad.', difficulty: 'Beginner', bpm: 70, category: 'Song', stage: 1,
        notes: [
            ...s1_twinkle_theme,
            ...shift(s1_twinkle_bridge, 16),
            ...shift(s1_twinkle_bridge, 24),
            ...shift(s1_twinkle_theme, 32),
            ...shift(s1_twinkle_theme, 48)
        ]
    },
    {
        id: 's1-jingle', title: 'Jingle Bells (Full)', artist: 'Pierpont', difficulty: 'Beginner', bpm: 80, category: 'Song', stage: 1,
        notes: [
            { note: NoteName.E, octave: 4, duration: 1, startTime: 0 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 1 }, { note: NoteName.E, octave: 4, duration: 2, startTime: 2 },
            { note: NoteName.E, octave: 4, duration: 1, startTime: 4 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 5 }, { note: NoteName.E, octave: 4, duration: 2, startTime: 6 },
            { note: NoteName.E, octave: 4, duration: 1, startTime: 8 }, { note: NoteName.G, octave: 4, duration: 1, startTime: 9 }, { note: NoteName.C, octave: 4, duration: 1.5, startTime: 10 }, { note: NoteName.D, octave: 4, duration: 0.5, startTime: 11.5 }, { note: NoteName.E, octave: 4, duration: 4, startTime: 12 },
            ...shift([
                { note: NoteName.F, octave: 4, duration: 1, startTime: 0 }, { note: NoteName.F, octave: 4, duration: 1, startTime: 1 }, { note: NoteName.F, octave: 4, duration: 1.5, startTime: 2 }, { note: NoteName.F, octave: 4, duration: 0.5, startTime: 3.5 },
                { note: NoteName.F, octave: 4, duration: 1, startTime: 4 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 5 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 6 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 7 },
                { note: NoteName.E, octave: 4, duration: 1, startTime: 8 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 9 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 10 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 11 },
                { note: NoteName.D, octave: 4, duration: 2, startTime: 12 }, { note: NoteName.G, octave: 4, duration: 2, startTime: 14 }
            ], 16),
            ...shift([
                 { note: NoteName.E, octave: 4, duration: 1, startTime: 0 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 1 }, { note: NoteName.E, octave: 4, duration: 2, startTime: 2 },
                 { note: NoteName.E, octave: 4, duration: 1, startTime: 4 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 5 }, { note: NoteName.E, octave: 4, duration: 2, startTime: 6 }
            ], 32),
             ...shift([
                 { note: NoteName.E, octave: 4, duration: 1, startTime: 0 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 1 }, { note: NoteName.E, octave: 4, duration: 2, startTime: 2 },
                 { note: NoteName.E, octave: 4, duration: 1, startTime: 4 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 5 }, { note: NoteName.E, octave: 4, duration: 2, startTime: 6 }
            ], 48)
        ]
    },
    {
        id: 's1-mary', title: 'Mary Had a Little Lamb', artist: 'Nursery', difficulty: 'Beginner', bpm: 70, category: 'Song', stage: 1,
        notes: [
            ...shift([
                { note: NoteName.E, octave: 4, duration: 1, startTime: 0 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 1 },
                { note: NoteName.C, octave: 4, duration: 1, startTime: 2 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 3 },
                { note: NoteName.E, octave: 4, duration: 1, startTime: 4 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 5 }, { note: NoteName.E, octave: 4, duration: 2, startTime: 6 },
                { note: NoteName.D, octave: 4, duration: 1, startTime: 8 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 9 }, { note: NoteName.D, octave: 4, duration: 2, startTime: 10 },
                { note: NoteName.E, octave: 4, duration: 1, startTime: 12 }, { note: NoteName.G, octave: 4, duration: 1, startTime: 13 }, { note: NoteName.G, octave: 4, duration: 2, startTime: 14 },
            ], 0),
            ...shift([
                { note: NoteName.E, octave: 4, duration: 1, startTime: 0 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 1 },
                { note: NoteName.C, octave: 4, duration: 1, startTime: 2 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 3 },
                { note: NoteName.E, octave: 4, duration: 1, startTime: 4 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 5 }, { note: NoteName.E, octave: 4, duration: 2, startTime: 6 },
                { note: NoteName.D, octave: 4, duration: 1, startTime: 8 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 9 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 10 },
                { note: NoteName.D, octave: 4, duration: 1, startTime: 11 }, { note: NoteName.C, octave: 4, duration: 4, startTime: 12 }
            ], 16),
             ...shift([
                { note: NoteName.E, octave: 4, duration: 1, startTime: 0 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 1 },
                { note: NoteName.C, octave: 4, duration: 1, startTime: 2 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 3 },
                { note: NoteName.E, octave: 4, duration: 1, startTime: 4 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 5 }, { note: NoteName.E, octave: 4, duration: 2, startTime: 6 }
            ], 32),
             ...shift([
                { note: NoteName.E, octave: 4, duration: 1, startTime: 0 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 1 },
                { note: NoteName.C, octave: 4, duration: 1, startTime: 2 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 3 },
                { note: NoteName.E, octave: 4, duration: 1, startTime: 4 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 5 }, { note: NoteName.E, octave: 4, duration: 2, startTime: 6 }
            ], 48)
        ]
    },
    {
        id: 's1-row', title: 'Row Row Row Your Boat', artist: 'Trad.', difficulty: 'Beginner', bpm: 70, category: 'Song', stage: 1,
        notes: [
            { note: NoteName.C, octave: 4, duration: 2, startTime: 0 },
            { note: NoteName.C, octave: 4, duration: 2, startTime: 2 },
            { note: NoteName.C, octave: 4, duration: 1.5, startTime: 4 }, { note: NoteName.D, octave: 4, duration: 0.5, startTime: 5.5 }, { note: NoteName.E, octave: 4, duration: 2, startTime: 6 },
            { note: NoteName.E, octave: 4, duration: 1.5, startTime: 8 }, { note: NoteName.D, octave: 4, duration: 0.5, startTime: 9.5 }, { note: NoteName.E, octave: 4, duration: 1.5, startTime: 10 }, { note: NoteName.F, octave: 4, duration: 0.5, startTime: 11.5 }, { note: NoteName.G, octave: 4, duration: 4, startTime: 12 },
            ...shift([
                { note: NoteName.C, octave: 5, duration: 0.5, startTime: 0 }, { note: NoteName.C, octave: 5, duration: 0.5, startTime: 0.5 }, { note: NoteName.C, octave: 5, duration: 0.5, startTime: 1 },
                { note: NoteName.G, octave: 4, duration: 0.5, startTime: 1.5 }, { note: NoteName.G, octave: 4, duration: 0.5, startTime: 2 }, { note: NoteName.G, octave: 4, duration: 0.5, startTime: 2.5 },
                { note: NoteName.E, octave: 4, duration: 0.5, startTime: 3 }, { note: NoteName.E, octave: 4, duration: 0.5, startTime: 3.5 }, { note: NoteName.E, octave: 4, duration: 0.5, startTime: 4 },
                { note: NoteName.C, octave: 4, duration: 0.5, startTime: 4.5 }, { note: NoteName.C, octave: 4, duration: 0.5, startTime: 5 }, { note: NoteName.C, octave: 4, duration: 0.5, startTime: 5.5 },
                { note: NoteName.G, octave: 4, duration: 1.5, startTime: 6 }, { note: NoteName.F, octave: 4, duration: 0.5, startTime: 7.5 }, { note: NoteName.E, octave: 4, duration: 1.5, startTime: 8 }, { note: NoteName.D, octave: 4, duration: 0.5, startTime: 9.5 }, { note: NoteName.C, octave: 4, duration: 4, startTime: 10 }
            ], 16),
             ...shift([
                { note: NoteName.C, octave: 4, duration: 2, startTime: 0 },
                { note: NoteName.C, octave: 4, duration: 2, startTime: 2 },
                { note: NoteName.C, octave: 4, duration: 1.5, startTime: 4 }, { note: NoteName.D, octave: 4, duration: 0.5, startTime: 5.5 }, { note: NoteName.E, octave: 4, duration: 2, startTime: 6 }
            ], 32)
        ]
    },
    {
        id: 's1-au-clair', title: 'Au Clair de la Lune', artist: 'French Folk', difficulty: 'Beginner', bpm: 65, category: 'Song', stage: 1,
        notes: [
            ...shift([
                { note: NoteName.C, octave: 4, duration: 1, startTime: 0 }, { note: NoteName.C, octave: 4, duration: 1, startTime: 1 }, { note: NoteName.C, octave: 4, duration: 1, startTime: 2 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 3 },
                { note: NoteName.E, octave: 4, duration: 2, startTime: 4 }, { note: NoteName.D, octave: 4, duration: 2, startTime: 6 },
                { note: NoteName.C, octave: 4, duration: 1, startTime: 8 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 9 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 10 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 11 },
                { note: NoteName.C, octave: 4, duration: 4, startTime: 12 }
            ], 0),
            ...shift([
                { note: NoteName.D, octave: 4, duration: 1, startTime: 0 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 1 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 2 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 3 },
                { note: NoteName.A, octave: 3, duration: 2, startTime: 4 }, { note: NoteName.A, octave: 3, duration: 2, startTime: 6 },
                { note: NoteName.D, octave: 4, duration: 1, startTime: 8 }, { note: NoteName.C, octave: 4, duration: 1, startTime: 9 }, { note: NoteName.B, octave: 3, duration: 1, startTime: 10 }, { note: NoteName.A, octave: 3, duration: 1, startTime: 11 },
                { note: NoteName.G, octave: 3, duration: 4, startTime: 12 }
            ], 16),
            ...shift([
                { note: NoteName.C, octave: 4, duration: 1, startTime: 0 }, { note: NoteName.C, octave: 4, duration: 1, startTime: 1 }, { note: NoteName.C, octave: 4, duration: 1, startTime: 2 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 3 },
                { note: NoteName.E, octave: 4, duration: 2, startTime: 4 }, { note: NoteName.D, octave: 4, duration: 2, startTime: 6 },
                { note: NoteName.C, octave: 4, duration: 1, startTime: 8 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 9 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 10 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 11 },
                { note: NoteName.C, octave: 4, duration: 4, startTime: 12 }
            ], 32)
        ]
    }
];

// ==========================================
// STAGE 2: EARLY INTERMEDIATE (Hands Together)
// ==========================================

const s2_minuet_theme: NoteEvent[] = [
    { note: NoteName.D, octave: 5, duration: 1, startTime: 0 }, 
    { note: NoteName.G, octave: 4, duration: 0.5, startTime: 1 }, { note: NoteName.A, octave: 4, duration: 0.5, startTime: 1.5 }, 
    { note: NoteName.B, octave: 4, duration: 0.5, startTime: 2 }, { note: NoteName.C, octave: 5, duration: 0.5, startTime: 2.5 },
    { note: NoteName.D, octave: 5, duration: 1, startTime: 3 }, { note: NoteName.G, octave: 4, duration: 1, startTime: 4 }, { note: NoteName.G, octave: 4, duration: 1, startTime: 5 },
    // Bass
    { note: NoteName.G, octave: 3, duration: 1, startTime: 0, hand: 'l' }, { note: NoteName.B, octave: 3, duration: 1, startTime: 1, hand: 'l' }, { note: NoteName.D, octave: 4, duration: 1, startTime: 2, hand: 'l' },
    { note: NoteName.B, octave: 3, duration: 1, startTime: 3, hand: 'l' }, { note: NoteName.G, octave: 3, duration: 2, startTime: 4, hand: 'l' },
    // Phrase 2
    { note: NoteName.E, octave: 5, duration: 1, startTime: 6 }, 
    { note: NoteName.C, octave: 5, duration: 0.5, startTime: 7 }, { note: NoteName.D, octave: 5, duration: 0.5, startTime: 7.5 }, 
    { note: NoteName.E, octave: 5, duration: 0.5, startTime: 8 }, { note: NoteName.Fs, octave: 5, duration: 0.5, startTime: 8.5 },
    { note: NoteName.G, octave: 5, duration: 1, startTime: 9 }, { note: NoteName.G, octave: 4, duration: 1, startTime: 10 }, { note: NoteName.G, octave: 4, duration: 1, startTime: 11 }
];

const STAGE_2_SONGS: Song[] = [
    {
        id: 's2-minuet', title: 'Minuet in G', artist: 'J.S. Bach', difficulty: 'Intermediate', bpm: 90, category: 'Song', stage: 2,
        notes: [
            ...s2_minuet_theme,
            ...shift(s2_minuet_theme, 12),
            ...shift(s2_minuet_theme, 24),
            ...shift(s2_minuet_theme, 36),
            ...shift(s2_minuet_theme, 48)
        ]
    },
    {
        id: 's2-new-world', title: 'New World Symphony (Largo)', artist: 'Dvorak', difficulty: 'Intermediate', bpm: 50, category: 'Song', stage: 2,
        notes: [
            { note: NoteName.E, octave: 4, duration: 1.5, startTime: 0 }, { note: NoteName.G, octave: 4, duration: 0.5, startTime: 1.5 }, { note: NoteName.G, octave: 4, duration: 2, startTime: 2 },
            { note: NoteName.E, octave: 4, duration: 1.5, startTime: 4 }, { note: NoteName.D, octave: 4, duration: 0.5, startTime: 5.5 }, { note: NoteName.C, octave: 4, duration: 1, startTime: 6 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 7 },
            { note: NoteName.E, octave: 4, duration: 1.5, startTime: 8 }, { note: NoteName.G, octave: 4, duration: 0.5, startTime: 9.5 }, { note: NoteName.E, octave: 4, duration: 2, startTime: 10 },
            { note: NoteName.D, octave: 4, duration: 4, startTime: 12 },
            { note: NoteName.C, octave: 3, duration: 4, startTime: 0, hand: 'l' }, { note: NoteName.G, octave: 2, duration: 4, startTime: 4, hand: 'l' },
            { note: NoteName.C, octave: 3, duration: 4, startTime: 8, hand: 'l' }, { note: NoteName.G, octave: 2, duration: 4, startTime: 12, hand: 'l' },
            ...shift([ { note: NoteName.E, octave: 4, duration: 1.5, startTime: 0 }, { note: NoteName.G, octave: 4, duration: 0.5, startTime: 1.5 }, { note: NoteName.G, octave: 4, duration: 2, startTime: 2 } ], 16),
            ...shift([ { note: NoteName.E, octave: 4, duration: 1.5, startTime: 0 }, { note: NoteName.G, octave: 4, duration: 0.5, startTime: 1.5 }, { note: NoteName.G, octave: 4, duration: 2, startTime: 2 } ], 24),
            ...shift([ { note: NoteName.E, octave: 4, duration: 1.5, startTime: 0 }, { note: NoteName.G, octave: 4, duration: 0.5, startTime: 1.5 }, { note: NoteName.G, octave: 4, duration: 2, startTime: 2 } ], 32),
            ...shift([ { note: NoteName.E, octave: 4, duration: 1.5, startTime: 0 }, { note: NoteName.G, octave: 4, duration: 0.5, startTime: 1.5 }, { note: NoteName.G, octave: 4, duration: 2, startTime: 2 } ], 40)
        ]
    },
    {
        id: 's2-surprise', title: 'Surprise Symphony', artist: 'Haydn', difficulty: 'Intermediate', bpm: 80, category: 'Song', stage: 2,
        notes: [
            { note: NoteName.C, octave: 4, duration: 0.5, startTime: 0 }, { note: NoteName.C, octave: 4, duration: 0.5, startTime: 0.5 }, { note: NoteName.E, octave: 4, duration: 0.5, startTime: 1 }, { note: NoteName.E, octave: 4, duration: 0.5, startTime: 1.5 },
            { note: NoteName.G, octave: 4, duration: 0.5, startTime: 2 }, { note: NoteName.G, octave: 4, duration: 0.5, startTime: 2.5 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 3 },
            { note: NoteName.F, octave: 4, duration: 0.5, startTime: 4 }, { note: NoteName.F, octave: 4, duration: 0.5, startTime: 4.5 }, { note: NoteName.D, octave: 4, duration: 0.5, startTime: 5 }, { note: NoteName.D, octave: 4, duration: 0.5, startTime: 5.5 },
            { note: NoteName.B, octave: 3, duration: 0.5, startTime: 6 }, { note: NoteName.B, octave: 3, duration: 0.5, startTime: 6.5 }, { note: NoteName.G, octave: 3, duration: 1, startTime: 7 },
            { note: NoteName.G, octave: 3, duration: 2, startTime: 8, hand: 'l' }, { note: NoteName.C, octave: 4, duration: 2, startTime: 8, hand: 'r' }, { note: NoteName.E, octave: 4, duration: 2, startTime: 8, hand: 'r' },
            ...shift([
                { note: NoteName.C, octave: 4, duration: 0.5, startTime: 0 }, { note: NoteName.C, octave: 4, duration: 0.5, startTime: 0.5 }, { note: NoteName.E, octave: 4, duration: 0.5, startTime: 1 }, { note: NoteName.E, octave: 4, duration: 0.5, startTime: 1.5 },
                { note: NoteName.G, octave: 4, duration: 0.5, startTime: 2 }, { note: NoteName.G, octave: 4, duration: 0.5, startTime: 2.5 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 3 }
            ], 12),
            ...shift([
                { note: NoteName.C, octave: 4, duration: 0.5, startTime: 0 }, { note: NoteName.C, octave: 4, duration: 0.5, startTime: 0.5 }, { note: NoteName.E, octave: 4, duration: 0.5, startTime: 1 }, { note: NoteName.E, octave: 4, duration: 0.5, startTime: 1.5 },
                { note: NoteName.G, octave: 4, duration: 0.5, startTime: 2 }, { note: NoteName.G, octave: 4, duration: 0.5, startTime: 2.5 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 3 }
            ], 20),
            ...shift([
                { note: NoteName.C, octave: 4, duration: 0.5, startTime: 0 }, { note: NoteName.C, octave: 4, duration: 0.5, startTime: 0.5 }, { note: NoteName.E, octave: 4, duration: 0.5, startTime: 1 }, { note: NoteName.E, octave: 4, duration: 0.5, startTime: 1.5 },
                { note: NoteName.G, octave: 4, duration: 0.5, startTime: 2 }, { note: NoteName.G, octave: 4, duration: 0.5, startTime: 2.5 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 3 }
            ], 28)
        ]
    },
    {
        id: 's2-musette', title: 'Musette in D', artist: 'J.S. Bach', difficulty: 'Intermediate', bpm: 90, category: 'Song', stage: 2,
        notes: [
            { note: NoteName.D, octave: 5, duration: 1, startTime: 0 }, { note: NoteName.A, octave: 4, duration: 1, startTime: 1 }, 
            { note: NoteName.D, octave: 5, duration: 0.5, startTime: 2 }, { note: NoteName.Cs, octave: 5, duration: 0.5, startTime: 2.5 }, { note: NoteName.D, octave: 5, duration: 0.5, startTime: 3 }, { note: NoteName.E, octave: 5, duration: 0.5, startTime: 3.5 },
            { note: NoteName.D, octave: 3, duration: 4, startTime: 0, hand: 'l' },
            ...shift([
               { note: NoteName.D, octave: 5, duration: 1, startTime: 0 }, { note: NoteName.A, octave: 4, duration: 1, startTime: 1 }, 
               { note: NoteName.D, octave: 5, duration: 0.5, startTime: 2 }, { note: NoteName.Cs, octave: 5, duration: 0.5, startTime: 2.5 }, { note: NoteName.D, octave: 5, duration: 0.5, startTime: 3 }, { note: NoteName.E, octave: 5, duration: 0.5, startTime: 3.5 },
               { note: NoteName.D, octave: 3, duration: 4, startTime: 0, hand: 'l' }
            ], 4),
            ...shift([
               { note: NoteName.D, octave: 5, duration: 1, startTime: 0 }, { note: NoteName.A, octave: 4, duration: 1, startTime: 1 }, 
               { note: NoteName.D, octave: 5, duration: 0.5, startTime: 2 }, { note: NoteName.Cs, octave: 5, duration: 0.5, startTime: 2.5 }, { note: NoteName.D, octave: 5, duration: 0.5, startTime: 3 }, { note: NoteName.E, octave: 5, duration: 0.5, startTime: 3.5 },
               { note: NoteName.D, octave: 3, duration: 4, startTime: 0, hand: 'l' }
            ], 8),
            ...shift([
               { note: NoteName.D, octave: 5, duration: 1, startTime: 0 }, { note: NoteName.A, octave: 4, duration: 1, startTime: 1 }, 
               { note: NoteName.D, octave: 5, duration: 0.5, startTime: 2 }, { note: NoteName.Cs, octave: 5, duration: 0.5, startTime: 2.5 }, { note: NoteName.D, octave: 5, duration: 0.5, startTime: 3 }, { note: NoteName.E, octave: 5, duration: 0.5, startTime: 3.5 },
               { note: NoteName.D, octave: 3, duration: 4, startTime: 0, hand: 'l' }
            ], 12)
        ]
    },
    {
        id: 's2-scarborough', title: 'Scarborough Fair', artist: 'Trad.', difficulty: 'Intermediate', bpm: 90, category: 'Song', stage: 2,
        notes: [
            { note: NoteName.D, octave: 4, duration: 2, startTime: 0 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 2 },
            { note: NoteName.A, octave: 4, duration: 1, startTime: 3 }, { note: NoteName.A, octave: 4, duration: 1, startTime: 4 }, { note: NoteName.A, octave: 4, duration: 1, startTime: 5 },
            { note: NoteName.E, octave: 4, duration: 1.5, startTime: 6 }, { note: NoteName.F, octave: 4, duration: 0.5, startTime: 7.5 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 8 }, 
            { note: NoteName.D, octave: 4, duration: 3, startTime: 9 },
            ...shift([
                { note: NoteName.D, octave: 4, duration: 2, startTime: 0 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 2 },
                { note: NoteName.A, octave: 4, duration: 1, startTime: 3 }, { note: NoteName.A, octave: 4, duration: 1, startTime: 4 }, { note: NoteName.A, octave: 4, duration: 1, startTime: 5 }
            ], 12),
            ...shift([
                { note: NoteName.D, octave: 4, duration: 2, startTime: 0 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 2 },
                { note: NoteName.A, octave: 4, duration: 1, startTime: 3 }, { note: NoteName.A, octave: 4, duration: 1, startTime: 4 }, { note: NoteName.A, octave: 4, duration: 1, startTime: 5 }
            ], 24),
            ...shift([
                { note: NoteName.D, octave: 4, duration: 2, startTime: 0 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 2 },
                { note: NoteName.A, octave: 4, duration: 1, startTime: 3 }, { note: NoteName.A, octave: 4, duration: 1, startTime: 4 }, { note: NoteName.A, octave: 4, duration: 1, startTime: 5 }
            ], 36)
        ]
    }
];

// ==========================================
// STAGE 3: INTERMEDIATE
// ==========================================

const STAGE_3_SONGS: Song[] = [
    {
        id: 's3-fur-elise', title: 'Für Elise', artist: 'Beethoven', difficulty: 'Intermediate', bpm: 75, category: 'Song', stage: 3,
        notes: [
            { note: NoteName.E, octave: 5, duration: 0.5, startTime: 0 }, { note: NoteName.Ds, octave: 5, duration: 0.5, startTime: 0.5 },
            { note: NoteName.E, octave: 5, duration: 0.5, startTime: 1 }, { note: NoteName.Ds, octave: 5, duration: 0.5, startTime: 1.5 },
            { note: NoteName.E, octave: 5, duration: 0.5, startTime: 2 }, { note: NoteName.B, octave: 4, duration: 0.5, startTime: 2.5 },
            { note: NoteName.D, octave: 5, duration: 0.5, startTime: 3 }, { note: NoteName.C, octave: 5, duration: 0.5, startTime: 3.5 },
            { note: NoteName.A, octave: 4, duration: 2, startTime: 4 },
            { note: NoteName.A, octave: 2, duration: 2, startTime: 4, hand: 'l' }, { note: NoteName.E, octave: 3, duration: 2, startTime: 4.5, hand: 'l' }, { note: NoteName.A, octave: 3, duration: 2, startTime: 5, hand: 'l' },
            ...shift([
                { note: NoteName.C, octave: 4, duration: 0.5, startTime: 0 }, { note: NoteName.E, octave: 4, duration: 0.5, startTime: 0.5 }, { note: NoteName.A, octave: 4, duration: 0.5, startTime: 1 }, { note: NoteName.B, octave: 4, duration: 2, startTime: 1.5 },
                { note: NoteName.E, octave: 2, duration: 2, startTime: 1.5, hand: 'l' }, { note: NoteName.E, octave: 3, duration: 2, startTime: 2, hand: 'l' }, { note: NoteName.Gs, octave: 3, duration: 2, startTime: 2.5, hand: 'l' }
            ], 6),
            ...shift([
                { note: NoteName.E, octave: 4, duration: 0.5, startTime: 0 }, { note: NoteName.Gs, octave: 4, duration: 0.5, startTime: 0.5 }, { note: NoteName.B, octave: 4, duration: 0.5, startTime: 1 }, { note: NoteName.C, octave: 5, duration: 2, startTime: 1.5 }
            ], 9.5),
            ...shift([
                { note: NoteName.E, octave: 5, duration: 0.5, startTime: 0 }, { note: NoteName.Ds, octave: 5, duration: 0.5, startTime: 0.5 },
                { note: NoteName.E, octave: 5, duration: 0.5, startTime: 1 }, { note: NoteName.Ds, octave: 5, duration: 0.5, startTime: 1.5 },
                { note: NoteName.E, octave: 5, duration: 0.5, startTime: 2 }, { note: NoteName.B, octave: 4, duration: 0.5, startTime: 2.5 }
            ], 13.5),
            ...shift([
                { note: NoteName.E, octave: 5, duration: 0.5, startTime: 0 }, { note: NoteName.Ds, octave: 5, duration: 0.5, startTime: 0.5 },
                { note: NoteName.E, octave: 5, duration: 0.5, startTime: 1 }, { note: NoteName.Ds, octave: 5, duration: 0.5, startTime: 1.5 }
            ], 18)
        ]
    },
    {
        id: 's3-prelude', title: 'Prelude in C', artist: 'J.S. Bach', difficulty: 'Intermediate', bpm: 70, category: 'Song', stage: 3,
        notes: [
            ...[0, 2].map(offset => shift([
                { note: NoteName.C, octave: 4, duration: 0.5, startTime: 0, hand: 'l' }, { note: NoteName.E, octave: 4, duration: 0.5, startTime: 0.5, hand: 'l' },
                { note: NoteName.G, octave: 4, duration: 0.5, startTime: 1, hand: 'r' }, { note: NoteName.C, octave: 5, duration: 0.5, startTime: 1.5, hand: 'r' }, { note: NoteName.E, octave: 5, duration: 0.5, startTime: 2, hand: 'r' }, { note: NoteName.G, octave: 4, duration: 0.5, startTime: 2.5, hand: 'r' }, { note: NoteName.C, octave: 5, duration: 0.5, startTime: 3, hand: 'r' }, { note: NoteName.E, octave: 5, duration: 0.5, startTime: 3.5, hand: 'r' }
            ], offset)).flat(),
            ...[4, 6].map(offset => shift([
                { note: NoteName.C, octave: 4, duration: 0.5, startTime: 0, hand: 'l' }, { note: NoteName.D, octave: 4, duration: 0.5, startTime: 0.5, hand: 'l' },
                { note: NoteName.A, octave: 4, duration: 0.5, startTime: 1, hand: 'r' }, { note: NoteName.D, octave: 5, duration: 0.5, startTime: 1.5, hand: 'r' }, { note: NoteName.F, octave: 5, duration: 0.5, startTime: 2, hand: 'r' }, { note: NoteName.A, octave: 4, duration: 0.5, startTime: 2.5, hand: 'r' }, { note: NoteName.D, octave: 5, duration: 0.5, startTime: 3, hand: 'r' }, { note: NoteName.F, octave: 5, duration: 0.5, startTime: 3.5, hand: 'r' }
            ], offset)).flat(),
            ...[8, 10, 12, 14, 16, 18, 20, 22].map(offset => shift([
                { note: NoteName.C, octave: 4, duration: 0.5, startTime: 0, hand: 'l' }, { note: NoteName.E, octave: 4, duration: 0.5, startTime: 0.5, hand: 'l' },
                { note: NoteName.G, octave: 4, duration: 0.5, startTime: 1, hand: 'r' }, { note: NoteName.C, octave: 5, duration: 0.5, startTime: 1.5, hand: 'r' }
            ], offset)).flat()
        ]
    },
    {
        id: 's3-gymnopedie', title: 'Gymnopédie No. 1', artist: 'Satie', difficulty: 'Intermediate', bpm: 60, category: 'Song', stage: 3,
        notes: [
            { note: NoteName.G, octave: 3, duration: 3, startTime: 0, hand: 'l' }, 
            { note: NoteName.D, octave: 4, duration: 1, startTime: 1, hand: 'l' }, { note: NoteName.A, octave: 4, duration: 1, startTime: 1, hand: 'r' }, 
            { note: NoteName.D, octave: 3, duration: 3, startTime: 3, hand: 'l' },
            { note: NoteName.Fs, octave: 5, duration: 4, startTime: 4, hand: 'r' },
            { note: NoteName.A, octave: 5, duration: 4, startTime: 8, hand: 'r' },
            { note: NoteName.G, octave: 5, duration: 4, startTime: 12, hand: 'r' },
            { note: NoteName.F, octave: 5, duration: 4, startTime: 16, hand: 'r' },
            { note: NoteName.C, octave: 5, duration: 2, startTime: 20, hand: 'r' }, { note: NoteName.B, octave: 4, duration: 2, startTime: 22, hand: 'r' },
            ...shift([{ note: NoteName.G, octave: 3, duration: 3, startTime: 0, hand: 'l' }], 6),
            ...shift([{ note: NoteName.G, octave: 3, duration: 3, startTime: 0, hand: 'l' }], 9),
            ...shift([{ note: NoteName.G, octave: 3, duration: 3, startTime: 0, hand: 'l' }], 12),
            ...shift([{ note: NoteName.G, octave: 3, duration: 3, startTime: 0, hand: 'l' }], 15)
        ]
    },
    {
        id: 's3-greensleeves', title: 'Greensleeves', artist: 'Trad.', difficulty: 'Intermediate', bpm: 100, category: 'Song', stage: 3,
        notes: [
            { note: NoteName.A, octave: 4, duration: 1, startTime: 0 },
            { note: NoteName.C, octave: 5, duration: 2, startTime: 1 }, { note: NoteName.D, octave: 5, duration: 1, startTime: 3 },
            { note: NoteName.E, octave: 5, duration: 1.5, startTime: 4 }, { note: NoteName.F, octave: 5, duration: 0.5, startTime: 5.5 }, { note: NoteName.E, octave: 5, duration: 1, startTime: 6 },
            { note: NoteName.D, octave: 5, duration: 2, startTime: 7 }, { note: NoteName.B, octave: 4, duration: 1, startTime: 9 },
            { note: NoteName.G, octave: 4, duration: 1.5, startTime: 10 }, { note: NoteName.A, octave: 4, duration: 0.5, startTime: 11.5 }, { note: NoteName.B, octave: 4, duration: 1, startTime: 12 },
            { note: NoteName.C, octave: 5, duration: 2, startTime: 13 },
            ...shift([
                { note: NoteName.A, octave: 4, duration: 1, startTime: 0 },
                { note: NoteName.C, octave: 5, duration: 2, startTime: 1 }, { note: NoteName.D, octave: 5, duration: 1, startTime: 3 },
                { note: NoteName.E, octave: 5, duration: 1.5, startTime: 4 }, { note: NoteName.F, octave: 5, duration: 0.5, startTime: 5.5 }, { note: NoteName.E, octave: 5, duration: 1, startTime: 6 }
            ], 16),
            ...shift([
                { note: NoteName.A, octave: 4, duration: 1, startTime: 0 },
                { note: NoteName.C, octave: 5, duration: 2, startTime: 1 }, { note: NoteName.D, octave: 5, duration: 1, startTime: 3 },
                { note: NoteName.E, octave: 5, duration: 1.5, startTime: 4 }, { note: NoteName.F, octave: 5, duration: 0.5, startTime: 5.5 }, { note: NoteName.E, octave: 5, duration: 1, startTime: 6 }
            ], 32)
        ]
    },
    {
        id: 's3-swan-lake', title: 'Swan Lake Theme', artist: 'Tchaikovsky', difficulty: 'Intermediate', bpm: 80, category: 'Song', stage: 3,
        notes: [
            { note: NoteName.B, octave: 4, duration: 1, startTime: 0 }, 
            { note: NoteName.E, octave: 5, duration: 3, startTime: 1 }, { note: NoteName.B, octave: 4, duration: 1, startTime: 4 }, { note: NoteName.C, octave: 5, duration: 1, startTime: 5 }, { note: NoteName.D, octave: 5, duration: 1, startTime: 6 },
            { note: NoteName.B, octave: 4, duration: 3, startTime: 7 }, { note: NoteName.B, octave: 4, duration: 1, startTime: 10 },
            { note: NoteName.C, octave: 5, duration: 3, startTime: 11 }, { note: NoteName.A, octave: 4, duration: 1, startTime: 14 }, { note: NoteName.B, octave: 4, duration: 1, startTime: 15 }, { note: NoteName.C, octave: 5, duration: 1, startTime: 16 },
            { note: NoteName.A, octave: 4, duration: 3, startTime: 17 },
            ...shift([
                { note: NoteName.E, octave: 3, duration: 0.5, startTime: 0, hand: 'l' }, { note: NoteName.B, octave: 3, duration: 0.5, startTime: 0.5, hand: 'l' },
                { note: NoteName.E, octave: 3, duration: 0.5, startTime: 1, hand: 'l' }, { note: NoteName.B, octave: 3, duration: 0.5, startTime: 1.5, hand: 'l' },
                { note: NoteName.E, octave: 3, duration: 0.5, startTime: 2, hand: 'l' }, { note: NoteName.B, octave: 3, duration: 0.5, startTime: 2.5, hand: 'l' }
            ], 0),
            ...shift([
                { note: NoteName.E, octave: 3, duration: 0.5, startTime: 0, hand: 'l' }, { note: NoteName.B, octave: 3, duration: 0.5, startTime: 0.5, hand: 'l' },
                { note: NoteName.E, octave: 3, duration: 0.5, startTime: 1, hand: 'l' }, { note: NoteName.B, octave: 3, duration: 0.5, startTime: 1.5, hand: 'l' }
            ], 8),
            ...shift([
                { note: NoteName.E, octave: 3, duration: 0.5, startTime: 0, hand: 'l' }, { note: NoteName.B, octave: 3, duration: 0.5, startTime: 0.5, hand: 'l' },
                { note: NoteName.E, octave: 3, duration: 0.5, startTime: 1, hand: 'l' }, { note: NoteName.B, octave: 3, duration: 0.5, startTime: 1.5, hand: 'l' }
            ], 16)
        ]
    }
];

// ==========================================
// STAGE 4: ADVANCED INTERMEDIATE
// ==========================================

const s4_canon_bass: NoteEvent[] = [
    { note: NoteName.D, octave: 3, duration: 2, startTime: 0, hand: 'l' },
    { note: NoteName.A, octave: 2, duration: 2, startTime: 2, hand: 'l' },
    { note: NoteName.B, octave: 2, duration: 2, startTime: 4, hand: 'l' },
    { note: NoteName.Fs, octave: 2, duration: 2, startTime: 6, hand: 'l' },
    { note: NoteName.G, octave: 2, duration: 2, startTime: 8, hand: 'l' },
    { note: NoteName.D, octave: 2, duration: 2, startTime: 10, hand: 'l' },
    { note: NoteName.G, octave: 2, duration: 2, startTime: 12, hand: 'l' },
    { note: NoteName.A, octave: 2, duration: 2, startTime: 14, hand: 'l' },
];

const STAGE_4_SONGS: Song[] = [
    {
        id: 's4-canon', title: 'Canon in D (Full)', artist: 'Pachelbel', difficulty: 'Advanced', bpm: 70, category: 'Song', stage: 4,
        notes: [
            ...s4_canon_bass,
            ...shift(s4_canon_bass, 16),
            ...shift(s4_canon_bass, 32),
            ...shift(s4_canon_bass, 48),
            ...shift([
                { note: NoteName.Fs, octave: 5, duration: 2, startTime: 0 }, { note: NoteName.E, octave: 5, duration: 2, startTime: 2 },
                { note: NoteName.D, octave: 5, duration: 2, startTime: 4 }, { note: NoteName.Cs, octave: 5, duration: 2, startTime: 6 },
                { note: NoteName.B, octave: 4, duration: 2, startTime: 8 }, { note: NoteName.A, octave: 4, duration: 2, startTime: 10 },
                { note: NoteName.B, octave: 4, duration: 2, startTime: 12 }, { note: NoteName.Cs, octave: 5, duration: 2, startTime: 14 },
            ], 16),
            ...shift([
                { note: NoteName.Fs, octave: 5, duration: 1, startTime: 0 }, { note: NoteName.G, octave: 5, duration: 1, startTime: 1 },
                { note: NoteName.A, octave: 5, duration: 1, startTime: 2 }, { note: NoteName.Fs, octave: 5, duration: 1, startTime: 3 },
                { note: NoteName.G, octave: 5, duration: 1, startTime: 4 }, { note: NoteName.A, octave: 5, duration: 1, startTime: 5 },
            ], 32)
        ]
    },
    {
        id: 's4-turca', title: 'Rondo Alla Turca', artist: 'Mozart', difficulty: 'Advanced', bpm: 110, category: 'Song', stage: 4,
        notes: [
            ...shift([
                { note: NoteName.B, octave: 4, duration: 0.5, startTime: 0 }, { note: NoteName.A, octave: 4, duration: 0.5, startTime: 0.5 }, { note: NoteName.Gs, octave: 4, duration: 0.5, startTime: 1 }, { note: NoteName.A, octave: 4, duration: 0.5, startTime: 1.5 },
                { note: NoteName.C, octave: 5, duration: 1, startTime: 2 }, 
                { note: NoteName.D, octave: 5, duration: 0.5, startTime: 3 }, { note: NoteName.C, octave: 5, duration: 0.5, startTime: 3.5 }, { note: NoteName.B, octave: 4, duration: 0.5, startTime: 4 }, { note: NoteName.C, octave: 5, duration: 0.5, startTime: 4.5 },
                { note: NoteName.E, octave: 5, duration: 1, startTime: 5 }
            ], 0),
            ...shift([
                { note: NoteName.B, octave: 4, duration: 0.5, startTime: 0 }, { note: NoteName.A, octave: 4, duration: 0.5, startTime: 0.5 }, { note: NoteName.Gs, octave: 4, duration: 0.5, startTime: 1 }, { note: NoteName.A, octave: 4, duration: 0.5, startTime: 1.5 },
                { note: NoteName.C, octave: 5, duration: 1, startTime: 2 }
            ], 8),
            ...shift([
                { note: NoteName.B, octave: 4, duration: 0.5, startTime: 0 }, { note: NoteName.A, octave: 4, duration: 0.5, startTime: 0.5 }, { note: NoteName.Gs, octave: 4, duration: 0.5, startTime: 1 }, { note: NoteName.A, octave: 4, duration: 0.5, startTime: 1.5 },
                { note: NoteName.C, octave: 5, duration: 1, startTime: 2 }
            ], 16),
            ...shift([
                { note: NoteName.B, octave: 4, duration: 0.5, startTime: 0 }, { note: NoteName.A, octave: 4, duration: 0.5, startTime: 0.5 }, { note: NoteName.Gs, octave: 4, duration: 0.5, startTime: 1 }, { note: NoteName.A, octave: 4, duration: 0.5, startTime: 1.5 },
                { note: NoteName.C, octave: 5, duration: 1, startTime: 2 }
            ], 24)
        ]
    },
    {
        id: 's4-entertainer', title: 'The Entertainer', artist: 'Scott Joplin', difficulty: 'Advanced', bpm: 70, category: 'Song', stage: 4,
        notes: [
            { note: NoteName.D, octave: 5, duration: 0.5, startTime: 0 }, { note: NoteName.E, octave: 5, duration: 0.5, startTime: 0.5 }, { note: NoteName.C, octave: 5, duration: 0.5, startTime: 1 }, { note: NoteName.A, octave: 4, duration: 1, startTime: 1.5 },
            { note: NoteName.B, octave: 4, duration: 0.5, startTime: 2.5 }, { note: NoteName.G, octave: 4, duration: 0.5, startTime: 3 }, 
            { note: NoteName.D, octave: 4, duration: 0.5, startTime: 3.5 }, { note: NoteName.E, octave: 4, duration: 0.5, startTime: 4 }, { note: NoteName.C, octave: 4, duration: 0.5, startTime: 4.5 },
            { note: NoteName.A, octave: 3, duration: 1, startTime: 5 }, { note: NoteName.B, octave: 3, duration: 0.5, startTime: 6 }, { note: NoteName.G, octave: 3, duration: 0.5, startTime: 6.5 },
            ...shift([
                { note: NoteName.D, octave: 5, duration: 0.5, startTime: 0 }, { note: NoteName.E, octave: 5, duration: 0.5, startTime: 0.5 }, { note: NoteName.C, octave: 5, duration: 0.5, startTime: 1 }, { note: NoteName.A, octave: 4, duration: 1, startTime: 1.5 }
            ], 8),
            ...shift([
                { note: NoteName.D, octave: 5, duration: 0.5, startTime: 0 }, { note: NoteName.E, octave: 5, duration: 0.5, startTime: 0.5 }, { note: NoteName.C, octave: 5, duration: 0.5, startTime: 1 }, { note: NoteName.A, octave: 4, duration: 1, startTime: 1.5 }
            ], 16),
            ...shift([
                { note: NoteName.D, octave: 5, duration: 0.5, startTime: 0 }, { note: NoteName.E, octave: 5, duration: 0.5, startTime: 0.5 }, { note: NoteName.C, octave: 5, duration: 0.5, startTime: 1 }, { note: NoteName.A, octave: 4, duration: 1, startTime: 1.5 }
            ], 24)
        ]
    },
    {
        id: 's4-river', title: 'River Flows in You', artist: 'Yiruma', difficulty: 'Advanced', bpm: 65, category: 'Song', stage: 4,
        notes: [
            ...shift([
                { note: NoteName.A, octave: 4, duration: 0.5, startTime: 0 }, { note: NoteName.Cs, octave: 5, duration: 0.5, startTime: 0.5 }, { note: NoteName.E, octave: 5, duration: 0.5, startTime: 1 }, { note: NoteName.A, octave: 5, duration: 0.5, startTime: 1.5 },
                { note: NoteName.Gs, octave: 5, duration: 2, startTime: 2 },
                { note: NoteName.A, octave: 5, duration: 0.5, startTime: 4 }, { note: NoteName.Gs, octave: 5, duration: 0.5, startTime: 4.5 }, { note: NoteName.A, octave: 5, duration: 0.5, startTime: 5 }, { note: NoteName.E, octave: 5, duration: 0.5, startTime: 5.5 },
            ], 0),
            ...shift([
                { note: NoteName.A, octave: 4, duration: 0.5, startTime: 0 }, { note: NoteName.Cs, octave: 5, duration: 0.5, startTime: 0.5 }, { note: NoteName.E, octave: 5, duration: 0.5, startTime: 1 }, { note: NoteName.A, octave: 5, duration: 0.5, startTime: 1.5 }
            ], 8),
            ...shift([
                { note: NoteName.A, octave: 4, duration: 0.5, startTime: 0 }, { note: NoteName.Cs, octave: 5, duration: 0.5, startTime: 0.5 }, { note: NoteName.E, octave: 5, duration: 0.5, startTime: 1 }, { note: NoteName.A, octave: 5, duration: 0.5, startTime: 1.5 }
            ], 16),
            ...shift([
                { note: NoteName.A, octave: 4, duration: 0.5, startTime: 0 }, { note: NoteName.Cs, octave: 5, duration: 0.5, startTime: 0.5 }, { note: NoteName.E, octave: 5, duration: 0.5, startTime: 1 }, { note: NoteName.A, octave: 5, duration: 0.5, startTime: 1.5 }
            ], 24)
        ]
    },
    {
        id: 's4-maple', title: 'Maple Leaf Rag', artist: 'Scott Joplin', difficulty: 'Advanced', bpm: 90, category: 'Song', stage: 4,
        notes: [
            { note: NoteName.G, octave: 3, duration: 0.5, startTime: 0, hand: 'l' }, { note: NoteName.B, octave: 3, duration: 0.5, startTime: 0.5, hand: 'l' },
            { note: NoteName.G, octave: 3, duration: 0.5, startTime: 1, hand: 'l' }, { note: NoteName.E, octave: 4, duration: 0.5, startTime: 1.5, hand: 'l' },
            ...shift([
                { note: NoteName.G, octave: 3, duration: 0.5, startTime: 0, hand: 'l' }, { note: NoteName.B, octave: 3, duration: 0.5, startTime: 0.5, hand: 'l' }
            ], 4),
            ...shift([
                { note: NoteName.G, octave: 3, duration: 0.5, startTime: 0, hand: 'l' }, { note: NoteName.B, octave: 3, duration: 0.5, startTime: 0.5, hand: 'l' }
            ], 8),
            ...shift([
                { note: NoteName.G, octave: 3, duration: 0.5, startTime: 0, hand: 'l' }, { note: NoteName.B, octave: 3, duration: 0.5, startTime: 0.5, hand: 'l' }
            ], 12),
            ...shift([
                { note: NoteName.G, octave: 3, duration: 0.5, startTime: 0, hand: 'l' }, { note: NoteName.B, octave: 3, duration: 0.5, startTime: 0.5, hand: 'l' }
            ], 16)
        ]
    }
];

// ==========================================
// STAGE 5: ADVANCED
// ==========================================

const STAGE_5_SONGS: Song[] = [
    {
        id: 's5-moonlight', title: 'Moonlight Sonata (Mvt 1)', artist: 'Beethoven', difficulty: 'Expert', bpm: 54, category: 'Song', stage: 5,
        notes: [
            ...shift([
                { note: NoteName.Cs, octave: 3, duration: 4, startTime: 0, hand: 'l' },
                { note: NoteName.Gs, octave: 3, duration: 0.33, startTime: 0, hand: 'r' }, { note: NoteName.Cs, octave: 4, duration: 0.33, startTime: 0.33, hand: 'r' }, { note: NoteName.E, octave: 4, duration: 0.33, startTime: 0.66, hand: 'r' },
                { note: NoteName.Gs, octave: 3, duration: 0.33, startTime: 1, hand: 'r' }, { note: NoteName.Cs, octave: 4, duration: 0.33, startTime: 1.33, hand: 'r' }, { note: NoteName.E, octave: 4, duration: 0.33, startTime: 1.66, hand: 'r' },
                { note: NoteName.Gs, octave: 3, duration: 0.33, startTime: 2, hand: 'r' }, { note: NoteName.Cs, octave: 4, duration: 0.33, startTime: 2.33, hand: 'r' }, { note: NoteName.E, octave: 4, duration: 0.33, startTime: 2.66, hand: 'r' },
                { note: NoteName.Gs, octave: 3, duration: 0.33, startTime: 3, hand: 'r' }, { note: NoteName.Cs, octave: 4, duration: 0.33, startTime: 3.33, hand: 'r' }, { note: NoteName.E, octave: 4, duration: 0.33, startTime: 3.66, hand: 'r' }
            ], 0),
            ...shift([
                { note: NoteName.B, octave: 2, duration: 4, startTime: 0, hand: 'l' },
                { note: NoteName.Gs, octave: 3, duration: 0.33, startTime: 0, hand: 'r' }, { note: NoteName.D, octave: 4, duration: 0.33, startTime: 0.33, hand: 'r' }, { note: NoteName.E, octave: 4, duration: 0.33, startTime: 0.66, hand: 'r' },
                { note: NoteName.Gs, octave: 3, duration: 0.33, startTime: 1, hand: 'r' }, { note: NoteName.D, octave: 4, duration: 0.33, startTime: 1.33, hand: 'r' }, { note: NoteName.E, octave: 4, duration: 0.33, startTime: 1.66, hand: 'r' }
            ], 4),
            ...shift([
                { note: NoteName.A, octave: 2, duration: 4, startTime: 0, hand: 'l' },
                { note: NoteName.A, octave: 3, duration: 0.33, startTime: 0, hand: 'r' }, { note: NoteName.Cs, octave: 4, duration: 0.33, startTime: 0.33, hand: 'r' }, { note: NoteName.E, octave: 4, duration: 0.33, startTime: 0.66, hand: 'r' }
            ], 8),
            ...shift([
                { note: NoteName.Cs, octave: 3, duration: 4, startTime: 0, hand: 'l' },
                { note: NoteName.Gs, octave: 3, duration: 0.33, startTime: 0, hand: 'r' }, { note: NoteName.Cs, octave: 4, duration: 0.33, startTime: 0.33, hand: 'r' }, { note: NoteName.E, octave: 4, duration: 0.33, startTime: 0.66, hand: 'r' }
            ], 12),
            ...shift([
                { note: NoteName.Cs, octave: 3, duration: 4, startTime: 0, hand: 'l' },
                { note: NoteName.Gs, octave: 3, duration: 0.33, startTime: 0, hand: 'r' }, { note: NoteName.Cs, octave: 4, duration: 0.33, startTime: 0.33, hand: 'r' }, { note: NoteName.E, octave: 4, duration: 0.33, startTime: 0.66, hand: 'r' }
            ], 16)
        ]
    },
    {
        id: 's5-clair', title: 'Clair de Lune', artist: 'Debussy', difficulty: 'Expert', bpm: 60, category: 'Song', stage: 5,
        notes: [
            { note: NoteName.F, octave: 4, duration: 1, startTime: 0, hand: 'l' }, { note: NoteName.Gs, octave: 4, duration: 1, startTime: 0, hand: 'r' },
            { note: NoteName.F, octave: 4, duration: 1, startTime: 1, hand: 'l' }, { note: NoteName.Gs, octave: 4, duration: 1, startTime: 1, hand: 'r' },
            ...shift([
                { note: NoteName.F, octave: 3, duration: 2, startTime: 0, hand: 'l' }, { note: NoteName.C, octave: 4, duration: 2, startTime: 0, hand: 'r' }
            ], 4),
            ...shift([
                { note: NoteName.Cs, octave: 3, duration: 2, startTime: 0, hand: 'l' }, { note: NoteName.Gs, octave: 3, duration: 2, startTime: 0, hand: 'r' }
            ], 8),
            ...shift([
                { note: NoteName.F, octave: 3, duration: 2, startTime: 0, hand: 'l' }, { note: NoteName.C, octave: 4, duration: 2, startTime: 0, hand: 'r' }
            ], 12),
            ...shift([
                { note: NoteName.Cs, octave: 3, duration: 2, startTime: 0, hand: 'l' }, { note: NoteName.Gs, octave: 3, duration: 2, startTime: 0, hand: 'r' }
            ], 16)
        ]
    },
    {
        id: 's5-chopin', title: 'Nocturne Op.9 No.2', artist: 'Chopin', difficulty: 'Expert', bpm: 60, category: 'Song', stage: 5,
        notes: [
            { note: NoteName.As, octave: 4, duration: 1, startTime: 0 }, { note: NoteName.G, octave: 5, duration: 1, startTime: 1 }, 
            { note: NoteName.F, octave: 5, duration: 0.5, startTime: 2 }, { note: NoteName.G, octave: 5, duration: 0.5, startTime: 2.5 }, 
            { note: NoteName.Ds, octave: 5, duration: 1, startTime: 3 },
            { note: NoteName.Ds, octave: 3, duration: 3, startTime: 0, hand: 'l' },
            ...shift([
                { note: NoteName.As, octave: 4, duration: 1, startTime: 0 }, { note: NoteName.G, octave: 5, duration: 1, startTime: 1 },
                { note: NoteName.Ds, octave: 3, duration: 3, startTime: 0, hand: 'l' }
            ], 4),
            ...shift([
                { note: NoteName.As, octave: 4, duration: 1, startTime: 0 }, { note: NoteName.G, octave: 5, duration: 1, startTime: 1 },
                { note: NoteName.Ds, octave: 3, duration: 3, startTime: 0, hand: 'l' }
            ], 8),
            ...shift([
                { note: NoteName.As, octave: 4, duration: 1, startTime: 0 }, { note: NoteName.G, octave: 5, duration: 1, startTime: 1 },
                { note: NoteName.Ds, octave: 3, duration: 3, startTime: 0, hand: 'l' }
            ], 12)
        ]
    },
    {
        id: 's5-waltz', title: 'Waltz in C# Minor', artist: 'Chopin', difficulty: 'Expert', bpm: 120, category: 'Song', stage: 5,
        notes: [
            { note: NoteName.Cs, octave: 4, duration: 1, startTime: 0, hand: 'r' },
            { note: NoteName.Cs, octave: 4, duration: 1, startTime: 1, hand: 'r' },
            ...shift([
                { note: NoteName.Cs, octave: 3, duration: 1, startTime: 0, hand: 'l' },
                { note: NoteName.E, octave: 3, duration: 1, startTime: 1, hand: 'l' }, { note: NoteName.Gs, octave: 3, duration: 1, startTime: 1, hand: 'l' },
                { note: NoteName.E, octave: 3, duration: 1, startTime: 2, hand: 'l' }, { note: NoteName.Gs, octave: 3, duration: 1, startTime: 2, hand: 'l' }
            ], 0),
            ...shift([
                { note: NoteName.Cs, octave: 3, duration: 1, startTime: 0, hand: 'l' },
                { note: NoteName.E, octave: 3, duration: 1, startTime: 1, hand: 'l' }, { note: NoteName.Gs, octave: 3, duration: 1, startTime: 1, hand: 'l' },
                { note: NoteName.E, octave: 3, duration: 1, startTime: 2, hand: 'l' }, { note: NoteName.Gs, octave: 3, duration: 1, startTime: 2, hand: 'l' }
            ], 3),
            ...shift([
                { note: NoteName.Cs, octave: 3, duration: 1, startTime: 0, hand: 'l' },
                { note: NoteName.E, octave: 3, duration: 1, startTime: 1, hand: 'l' }, { note: NoteName.Gs, octave: 3, duration: 1, startTime: 1, hand: 'l' },
                { note: NoteName.E, octave: 3, duration: 1, startTime: 2, hand: 'l' }, { note: NoteName.Gs, octave: 3, duration: 1, startTime: 2, hand: 'l' }
            ], 6)
        ]
    },
    {
        id: 's5-liebestraum', title: 'Liebestraum No. 3', artist: 'Liszt', difficulty: 'Expert', bpm: 70, category: 'Song', stage: 5,
        notes: [
            { note: NoteName.C, octave: 5, duration: 2, startTime: 0 }, { note: NoteName.Ds, octave: 5, duration: 1, startTime: 2 },
            { note: NoteName.G, octave: 5, duration: 3, startTime: 3 },
            ...shift([
                { note: NoteName.Gs, octave: 3, duration: 0.5, startTime: 0, hand: 'l' }, { note: NoteName.C, octave: 4, duration: 0.5, startTime: 0.5, hand: 'l' }, { note: NoteName.Ds, octave: 4, duration: 0.5, startTime: 1, hand: 'l' },
                { note: NoteName.Gs, octave: 4, duration: 0.5, startTime: 1.5, hand: 'r' }, { note: NoteName.C, octave: 5, duration: 0.5, startTime: 2, hand: 'r' }, { note: NoteName.Ds, octave: 5, duration: 0.5, startTime: 2.5, hand: 'r' }
            ], 0),
            ...shift([
                { note: NoteName.Gs, octave: 3, duration: 0.5, startTime: 0, hand: 'l' }, { note: NoteName.C, octave: 4, duration: 0.5, startTime: 0.5, hand: 'l' }, { note: NoteName.Ds, octave: 4, duration: 0.5, startTime: 1, hand: 'l' },
                { note: NoteName.Gs, octave: 4, duration: 0.5, startTime: 1.5, hand: 'r' }, { note: NoteName.C, octave: 5, duration: 0.5, startTime: 2, hand: 'r' }, { note: NoteName.Ds, octave: 5, duration: 0.5, startTime: 2.5, hand: 'r' }
            ], 3),
            ...shift([
                { note: NoteName.Gs, octave: 3, duration: 0.5, startTime: 0, hand: 'l' }, { note: NoteName.C, octave: 4, duration: 0.5, startTime: 0.5, hand: 'l' }, { note: NoteName.Ds, octave: 4, duration: 0.5, startTime: 1, hand: 'l' },
                { note: NoteName.Gs, octave: 4, duration: 0.5, startTime: 1.5, hand: 'r' }, { note: NoteName.C, octave: 5, duration: 0.5, startTime: 2, hand: 'r' }, { note: NoteName.Ds, octave: 5, duration: 0.5, startTime: 2.5, hand: 'r' }
            ], 6)
        ]
    }
];

// ==========================================
// STAGE 6: MASTER (Virtuoso)
// ==========================================

const STAGE_6_SONGS: Song[] = [
    {
        id: 's6-bumblebee', title: 'Flight of the Bumblebee', artist: 'Rimsky-Korsakov', difficulty: 'Master', bpm: 140, category: 'Song', stage: 6,
        notes: [
            ...Array.from({ length: 30 }).flatMap((_, i) => {
                const start = i * 2;
                return [
                    { note: NoteName.G, octave: 4, duration: 0.25, startTime: start },
                    { note: NoteName.Fs, octave: 4, duration: 0.25, startTime: start + 0.25 },
                    { note: NoteName.F, octave: 4, duration: 0.25, startTime: start + 0.5 },
                    { note: NoteName.E, octave: 4, duration: 0.25, startTime: start + 0.75 },
                    { note: NoteName.Ds, octave: 4, duration: 0.25, startTime: start + 1 },
                    { note: NoteName.D, octave: 4, duration: 0.25, startTime: start + 1.25 },
                    { note: NoteName.Cs, octave: 4, duration: 0.25, startTime: start + 1.5 },
                    { note: NoteName.C, octave: 4, duration: 0.25, startTime: start + 1.75 }
                ];
            })
        ]
    },
    {
        id: 's6-fantasie', title: 'Fantaisie-Impromptu', artist: 'Chopin', difficulty: 'Master', bpm: 140, category: 'Song', stage: 6,
        notes: [
            ...Array.from({ length: 10 }).flatMap((_, i) => {
                const s = i * 4;
                return [
                    { note: NoteName.Cs, octave: 3, duration: 1.33, startTime: s, hand: 'l' },
                    { note: NoteName.Gs, octave: 3, duration: 1.33, startTime: s + 1.33, hand: 'l' },
                    { note: NoteName.Cs, octave: 4, duration: 1.33, startTime: s + 2.66, hand: 'l' },
                    { note: NoteName.Gs, octave: 4, duration: 1, startTime: s, hand: 'r' },
                    { note: NoteName.A, octave: 4, duration: 1, startTime: s + 1, hand: 'r' },
                    { note: NoteName.C, octave: 5, duration: 1, startTime: s + 2, hand: 'r' },
                    { note: NoteName.E, octave: 5, duration: 1, startTime: s + 3, hand: 'r' },
                ];
            })
        ]
    },
    {
        id: 's6-campanella', title: 'La Campanella', artist: 'Liszt', difficulty: 'Master', bpm: 100, category: 'Song', stage: 6,
        notes: [
            ...Array.from({ length: 20 }).flatMap((_, i) => {
                const s = i * 2;
                return [
                    { note: NoteName.Ds, octave: 6, duration: 0.5, startTime: s, hand: 'r' },
                    { note: NoteName.Ds, octave: 5, duration: 0.5, startTime: s + 0.5, hand: 'r' },
                    { note: NoteName.Ds, octave: 6, duration: 0.5, startTime: s + 1, hand: 'r' },
                    { note: NoteName.Ds, octave: 5, duration: 0.5, startTime: s + 1.5, hand: 'r' }
                ];
            })
        ]
    },
    {
        id: 's6-rachmaninoff', title: 'Piano Concerto No. 2', artist: 'Rachmaninoff', difficulty: 'Master', bpm: 60, category: 'Song', stage: 6,
        notes: [
            ...shift([
                { note: NoteName.F, octave: 1, duration: 4, startTime: 0, hand: 'l' }, { note: NoteName.F, octave: 2, duration: 4, startTime: 0, hand: 'l' }, { note: NoteName.F, octave: 3, duration: 4, startTime: 0, hand: 'r' }, { note: NoteName.As, octave: 3, duration: 4, startTime: 0, hand: 'r' }, { note: NoteName.Cs, octave: 4, duration: 4, startTime: 0, hand: 'r' },
                { note: NoteName.C, octave: 1, duration: 4, startTime: 4, hand: 'l' }, { note: NoteName.C, octave: 2, duration: 4, startTime: 4, hand: 'l' }, { note: NoteName.E, octave: 3, duration: 4, startTime: 4, hand: 'r' }, { note: NoteName.G, octave: 3, duration: 4, startTime: 4, hand: 'r' }, { note: NoteName.C, octave: 4, duration: 4, startTime: 4, hand: 'r' },
            ], 0),
            ...shift([
                { note: NoteName.F, octave: 1, duration: 4, startTime: 0, hand: 'l' }, { note: NoteName.F, octave: 2, duration: 4, startTime: 0, hand: 'l' }, { note: NoteName.F, octave: 3, duration: 4, startTime: 0, hand: 'r' }, { note: NoteName.As, octave: 3, duration: 4, startTime: 0, hand: 'r' }, { note: NoteName.Cs, octave: 4, duration: 4, startTime: 0, hand: 'r' },
            ], 8),
            ...shift([
                { note: NoteName.C, octave: 1, duration: 4, startTime: 0, hand: 'l' }, { note: NoteName.C, octave: 2, duration: 4, startTime: 0, hand: 'l' }, { note: NoteName.E, octave: 3, duration: 4, startTime: 0, hand: 'r' }, { note: NoteName.G, octave: 3, duration: 4, startTime: 0, hand: 'r' }, { note: NoteName.C, octave: 4, duration: 4, startTime: 0, hand: 'r' },
            ], 12)
        ]
    },
    {
        id: 's6-rhapsody', title: 'Hungarian Rhapsody No. 2', artist: 'Liszt', difficulty: 'Master', bpm: 90, category: 'Song', stage: 6,
        notes: [
            { note: NoteName.Cs, octave: 4, duration: 4, startTime: 0 }, { note: NoteName.Fs, octave: 4, duration: 4, startTime: 0 }, { note: NoteName.As, octave: 4, duration: 4, startTime: 0 },
            { note: NoteName.Cs, octave: 3, duration: 1, startTime: 4, hand: 'l' }, { note: NoteName.Fs, octave: 3, duration: 1, startTime: 5, hand: 'l' },
            { note: NoteName.As, octave: 3, duration: 1, startTime: 6, hand: 'l' }, { note: NoteName.Cs, octave: 4, duration: 1, startTime: 7, hand: 'l' },
            ...shift([
                { note: NoteName.Fs, octave: 4, duration: 0.5, startTime: 0 }, { note: NoteName.Gs, octave: 4, duration: 0.5, startTime: 0.5 }, { note: NoteName.A, octave: 4, duration: 0.5, startTime: 1 }, { note: NoteName.As, octave: 4, duration: 0.5, startTime: 1.5 }
            ], 8),
            ...shift([
                { note: NoteName.Fs, octave: 4, duration: 0.5, startTime: 0 }, { note: NoteName.Gs, octave: 4, duration: 0.5, startTime: 0.5 }, { note: NoteName.A, octave: 4, duration: 0.5, startTime: 1 }, { note: NoteName.As, octave: 4, duration: 0.5, startTime: 1.5 }
            ], 10),
            ...shift([
                { note: NoteName.Fs, octave: 4, duration: 0.5, startTime: 0 }, { note: NoteName.Gs, octave: 4, duration: 0.5, startTime: 0.5 }, { note: NoteName.A, octave: 4, duration: 0.5, startTime: 1 }, { note: NoteName.As, octave: 4, duration: 0.5, startTime: 1.5 }
            ], 12)
        ]
    }
];

export const COURSES: Song[] = [
    ...STAGE_1_SONGS,
    ...STAGE_2_SONGS,
    ...STAGE_3_SONGS,
    ...STAGE_4_SONGS,
    ...STAGE_5_SONGS,
    ...STAGE_6_SONGS
];

export const TRENDING_SONGS_METADATA = [
  { title: "Espresso", artist: "Sabrina Carpenter" },
  { title: "Birds of a Feather", artist: "Billie Eilish" },
  { title: "Good Luck, Babe!", artist: "Chappell Roan" },
  { title: "Please Please Please", artist: "Sabrina Carpenter" },
  { title: "Texas Hold 'Em", artist: "Beyoncé" },
  { title: "Beautiful Things", artist: "Benson Boone" },
  { title: "Too Sweet", artist: "Hozier" },
  { title: "Lunch", artist: "Billie Eilish" },
  { title: "Fortnight", artist: "Taylor Swift" },
  { title: "I Had Some Help", artist: "Post Malone ft. Morgan Wallen" },
  { title: "Not Like Us", artist: "Kendrick Lamar" },
  { title: "Million Dollar Baby", artist: "Tommy Richman" },
  { title: "A Bar Song (Tipsy)", artist: "Shaboozey" },
  { title: "Lose Control", artist: "Teddy Swims" },
  { title: "Greedy", artist: "Tate McRae" },
  { title: "Water", artist: "Tyla" },
  { title: "Paint The Town Red", artist: "Doja Cat" },
  { title: "Cruel Summer", artist: "Taylor Swift" },
  { title: "Vampire", artist: "Olivia Rodrigo" },
  { title: "Flowers", artist: "Miley Cyrus" },
  { title: "Anti-Hero", artist: "Taylor Swift" },
  { title: "As It Was", artist: "Harry Styles" },
  { title: "Stick Season", artist: "Noah Kahan" },
  { title: "Lovin On Me", artist: "Jack Harlow" },
  { title: "Agora Hills", artist: "Doja Cat" },
  { title: "Snooze", artist: "SZA" },
  { title: "Kill Bill", artist: "SZA" },
  { title: "Daylight", artist: "David Kushner" },
  { title: "Strangers", artist: "Kenya Grace" },
  { title: "Yes, And?", artist: "Ariana Grande" },
  { title: "Houdini", artist: "Dua Lipa" }
];
