
import { Song, NoteName, NoteEvent } from '../types';

// --- HELPER TO GENERATE LONG SONGS ---
const shift = (notes: NoteEvent[], beats: number): NoteEvent[] => {
    return notes.map(n => ({ ...n, startTime: n.startTime + beats }));
};

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

// Archived Songs
export const PAST_COURSES: Song[] = [
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
        ]
    },
    {
        id: 's1-mary', title: 'Mary Had a Little Lamb', artist: 'Nursery', difficulty: 'Beginner', bpm: 70, category: 'Song', stage: 1,
        notes: [
            { note: NoteName.E, octave: 4, duration: 1, startTime: 0 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 1 },
            { note: NoteName.C, octave: 4, duration: 1, startTime: 2 }, { note: NoteName.D, octave: 4, duration: 1, startTime: 3 },
            { note: NoteName.E, octave: 4, duration: 1, startTime: 4 }, { note: NoteName.E, octave: 4, duration: 1, startTime: 5 }, { note: NoteName.E, octave: 4, duration: 2, startTime: 6 },
        ]
    },
    {
        id: 's2-minuet', title: 'Minuet in G', artist: 'J.S. Bach', difficulty: 'Intermediate', bpm: 90, category: 'Song', stage: 2,
        notes: s2_minuet_theme
    },
    {
        id: 's4-canon', title: 'Canon in D (Full)', artist: 'Pachelbel', difficulty: 'Advanced', bpm: 70, category: 'Song', stage: 4,
        notes: s4_canon_bass
    }
];
