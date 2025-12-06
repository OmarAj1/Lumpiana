// utils/constants.ts

// Ratio of black key height to white key height
export const BLACK_KEY_HEIGHT_RATIO = 0.6; // Black keys are about 60% the height of white keys

// The original base height of a white key in the SVG coordinate system
// This is used for scaling labels and other internal elements proportionally
// Corresponds to the height value (150) in the VirtualPiano SVG viewBox
export const ORIGINAL_WHITE_KEY_HEIGHT = 150;

// Array of note names for MIDI mapping (0-11)
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];