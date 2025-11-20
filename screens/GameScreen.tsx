
import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { audioEngine } from '../services/audioEngine';
import { AppState, NoteStatus, LoopRegion, NoteName, AudioAnalysisResult } from '../types';
import { NOTES_ORDER } from '../constants';
import SheetMusic from '../components/SheetMusic';
import Fretboard from '../components/Fretboard';
import PianoKey from '../components/PianoKey';
import { getFeedback, speakText } from '../services/geminiService';
import { authService } from '../services/authService';
import { STAR_THRESHOLDS } from '../constants';

interface GameScreenProps {
  // Remove props, use Context
}

const GameScreen: React.FC<GameScreenProps> = () => {
  const { 
    currentSong, settings, setAppState, 
    selectedInstrument, currentUser, setCurrentUser 
  } = useGame();

  // Local Game State (things that change rarely or need re-render)
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(settings.defaultSpeed);
  const [score, setScore] = useState(0);
  const [loopRegion, setLoopRegion] = useState<LoopRegion>({ 
      start: 0, end: 4, active: settings.enableLooping 
  });
  
  // High-Freq Data (Refs)
  const [currentTimeInBeats, setCurrentTimeInBeats] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);
  const [waitingNote, setWaitingNote] = useState<string | null>(null);
  
  // Direct Audio Data (No State!)
  const currentInputRef = useRef<AudioAnalysisResult>({ activeNotes: [], volume: 0, snr: 0, clarity: 0, source: 'none' });
  
  const noteResultsRef = useRef<Map<number, NoteStatus>>(new Map());
  // We still need to force render when results change for visualizer
  const [, setTick] = useState(0); 

  const playedBackingChordsRef = useRef<Set<number>>(new Set());
  const consecutiveHitFramesRef = useRef(0);
  const currentTimeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const animationFrameRef = useRef(0);

  // Init
  useEffect(() => {
      noteResultsRef.current = new Map();
      currentTimeRef.current = 0;
      setScore(0);
      lastFrameTimeRef.current = performance.now();
  }, [currentSong]);

  // Main Game Loop (Combined Audio + Logic)
  useEffect(() => {
      const loop = () => {
          const now = performance.now();
          const dt = (now - lastFrameTimeRef.current) / 1000;
          lastFrameTimeRef.current = now;

          // 1. POLL AUDIO ENGINE DIRECTLY
          currentInputRef.current = audioEngine.analyze();
          
          // 2. GAME LOGIC
          if (isPlaying) {
              const effectiveBpm = currentSong.bpm * playbackSpeed;
              let newTime = currentTimeRef.current + (dt * (effectiveBpm / 60));

              // Loop
              if (loopRegion.active && newTime >= loopRegion.end) {
                  newTime = loopRegion.start;
                  currentSong.notes.forEach((n, i) => {
                      if (n.startTime >= loopRegion.start && n.startTime < loopRegion.end) {
                          noteResultsRef.current.delete(i);
                      }
                  });
                  playedBackingChordsRef.current.clear();
                  setTick(t => t + 1);
              }

              // Backing Track
              if (currentSong.backingTrack) {
                  currentSong.backingTrack.forEach((event, index) => {
                      if (newTime >= event.startTime && !playedBackingChordsRef.current.has(index)) {
                          audioEngine.playBackingTrackChord(event.notes, event.duration * (60/effectiveBpm));
                          playedBackingChordsRef.current.add(index);
                      }
                  });
              }

              // Note Hit Logic
              let lockTime = false;
              let targetNoteLabel: string | null = null;

              for (let i = 0; i < currentSong.notes.length; i++) {
                  const note = currentSong.notes[i];
                  if (noteResultsRef.current.get(i) === NoteStatus.CORRECT) continue;

                  if (newTime >= note.startTime) {
                      // Check if ANY detected note matches target
                      const hit = currentInputRef.current.activeNotes.some(detected => 
                          detected.note === note.note && detected.octave === note.octave
                      );

                      if (hit) {
                          consecutiveHitFramesRef.current++;
                      } else {
                          consecutiveHitFramesRef.current = 0;
                      }

                      if (hit && consecutiveHitFramesRef.current >= 1) {
                          noteResultsRef.current.set(i, NoteStatus.CORRECT);
                          setScore(s => s + 100);
                          if (note.lyrics && settings.enableTTS) speakText(note.lyrics);
                          setTick(t => t + 1);
                          lockTime = false;
                      } else {
                          // Lock
                          newTime = note.startTime;
                          targetNoteLabel = `${note.note}${note.octave}`;
                          noteResultsRef.current.set(i, NoteStatus.HINTED);
                          lockTime = true;
                          break; // Stop checking future notes
                      }
                  }
              }

              currentTimeRef.current = newTime;
              setCurrentTimeInBeats(newTime);
              setIsWaiting(lockTime);
              setWaitingNote(targetNoteLabel);
              
              // End Condition
              const lastNote = currentSong.notes[currentSong.notes.length-1];
              if (lastNote && newTime > lastNote.startTime + lastNote.duration + 1 && !loopRegion.active) {
                  finishLesson();
                  return;
              }
          }

          animationFrameRef.current = requestAnimationFrame(loop);
      };
      
      animationFrameRef.current = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isPlaying, currentSong, playbackSpeed, loopRegion]);

  const finishLesson = async () => {
      setIsPlaying(false);
      // Calc stats...
      // Update User via Context...
      setAppState(AppState.FEEDBACK);
  };

  // Helper to extract primary note for visualizer (monophonic fallback for UI)
  const primaryInput = currentInputRef.current.activeNotes[0] || { note: null, octave: null };
  const inputForVis: AudioAnalysisResult = {
      ...currentInputRef.current,
      // @ts-ignore compatible struct
      note: primaryInput.note,
      octave: primaryInput.octave
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
       {/* TOP BAR */}
       <div className="h-16 flex items-center justify-between px-6 bg-gray-800 border-b border-gray-700 shrink-0 z-20">
           <button onClick={() => setAppState(AppState.MENU)} className="text-gray-400 hover:text-white font-bold flex items-center gap-2">
               ← Exit
           </button>
           <div className="text-center">
               <h2 className="font-bold text-lg">{currentSong.title}</h2>
               <p className="text-xs text-gray-400">{currentSong.artist} {currentSong.keySignature ? `(${currentSong.keySignature})` : ''}</p>
           </div>
           <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full">
                   <span className="text-xs font-mono text-gray-400">SPD</span>
                   <input 
                     type="range" min="0.5" max="1.5" step="0.1" 
                     value={playbackSpeed} 
                     onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                     className="w-20 accent-blue-500 h-1"
                   />
               </div>
               <div className="font-mono text-blue-400 text-xl">{score}</div>
           </div>
       </div>

       {/* MAIN AREA */}
       <div className="flex-1 relative flex flex-col">
           <div className="flex-1 relative bg-gray-900/50">
                {/* We pass the REF current value to children who need to query it, 
                    OR we force update via key if needed. 
                    For smooth 60fps visualizer, SheetMusic should ALSO allow ref based input 
                    but for now we pass the state that updates 60fps via the loop above 
                    Wait, we aren't updating state 60fps above. 
                    We need SheetMusic to pull data or we pass it.
                    Actually, passing it as prop works if Parent re-renders. 
                    BUT we want to avoid parent re-render.
                    So SheetMusic should use useGame() or direct audio query?
                    Ideally SheetMusic accepts a ref or we pass the raw object and forceUpdate child.
                    For this refactor, I'll pass the derived object but use a separate Raf inside SheetMusic?
                    No, let's pass the object, but we rely on the fact that 'setTick' or 'setCurrentTimeInBeats' 
                    triggers the render.
                    'setCurrentTimeInBeats' is happening 60fps. So GameScreen IS re-rendering 60fps.
                    To optimize: Move 'SheetMusic' logic to use a ref and its own loop, 
                    and GameScreen only updates 'score' etc.
                */}
               <SheetMusic 
                    songNotes={currentSong.notes} 
                    currentTime={currentTimeInBeats} 
                    currentInput={inputForVis} // This is now updating 60fps
                    results={noteResultsRef.current}
                    bpm={currentSong.bpm}
                    isPlaying={isPlaying}
                    loopRegion={loopRegion}
                    settings={settings}
               />
               
               {isWaiting && waitingNote && (
                   <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-500/10 text-yellow-400 px-4 py-1 rounded-full border border-yellow-500/50 text-sm font-bold animate-pulse backdrop-blur-md">
                       Waiting for {waitingNote}
                   </div>
               )}
           </div>
           
           <div className="h-12 bg-gray-800/80 border-t border-gray-700 flex items-center px-4 gap-4 shrink-0 backdrop-blur">
               <span className="text-xs font-bold text-gray-400 uppercase">Loop</span>
               <input type="checkbox" checked={loopRegion.active} onChange={e => setLoopRegion(p => ({ ...p, active: e.target.checked }))} className="w-4 h-4 accent-blue-500" />
               <input type="range" min="0" max={currentSong.notes[currentSong.notes.length-1]?.startTime || 30} value={loopRegion.start} onChange={e => setLoopRegion(p => ({ ...p, start: parseFloat(e.target.value) }))} className="flex-1 accent-blue-500 h-1" />
               <input type="range" min="0" max={currentSong.notes[currentSong.notes.length-1]?.startTime || 30} value={loopRegion.end} onChange={e => setLoopRegion(p => ({ ...p, end: parseFloat(e.target.value) }))} className="flex-1 accent-blue-500 h-1" />
           </div>

           <div className="h-[33vh] w-full bg-[#1a1a1a] relative shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t-4 border-[#3a3a3a] flex items-end justify-center overflow-hidden">
               <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url(https://www.transparenttextures.com/patterns/wood-pattern.png)' }} />
               <div className="relative flex h-full w-full max-w-[1600px] mx-auto px-4 pb-1">
                  {[3, 4, 5].map(octave => 
                      NOTES_ORDER.map((note) => {
                          const isBlack = note.includes('#');
                          const noteStr = `${note}${octave}`;
                          const isActiveTarget = isWaiting && waitingNote === noteStr;
                          // Polyphonic Check
                          const isUserInput = currentInputRef.current.activeNotes.some(n => n.note === note && n.octave === octave);

                          if (isBlack) return null;
                          return (
                              <div key={noteStr} className="flex-1 relative h-full">
                                  <PianoKey 
                                      note={note} isBlack={false} 
                                      isTarget={isActiveTarget && !isBlack}
                                      isInput={isUserInput && !isBlack}
                                      label={settings.showNoteLabels ? note : undefined}
                                      className="w-full h-full"
                                  />
                                  {['C','D','F','G','A'].includes(note) && (
                                      <div className="absolute top-0 right-0 w-0 h-full z-20 overflow-visible">
                                          <PianoKey
                                              note={note === NoteName.C ? NoteName.Cs : note === NoteName.D ? NoteName.Ds : note === NoteName.F ? NoteName.Fs : note === NoteName.G ? NoteName.Gs : NoteName.As}
                                              isBlack={true}
                                              isTarget={waitingNote?.startsWith(`${note}#`) || false} // Simplified
                                              isInput={currentInputRef.current.activeNotes.some(n => n.note === `${note}#` && n.octave === octave)}
                                          />
                                      </div>
                                  )}
                              </div>
                          );
                      })
                  )}
               </div>
           </div>
       </div>
    </div>
  );
};

export default GameScreen;
