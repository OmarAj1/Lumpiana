

import { NoteName, Song, NoteEvent, SchaumBook } from './types';

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

// --- SCHAUM BOOK DATA ---
export interface SchaumBookData {
    id: SchaumBook;
    title: string;
    subtitle: string;
    accentColor: string;
    darkColor: string;
    gradient: string;
    shadow: string;
    desc: string;
    difficultyLabel: string;
    icon: string;
    particles: string[];
}

export const SCHAUM_BOOKS: SchaumBookData[] = [
    { 
      id: 'Pre-A', 
      title: "Pre-A", 
      subtitle: "The Green Book", 
      accentColor: "#4ade80", 
      darkColor: "#14532d", 
      gradient: "linear-gradient(135deg, #4ade80 0%, #16a34a 100%)", 
      shadow: "rgba(74, 222, 128, 0.4)", 
      desc: "For the Earliest Beginner",
      difficultyLabel: "Entry Level",
      icon: "🌱",
      particles: ["🍃", "🌿", "✨"]
    },
    { 
      id: 'A', 
      title: "Grade 1", 
      subtitle: "The Red Book", 
      accentColor: "#f87171", 
      darkColor: "#7f1d1d",
      gradient: "linear-gradient(135deg, #f87171 0%, #dc2626 100%)", 
      shadow: "rgba(248, 113, 113, 0.4)", 
      desc: "Foundations of Rhythm",
      difficultyLabel: "Beginner",
      icon: "🔥",
      particles: ["⚡", "💥", "✨"]
    },
    { 
      id: 'B', 
      title: "Grade 1.5", 
      subtitle: "The Blue Book", 
      accentColor: "#60a5fa", 
      darkColor: "#1e3a8a",
      gradient: "linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)", 
      shadow: "rgba(96, 165, 250, 0.4)", 
      desc: "The Scales & Chords",
      difficultyLabel: "Lower Int.",
      icon: "🌊",
      particles: ["💧", "❄️", "✨"]
    },
    { 
      id: 'C', 
      title: "Grade 2", 
      subtitle: "The Purple Book", 
      accentColor: "#a78bfa", 
      darkColor: "#4c1d95",
      gradient: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)", 
      shadow: "rgba(167, 139, 250, 0.4)", 
      desc: "Advanced Phrasing",
      difficultyLabel: "Intermediate",
      icon: "🔮",
      particles: ["✨", "🟣", "🌙"]
    },
    { 
      id: 'D', 
      title: "Grade 2.5", 
      subtitle: "The Orange Book", 
      accentColor: "#fb923c", 
      darkColor: "#7c2d12",
      gradient: "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)", 
      shadow: "rgba(251, 146, 60, 0.4)", 
      desc: "Concert Preparation",
      difficultyLabel: "Advanced",
      icon: "⚡",
      particles: ["⭐", "☀️", "✨"]
    },
    { 
      id: 'Virtuoso', 
      title: "Virtuoso", 
      subtitle: "The Grey Book", 
      accentColor: "#9ca3af", 
      darkColor: "#1f2937",
      gradient: "linear-gradient(135deg, #9ca3af 0%, #4b5563 100%)", 
      shadow: "rgba(156, 163, 175, 0.4)", 
      desc: "Mastery Technicality",
      difficultyLabel: "Master",
      icon: "👑",
      particles: ["💎", "🏆", "✨"]
    },
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

// ==========================================
// BOOK Pre-A (Green) - Fundamentals
// ==========================================

const STAGE_1_SONGS: Song[] = [
    {
        id: 'pre-a-woodchuck', title: 'The Wood-Chuck', artist: 'Schaum Pre-A', difficulty: 'Beginner', bpm: 60, category: 'Song', stage: 1, book: 'Pre-A',
        notes: [
            // Based on C Major Position Chart (Green Book)
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
            { note: NoteName.D, octave: 4, duration: 1, startTime: 11, finger: 2, lyrics: "??" },
            { note: NoteName.C, octave: 4, duration: 2, startTime: 12, finger: 1, lyrics: "chuck?" },
        ]
    },
    {
        id: 'pre-a-speedboat', title: 'The Speed Boat', artist: 'Schaum Pre-A', difficulty: 'Beginner', bpm: 70, category: 'Song', stage: 1, book: 'Pre-A',
        notes: [
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
        id: 'pre-a-escalator', title: 'The Escalator', artist: 'Schaum Pre-A', difficulty: 'Beginner', bpm: 80, category: 'Song', stage: 1, book: 'Pre-A',
        notes: [
            // Ascending C Major Scale (divided between hands)
            { note: NoteName.C, octave: 4, duration: 1, startTime: 0, hand: 'l', finger: 4 },
            { note: NoteName.D, octave: 4, duration: 1, startTime: 1, hand: 'l', finger: 3 },
            { note: NoteName.E, octave: 4, duration: 1, startTime: 2, hand: 'l', finger: 2 },
            { note: NoteName.F, octave: 4, duration: 1, startTime: 3, hand: 'l', finger: 1 },
            { note: NoteName.G, octave: 4, duration: 1, startTime: 4, hand: 'r', finger: 1 },
            { note: NoteName.A, octave: 4, duration: 1, startTime: 5, hand: 'r', finger: 2 },
            { note: NoteName.B, octave: 4, duration: 1, startTime: 6, hand: 'r', finger: 3 },
            { note: NoteName.C, octave: 5, duration: 1, startTime: 7, hand: 'r', finger: 4 }
        ]
    }
];

// ==========================================
// BOOK A (Red) - Grade 1
// ==========================================

const STAGE_2_SONGS: Song[] = [
    {
        id: 'a-swinging', title: 'Swinging Along', artist: 'Schaum Book A', difficulty: 'Beginner', bpm: 90, category: 'Song', stage: 2, book: 'A',
        notes: [
            // 6/8 Time feeling
            { note: NoteName.G, octave: 4, duration: 1, startTime: 0, finger: 5 }, 
            { note: NoteName.E, octave: 4, duration: 1, startTime: 1, finger: 3 }, 
            { note: NoteName.G, octave: 4, duration: 1, startTime: 2, finger: 5 },
            { note: NoteName.C, octave: 5, duration: 1.5, startTime: 3, finger: 1, hand: 'l' }, // Cross over simulation for "Singing a song"
            { note: NoteName.G, octave: 4, duration: 1.5, startTime: 4.5, finger: 5 },
            
            { note: NoteName.G, octave: 4, duration: 1, startTime: 6, finger: 5 },
            { note: NoteName.E, octave: 4, duration: 1, startTime: 7, finger: 3 },
            { note: NoteName.C, octave: 4, duration: 1, startTime: 8, finger: 1 },
            { note: NoteName.G, octave: 3, duration: 3, startTime: 9, hand: 'l', finger: 5 }
        ]
    },
    {
        id: 'a-wishes', title: 'The Wishing Well', artist: 'Schaum Book A', difficulty: 'Beginner', bpm: 85, category: 'Song', stage: 2, book: 'A',
        notes: [
            { note: NoteName.E, octave: 4, duration: 1, startTime: 0 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 1 },
            { note: NoteName.C, octave: 4, duration: 1, startTime: 2 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 3 },
            { note: NoteName.E, octave: 4, duration: 2, startTime: 4 }, { note: NoteName.C, octave: 4, duration: 2, startTime: 6 }
        ]
    }
];

// ==========================================
// BOOK B (Blue) - Grade 1 1/2
// ==========================================

const STAGE_3_SONGS: Song[] = [
    {
        id: 'b-elevator', title: 'The Elevator', artist: 'Schaum Book B', difficulty: 'Intermediate', bpm: 70, category: 'Song', stage: 3, book: 'B',
        notes: [
            // Arpeggios C Major
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
        id: 'b-strangelands', title: 'Strange Lands', artist: 'Schumann (Schaum B)', difficulty: 'Intermediate', bpm: 60, category: 'Song', stage: 3, book: 'B',
        notes: [
            // Introduction to Pedal (simplified)
            { note: NoteName.E, octave: 4, duration: 2, startTime: 0 }, { note: NoteName.G, octave: 4, duration: 1, startTime: 2 },
            { note: NoteName.G, octave: 4, duration: 2, startTime: 3 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 5 },
            { note: NoteName.D, octave: 4, duration: 2, startTime: 6 }, { note: NoteName.C, octave: 4, duration: 1, startTime: 8 }
        ]
    }
];

// ==========================================
// BOOK C (Purple) - Grade 2
// ==========================================

const STAGE_4_SONGS: Song[] = [
    {
        id: 'c-camptown', title: 'Camptown Races', artist: 'Foster (Schaum C)', difficulty: 'Intermediate', bpm: 100, category: 'Song', stage: 4, book: 'C',
        notes: [
            { note: NoteName.G, octave: 4, duration: 1, startTime: 0, finger: 5 }, { note: NoteName.G, octave: 4, duration: 1, startTime: 1, finger: 5 },
            { note: NoteName.E, octave: 4, duration: 1, startTime: 2, finger: 3 }, { note: NoteName.G, octave: 4, duration: 1, startTime: 3, finger: 5 },
            { note: NoteName.A, octave: 4, duration: 1, startTime: 4, finger: 1 }, { note: NoteName.G, octave: 4, duration: 1, startTime: 5, finger: 5 },
            { note: NoteName.E, octave: 4, duration: 2, startTime: 6, finger: 3 }
        ]
    },
    {
        id: 'c-thunderer', title: 'The Thunderer', artist: 'Sousa (Schaum C)', difficulty: 'Intermediate', bpm: 110, category: 'Song', stage: 4, book: 'C',
        notes: [
            // March style
            { note: NoteName.C, octave: 4, duration: 1, startTime: 0 }, { note: NoteName.G, octave: 3, duration: 0.5, startTime: 1 }, { note: NoteName.G, octave: 3, duration: 0.5, startTime: 1.5 },
            { note: NoteName.C, octave: 4, duration: 1, startTime: 2 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 3 },
            { note: NoteName.G, octave: 4, duration: 2, startTime: 4 }, { note: NoteName.E, octave: 4, duration: 2, startTime: 6 }
        ]
    }
];

// ==========================================
// BOOK D (Orange) - Grade 2 1/2
// ==========================================

const STAGE_5_SONGS: Song[] = [
    {
        id: 'd-harvest', title: 'A Harvest Melody', artist: 'Beethoven (Schaum D)', difficulty: 'Advanced', bpm: 70, category: 'Song', stage: 5, book: 'D',
        notes: [
            // 6/8 Time
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
        id: 'd-star', title: 'Star of Midnight', artist: 'Dvorak (Schaum D)', difficulty: 'Advanced', bpm: 60, category: 'Song', stage: 5, book: 'D',
        notes: [
            // Largo
            { note: NoteName.E, octave: 4, duration: 2, startTime: 0 }, { note: NoteName.G, octave: 4, duration: 1, startTime: 2 }, { note: NoteName.G, octave: 4, duration: 1, startTime: 3 },
            { note: NoteName.E, octave: 4, duration: 2, startTime: 4 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 6 }, { note: NoteName.C, octave: 4, duration: 1, startTime: 7 }
        ]
    }
];

// ==========================================
// VIRTUOSO (Master) - Advanced Pieces
// ==========================================

const STAGE_6_SONGS: Song[] = [
    {
        id: 's6-bumblebee', title: 'Flight of the Bumblebee', artist: 'Rimsky-Korsakov', difficulty: 'Master', bpm: 140, category: 'Song', stage: 6, book: 'Virtuoso',
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
        id: 's6-fantasie', title: 'Fantaisie-Impromptu', artist: 'Chopin', difficulty: 'Master', bpm: 140, category: 'Song', stage: 6, book: 'Virtuoso',
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