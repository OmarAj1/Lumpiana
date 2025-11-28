
import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- Web Audio Synthesizer Hook ---
const useSynth = () => {
  const audioContext = useRef<AudioContext | null>(null);
  const activeOscillators = useRef(new Map<number, {oscillator: OscillatorNode, gainNode: GainNode}>());

  useEffect(() => {
    if (!audioContext.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContext.current = new AudioContextClass();
    }
    return () => {
        if (audioContext.current && audioContext.current.state !== 'closed') {
            audioContext.current.close();
        }
    };
  }, []);

  const playNote = useCallback((midiNote: number, volume = 0.5, sustain = false) => {
    if (!audioContext.current) return;
    const ctx = audioContext.current;
    if (ctx.state === 'suspended') ctx.resume();

    if (activeOscillators.current.has(midiNote)) return;

    const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gainNode.gain.setValueAtTime(0, ctx.currentTime);

    const attackTime = 0.02;
    const decayTime = sustain ? 0.8 : 0.2;
    const holdLevel = sustain ? 0.3 : 0.01;

    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + attackTime);
    gainNode.gain.linearRampToValueAtTime(holdLevel, ctx.currentTime + attackTime + decayTime);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();

    activeOscillators.current.set(midiNote, { oscillator: osc, gainNode });
  }, []);

  const stopNote = useCallback((midiNote: number) => {
    if (!audioContext.current) return;
    const noteData = activeOscillators.current.get(midiNote);
    if (!noteData) return;

    const ctx = audioContext.current;
    const { oscillator, gainNode } = noteData;
    const releaseTime = 0.1;

    gainNode.gain.cancelScheduledValues(ctx.currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + releaseTime);
    oscillator.stop(ctx.currentTime + releaseTime);

    activeOscillators.current.delete(midiNote);
  }, []);

  const enforceSilence = useCallback(() => {
    activeOscillators.current.forEach(({ oscillator }) => {
      try { oscillator.stop(); } catch (e) {}
    });
    activeOscillators.current.clear();
  }, []);

  return { playNote, stopNote, enforceSilence };
};

// --- SVG KEY BLOCKS ---

interface KeyBlockProps {
  octave: number;
  x: string;
  width: string;
  activeKeys: Set<number>;
  playNote: (n: number) => void;
  stopNote: (n: number) => void;
}

// Helper to handle glissando (slide) input
const handlePointerEnter = (e: React.PointerEvent, midi: number, playNote: (n: number) => void) => {
    if (e.buttons === 1) { // Only play if primary button is held down (slide/drag)
        e.preventDefault();
        playNote(midi);
    }
};

const CEBlock: React.FC<KeyBlockProps> = ({ octave, x, width, activeKeys, playNote, stopNote }) => {
  const baseMidi = 12 + (octave * 12); // C is 0 in octave 0 (Midi 12)
  const keys = [
    { midi: baseMidi + 0, note: 'C', label: `C${octave}` },
    { midi: baseMidi + 2, note: 'D', label: `D${octave}` },
    { midi: baseMidi + 4, note: 'E', label: `E${octave}` }
  ];
  const blacks = [
    { midi: baseMidi + 1, x: '20%' }, // C#
    { midi: baseMidi + 3, x: '60%' }  // D#
  ];

  return (
    <svg width={width} height="100%" x={x} style={{ overflow: 'visible' }}>
        {/* White Keys */}
        {keys.map((k, i) => (
            <svg key={k.midi} id={`klawisz${k.midi}`} width="32.85%" height="100%" x={`${i * 32.85}%`} className={`whitekeybutton ${activeKeys.has(k.midi) ? 'active' : ''}`}
                 onPointerDown={(e) => { e.preventDefault(); playNote(k.midi); }} 
                 onPointerUp={() => stopNote(k.midi)} 
                 onPointerLeave={() => stopNote(k.midi)}
                 onPointerEnter={(e) => handlePointerEnter(e, k.midi, playNote)}
            >
                 <svg width="100%" height="100%" viewBox="0 0 24 150" preserveAspectRatio="none" className="path_container">
                     <path d="M0,0 H24 V146 Q24,150 20,150 H4 Q0,150 0,146 Z"></path>
                 </svg>
                 <svg x="25%" y="67" width="30%"><svg width="100%" height="100%" viewBox="0 0 13 20"><text x="0" y="13">{k.label}</text></svg></svg>
            </svg>
        ))}

        {/* Black Keys */}
        {blacks.map(b => (
            <svg key={b.midi} id={`klawisz${b.midi}`} width="20%" height="66.67%" x={b.x} className={`blackkeybutton ${activeKeys.has(b.midi) ? 'active' : ''}`}
                 onPointerDown={(e) => { e.preventDefault(); playNote(b.midi); }} 
                 onPointerUp={() => stopNote(b.midi)} 
                 onPointerLeave={() => stopNote(b.midi)}
                 onPointerEnter={(e) => handlePointerEnter(e, b.midi, playNote)}
            >
                <svg width="100%" height="100%" viewBox="0 0 14 100" preserveAspectRatio="none">
                    <path d="M0,0 H14 V99 Q14,100 11,100 H3 Q0,100 0,99 Z"></path>
                </svg>
                <rect x="8%" y="94%" width="84%" height="1" fill="#777"></rect>
            </svg>
        ))}
    </svg>
  );
};

const FBBlock: React.FC<KeyBlockProps> = ({ octave, x, width, activeKeys, playNote, stopNote }) => {
  const baseMidi = 12 + (octave * 12) + 5; // F is index 5
  const keys = [
    { midi: baseMidi + 0, note: 'F', label: `F${octave}` },
    { midi: baseMidi + 2, note: 'G', label: `G${octave}` },
    { midi: baseMidi + 4, note: 'A', label: `A${octave}` },
    { midi: baseMidi + 6, note: 'B', label: `B${octave}` }
  ];
  const blacks = [
    { midi: baseMidi + 1, x: '13.82%' }, // F#
    { midi: baseMidi + 3, x: '42.55%' }, // G#
    { midi: baseMidi + 5, x: '71.27%' }  // A#
  ];

  return (
    <svg width={width} height="100%" x={x} style={{ overflow: 'visible' }}>
        {/* White Keys */}
        {keys.map((k, i) => (
             <svg key={k.midi} id={`klawisz${k.midi}`} width="24.5%" height="100%" x={`${i * 25.0}%`} className={`whitekeybutton ${activeKeys.has(k.midi) ? 'active' : ''}`}
                 onPointerDown={(e) => { e.preventDefault(); playNote(k.midi); }} 
                 onPointerUp={() => stopNote(k.midi)} 
                 onPointerLeave={() => stopNote(k.midi)}
                 onPointerEnter={(e) => handlePointerEnter(e, k.midi, playNote)}
             >
                 <svg width="100%" height="100%" viewBox="0 0 24 150" preserveAspectRatio="none" className="path_container">
                     <path d="M0,0 H24 V146 Q24,150 20,150 H4 Q0,150 0,146 Z"></path>
                 </svg>
                 <svg x="25%" y="67" width="30%"><svg width="100%" height="100%" viewBox="0 0 13 20"><text x="0" y="13">{k.label}</text></svg></svg>
            </svg>
        ))}

        {/* Black Keys */}
        {blacks.map(b => (
            <svg key={b.midi} id={`klawisz${b.midi}`} width="14.89%" height="66.67%" x={b.x} className={`blackkeybutton ${activeKeys.has(b.midi) ? 'active' : ''}`}
                 onPointerDown={(e) => { e.preventDefault(); playNote(b.midi); }} 
                 onPointerUp={() => stopNote(b.midi)} 
                 onPointerLeave={() => stopNote(b.midi)}
                 onPointerEnter={(e) => handlePointerEnter(e, b.midi, playNote)}
            >
                <svg width="100%" height="100%" viewBox="0 0 14 100" preserveAspectRatio="none">
                    <path d="M0,0 H14 V99 Q14,100 11,100 H3 Q0,100 0,99 Z"></path>
                </svg>
                <rect x="8%" y="94%" width="84%" height="1" fill="#777"></rect>
            </svg>
        ))}
    </svg>
  );
};

const FinalCBlock: React.FC<KeyBlockProps> = ({ octave, x, width, activeKeys, playNote, stopNote }) => {
    const midi = 12 + (octave * 12);
    return (
        <svg width={width} height="100%" x={x}>
             <svg id={`klawisz${midi}`} width="100%" height="100%" x="0%" className={`whitekeybutton ${activeKeys.has(midi) ? 'active' : ''}`}
                 onPointerDown={(e) => { e.preventDefault(); playNote(midi); }} 
                 onPointerUp={() => stopNote(midi)} 
                 onPointerLeave={() => stopNote(midi)}
                 onPointerEnter={(e) => handlePointerEnter(e, midi, playNote)}
             >
                 <svg width="100%" height="100%" viewBox="0 0 24 150" preserveAspectRatio="none" className="path_container">
                     <path d="M0,0 H24 V146 Q24,150 20,150 H4 Q0,150 0,146 Z"></path>
                 </svg>
                 <svg x="25%" y="67" width="30%"><svg width="100%" height="100%" viewBox="0 0 13 20"><text x="0" y="13">{`C${octave}`}</text></svg></svg>
            </svg>
        </svg>
    );
};

// --- MAIN COMPONENT ---

interface VirtualPianoProps {
  onNotePlay?: (midi: number) => void;
  onNoteStop?: (midi: number) => void;
}

export const VirtualPiano: React.FC<VirtualPianoProps> = ({ onNotePlay, onNoteStop }) => {
  // Matches snippet range C2 (2) to C6 (5 + 1 note)
  const [octaves, setOctaves] = useState({ start: 2, end: 5 }); 
  const [activeKeys, setActiveKeys] = useState(new Set<number>());
  const { playNote, stopNote, enforceSilence } = useSynth();
  const [volume, setVolume] = useState(5);

  const handleNotePlay = useCallback((midi: number) => {
      playNote(midi, volume/10);
      onNotePlay?.(midi);
  }, [playNote, volume, onNotePlay]);

  const handleNoteStop = useCallback((midi: number) => {
      stopNote(midi);
      onNoteStop?.(midi);
  }, [stopNote, onNoteStop]);

  const keyToOffset = useRef<Record<string, number>>({
    'KeyZ': -9, 'KeyS': -8, 'KeyX': -7, 'KeyD': -5, 'KeyC': -6, 'KeyF': -5, 'KeyV': -4, 'KeyG': -3, 'KeyB': -2, 'KeyH': -1, 'KeyN': 0, 'KeyJ': 2, 'KeyM': 1, 'Comma': 3, 'KeyL': 4, 'Period': 5,
    'KeyQ': 3, 'Digit2': 4, 'KeyW': 5, 'Digit3': 6, 'KeyE': 7, 'Digit4': 8, 'KeyR': 9, 'Digit5': 10, 'KeyT': 11, 'Digit6': 12, 'KeyY': 13, 'Digit7': 14, 'KeyU': 15, 'Digit8': 16, 'KeyI': 17, 'Digit9': 18, 'Digit0': 20, 'KeyP': 21, 'Minus': 22,
  });
  const [octaveOffset, setOctaveOffset] = useState(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.repeat) return;
    const baseMidi = 60; // C4
    const offset = keyToOffset.current[e.code];
    if (typeof offset === 'number') {
        const midi = baseMidi + offset + octaveOffset;
        if (!activeKeys.has(midi)) {
            setActiveKeys(prev => new Set(prev).add(midi));
            handleNotePlay(midi);
        }
    }
    if (e.code === 'ArrowRight') setOctaveOffset(p => p + 12);
    if (e.code === 'ArrowLeft') setOctaveOffset(p => p - 12);
    if (e.code === 'Space') enforceSilence();
  }, [activeKeys, handleNotePlay, enforceSilence, octaveOffset]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const baseMidi = 60;
    const offset = keyToOffset.current[e.code];
    if (typeof offset === 'number') {
        const midi = baseMidi + offset + octaveOffset;
        setActiveKeys(prev => {
            const next = new Set(prev);
            next.delete(midi);
            return next;
        });
        handleNoteStop(midi);
    }
  }, [handleNoteStop, octaveOffset]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const totalOctaves = octaves.end - octaves.start + 1;
  const totalWhiteKeys = totalOctaves * 7 + 1;
  const unitWidth = 100 / totalWhiteKeys;
  const ceWidth = unitWidth * 3;
  const fbWidth = unitWidth * 4;
  const finalCWidth = unitWidth * 1;

  const renderKeyboard = () => {
      const blocks = [];
      let currentX = 0;

      for (let o = octaves.start; o <= octaves.end; o++) {
          blocks.push(
              <CEBlock 
                key={`ce-${o}`} 
                octave={o} 
                x={`${currentX}%`} 
                width={`${ceWidth}%`} 
                activeKeys={activeKeys} 
                playNote={handleNotePlay} 
                stopNote={handleNoteStop} 
              />
          );
          currentX += ceWidth;
          blocks.push(
              <FBBlock 
                key={`fb-${o}`} 
                octave={o} 
                x={`${currentX}%`} 
                width={`${fbWidth}%`} 
                activeKeys={activeKeys} 
                playNote={handleNotePlay} 
                stopNote={handleNoteStop} 
              />
          );
          currentX += fbWidth;
      }
      blocks.push(
          <FinalCBlock 
             key="final-c"
             octave={octaves.end + 1}
             x={`${currentX}%`}
             width={`${finalCWidth}%`}
             activeKeys={activeKeys}
             playNote={handleNotePlay}
             stopNote={handleNoteStop}
          />
      );
      return blocks;
  };

  return (
    <div id="p1mii26d9e" className="piano-panel h-full flex flex-col" style={{ userSelect: 'none', width: '100%', background: 'transparent' }}>
      
      <style>{`
        .piano-panel { font-family: 'Inter', sans-serif; color: white; padding: 4px; border-radius: 8px; }
        .ostylowany { display: inline-block; margin: 0.25em; vertical-align: middle; }
        button.ostylowany, .ostylowany button { 
            background: #333; border: 1px solid #555; color: #eee; padding: 2px 6px; border-radius: 4px; cursor: pointer; font-size: 10px;
        }
        button.ostylowany:hover, .ostylowany button:hover { background: #444; }
        
        .whitekeybutton { cursor: pointer; touch-action: none; }
        .whitekeybutton text { font-family: Arial; fill: #777; font-size: 10px; }
        .whitekeybutton.active .path_container path:nth-of-type(1) { fill: #ddd; }
        .whitekeybutton:hover .path_container path:nth-of-type(1) { fill: #f0f0f0; }
        .whitekeybutton:hover text { fill: black; }
        .path_container path:nth-of-type(1) { stroke-width: 1; stroke: #aaa; fill: url(#whitekey_gradient); }

        .blackkeybutton { cursor: pointer; touch-action: none; }
        .blackkeybutton path { fill: url(#vp_blackkey_gradient); stroke: #555; stroke-width: 1px; }
        .blackkeybutton.active path { fill: #555; }
        .blackkeybutton:hover path { fill: #333; }
      `}</style>

      {/* Controls - Compact layout */}
      <div className="inputs shrink-0" style={{ textAlign: 'center', marginBottom: '2px' }}>
         <div id="advanced_inputs_div" style={{ lineHeight: 1.5, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '5px' }}>
             <div className="ostylowany"><button onClick={enforceSilence}>Silence</button></div>
             <div className="ostylowany">
                 Vol: 
                 <button onClick={() => setVolume(v => Math.max(0, v-1))}>-</button>
                 <span style={{ display: 'inline-block', width: '1.5em', textAlign: 'center' }}>{volume}</span>
                 <button onClick={() => setVolume(v => Math.min(10, v+1))}>+</button>
             </div>
             {/* Layout selector hidden for simplicity/space */}
         </div>
      </div>

      {/* Keyboard Area - Fills remaining height */}
      <div className="klawa flex-1 relative min-h-0" style={{ width: '100%' }}>
         <div className="pianoside" style={{ position: 'absolute', left: '0', top: 0, bottom: 0, zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2px' }}>
            <button className="range_change_button ostylowany" onClick={() => setOctaves(p => ({ ...p, start: Math.max(0, p.start - 1) }))}>+</button>
            <button className="range_change_button ostylowany" onClick={() => setOctaves(p => ({ ...p, start: Math.min(p.end - 1, p.start + 1) }))}>-</button>
         </div>

         <div className="pianoside" style={{ position: 'absolute', right: '0', top: 0, bottom: 0, zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2px' }}>
            <button className="range_change_button ostylowany" onClick={() => setOctaves(p => ({ ...p, end: Math.min(8, p.end + 1) }))}>+</button>
            <button className="range_change_button ostylowany" onClick={() => setOctaves(p => ({ ...p, end: Math.max(p.start + 1, p.end - 1) }))}>-</button>
         </div>

         <svg preserveAspectRatio="none" viewBox="0 0 679 150" style={{ userSelect: 'none', touchAction: 'none', width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
            <defs>
                <linearGradient id="whitekey_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#eee"></stop>
                    <stop offset="100%" stopColor="white"></stop>
                </linearGradient>
                <linearGradient id="vp_blackkey_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#444"></stop> 
                    <stop offset="100%" stopColor="#111"></stop>
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="transparent"></rect>
            {renderKeyboard()}
         </svg>
      </div>
    </div>
  );
};
