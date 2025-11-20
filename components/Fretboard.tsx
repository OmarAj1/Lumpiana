
import React from 'react';
import { AudioAnalysisResult, NoteName } from '../types';
import { audioEngine } from '../services/audioEngine';

interface FretboardProps {
  currentInput: AudioAnalysisResult;
  targetNote?: { note: NoteName, octave: number } | null;
}

const Fretboard: React.FC<FretboardProps> = ({ currentInput, targetNote }) => {
  // 6 Strings
  const STRINGS = 6;
  const FRETS = 12;

  // Calculate active positions
  let activePositions: {s: number, f: number, type: 'user' | 'target'}[] = [];

  // User Input
  if (currentInput.activeNotes && currentInput.activeNotes.length > 0) {
    currentInput.activeNotes.forEach(note => {
        const pos = audioEngine.getGuitarPosition(note.note, note.octave);
        if (pos) activePositions.push({ s: pos.stringIdx, f: pos.fret, type: 'user' });
    });
  }

  // Target Note (Guide)
  if (targetNote) {
    const pos = audioEngine.getGuitarPosition(targetNote.note, targetNote.octave);
    if (pos) activePositions.push({ s: pos.stringIdx, f: pos.fret, type: 'target' });
  }

  return (
    <div className="relative w-full h-48 bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-700 select-none">
       {/* Wood Texture / Gradient */}
       <div className="absolute inset-0 bg-gradient-to-b from-amber-900 to-amber-950 opacity-80" />
       
       {/* Frets (Vertical Lines) */}
       <div className="absolute inset-0 flex">
          {Array.from({ length: FRETS }).map((_, i) => (
             <div key={i} className="flex-1 border-r border-gray-400/50 relative">
                {/* Fret Markers (Dots) */}
                {[2, 4, 6, 8].includes(i) && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white/20" />
                )}
                {i === 11 && ( // 12th fret double dot
                    <>
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white/20" />
                    <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white/20" />
                    </>
                )}
                 <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-white/30 font-mono">{i+1}</span>
             </div>
          ))}
       </div>

       {/* Strings (Horizontal Lines) */}
       <div className="absolute inset-0 flex flex-col justify-around py-4">
          {Array.from({ length: STRINGS }).map((_, i) => (
             <div key={i} className="w-full relative">
                {/* String Line */}
                <div 
                  className="w-full bg-gradient-to-r from-gray-400 to-gray-600 shadow-sm" 
                  style={{ height: `${1 + i * 0.5}px` }} 
                />
             </div>
          ))}
       </div>

       {/* Active Note Indicators */}
       <div className="absolute inset-0 flex flex-col justify-around py-4 pointer-events-none">
          {Array.from({ length: STRINGS }).map((_, sIdx) => (
             <div key={sIdx} className="w-full relative h-[2px] flex">
                {Array.from({ length: FRETS }).map((_, fIdx) => {
                    const active = activePositions.find(p => p.s === sIdx && p.f === fIdx);
                    
                    if (!active) return <div key={fIdx} className="flex-1" />;

                    const isTarget = active.type === 'target';
                    const isUser = active.type === 'user';
                    
                    // If both happen at same spot, show success color
                    const colorClass = (activePositions.some(p => p.s === sIdx && p.f === fIdx && p.type === 'target') && 
                                        activePositions.some(p => p.s === sIdx && p.f === fIdx && p.type === 'user'))
                                        ? 'bg-green-400 shadow-[0_0_15px_#4ade80]'
                                        : isTarget ? 'bg-amber-400 animate-pulse shadow-[0_0_15px_#fbbf24]' : 'bg-violet-400 shadow-[0_0_15px_#a78bfa]';

                    return (
                        <div key={fIdx} className="flex-1 relative">
                             <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full ${colorClass} z-20 transition-all duration-100`}>
                                {/* Inner glow */}
                                <div className="absolute inset-1 bg-white/40 rounded-full blur-[1px]" />
                             </div>
                        </div>
                    );
                })}
             </div>
          ))}
       </div>
       
       {/* Open Strings Area (Left side) */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-black/50 border-r-4 border-gray-400" />

    </div>
  );
};

export default Fretboard;
