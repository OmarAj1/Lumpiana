

import { NoteName, Song, NoteEvent } from './types';

export const STAR_THRESHOLDS = {
    GOLD: 0.9,   // 3 Stars
    SILVER: 0.75, // 2 Stars
    BRONZE: 0.5  // 1 Star
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
  book: 'Pre-A',
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

// --- HELPER FOR TRENDING SONGS GENERATION ---
// Generates a simple playable placeholder for trending songs since we only have metadata
const createTrendingSong = (id: string, title: string, artist: string, book: any, baseOctave: number = 4): Song => {
    // Create a simple generic melody pattern so it is playable
    const melodyPattern = [
        { note: NoteName.E, duration: 1 }, { note: NoteName.G, duration: 1 }, { note: NoteName.A, duration: 1 },
        { note: NoteName.G, duration: 2 }, { note: NoteName.E, duration: 1 }, { note: NoteName.C, duration: 2 }
    ];
    
    const notes: NoteEvent[] = melodyPattern.map((n, i) => ({
        note: n.note,
        octave: baseOctave,
        duration: n.duration,
        startTime: i * 1.0, // simplified timing
        finger: (i % 5) + 1
    }));

    return {
        id: `trending-${id}`,
        title,
        artist,
        difficulty: 'Intermediate',
        bpm: 100,
        category: 'Course', // CHANGED to 'Course' so it appears in the Curriculum/Main tab
        stage: 1, 
        book: book,
        notes: notes
    };
};

const TRENDING_RAW_DATA = [
  { title: "Espresso", artist: "Sabrina Carpenter" },
  { title: "Birds of a Feather", artist: "Billie Eilish" },
  { title: "Good Luck, Babe!", artist: "Chappell Roan" },
  { title: "Please Please Please", artist: "Sabrina Carpenter" },
  { title: "Texas Hold 'Em", artist: "Beyoncé" },
  { title: "Beautiful Things", artist: "Benson Boone" },
  { title: "Too Sweet", artist: "Hozier" },
  { title: "Lunch", artist: "Billie Eilish" },
  { title: "Fortnight", artist: "Taylor Swift" },
  { title: "I Had Some Help", artist: "Post Malone" },
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
  { title: "Agora Hills", artist: "Doja Cat" }
];

// Distribute trending songs
const PRE_A_BONUS = TRENDING_RAW_DATA.slice(0, 5).map((s, i) => createTrendingSong(`pre-a-${i}`, s.title, s.artist, 'Pre-A', 4));
const A_BONUS = TRENDING_RAW_DATA.slice(5, 10).map((s, i) => createTrendingSong(`a-${i}`, s.title, s.artist, 'A', 4));
const B_BONUS = TRENDING_RAW_DATA.slice(10, 15).map((s, i) => createTrendingSong(`b-${i}`, s.title, s.artist, 'B', 4));
const C_BONUS = TRENDING_RAW_DATA.slice(15, 20).map((s, i) => createTrendingSong(`c-${i}`, s.title, s.artist, 'C', 4));
const D_BONUS = TRENDING_RAW_DATA.slice(20, 25).map((s, i) => createTrendingSong(`d-${i}`, s.title, s.artist, 'D', 4));


// ==========================================
// SCHAUM CURRICULUM DATA
// ==========================================

// ----------------------------------
// BOOK PRE-A: THE GREEN BOOK
// "For the Earliest Beginner"
// ----------------------------------

const PRE_A_SONGS: Song[] = [
    {
        id: 'pre-a-intro',
        title: 'Finger Number Melodies',
        artist: 'John W. Schaum',
        difficulty: 'Beginner',
        bpm: 60,
        category: 'Course', // CHANGED TO COURSE
        stage: 1,
        book: 'Pre-A',
        description: 'Right Hand Alone. C-D-E.',
        notes: [
            // Page 5: "This is up"
            // NOTE: Lyrics are paired with Note Hints as requested
            { note: NoteName.C, octave: 4, duration: 1, startTime: 0, finger: 1, lyrics: "This" },
            { note: NoteName.D, octave: 4, duration: 1, startTime: 1, finger: 2, lyrics: "is" },
            { note: NoteName.E, octave: 4, duration: 2, startTime: 2, finger: 3, lyrics: "up." },
            // "This is down"
            { note: NoteName.E, octave: 4, duration: 1, startTime: 4, finger: 3, lyrics: "This" },
            { note: NoteName.D, octave: 4, duration: 1, startTime: 5, finger: 2, lyrics: "is" },
            { note: NoteName.C, octave: 4, duration: 2, startTime: 6, finger: 1, lyrics: "down." }
        ]
    },
    {
        id: 'pre-a-woodchuck', 
        title: 'The Wood-Chuck', 
        artist: 'Schaum Pre-A', 
        difficulty: 'Beginner', 
        bpm: 60, 
        category: 'Course', // CHANGED TO COURSE
        stage: 1, 
        book: 'Pre-A',
        description: 'Unit 1: Right Hand C Position.',
        notes: [
            // p.6 Green Book
            { note: NoteName.C, octave: 4, duration: 1, startTime: 0, finger: 1, lyrics: "If" },
            { note: NoteName.D, octave: 4, duration: 1, startTime: 1, finger: 2, lyrics: "a" },
            { note: NoteName.E, octave: 4, duration: 1, startTime: 2, finger: 3, lyrics: "wood" },
            { note: NoteName.F, octave: 4, duration: 1, startTime: 3, finger: 4, lyrics: "chuck" },
            { note: NoteName.G, octave: 4, duration: 1, startTime: 4, finger: 5, lyrics: "could" },
            { note: NoteName.G, octave: 4, duration: 1, startTime: 5, finger: 5, lyrics: "chuck" },
            { note: NoteName.G, octave: 4, duration: 2, startTime: 6, finger: 5, lyrics: "wood" },
            
            { note: NoteName.G, octave: 4, duration: 1, startTime: 8, finger: 5, lyrics: "How" },
            { note: NoteName.F, octave: 4, duration: 1, startTime: 9, finger: 4, lyrics: "much" },
            { note: NoteName.E, octave: 4, duration: 1, startTime: 10, finger: 3, lyrics: "wood" },
            { note: NoteName.D, octave: 4, duration: 1, startTime: 11, finger: 2, lyrics: "would" },
            { note: NoteName.C, octave: 4, duration: 2, startTime: 12, finger: 1, lyrics: "he" },
            { note: NoteName.C, octave: 4, duration: 2, startTime: 14, finger: 1, lyrics: "chuck?" },
        ]
    },
    {
        id: 'pre-a-speedboat', 
        title: 'The Speed Boat', 
        artist: 'Schaum Pre-A', 
        difficulty: 'Beginner', 
        bpm: 70, 
        category: 'Course', // CHANGED TO COURSE
        stage: 1, 
        book: 'Pre-A',
        description: 'Unit 2: Right Hand C-D-E-F-G.',
        notes: [
            // p.12 Green Book
            { note: NoteName.C, octave: 4, duration: 1, startTime: 0, finger: 1, lyrics: "Put," },
            { note: NoteName.D, octave: 4, duration: 1, startTime: 1, finger: 2, lyrics: "put," },
            { note: NoteName.E, octave: 4, duration: 1, startTime: 2, finger: 3, lyrics: "put," },
            { note: NoteName.F, octave: 4, duration: 1, startTime: 3, finger: 4, lyrics: "put!" },
            { note: NoteName.G, octave: 4, duration: 4, startTime: 4, finger: 5, lyrics: "Goes..." },
            
            { note: NoteName.G, octave: 4, duration: 1, startTime: 8, finger: 5, lyrics: "flash" },
            { note: NoteName.F, octave: 4, duration: 1, startTime: 9, finger: 4, lyrics: "y" },
            { note: NoteName.E, octave: 4, duration: 1, startTime: 10, finger: 3, lyrics: "speed" },
            { note: NoteName.D, octave: 4, duration: 1, startTime: 11, finger: 2, lyrics: "boat." },
            { note: NoteName.C, octave: 4, duration: 4, startTime: 12, finger: 1, lyrics: "." },
        ]
    },
    {
        id: 'pre-a-computer', 
        title: 'The Computer', 
        artist: 'Schaum Pre-A', 
        difficulty: 'Beginner', 
        bpm: 75, 
        category: 'Course', // CHANGED TO COURSE
        stage: 1, 
        book: 'Pre-A',
        description: 'Unit 3: Left Hand A-B-C.',
        notes: [
            // p.13 Green Book
            { note: NoteName.A, octave: 3, duration: 1, startTime: 0, hand: 'l', finger: 3, lyrics: "I" },
            { note: NoteName.B, octave: 3, duration: 1, startTime: 1, hand: 'l', finger: 2, lyrics: "just" },
            { note: NoteName.C, octave: 4, duration: 1, startTime: 2, hand: 'l', finger: 1, lyrics: "love" },
            { note: NoteName.B, octave: 3, duration: 1, startTime: 3, hand: 'l', finger: 2, lyrics: "to" },
            { note: NoteName.A, octave: 3, duration: 2, startTime: 4, hand: 'l', finger: 3, lyrics: "touch" },
            { note: NoteName.B, octave: 3, duration: 2, startTime: 6, hand: 'l', finger: 2, lyrics: "the" },
            { note: NoteName.C, octave: 4, duration: 4, startTime: 8, hand: 'l', finger: 1, lyrics: "keys," }
        ]
    }
];

// ----------------------------------
// BOOK A (Red) - Grade 1
// ----------------------------------

const A_SONGS: Song[] = [
    {
        id: 'a-swinging', title: 'Swinging Along', artist: 'Schaum Book A', difficulty: 'Beginner', bpm: 90, category: 'Course', stage: 2, book: 'A',
        description: 'Musical Terms: "Swinging Along"',
        notes: [
            { note: NoteName.G, octave: 4, duration: 1, startTime: 0, finger: 5, lyrics: "Wear" }, 
            { note: NoteName.E, octave: 4, duration: 1, startTime: 1, finger: 3, lyrics: "ing" }, 
            { note: NoteName.G, octave: 4, duration: 1, startTime: 2, finger: 5, lyrics: "a" },
            { note: NoteName.C, octave: 5, duration: 1.5, startTime: 3, finger: 1, hand: 'l', lyrics: "smile" }, 
            { note: NoteName.G, octave: 4, duration: 1.5, startTime: 4.5, finger: 5, lyrics: "as" },
            { note: NoteName.G, octave: 4, duration: 1, startTime: 6, finger: 5, lyrics: "long" },
            { note: NoteName.E, octave: 4, duration: 1, startTime: 7, finger: 3, lyrics: "as" },
            { note: NoteName.C, octave: 4, duration: 1, startTime: 8, finger: 1, lyrics: "a" },
            { note: NoteName.G, octave: 3, duration: 3, startTime: 9, hand: 'l', finger: 5, lyrics: "mile." }
        ]
    },
    {
        id: 'a-wishes', title: 'The Wishing Well', artist: 'Schaum Book A', difficulty: 'Beginner', bpm: 85, category: 'Course', stage: 2, book: 'A',
        description: 'Excerpt from a Mozart Sonata',
        notes: [
            { note: NoteName.E, octave: 4, duration: 1, startTime: 0 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 1 },
            { note: NoteName.C, octave: 4, duration: 1, startTime: 2 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 3 },
            { note: NoteName.E, octave: 4, duration: 2, startTime: 4 }, { note: NoteName.C, octave: 4, duration: 2, startTime: 6 }
        ]
    }
];

// ----------------------------------
// BOOK B (Blue) - Grade 1 1/2
// ----------------------------------

const B_SONGS: Song[] = [
    {
        id: 'b-elevator', title: 'The Elevator', artist: 'Schaum Book B', difficulty: 'Intermediate', bpm: 70, category: 'Course', stage: 3, book: 'B',
        description: 'Arpeggio Recital Piece',
        notes: [
            { note: NoteName.C, octave: 4, duration: 1, startTime: 0, hand: 'r', finger: 1, lyrics: "Go" },
            { note: NoteName.E, octave: 4, duration: 1, startTime: 1, hand: 'r', finger: 3, lyrics: "ing" },
            { note: NoteName.G, octave: 4, duration: 1, startTime: 2, hand: 'r', finger: 5, lyrics: "Up!" },
            { note: NoteName.C, octave: 5, duration: 3, startTime: 3, hand: 'l', finger: 2, lyrics: "Floor!" },
            { note: NoteName.C, octave: 5, duration: 1, startTime: 6, hand: 'l', finger: 1, lyrics: "Go" },
            { note: NoteName.G, octave: 4, duration: 1, startTime: 7, hand: 'r', finger: 5, lyrics: "ing" },
            { note: NoteName.E, octave: 4, duration: 1, startTime: 8, hand: 'r', finger: 3, lyrics: "Down" },
            { note: NoteName.C, octave: 4, duration: 3, startTime: 9, hand: 'r', finger: 1, lyrics: "!" }
        ]
    },
    {
        id: 'b-strangelands', title: 'Strange Lands', artist: 'Schumann (Schaum B)', difficulty: 'Intermediate', bpm: 60, category: 'Course', stage: 3, book: 'B',
        notes: [
            // Introduction to Pedal (simplified)
            { note: NoteName.E, octave: 4, duration: 2, startTime: 0 }, { note: NoteName.G, octave: 4, duration: 1, startTime: 2 },
            { note: NoteName.G, octave: 4, duration: 2, startTime: 3 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 5 },
            { note: NoteName.D, octave: 4, duration: 2, startTime: 6 }, { note: NoteName.C, octave: 4, duration: 1, startTime: 8 }
        ]
    }
];

// ----------------------------------
// BOOK C (Purple) - Grade 2
// ----------------------------------

const C_SONGS: Song[] = [
    {
        id: 'c-camptown', title: 'Camptown Races', artist: 'Foster (Schaum C)', difficulty: 'Intermediate', bpm: 100, category: 'Course', stage: 4, book: 'C',
        description: 'The American Folk Song',
        notes: [
            { note: NoteName.G, octave: 4, duration: 1, startTime: 0, finger: 5, lyrics: "The" }, 
            { note: NoteName.G, octave: 4, duration: 1, startTime: 1, finger: 5, lyrics: "Camp-" },
            { note: NoteName.E, octave: 4, duration: 1, startTime: 2, finger: 3, lyrics: "town" }, 
            { note: NoteName.G, octave: 4, duration: 1, startTime: 3, finger: 5, lyrics: "la-" },
            { note: NoteName.A, octave: 4, duration: 1, startTime: 4, finger: 1, hand: 'l', lyrics: "dies" },
            { note: NoteName.G, octave: 4, duration: 1, startTime: 5, finger: 5, lyrics: "sing" },
            { note: NoteName.E, octave: 4, duration: 2, startTime: 6, finger: 3, lyrics: "song" }
        ]
    },
    {
        id: 'c-thunderer', title: 'The Thunderer', artist: 'Sousa (Schaum C)', difficulty: 'Intermediate', bpm: 110, category: 'Course', stage: 4, book: 'C',
        notes: [
            // March style
            { note: NoteName.C, octave: 4, duration: 1, startTime: 0 }, { note: NoteName.G, octave: 3, duration: 0.5, startTime: 1 }, { note: NoteName.G, octave: 3, duration: 0.5, startTime: 1.5 },
            { note: NoteName.C, octave: 4, duration: 1, startTime: 2 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 3 },
            { note: NoteName.G, octave: 4, duration: 2, startTime: 4 }, { note: NoteName.E, octave: 4, duration: 2, startTime: 6 }
        ]
    }
];

// ----------------------------------
// BOOK D (Orange) - Grade 2 1/2
// ----------------------------------

const D_SONGS: Song[] = [
    {
        id: 'd-harvest', title: 'A Harvest Melody', artist: 'Beethoven (Schaum D)', difficulty: 'Advanced', bpm: 70, category: 'Course', stage: 5, book: 'D',
        description: 'Natural Accents in 6/8 Time',
        notes: [
            { note: NoteName.G, octave: 4, duration: 1.5, startTime: 0, finger: 5 }, 
            { note: NoteName.E, octave: 4, duration: 0.5, startTime: 1.5, finger: 3 }, 
            { note: NoteName.C, octave: 4, duration: 1, startTime: 2, finger: 1 },
            { note: NoteName.D, octave: 4, duration: 1, startTime: 3, finger: 2 },
            { note: NoteName.E, octave: 4, duration: 1, startTime: 4, finger: 3 },
            { note: NoteName.F, octave: 4, duration: 1, startTime: 5, finger: 4 },
            { note: NoteName.E, octave: 4, duration: 2, startTime: 6, finger: 3 },
            { note: NoteName.D, octave: 4, duration: 1, startTime: 8, finger: 2 }
        ]
    },
    {
        id: 'd-star', title: 'Star of Midnight', artist: 'Dvorak (Schaum D)', difficulty: 'Advanced', bpm: 60, category: 'Course', stage: 5, book: 'D',
        notes: [
            // Largo
            { note: NoteName.E, octave: 4, duration: 2, startTime: 0 }, { note: NoteName.G, octave: 4, duration: 1, startTime: 2 }, { note: NoteName.G, octave: 4, duration: 1, startTime: 3 },
            { note: NoteName.E, octave: 4, duration: 2, startTime: 4 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 6 }, { note: NoteName.C, octave: 4, duration: 1, startTime: 7 }
        ]
    }
];

export const COURSES: Song[] = [
    ...PRE_A_SONGS, ...PRE_A_BONUS,
    ...A_SONGS, ...A_BONUS,
    ...B_SONGS, ...B_BONUS,
    ...C_SONGS, ...C_BONUS,
    ...D_SONGS, ...D_BONUS
];

export const TRENDING_SONGS_METADATA = TRENDING_RAW_DATA;
