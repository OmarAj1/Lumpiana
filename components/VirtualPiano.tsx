import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppSettings } from '../types'; // Import AppSettings for typing props

// --- Web Audio Synthesizer Hook ---
/**
 * A basic polyphonic synthesizer using Web Audio API oscillators.
 * It replaces the complex sample loading logic (piano7, pno0x3, etc.)
 * in the original file with a simple, self-contained synth.
 * Uses a sine wave with a simple Attack-Decay envelope.
 */
const useSynth = () => {
  const audioContext = useRef<AudioContext | null>(null);
  const activeOscillators = useRef(new Map<number, {oscillator: OscillatorNode, gainNode: GainNode}>()); // Map<midiNote, {oscillator, gainNode}>

  useEffect(() => {
    // Initialize AudioContext on first use, especially helpful for mobile/browser policies
    if (!audioContext.current) {
      audioContext.current = new AudioContext();
    }
  }, []);

  const playNote = useCallback((midiNote: number, volume = 0.5, sustain = false) => {
    if (!audioContext.current || activeOscillators.current.has(midiNote)) {
      return; // Already playing
    }
    const ctx = audioContext.current;
    if (ctx.state === 'suspended') {
      ctx.resume(); // Try to resume context if it was suspended
    }

    const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine'; // Simple sine wave for a clean tone
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gainNode.gain.setValueAtTime(0, ctx.currentTime); // Start volume at 0

    // Simple ADSR Envelope
    const attackTime = 0.02;
    const decayTime = sustain ? 0.8 : 0.2;
    const holdLevel = sustain ? 0.3 : 0.01;

    // Attack
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + attackTime);
    // Decay/Sustain (if sustained, it holds the level, otherwise decays fast)
    gainNode.gain.linearRampToValueAtTime(holdLevel, ctx.currentTime + attackTime + decayTime);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();

    activeOscillators.current.set(midiNote, { oscillator: osc, gainNode });

  }, []);

  const stopNote = useCallback((midiNote: number) => {
    const noteData = activeOscillators.current.get(midiNote);
    if (!audioContext.current || !noteData) {
      return;
    }
    const ctx = audioContext.current;
    const { oscillator: osc, gainNode } = noteData;
    const releaseTime = 0.1;

    // Release: ramp volume down to 0
    gainNode.gain.cancelScheduledValues(ctx.currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + releaseTime);

    // Stop oscillator after release phase
    osc.stop(ctx.currentTime + releaseTime);

    activeOscillators.current.delete(midiNote);
  }, []);

  // Public utility function to stop all currently playing notes (similar to enforceSilence)
  const enforceSilence = useCallback(() => {
    activeOscillators.current.forEach(({ oscillator }) => {
      try { oscillator.stop(); } catch (e) { /* ignore if already stopped */ }
    });
    activeOscillators.current.clear();
    // Re-initialize context to clear pending events
    if (audioContext.current) {
        audioContext.current.close().finally(() => {
            audioContext.current = new AudioContext();
        });
    }
  }, []);

  return { playNote, stopNote, enforceSilence };
};

// --- Keyboard Component (SVG-based) ---
interface PianoKeysProps {
  activeKeys: Set<number>;
  playNote: (midiNote: number, volume?: number, sustain?: boolean) => void;
  stopNote: (midiNote: number) => void;
  octaves: { start: number; end: number };
  octaveOffset: number;
}

const PianoKeys = React.memo<PianoKeysProps>(({ activeKeys, playNote, stopNote, octaves }) => {
  const [firstOctave, lastOctave] = [octaves.start, octaves.end];
  const totalOctaves = lastOctave - firstOctave + 1;
  // Adjusted from original to maintain ratio and allow for a clean C8
  const svgWidth = (totalOctaves * 164) + 23; 

  // Constants based on the original width calculation proportions
  const WHITE_KEY_WIDTH_DENOMINATOR = 23 + 24 + 23; // C-D-E block
  const BLACK_KEY_WIDTH_DENOMINATOR = 24 + 23 + 23 + 24; // F-G-A-B block

  const KEY_GEOMETRY = {
    // White Keys
    0: { w: 23 / WHITE_KEY_WIDTH_DENOMINATOR, offsetFactor: 0 }, // C
    2: { w: 24 / WHITE_KEY_WIDTH_DENOMINATOR, offsetFactor: 23 }, // D
    4: { w: 23 / WHITE_KEY_WIDTH_DENOMINATOR, offsetFactor: 23 + 24 }, // E
    5: { w: 24 / BLACK_KEY_WIDTH_DENOMINATOR, offsetFactor: 0 }, // F
    7: { w: 23 / BLACK_KEY_WIDTH_DENOMINATOR, offsetFactor: 24 }, // G
    9: { w: 23 / BLACK_KEY_WIDTH_DENOMINATOR, offsetFactor: 24 + 23 }, // A
    11: { w: 24 / BLACK_KEY_WIDTH_DENOMINATOR, offsetFactor: 24 + 23 + 23 }, // B

    // Black Keys
    1: { w: 14 / WHITE_KEY_WIDTH_DENOMINATOR, baseWhiteKeyOffsetFactor: 23, xAdjustment: -7 }, // C# over C/D gap
    3: { w: 14 / WHITE_KEY_WIDTH_DENOMINATOR, baseWhiteKeyOffsetFactor: 23 + 24, xAdjustment: -7 }, // D# over D/E gap

    6: { w: 14 / BLACK_KEY_WIDTH_DENOMINATOR, baseWhiteKeyOffsetFactor: 24, xAdjustment: -7 }, // F# over F/G gap
    8: { w: 14 / BLACK_KEY_WIDTH_DENOMINATOR, baseWhiteKeyOffsetFactor: 24 + 23, xAdjustment: -7 }, // G# over G/A gap
    10: { w: 14 / BLACK_KEY_WIDTH_DENOMINATOR, baseWhiteKeyOffsetFactor: 24 + 23 + 23, xAdjustment: -7 }, // A# over A/B gap
  };

  const getNoteName = useCallback((midi: number) => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midi / 12) - 1; // C4 is MIDI 60
    return noteNames[midi % 12] + octave;
  }, []);

  const renderKeys = useCallback((isWhite: boolean) => {
    const keys = [];
    const scaleUnit = svgWidth / (totalOctaves * 7 + 1); // Width of one "unit" on the overall scale

    const WHITE_KEY_UNIT_WIDTH_CD = scaleUnit * (23 / WHITE_KEY_WIDTH_DENOMINATOR * 7);
    const WHITE_KEY_UNIT_WIDTH_DE = scaleUnit * (24 / WHITE_KEY_WIDTH_DENOMINATOR * 7);
    const WHITE_KEY_UNIT_WIDTH_EF = scaleUnit * (23 / WHITE_KEY_WIDTH_DENOMINATOR * 7); // E key width for CDE block

    const WHITE_KEY_UNIT_WIDTH_FG = scaleUnit * (24 / BLACK_KEY_WIDTH_DENOMINATOR * 7);
    const WHITE_KEY_UNIT_WIDTH_GA = scaleUnit * (23 / BLACK_KEY_WIDTH_DENOMINATOR * 7);
    const WHITE_KEY_UNIT_WIDTH_AB = scaleUnit * (23 / BLACK_KEY_WIDTH_DENOMINATOR * 7);
    const WHITE_KEY_UNIT_WIDTH_BC = scaleUnit * (24 / BLACK_KEY_WIDTH_DENOMINATOR * 7); // B key width for FGAB block

    for (let octave = firstOctave; octave <= lastOctave; octave++) {
      let currentWhiteKeyX = (octave - firstOctave) * (scaleUnit * 7); // X position for the start of the current octave's white keys

      for (let pc = 0; pc < 12; pc++) { // pc: pitch class 0-11
        const midi = octave * 12 + pc + 12; // MIDI 24 is C1
        if (midi < 24 || midi > 108) continue; // Only render 88-key piano range C1-C8

        let keyWidth;
        let xPos;
        let height;
        let yPos = 0;

        const isActive = activeKeys.has(midi);

        if (isWhite) {
          if (![0, 2, 4, 5, 7, 9, 11].includes(pc)) continue; // Skip black key pitch classes for white keys

          switch(pc) {
              case 0: keyWidth = WHITE_KEY_UNIT_WIDTH_CD; xPos = currentWhiteKeyX; break; // C
              case 2: keyWidth = WHITE_KEY_UNIT_WIDTH_DE; xPos = currentWhiteKeyX + WHITE_KEY_UNIT_WIDTH_CD; break; // D
              case 4: keyWidth = WHITE_KEY_UNIT_WIDTH_EF; xPos = currentWhiteKeyX + WHITE_KEY_UNIT_WIDTH_CD + WHITE_KEY_UNIT_WIDTH_DE; break; // E
              case 5: keyWidth = WHITE_KEY_UNIT_WIDTH_FG; xPos = currentWhiteKeyX + WHITE_KEY_UNIT_WIDTH_CD + WHITE_KEY_UNIT_WIDTH_DE + WHITE_KEY_UNIT_WIDTH_EF; break; // F
              case 7: keyWidth = WHITE_KEY_UNIT_WIDTH_GA; xPos = currentWhiteKeyX + WHITE_KEY_UNIT_WIDTH_CD + WHITE_KEY_UNIT_WIDTH_DE + WHITE_KEY_UNIT_WIDTH_EF + WHITE_KEY_UNIT_WIDTH_FG; break; // G
              case 9: keyWidth = WHITE_KEY_UNIT_WIDTH_AB; xPos = currentWhiteKeyX + WHITE_KEY_UNIT_WIDTH_CD + WHITE_KEY_UNIT_WIDTH_DE + WHITE_KEY_UNIT_WIDTH_EF + WHITE_KEY_UNIT_WIDTH_FG + WHITE_KEY_UNIT_WIDTH_GA; break; // A
              case 11: keyWidth = WHITE_KEY_UNIT_WIDTH_BC; xPos = currentWhiteKeyX + WHITE_KEY_UNIT_WIDTH_CD + WHITE_KEY_UNIT_WIDTH_DE + WHITE_KEY_UNIT_WIDTH_EF + WHITE_KEY_UNIT_WIDTH_FG + WHITE_KEY_UNIT_WIDTH_GA + WHITE_KEY_UNIT_WIDTH_AB; break; // B
              default: keyWidth = 0; xPos = 0; break;
          }
          height = 150; // White keys are 150 high

        } else { // Black keys
          if (![1, 3, 6, 8, 10].includes(pc)) continue; // Skip white key pitch classes for black keys

          keyWidth = scaleUnit * 0.7 * (14 / WHITE_KEY_WIDTH_DENOMINATOR * 7); // Approx 70% width of a white key segment
          height = 100; // Black keys are 100 high
          
          let baseWhiteKeyXForBlackKey = currentWhiteKeyX;
          
          switch(pc) {
              case 1: baseWhiteKeyXForBlackKey += (WHITE_KEY_UNIT_WIDTH_CD / 2); break; // C#
              case 3: baseWhiteKeyXForBlackKey += WHITE_KEY_UNIT_WIDTH_CD + (WHITE_KEY_UNIT_WIDTH_DE / 2); break; // D#
              case 6: baseWhiteKeyXForBlackKey += WHITE_KEY_UNIT_WIDTH_CD + WHITE_KEY_UNIT_WIDTH_DE + WHITE_KEY_UNIT_WIDTH_EF + (WHITE_KEY_UNIT_WIDTH_FG / 2); break; // F#
              case 8: baseWhiteKeyXForBlackKey += WHITE_KEY_UNIT_WIDTH_CD + WHITE_KEY_UNIT_WIDTH_DE + WHITE_KEY_UNIT_WIDTH_EF + WHITE_KEY_UNIT_WIDTH_FG + (WHITE_KEY_UNIT_WIDTH_GA / 2); break; // G#
              case 10: baseWhiteKeyXForBlackKey += WHITE_KEY_UNIT_WIDTH_CD + WHITE_KEY_UNIT_WIDTH_DE + WHITE_KEY_UNIT_WIDTH_EF + WHITE_KEY_UNIT_WIDTH_FG + WHITE_KEY_UNIT_WIDTH_GA + (WHITE_KEY_UNIT_WIDTH_AB / 2); break; // A#
          }
          xPos = baseWhiteKeyXForBlackKey - keyWidth / 2; // Center black key over the crack
        }
        
        // Ensure valid positioning and size
        if (keyWidth <= 0 || xPos === undefined) continue;

        // --- Event Handlers ---
        const onPointerDown = (e: React.PointerEvent) => {
          e.preventDefault();
          playNote(midi, 0.5, true);
        };
        const onPointerUp = (e: React.PointerEvent) => {
          e.preventDefault();
          stopNote(midi);
        };
        const onPointerLeave = (e: React.PointerEvent) => {
            // Only stop if the pointer was actually down on this element
            if (e.buttons === 1) { // Check if left mouse button is pressed
                stopNote(midi);
            }
        };

        keys.push(
          <g
            key={midi}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerLeave} // End note on mouse out
            className={`cursor-pointer transition-all duration-75 ease-in-out ${isActive ? 'translate-y-0.5' : ''}`}
            style={{ touchAction: 'none' }} // Prevents mobile scrolling
          >
            <rect
              x={xPos}
              y={yPos}
              width={keyWidth}
              height={height}
              rx={3}
              ry={3}
              className={`${isWhite ? 'whitekeybutton' : 'blackkeybutton'} ${isActive ? (isWhite ? 'whitekeybutton--active' : 'blackkeybutton--active') : ''}`}
            />
            {isWhite && (
              <text
                x={xPos + keyWidth * 0.5}
                y={130}
                textAnchor="middle"
                fontSize="12"
                fill={isActive ? 'black' : 'rgb(119, 119, 119)'} // #777
              >
                {getNoteName(midi)}
              </text>
            )}
          </g>
        );
      }
    }
    return keys;
  }, [activeKeys, playNote, stopNote, firstOctave, lastOctave, svgWidth, getNoteName]);

  return (
    <svg
      preserveAspectRatio="xMidYMid meet"
      viewBox={`0 0 ${svgWidth} 150`}
      style={{ userSelect: 'none', touchAction: 'none' }}
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="whitekey_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#eee"></stop>
          <stop offset="100%" stopColor="white"></stop>
        </linearGradient>
        <linearGradient id="blackkey_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#111"></stop>
          <stop offset="100%" stopColor="#444"></stop>
        </linearGradient>
      </defs>
      <style type="text/css">{`
        .whitekeybutton {
          fill: url(#whitekey_gradient);
          stroke-width: 1;
          stroke: #aaa;
          cursor: pointer;
        }
        .whitekeybutton text {
          font-family: Arial;
          fill: #777;
        }
        .whitekeybutton--active {
          fill: #ddd; /* Lighter color when active */
          stroke: #aaa;
        }
        .whitekeybutton--active text {
          fill: black;
        }

        .blackkeybutton {
          fill: url(#blackkey_gradient);
          cursor: pointer;
        }
        .blackkeybutton--active {
          fill: #555; /* Lighter color when active */
        }
      `}</style>
      <rect width="100%" height="100%" fill="transparent"></rect> {/* Background rect */}
      {renderKeys(true)}
      {renderKeys(false)}
    </svg>
  );
});

// --- Main App Component ---
interface VirtualPianoProps {
  isDark?: boolean; // Optional prop, not directly used in this component's logic
  settings?: AppSettings; // Optional, only if settings directly influence this component's rendering
}

export const VirtualPiano: React.FC<VirtualPianoProps> = () => {
  const [octaves, setOctaves] = useState({ start: 3, end: 5 }); // Default C3 to C5 (3 visible octaves)
  const [octaveOffset, setOctaveOffset] = useState(0); // For PC keyboard transpose/shift
  const [activeKeys, setActiveKeys] = useState(new Set<number>()); // MIDI notes currently playing
  const [volume, setVolume] = useState(5); // Volume is 0-10
  const [sustainOn, setSustainOn] = useState(false); // Sustain toggle
  
  const { playNote, stopNote, enforceSilence } = useSynth();

  // Default PC Keyboard mapping
  const keyToOffset = useRef<Record<string, number | string>>({
    // Bottom row (C3 to C5) relative to C4 (MIDI 60)
    'KeyZ': -9, 'KeyS': -8, 'KeyX': -7, 'KeyD': -5, 'KeyC': -6, 'KeyF': -5, 'KeyV': -4, 'KeyG': -3, 'KeyB': -2, 'KeyH': -1, 'KeyN': 0, 'KeyJ': 2, 'KeyM': 1, 'Comma': 3, 'KeyL': 4, 'Period': 5,
    // Top row (C4 to C6) relative to C4 (MIDI 60)
    'KeyQ': 3, 'Digit2': 4, 'KeyW': 5, 'Digit3': 6, 'KeyE': 7, 'Digit4': 8, 'KeyR': 9, 'Digit5': 10, 'KeyT': 11, 'Digit6': 12, 'KeyY': 13, 'Digit7': 14, 'KeyU': 15, 'Digit8': 16, 'KeyI': 17, 'Digit9': 18, 'KeyO': 19, 'Digit0': 20, 'KeyP': 21, 'Minus': 22,
  });

  const getMidiNote = (code: string, offset: number) => {
    const baseMidi = 60; // C4
    const keyOffset = keyToOffset.current[code];
    if (typeof keyOffset === 'number') {
      return baseMidi + keyOffset + offset;
    }
    return null;
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.repeat) return;
    const code = e.code;

    // Control actions
    if (code === 'ArrowLeft') {
        e.preventDefault();
        setOctaveOffset(prev => Math.max(-24, prev - 12));
        return;
    }
    if (code === 'ArrowRight') {
        e.preventDefault();
        setOctaveOffset(prev => Math.min(24, prev + 12));
        return;
    }
    if (code === 'Space') {
        e.preventDefault();
        enforceSilence();
        return;
    }
    if (code === 'CapsLock') {
        e.preventDefault(); // Prevent CapsLock from toggling
        setSustainOn(true); // Treat CapsLock as a sustain pedal press
        return;
    }

    // Handle Note Press
    const midi = getMidiNote(code, octaveOffset);
    if (midi && midi >= 24 && midi <= 108 && !activeKeys.has(midi)) {
      e.preventDefault();
      setActiveKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.add(midi);
        return newKeys;
      });
      playNote(midi, volume / 10, sustainOn);
    }
  }, [octaveOffset, activeKeys, playNote, volume, sustainOn, enforceSilence]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const code = e.code;

    if (code === 'CapsLock') {
        setSustainOn(false); // Release sustain when CapsLock is released
        return;
    }

    const midi = getMidiNote(code, octaveOffset);
    if (midi && activeKeys.has(midi)) {
      e.preventDefault();
      setActiveKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(midi);
        return newKeys;
      });
      stopNote(midi);
    }
  }, [octaveOffset, activeKeys, stopNote]);

  // Setup global keyboard listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Handle octave selector change
  const handleOctaveSelectorChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOctave = parseInt(e.target.value, 10);
    // C4 is midi 60. `selectedOctave` is the octave number (e.g., 1 for C1, 2 for C2).
    // The `keyToOffset` keys are relative to C4.
    // So, if selectedOctave is C1, the offset should be (1-4)*12 = -36
    setOctaveOffset((selectedOctave - 4) * 12); 
  }, []);

  const currentTransposeOctave = Math.floor((octaveOffset + 60) / 12) - 1; // For displaying C1, C2 etc.

  return (
    <div id="p1mii26d9e" className="piano-panel relative flex flex-col items-center justify-center p-4 bg-zinc-800 rounded-lg shadow-inner-lg shadow-zinc-900 border border-zinc-700">
      <div className="inputs flex flex-wrap justify-center items-center gap-4 mb-4 text-zinc-200">
        
        {/* Basic Inputs */}
        <div className="id-basic_inputs_div flex flex-wrap justify-center items-center gap-4">
          
          {/* Octaves Picker */}
          <div className="id-octaves-picker ostylowany flex items-center gap-2">
            <label htmlFor="octaves_selector" className="text-sm font-medium">Tab plays</label>
            <select
              id="octaves_selector"
              className="bg-zinc-700 text-zinc-100 p-1 rounded-md text-sm cursor-pointer"
              value={currentTransposeOctave} // Display the current 'C' octave being played by 'N' key
              onChange={handleOctaveSelectorChange}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(oct => ( // MIDI range for C
                <option key={oct} value={oct}>{`C${oct}`}</option>
              ))}
            </select>
          </div>

          {/* Volume Control */}
          <div className="ostylowany flex items-center gap-2">
            <label htmlFor="volume_control" className="text-sm font-medium">Volume</label>
            <button
              title="volume down"
              onClick={() => setVolume(prev => Math.max(0, prev - 1))}
              className="bg-zinc-700 text-zinc-100 font-bold px-2 py-1 rounded-l-md hover:bg-zinc-600 transition"
            >
              −
            </button>
            <input
              id="volume_control"
              type="text"
              readOnly
              value={volume}
              className="w-8 text-center bg-zinc-800 text-zinc-100 font-bold p-1 border-y border-zinc-600 focus:outline-none"
              aria-label="Volume level"
            />
            <button
              title="volume up"
              onClick={() => setVolume(prev => Math.min(10, prev + 1))}
              className="bg-zinc-700 text-zinc-100 font-bold px-2 py-1 rounded-r-md hover:bg-zinc-600 transition"
            >
              +
            </button>
          </div>

          {/* Sustain Checkbox */}
          <label htmlFor="susbox" className="ostylowany flex items-center gap-2 text-sm font-medium">
            Sustain
            <input
              id="susbox"
              type="checkbox"
              checked={sustainOn}
              onChange={(e) => setSustainOn(e.target.checked)}
              className="w-4 h-4 accent-blue-500 cursor-pointer"
            />
          </label>
        </div>
        
        {/* More Features (Simplified silence button) */}
        <div className="id-basic_inputs_div flex flex-wrap justify-center items-center gap-4">
             <button
                onClick={enforceSilence}
                className="px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition shadow-md text-sm"
              >
                Silence All 🛑
              </button>
        </div>
      </div>

      {/* --- Piano Keyboard --- */}
      <div className="klawa relative w-full overflow-hidden rounded-md bg-zinc-900 border border-zinc-700 shadow-xl flex">
        {/* Pianoside octave range controls */}
        <div className="pianoside flex flex-col justify-between py-2 text-zinc-400 bg-zinc-900 text-sm font-bold">
          <button
            onClick={() => setOctaves(prev => ({ ...prev, end: Math.min(8, prev.end + 1) }))}
            className="p-1 px-2 hover:text-white transition" aria-label="Add higher octave"
          >
            +
          </button>
          <button
            onClick={() => setOctaves(prev => ({ ...prev, end: Math.max(prev.start + 2, prev.end - 1) }))} // Min 3 octaves visible
            className="p-1 px-2 hover:text-white transition" aria-label="Remove higher octave"
          >
            −
          </button>
        </div>

        <PianoKeys
          activeKeys={activeKeys}
          playNote={playNote}
          stopNote={stopNote}
          octaves={octaves}
          octaveOffset={octaveOffset} // This prop is not directly used by PianoKeys for rendering, but kept for context consistency.
        />

        <div className="pianoside flex flex-col justify-between py-2 text-zinc-400 bg-zinc-900 text-sm font-bold">
          <button
            onClick={() => setOctaves(prev => ({ ...prev, start: Math.max(0, prev.start - 1) }))}
            className="p-1 px-2 hover:text-white transition" aria-label="Add lower octave"
          >
            +
          </button>
          <button
            onClick={() => setOctaves(prev => ({ ...prev, start: Math.min(prev.end - 2, prev.start + 1) }))} // Min 3 octaves visible
            className="p-1 px-2 hover:text-white transition" aria-label="Remove lower octave"
          >
            −
          </button>
        </div>
      </div>

      {/* Chord Label (hidden by default as per design, functionality not implemented here) */}
      <div
        id="chord-label"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-700 text-white font-bold p-2 rounded-lg text-sm hidden"
        style={{ userSelect: 'text' }}
      >
        Chord
      </div>
    </div>
  );
};