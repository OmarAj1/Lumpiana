
import React, { useRef, useEffect, useState } from 'react';
import { AppState, NoteName } from '../types';
import { useAudioPoll } from '../hooks/useAudioPoll';
import { NOTES_ORDER } from '../constants';
import PianoKey from '../components/PianoKey';

interface JamScreenProps {
    setAppState: (state: AppState) => void;
    jamMood: string;
}

const JamScreen: React.FC<JamScreenProps> = ({ setAppState }) => {
  const currentInput = useAudioPoll();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chordHistory, setChordHistory] = useState<string[]>([]);
  
  // Update chord history when a new stable chord appears
  useEffect(() => {
    if (currentInput.chordName) {
        setChordHistory(prev => {
            if (prev[0] === currentInput.chordName) return prev; // Dedup consecutive
            return [currentInput.chordName!, ...prev].slice(0, 5);
        });
    }
  }, [currentInput.chordName]);

  // Visualizer Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        // Draw Spectrum
        if (currentInput.spectrum) {
            const barWidth = width / currentInput.spectrum.length;
            const centerY = height / 2;
            
            // Mirror Effect
            currentInput.spectrum.forEach((val, i) => {
                const barHeight = val * height * 1.5; // Scale up
                
                // Fancy Gradient based on height
                const hue = 200 + (val * 160); // Blue to Red
                ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
                
                // Top Bar
                ctx.fillRect(i * barWidth, centerY - barHeight / 2, barWidth - 2, barHeight / 2);
                
                // Reflection (Bottom)
                ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.3)`;
                ctx.fillRect(i * barWidth, centerY, barWidth - 2, barHeight / 2);
            });
        }
        animId = requestAnimationFrame(render);
    };

    // Handle Resize
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();
    render();

    return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', resize);
    };
  }, [currentInput.spectrum]);

  return (
      <div className="h-screen flex flex-col bg-black text-white relative overflow-hidden">
          {/* Back Button */}
          <button 
            onClick={() => setAppState(AppState.MENU)} 
            className="absolute top-6 left-6 z-50 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors font-bold text-sm"
          >
              ← Back to Menu
          </button>

          {/* Visualizer Background */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />

          {/* Main Content Overlay */}
          <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-8 space-y-12">
              
              {/* Chord Display */}
              <div className="text-center space-y-4">
                  <div className={`transition-all duration-300 ${currentInput.chordName ? 'scale-100 opacity-100' : 'scale-95 opacity-50'}`}>
                    <h2 className="text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-purple-600 drop-shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                        {currentInput.chordName || "Play..."}
                    </h2>
                  </div>
                  <div className="h-8">
                     {currentInput.activeNotes.length > 0 && (
                         <div className="flex gap-2 justify-center">
                             {currentInput.activeNotes.map((n, i) => (
                                 <span key={i} className="px-3 py-1 bg-white/10 rounded-full font-mono text-sm border border-white/20">
                                     {n.note}{n.octave}
                                 </span>
                             ))}
                         </div>
                     )}
                  </div>
              </div>

              {/* Chord History */}
              <div className="flex gap-4 opacity-60">
                  {chordHistory.slice(1).map((chord, i) => (
                      <span key={i} className="text-xl font-bold text-gray-500">{chord}</span>
                  ))}
              </div>
          </div>

          {/* Keyboard Visualizer (Non-Interactive) */}
          <div className="h-[25vh] w-full bg-zinc-900/80 backdrop-blur-lg border-t border-white/10 flex items-end justify-center relative z-20 pb-0">
               <div className="relative flex h-full w-full max-w-5xl mx-auto px-4">
                  {[3, 4, 5].map(octave => 
                      NOTES_ORDER.map((note) => {
                          const isBlack = note.includes('#');
                          // Check if this specific key is pressed
                          const isActive = currentInput.activeNotes.some(n => n.note === note && n.octave === octave);

                          if (isBlack) return null;
                          
                          let blackKeyNote: NoteName | null = null;
                          if (note === NoteName.C) blackKeyNote = NoteName.Cs;
                          if (note === NoteName.D) blackKeyNote = NoteName.Ds;
                          if (note === NoteName.F) blackKeyNote = NoteName.Fs;
                          if (note === NoteName.G) blackKeyNote = NoteName.Gs;
                          if (note === NoteName.A) blackKeyNote = NoteName.As;

                          const isBlackActive = blackKeyNote ? currentInput.activeNotes.some(n => n.note === blackKeyNote && n.octave === octave) : false;

                          return (
                              <div key={`${note}${octave}`} className="flex-1 relative h-full">
                                  <PianoKey 
                                      note={note} isBlack={false} 
                                      isTarget={false}
                                      isInput={isActive} // Light up on input
                                      className="w-full h-full"
                                  />
                                  {blackKeyNote && (
                                      <div className="absolute top-0 right-0 w-0 h-full z-20 overflow-visible">
                                          <PianoKey
                                              note={blackKeyNote}
                                              isBlack={true}
                                              isTarget={false}
                                              isInput={isBlackActive} // Light up on input
                                          />
                                      </div>
                                  )}
                              </div>
                          );
                      })
                  )}
               </div>
               {/* Fade Overlay for edges */}
               <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black via-transparent to-black" />
          </div>
      </div>
  );
};

export default JamScreen;
