
import React from 'react';
import { AppState, Song, AudioAnalysisResult, Instrument, NoteStatus, LoopRegion, AppSettings, NoteName } from '../types';
import { NOTES_ORDER } from '../constants';
import SheetMusic from '../components/SheetMusic';
import Fretboard from '../components/Fretboard';
import PianoKey from '../components/PianoKey';

interface GameScreenProps {
    setAppState: (state: AppState) => void;
    currentSong: Song;
    playbackSpeed: number;
    setPlaybackSpeed: (speed: number) => void;
    score: number;
    selectedInstrument: Instrument;
    currentInput: AudioAnalysisResult;
    waitingNote: string | null;
    isPlaying: boolean;
    currentTimeInBeats: number;
    noteResults: Map<number, NoteStatus>;
    loopRegion: LoopRegion;
    setLoopRegion: React.Dispatch<React.SetStateAction<LoopRegion>>;
    settings: AppSettings;
    isWaiting: boolean;
}

const GameScreen: React.FC<GameScreenProps> = ({
    setAppState, currentSong, playbackSpeed, setPlaybackSpeed, score,
    selectedInstrument, currentInput, waitingNote, isPlaying, currentTimeInBeats,
    noteResults, loopRegion, setLoopRegion, settings, isWaiting
}) => {
  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
       {/* TOP BAR */}
       <div className="h-16 flex items-center justify-between px-6 bg-gray-800 border-b border-gray-700 shrink-0 z-20">
           <button onClick={() => setAppState(AppState.MENU)} className="text-gray-400 hover:text-white font-bold flex items-center gap-2">
               ← Exit
           </button>
           <div className="text-center">
               <h2 className="font-bold text-lg">{currentSong.title}</h2>
               <p className="text-xs text-gray-400">{currentSong.artist}</p>
           </div>
           <div className="flex items-center gap-4">
               {/* Tempo Control */}
               <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full">
                   <span className="text-xs font-mono text-gray-400">SPD</span>
                   <input 
                     type="range" min="0.5" max="1.5" step="0.1" 
                     value={playbackSpeed} 
                     onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                     className="w-20 accent-blue-500 h-1"
                   />
                   <span className="text-xs font-mono w-8 text-right">{Math.round(playbackSpeed * 100)}%</span>
               </div>
               <div className="font-mono text-blue-400 text-xl">{score}</div>
           </div>
       </div>

       {/* MAIN AREA */}
       <div className="flex-1 relative flex flex-col">
           {/* Visualizer Area */}
           <div className="flex-1 relative bg-gray-900/50">
               {selectedInstrument === Instrument.GUITAR ? (
                   <div className="absolute inset-0 flex items-center justify-center p-8">
                       <Fretboard currentInput={currentInput} targetNote={waitingNote ? { note: waitingNote.slice(0,-1) as NoteName, octave: parseInt(waitingNote.slice(-1)) } : null} />
                   </div>
               ) : (
                   <SheetMusic 
                        songNotes={currentSong.notes || []} 
                        currentTime={currentTimeInBeats} 
                        currentInput={currentInput}
                        results={noteResults}
                        bpm={currentSong.bpm}
                        isPlaying={isPlaying}
                        loopRegion={loopRegion}
                   />
               )}
               
               {/* WAIT OVERLAY */}
               {isWaiting && waitingNote && (
                   <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-500/10 text-yellow-400 px-4 py-1 rounded-full border border-yellow-500/50 text-sm font-bold animate-pulse backdrop-blur-md flex items-center gap-2">
                       <span>Waiting for {waitingNote}</span>
                   </div>
               )}
           </div>
           
           {/* PRACTICE LOOP CONTROLS */}
           <div className="h-12 bg-gray-800/80 border-t border-gray-700 flex items-center px-4 gap-4 shrink-0 backdrop-blur">
               <span className="text-xs font-bold text-gray-400 uppercase">Loop</span>
               <input 
                 type="checkbox" 
                 checked={loopRegion.active} 
                 onChange={e => setLoopRegion(p => ({ ...p, active: e.target.checked }))}
                 className="w-4 h-4 accent-blue-500"
               />
               <input 
                 type="range" 
                 min="0" 
                 max={currentSong.notes?.length > 0 ? currentSong.notes[currentSong.notes.length - 1].startTime + 10 : 30} 
                 value={loopRegion.start} 
                 onChange={e => setLoopRegion(p => ({ ...p, start: parseFloat(e.target.value) }))}
                 className="flex-1 accent-blue-500 h-1"
                 disabled={!loopRegion.active}
               />
               <input 
                 type="range" 
                 min="0" 
                 max={currentSong.notes?.length > 0 ? currentSong.notes[currentSong.notes.length - 1].startTime + 10 : 30} 
                 value={loopRegion.end} 
                 onChange={e => setLoopRegion(p => ({ ...p, end: parseFloat(e.target.value) }))}
                 className="flex-1 accent-blue-500 h-1"
                 disabled={!loopRegion.active}
               />
           </div>

           {/* PIANO / INPUT AREA - Fixed Height 33% */}
           {selectedInstrument === Instrument.PIANO && (
               <div className="h-[33vh] w-full bg-[#1a1a1a] relative shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t-4 border-[#3a3a3a] flex items-end justify-center overflow-hidden">
                   {/* Wood texture background */}
                   <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url(https://www.transparenttextures.com/patterns/wood-pattern.png)' }} />
                   
                   <div className="relative flex h-full w-full max-w-[1600px] mx-auto px-4 pb-1">
                      {/* RENDER 3 OCTAVES (3, 4, 5) */}
                      {[3, 4, 5].map(octave => 
                          NOTES_ORDER.map((note) => {
                              const isBlack = note.includes('#');
                              const noteStr = `${note}${octave}`;
                              
                              const isActiveTarget = isWaiting && waitingNote === noteStr;
                              const isUserInput = currentInput.note === note && currentInput.octave === octave;

                              // Don't render black keys in the flex flow, render them absolutely on top
                              if (isBlack) return null;

                              return (
                                  <div key={noteStr} className="flex-1 relative h-full">
                                      {/* White Key */}
                                      <PianoKey 
                                          note={note} 
                                          isBlack={false} 
                                          isTarget={isActiveTarget && !isBlack}
                                          isInput={isUserInput && !isBlack}
                                          label={settings.showNoteLabels ? note : undefined}
                                          className="w-full h-full"
                                      />
                                      
                                      {/* Check for Black Key to the right */}
                                      {['C','D','F','G','A'].includes(note) && (
                                          <div className="absolute top-0 right-0 w-0 h-full z-20 overflow-visible">
                                              <PianoKey
                                                  note={note === NoteName.C ? NoteName.Cs : note === NoteName.D ? NoteName.Ds : note === NoteName.F ? NoteName.Fs : note === NoteName.G ? NoteName.Gs : NoteName.As}
                                                  isBlack={true}
                                                  isTarget={(isWaiting && waitingNote === `${note}#${octave}`) || (isWaiting && waitingNote === `${note === NoteName.A ? 'A#' : note === NoteName.C ? 'C#' : note === NoteName.D ? 'D#' : note === NoteName.F ? 'F#' : 'G#'}${octave}`)}
                                                  isInput={currentInput.note === `${note}#` as NoteName && currentInput.octave === octave}
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
    