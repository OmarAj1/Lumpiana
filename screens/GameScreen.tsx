
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '../contexts/GameContext';
import { audioEngine } from '../services/audioEngine';
import { AppState, NoteStatus, LoopRegion, NoteName, AudioAnalysisResult, DetectedNote } from '../types';
import { NOTES_ORDER, STAR_THRESHOLDS, NOTE_FREQUENCIES } from '../constants';
import SheetMusic from '../components/SheetMusic';
import PianoKey from '../components/PianoKey';
import { speakText } from '../services/geminiService';
import { authService } from '../services/authService';
import { VirtualPiano } from '../components/VirtualPiano'; 

const GameScreen: React.FC = () => {
  const { 
    currentSong, settings, setAppState, 
    currentUser, setCurrentUser, setLastSessionStats
  } = useGame();

  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(settings.defaultSpeed);
  
  // NEW SCORING: Track count of correct notes instead of raw points
  const [correctCount, setCorrectCount] = useState(0);
  const [misses, setMisses] = useState(0); 
  
  const [loopRegion, setLoopRegion] = useState<LoopRegion>({ 
      start: 0, end: 4, active: settings.enableLooping 
  });
  
  const [currentTimeInBeats, setCurrentTimeInBeats] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);
  const [waitingNoteLabel, setWaitingNoteLabel] = useState<string | null>(null);
  
  const currentInputRef = useRef<AudioAnalysisResult>({ 
      activeNotes: [], volume: 0, snr: 0, clarity: 0, harmonicity: 0, spectralCentroid: 0, source: 'none' 
  });
  
  const noteResultsRef = useRef<Map<number, NoteStatus>>(new Map());
  const [, setTick] = useState(0); 

  const playedBackingChordsRef = useRef<Set<number>>(new Set());
  const currentTimeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const animationFrameRef = useRef(0);
  const waitingTimeRef = useRef(0); 

  // --- VIRTUAL PIANO STATE ---
  const virtualNotesRef = useRef<Set<number>>(new Set());

  const handleVirtualNoteOn = useCallback((midi: number) => {
    virtualNotesRef.current.add(midi);
  }, []);

  const handleVirtualNoteOff = useCallback((midi: number) => {
    virtualNotesRef.current.delete(midi);
  }, []);

  useEffect(() => {
      if (!currentSong.notes) {
          setAppState(AppState.MENU);
          return;
      }
      noteResultsRef.current = new Map();
      currentTimeRef.current = 0;
      setCorrectCount(0);
      setMisses(0);
      virtualNotesRef.current.clear();
      lastFrameTimeRef.current = performance.now();
  }, [currentSong, setAppState]); 

  useEffect(() => {
      const loop = () => {
          const now = performance.now();
          const dt = (now - lastFrameTimeRef.current) / 1000;
          lastFrameTimeRef.current = now;

          // 1. Get Audio Input
          const audioAnalysis = audioEngine.analyze();
          
          // 2. Merge Virtual Piano Inputs
          const virtualDetected: DetectedNote[] = [];
          virtualNotesRef.current.forEach(midi => {
              virtualDetected.push({
                  note: NOTES_ORDER[midi % 12],
                  octave: Math.floor(midi / 12) - 1,
                  cents: 0,
                  frequency: 440 * Math.pow(2, (midi - 69) / 12),
                  confidence: 1.0,
                  midi: midi
              });
          });

          // Combine microphone/midi notes with virtual screen notes
          currentInputRef.current = {
              ...audioAnalysis,
              activeNotes: [...audioAnalysis.activeNotes, ...virtualDetected],
              // If virtual keys are pressed, consider input source valid for gameplay
              source: virtualDetected.length > 0 ? 'midi' : audioAnalysis.source 
          };
          
          if (isPlaying && currentSong?.notes && currentSong.notes.length > 0) {
              const effectiveBpm = currentSong.bpm * playbackSpeed;
              const beatDelta = dt * (effectiveBpm / 60);
              
              let proposedTime = currentTimeRef.current + beatDelta;

              if (loopRegion.active && proposedTime >= loopRegion.end) {
                  proposedTime = loopRegion.start;
                  currentSong.notes.forEach((n, i) => {
                      if (n.startTime >= loopRegion.start && n.startTime < loopRegion.end) {
                          noteResultsRef.current.delete(i);
                      }
                  });
                  playedBackingChordsRef.current.clear();
                  setTick(t => t + 1);
              }

              if (currentSong.backingTrack) {
                  currentSong.backingTrack.forEach((event, index) => {
                      if (proposedTime >= event.startTime && !playedBackingChordsRef.current.has(index)) {
                          audioEngine.playBackingTrackChord(event.notes, event.duration * (60/effectiveBpm));
                          playedBackingChordsRef.current.add(index);
                      }
                  });
              }
              
              let blockingNoteIndex = -1;
              for (let i = 0; i < currentSong.notes.length; i++) {
                  const status = noteResultsRef.current.get(i);
                  if (status !== NoteStatus.CORRECT && status !== NoteStatus.MISSED) {
                      blockingNoteIndex = i;
                      break;
                  }
              }

              let shouldLockTime = false;
              let displayLabel = "";

              if (blockingNoteIndex !== -1) {
                  const targetNote = currentSong.notes[blockingNoteIndex];
                  
                  if (proposedTime >= targetNote.startTime) {
                      const concurrentIndices = [blockingNoteIndex];
                      for (let k = blockingNoteIndex + 1; k < currentSong.notes.length; k++) {
                          if (Math.abs(currentSong.notes[k].startTime - targetNote.startTime) < 0.05) {
                              concurrentIndices.push(k);
                          } else {
                              break; 
                          }
                      }

                      let allSatisfied = true;
                      const noteLabels: string[] = [];

                      concurrentIndices.forEach(idx => {
                          const noteObj = currentSong.notes[idx];
                          noteLabels.push(`${noteObj.note}${noteObj.octave}`);
                          
                          if (noteResultsRef.current.get(idx) === NoteStatus.CORRECT) return;

                          // CHECK INPUT (Merged Audio + Virtual)
                          const isHit = currentInputRef.current.activeNotes.some(
                              detected => detected.note === noteObj.note && detected.octave === noteObj.octave
                          );
                          
                          if (isHit) {
                              noteResultsRef.current.set(idx, NoteStatus.CORRECT);
                              // Increment count of correct notes
                              setCorrectCount(c => c + 1);
                              if (noteObj.lyrics && settings.enableTTS) speakText(noteObj.lyrics);
                          } else {
                              allSatisfied = false;
                              noteResultsRef.current.set(idx, NoteStatus.HINTED);
                          }
                      });

                      displayLabel = noteLabels.join(" + ");

                      if (!allSatisfied) {
                          if (settings.flowMode) {
                              waitingTimeRef.current += dt;
                              if (waitingTimeRef.current > 0.5) { 
                                  concurrentIndices.forEach(idx => {
                                      if (noteResultsRef.current.get(idx) !== NoteStatus.CORRECT) {
                                          noteResultsRef.current.set(idx, NoteStatus.MISSED);
                                          setMisses(m => m + 1);
                                      }
                                  });
                                  waitingTimeRef.current = 0;
                                  setTick(t => t + 1);
                              }
                          } else {
                              proposedTime = targetNote.startTime; 
                              shouldLockTime = true;
                              waitingTimeRef.current += dt;
                          }
                      } else {
                          waitingTimeRef.current = 0;
                          setTick(t => t + 1);
                      }
                  }
              }

              currentTimeRef.current = proposedTime;
              setCurrentTimeInBeats(proposedTime);
              setIsWaiting(shouldLockTime);
              setWaitingNoteLabel(shouldLockTime ? displayLabel : null);

              const lastNote = currentSong.notes[currentSong.notes.length-1];
              if (lastNote && proposedTime > lastNote.startTime + lastNote.duration + 1 && !loopRegion.active) {
                  finishLesson();
                  return;
              }
          }

          animationFrameRef.current = requestAnimationFrame(loop);
      };
      
      animationFrameRef.current = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isPlaying, currentSong, playbackSpeed, loopRegion, settings.flowMode, settings.enableTTS, setAppState, currentUser, setCurrentUser, setLastSessionStats]); 

  const finishLesson = async () => {
      setIsPlaying(false);
      
      const totalNotes = currentSong.notes ? currentSong.notes.length : 1;
      // Calculate Percentage Score (0 - 100)
      const accuracyPercentage = Math.round((correctCount / totalNotes) * 100);
      
      setLastSessionStats({ score: accuracyPercentage, misses });
      
      if (currentUser) {
          const accuracyRatio = correctCount / totalNotes;
          let stars = 1; // Default to 1 star if completed (Assuming < 75%)
          
          if (accuracyRatio >= STAR_THRESHOLDS.GOLD) {
              stars = 3; // >= 97%
          } else if (accuracyRatio >= STAR_THRESHOLDS.SILVER) {
              stars = 2; // >= 75%
          }

          // XP is calculated based on amount of correct notes played * multiplier
          const xpGained = correctCount * 10;

          const updatedUser = await authService.updateUserProgress(
              currentUser.id, 
              currentSong.id, 
              { stars, highScore: accuracyPercentage }, // Store Percentage as High Score 
              xpGained
          );
          setCurrentUser(updatedUser);
      }
      setAppState(AppState.FEEDBACK);
  };

  const visInput = { ...currentInputRef.current };
  
  // Real-time % Calculation for HUD
  const currentTotal = correctCount + misses;
  const realtimeAccuracy = currentTotal > 0 ? Math.round((correctCount / currentTotal) * 100) : 100;

  return (
    <div className="h-screen flex flex-col bg-surface-primary text-white overflow-hidden relative font-sans">
       
       {/* FLOATING HUD (Dynamic Island Style) */}
       <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6 px-6 py-3 bg-zinc-900/80 dark:bg-surface-glass backdrop-blur-xl rounded-full border border-border-default shadow-2xl">
           <div className="flex flex-col items-center">
               <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Accuracy</span>
               <span className={`text-xl font-mono font-bold ${realtimeAccuracy > 90 ? 'text-green-400' : realtimeAccuracy > 70 ? 'text-yellow-400' : 'text-text-primary'}`}>
                   {realtimeAccuracy}%
               </span>
           </div>
           <div className="w-px h-8 bg-white/10 dark:bg-border-default" />
           <div className="text-center min-w-[120px]">
               <h2 className="font-bold text-sm truncate max-w-[150px]">{currentSong.title}</h2>
               <div className="flex items-center justify-center gap-2 text-xs text-text-secondary mt-1">
                   <span>{Math.round(currentSong.bpm * playbackSpeed)} BPM</span>
                   {visInput.chordName && <span className="text-blue-400 font-bold">| {visInput.chordName}</span>}
               </div>
           </div>
           <div className="w-px h-8 bg-white/10 dark:bg-border-default" />
           <button onClick={() => setAppState(AppState.MENU)} className="w-8 h-8 rounded-full bg-white/10 dark:bg-surface-tertiary hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-colors">
               ✕
           </button>
       </div>

       {/* MAIN CONTENT */}
       <div className="flex-1 relative flex flex-col">
           <div className="flex-1 relative bg-gradient-to-b from-zinc-900 to-black dark:from-surface-secondary dark:to-surface-primary">
               <SheetMusic 
                    songNotes={currentSong?.notes || []} 
                    currentTime={currentTimeInBeats} 
                    currentInput={visInput}
                    results={noteResultsRef.current}
                    bpm={currentSong?.bpm || 60}
                    isPlaying={isPlaying}
                    loopRegion={loopRegion}
                    settings={settings}
               />
               {isWaiting && waitingNoteLabel && (
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                       <div className="px-8 py-4 bg-blue-600 rounded-2xl shadow-glow animate-pulse text-2xl font-bold">
                           Play {waitingNoteLabel}
                       </div>
                   </div>
               )}
           </div>
           
           {/* CONTROL STRIP */}
           <div className="h-10 bg-zinc-900 dark:bg-surface-secondary border-t border-white/5 dark:border-border-default flex items-center px-4 gap-4 shrink-0 justify-center">
               <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Loop Region</span>
               <input type="range" min="0" max={(currentSong?.notes?.[currentSong.notes.length-1]?.startTime) || 30} value={loopRegion.start} onChange={e => setLoopRegion(p => ({ ...p, start: parseFloat(e.target.value) }))} className="w-32 h-1 accent-blue-500 bg-white/10 dark:bg-surface-tertiary rounded-full appearance-none" />
               <input type="range" min="0" max={(currentSong?.notes?.[currentSong.notes.length-1]?.startTime) || 30} value={loopRegion.end} onChange={e => setLoopRegion(p => ({ ...p, end: parseFloat(e.target.value) }))} className="w-32 h-1 accent-blue-500 bg-white/10 dark:bg-surface-tertiary rounded-full appearance-none" />
               <div className={`w-2 h-2 rounded-full ${loopRegion.active ? 'bg-blue-500' : 'bg-gray-600'} cursor-pointer`} onClick={() => setLoopRegion(p => ({ ...p, active: !p.active }))} />
           </div>

           {/* PIANO - RENDER VIRTUAL PIANO OR PIANOKEYS */}
           {settings.enableTouchPiano ? (
               <div className="h-[35vh] w-full bg-[#121214] dark:bg-surface-tertiary relative shrink-0 shadow-[0_-20px_60px_rgba(0,0,0,0.7)] border-t border-white/10 dark:border-border-default flex flex-col justify-end overflow-hidden select-none">
                   <VirtualPiano onNotePlay={handleVirtualNoteOn} onNoteStop={handleVirtualNoteOff} />
               </div>
           ) : (
               <div className="h-[35vh] w-full bg-[#121214] dark:bg-surface-tertiary relative shrink-0 shadow-[0_-20px_60px_rgba(0,0,0,0.7)] border-t border-white/10 dark:border-border-default flex items-end justify-center overflow-hidden select-none">
                   <div className="relative flex h-full w-full max-w-[1400px] mx-auto">
                       {[3, 4, 5].map(octave => 
                           NOTES_ORDER.map((note) => {
                               const isBlack = note.includes('#');
                               const noteStr = `${note}${octave}`;
                               const isTarget = waitingNoteLabel?.includes(noteStr) || false;
                               
                               // Check for Audio Input
                               const isUserInput = visInput.activeNotes.some(n => n.note === note && n.octave === octave);

                               if (isBlack) return null;
                               
                               let blackKeyNote: NoteName | null = null;
                               if (note === NoteName.C) blackKeyNote = NoteName.Cs;
                               if (note === NoteName.D) blackKeyNote = NoteName.Ds;
                               if (note === NoteName.F) blackKeyNote = NoteName.Fs;
                               if (note === NoteName.G) blackKeyNote = NoteName.Gs;
                               if (note === NoteName.A) blackKeyNote = NoteName.As;

                               const blackNoteStr = blackKeyNote ? `${blackKeyNote}${octave}` : '';
                               const isBlackTarget = blackKeyNote ? waitingNoteLabel?.includes(blackNoteStr) : false;
                               const isBlackInput = blackKeyNote ? (visInput.activeNotes.some(n => n.note === blackKeyNote && n.octave === octave)) : false;

                               return (
                                   <div key={noteStr} className="flex-1 relative h-full">
                                       <PianoKey 
                                           note={note} isBlack={false} 
                                           isTarget={isTarget}
                                           isInput={isUserInput}
                                           label={settings.showNoteLabels ? note : undefined}
                                           className="w-full h-full"
                                           interactive={true} // Always interactive for this mode
                                           octave={octave}
                                           useAppPianoSound={true} // Use app's sound for this mode
                                       />
                                       {blackKeyNote && (
                                           <div className="absolute top-0 right-0 w-0 h-full z-20 overflow-visible">
                                               <PianoKey
                                                   note={blackKeyNote}
                                                   isBlack={true}
                                                   isTarget={isBlackTarget || false}
                                                   isInput={isBlackInput || false}
                                                   interactive={true} // Always interactive for this mode
                                                   octave={octave}
                                                   useAppPianoSound={true} // Use app's sound for this mode
                                               />
                                           </div>
                                       )}
                                   </div>
                               );
                           })
                       )}
                   </div>
               </div>
           )}
       </div>
    </div>
  );
};

export default GameScreen;
