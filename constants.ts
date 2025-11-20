
import { NoteName, Song } from './types';

export const STAR_THRESHOLDS = {
    GOLD: 0.9,   // 3 Stars
    SILVER: 0.75, // 2 Stars
    BRONZE: 0.5  // 1 Star
};

export const NOTE_FREQUENCIES: Record<string, number> = {
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77
};

export const NOTES_ORDER = [
  NoteName.C, NoteName.Cs, NoteName.D, NoteName.Ds, NoteName.E, NoteName.F,
  NoteName.Fs, NoteName.G, NoteName.Gs, NoteName.A, NoteName.As, NoteName.B
];

export const DEMO_SONG: Song = {
  id: 'ode-to-joy',
  title: 'Ode to Joy',
  artist: 'Ludwig van Beethoven',
  difficulty: 'Beginner',
  bpm: 50,
  notes: [
    { note: NoteName.E, octave: 4, duration: 1, startTime: 0 },
    { note: NoteName.E, octave: 4, duration: 1, startTime: 1 },
    { note: NoteName.F, octave: 4, duration: 1, startTime: 2 },
    { note: NoteName.G, octave: 4, duration: 1, startTime: 3 },
    { note: NoteName.G, octave: 4, duration: 1, startTime: 4 },
    { note: NoteName.F, octave: 4, duration: 1, startTime: 5 },
    { note: NoteName.E, octave: 4, duration: 1, startTime: 6 },
    { note: NoteName.D, octave: 4, duration: 1, startTime: 7 },
    { note: NoteName.C, octave: 4, duration: 1, startTime: 8 },
    { note: NoteName.C, octave: 4, duration: 1, startTime: 9 },
    { note: NoteName.D, octave: 4, duration: 1, startTime: 10 },
    { note: NoteName.E, octave: 4, duration: 1, startTime: 11 },
    { note: NoteName.E, octave: 4, duration: 1.5, startTime: 12 },
    { note: NoteName.D, octave: 4, duration: 0.5, startTime: 13.5 },
    { note: NoteName.D, octave: 4, duration: 2, startTime: 14 },
  ]
};

export const COURSES: Song[] = [
  {
    id: 'course-1',
    title: 'Piano Basics 101',
    artist: 'Luma Academy',
    difficulty: 'Beginner',
    bpm: 60,
    description: 'Learn the white keys and basic finger positioning.',
    category: 'Course',
    notes: [
      { note: NoteName.C, octave: 4, duration: 1, startTime: 0 },
      { note: NoteName.D, octave: 4, duration: 1, startTime: 1 },
      { note: NoteName.E, octave: 4, duration: 1, startTime: 2 },
      { note: NoteName.C, octave: 4, duration: 1, startTime: 3 },
    ]
  },
  {
    id: 'course-2',
    title: 'First Melodies',
    artist: 'Luma Academy',
    difficulty: 'Beginner',
    bpm: 70,
    description: 'Play simple tunes like Mary Had a Little Lamb.',
    category: 'Course',
    notes: [
      { note: NoteName.E, octave: 4, duration: 1, startTime: 0 },
      { note: NoteName.D, octave: 4, duration: 1, startTime: 1 },
      { note: NoteName.C, octave: 4, duration: 1, startTime: 2 },
      { note: NoteName.D, octave: 4, duration: 1, startTime: 3 },
      { note: NoteName.E, octave: 4, duration: 1, startTime: 4 },
      { note: NoteName.E, octave: 4, duration: 1, startTime: 5 },
      { note: NoteName.E, octave: 4, duration: 2, startTime: 6 },
    ]
  },
  {
    id: 'course-3',
    title: 'Chords Introduction',
    artist: 'Luma Academy',
    difficulty: 'Intermediate',
    bpm: 60,
    description: 'Understanding major and minor triads.',
    category: 'Course',
    notes: [
      { note: NoteName.C, octave: 4, duration: 4, startTime: 0 },
      { note: NoteName.E, octave: 4, duration: 4, startTime: 0 },
      { note: NoteName.G, octave: 4, duration: 4, startTime: 0 },
    ]
  },
  {
    id: 'course-4',
    title: 'Rhythm Training',
    artist: 'Luma Academy',
    difficulty: 'Intermediate',
    bpm: 90,
    description: 'Master quarter, eighth, and sixteenth notes.',
    category: 'Course',
    notes: [
      { note: NoteName.C, octave: 4, duration: 0.5, startTime: 0 },
      { note: NoteName.C, octave: 4, duration: 0.5, startTime: 0.5 },
      { note: NoteName.C, octave: 4, duration: 1, startTime: 1 },
    ]
  }
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
