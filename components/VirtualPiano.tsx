import React, { useState, useEffect, useCallback, useRef } from 'react';
import { audioEngine } from '../services/audioEngine';
import BlackKey from './BlackKey';
import WhiteKey from './WhiteKey';
import { BLACK_KEY_HEIGHT_RATIO, ORIGINAL_WHITE_KEY_HEIGHT, NOTE_NAMES } from '../utils/constants';

// Helper to handle glissando (slide) input - moved outside for reusability
const handlePointerEnter = (e: React.PointerEvent, midi: number, playNote: (n: number) => void) => {
    // Only play if primary button (left mouse or touch) is held down (slide/drag)
    if (e.buttons === 1 || e.pressure > 0) { 
        e.preventDefault();
        playNote(midi);
    }
};

interface VirtualPianoProps {
  onNotePlay?: (midi: number) => void;
  onNoteStop?: (midi: number) => void;
}

const NUM_WHITE_KEYS_PER_OCTAVE = 7;
const NUM_OCTAVES_VISIBLE = 3; // e.g., C3 to C6, which is 22 white keys (3 full octaves + the C of the 4th)
const TOTAL_VISIBLE_WHITE_KEYS = (NUM_OCTAVES_VISIBLE * NUM_WHITE_KEYS_PER_OCTAVE) + 1; // C-D-E-F-G-A-B C-D-E-F-G-A-B C-D-E-F-G-A-B C

export const VirtualPiano: React.FC<VirtualPianoProps> = ({ onNotePlay, onNoteStop }) => {
  // `startMidiNote` is the MIDI number of the first C on the visual keyboard.
  // C3 is MIDI 48. We'll start with C3 as the lowest visible note.
  const [startMidiNote, setStartMidiNote] = useState(48); // MIDI for C3
  const [activeKeys, setActiveKeys] = useState(new Set<number>());

  const handleNotePlay = useCallback((midi: number) => {
      const freq = 440 * Math.pow(2, (midi - 69) / 12);
      audioEngine.playPianoNote(freq);
      onNotePlay?.(midi);
      setActiveKeys(prev => new Set(prev).add(midi));
  }, [onNotePlay]);

  const handleNoteStop = useCallback((midi: number) => {
      onNoteStop?.(midi);
      setActiveKeys(prev => {
          const next = new Set(prev);
          next.delete(midi);
          return next;
      });
  }, [onNoteStop]);

  // QWERTY to MIDI offset mapping, relative to the current `startMidiNote`
  // This maps a key code to an offset from the `startMidiNote`'s C.
  // The layout below covers 2 octaves starting from the current `startMidiNote`.
  const keyToRelativeMidiOffset = useRef<Record<string, number>>({
    // Lower Octave White Keys (relative to startMidiNote for C)
    'KeyZ': 0, // C
    'KeyX': 2, // D
    'KeyC': 4, // E
    'KeyV': 5, // F
    'KeyB': 7, // G
    'KeyN': 9, // A
    'KeyM': 11, // B
    
    // Lower Octave Black Keys
    'KeyS': 1,  // C#
    'KeyD': 3,  // D#
    'KeyG': 6,  // F#
    'KeyH': 8,  // G#
    'KeyJ': 10, // A#

    // Upper Octave White Keys (relative to startMidiNote + 12 for C)
    'KeyQ': 12, // C
    'KeyW': 14, // D
    'KeyE': 16, // E
    'KeyR': 17, // F
    'KeyT': 19, // G
    'KeyY': 21, // A
    'KeyU': 23, // B

    // Upper Octave Black Keys
    'Digit2': 13, // C#
    'Digit3': 15, // D#
    'Digit5': 18, // F#
    'Digit6': 20, // G#
    'Digit7': 22, // A#
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.repeat) return;
    
    if (e.code === 'ArrowRight') {
      setStartMidiNote(prev => Math.min(prev + 12, 72)); // Max C6 (MIDI 72) as starting note
      return;
    }
    if (e.code === 'ArrowLeft') {
      setStartMidiNote(prev => Math.max(prev - 12, 24)); // Min C1 (MIDI 24) as starting note
      return;
    }

    const relativeOffset = keyToRelativeMidiOffset.current[e.code];
    
    if (typeof relativeOffset === 'number') {
        const baseMidiC = startMidiNote; // The visible C3, C4, etc.
        const actualMidi = baseMidiC + relativeOffset;
        
        // Ensure the note is within the displayed range to avoid playing invisible notes
        // For a 3-octave keyboard from startMidiNote, max note is startMidiNote + (3*12)
        if (actualMidi >= baseMidiC && actualMidi < baseMidiC + (NUM_OCTAVES_VISIBLE * 12) + 12) { // 3 full octaves + B of the 4th oct
            if (!activeKeys.has(actualMidi)) {
                handleNotePlay(actualMidi);
            }
        }
    }
  }, [activeKeys, handleNotePlay, startMidiNote]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const relativeOffset = keyToRelativeMidiOffset.current[e.code];
    if (typeof relativeOffset === 'number') {
        const baseMidiC = startMidiNote;
        const actualMidi = baseMidiC + relativeOffset;
        if (activeKeys.has(actualMidi)) { // Only stop if it was actually pressed
            handleNoteStop(actualMidi);
        }
    }
  }, [activeKeys, handleNoteStop, startMidiNote]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // SVG drawing logic
  const SVG_VIEWBOX_WIDTH = 679; // Maintain original width ratio for now
  const SVG_VIEWBOX_HEIGHT = ORIGINAL_WHITE_KEY_HEIGHT;
  
  // Define MIDI range for the visible octaves based on startMidiNote
  const whiteKeyMidis: number[] = [];
  const blackKeyMidis: number[] = [];

  const firstCOctave = Math.floor(startMidiNote / 12);

  // Generate white keys starting from the base octave (e.g., C3)
  for (let octave = firstCOctave; octave < firstCOctave + NUM_OCTAVES_VISIBLE + 1; octave++) {
    for (let i = 0; i < 12; i++) {
        const midi = (octave * 12) + i;
        if (midi < startMidiNote) continue; // Skip notes before the actual startMidiNote
        
        const noteIndex = i % 12;
        if ([1, 3, 6, 8, 10].includes(noteIndex)) { // C#, D#, F#, G#, A# (black keys)
            blackKeyMidis.push(midi);
        } else { // C, D, E, F, G, A, B (white keys)
            whiteKeyMidis.push(midi);
        }
    }
  }

  // Filter to exactly TOTAL_VISIBLE_WHITE_KEYS white keys
  const visibleWhiteKeys = whiteKeyMidis.filter(midi => {
    const noteIndex = midi % 12;
    return [0,2,4,5,7,9,11].includes(noteIndex); // Only white keys
  }).slice(0, TOTAL_VISIBLE_WHITE_KEYS);

  // Calculate dynamic width of a single white key based on current view
  const numVisibleWhiteKeys = visibleWhiteKeys.length;
  const whiteKeyWidth = SVG_VIEWBOX_WIDTH / numVisibleWhiteKeys;
  const blackKeyWidth = whiteKeyWidth * 0.6; // Black keys are narrower

  const getNoteName = (midi: number) => {
    const octave = Math.floor(midi / 12) - 1;
    return `${NOTE_NAMES[midi % 12]}${octave}`;
  };

  return (
    <div id="p1mii26d9e" className="piano-panel h-full flex flex-col" style={{ userSelect: 'none', width: '100%', background: 'transparent' }}>
      
      <style>{`
        /* Global Styles for Piano Keys - can be overridden by component-specific styles */
        .piano-panel { font-family: 'Inter', sans-serif; color: white; padding: 4px; border-radius: 8px; }
        .ostylowany { 
            background: rgb(var(--color-surface-tertiary)); 
            border: 1px solid rgb(var(--color-border-default)); 
            color: rgb(var(--color-text-primary)); 
            padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold;
        }
        .ostylowany:hover { background: rgb(var(--color-surface-interactive)); }
        
        .whitekeybutton text { font-family: Arial; fill: rgb(var(--virtual-piano-white-key-label-idle)); font-size: 10px; }
        .blackkeybutton text { font-family: Arial; fill: rgb(var(--color-text-primary)); font-size: 9px; }
      `}</style>

      {/* Controls - Compact layout */}
      <div className="inputs shrink-0" style={{ textAlign: 'center', marginBottom: '2px' }}>
         <div id="advanced_inputs_div" style={{ lineHeight: 1.5, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '5px' }}>
            <span className="ostylowany">Start Note: {getNoteName(startMidiNote)}</span>
         </div>
      </div>

      {/* Keyboard Area - Fills remaining height */}
      <div className="klawa flex-1 relative min-h-0" style={{ width: '100%' }}>
         {/* Octave Range Change Buttons - Left Side */}
         <div className="pianoside" style={{ position: 'absolute', left: '0', top: 0, bottom: 0, zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2px' }}>
            <button className="range_change_button ostylowany" onClick={() => setStartMidiNote(prev => Math.max(prev - 12, 24))}>&#9664; Octave</button>
         </div>

         {/* Octave Range Change Buttons - Right Side */}
         <div className="pianoside" style={{ position: 'absolute', right: '0', top: 0, bottom: 0, zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2px' }}>
            <button className="range_change_button ostylowany" onClick={() => setStartMidiNote(prev => Math.min(prev + 12, 72))}>Octave &#9654;</button>
         </div>

         <svg 
            preserveAspectRatio="none" 
            viewBox={`0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}`} 
            style={{ userSelect: 'none', touchAction: 'none', width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
            onPointerLeave={() => { /* Stop all notes when pointer leaves SVG */ activeKeys.forEach(midi => handleNoteStop(midi)); }}
         >
            <rect width="100%" height="100%" fill="transparent"></rect>

            {/* Render White Keys */}
            {visibleWhiteKeys.map((midi, index) => {
                const xPos = index * whiteKeyWidth;
                return (
                    <WhiteKey
                        key={midi}
                        midi={midi}
                        x={xPos}
                        w={whiteKeyWidth}
                        height={SVG_VIEWBOX_HEIGHT}
                        yOffset={0}
                        isActive={activeKeys.has(midi)}
                        keyLabel={getNoteName(midi).slice(0, -1)} // Pass note name only
                        playNote={handleNotePlay}
                        stopNote={handleNoteStop}
                        onPointerEnter={handlePointerEnter}
                    />
                );
            })}

            {/* Render Black Keys */}
            {blackKeyMidis.filter(midi => { // Only show black keys within the range of visible white keys
                const whiteKeyBefore = visibleWhiteKeys.find(wMidi => wMidi < midi && (midi - wMidi === 1 || midi - wMidi === 2)); // C# is 1 semitone from C, D# is 1 semitone from D
                const whiteKeyAfter = visibleWhiteKeys.find(wMidi => wMidi > midi && (wMidi - midi === 1 || wMidi - midi === 2)); // e.g. D is 1 semitone from C#
                return whiteKeyBefore && whiteKeyAfter;
            }).map((midi) => {
                const noteIndex = midi % 12;
                let whiteKeyIndex = -1;
                let xOffsetRatio = 0;

                // Position black key relative to its preceding white key
                // C# (1) -> relative to C (0)
                // D# (3) -> relative to D (2)
                // F# (6) -> relative to F (5)
                // G# (8) -> relative to G (7)
                // A# (10) -> relative to A (9)

                // Find the index of the white key immediately to its left
                const leftWhiteKeyMidi = (noteIndex === 1 || noteIndex === 6) ? midi - 1 : midi - 2; 
                whiteKeyIndex = visibleWhiteKeys.indexOf(leftWhiteKeyMidi);
                
                // Fine-tune centering based on common piano layouts
                if (noteIndex === 1) xOffsetRatio = 0.7; // C# over C
                else if (noteIndex === 3) xOffsetRatio = 0.3; // D# over D
                else if (noteIndex === 6) xOffsetRatio = 0.75; // F# over F
                else if (noteIndex === 8) xOffsetRatio = 0.45; // G# over G
                else if (noteIndex === 10) xOffsetRatio = 0.15; // A# over A

                if (whiteKeyIndex === -1) return null; // Should not happen for visible black keys
                
                const xPos = (whiteKeyIndex * whiteKeyWidth) + (whiteKeyWidth * xOffsetRatio) - (blackKeyWidth / 2);

                return (
                    <BlackKey
                        key={midi}
                        midi={midi}
                        x={xPos}
                        w={blackKeyWidth}
                        height={SVG_VIEWBOX_HEIGHT * BLACK_KEY_HEIGHT_RATIO}
                        yOffset={0}
                        isActive={activeKeys.has(midi)}
                        keyLabel={''} // Pass empty string as label is not rendered
                        playNote={handleNotePlay}
                        stopNote={handleNoteStop}
                        onPointerEnter={handlePointerEnter}
                    />
                );
            })}
         </svg>
      </div>
    </div>
  );
};