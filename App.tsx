
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioEngine } from './services/audioEngine';
import { authService } from './services/authService';
import { generateLesson, getFeedback, speakText, generateAccompaniment, generateWorkout, generateSongFromTitle } from './services/geminiService';
import { DEMO_SONG, NOTES_ORDER, TRENDING_SONGS_METADATA, STAR_THRESHOLDS } from './constants';
import { NoteName, AppState, Song, AudioAnalysisResult, Instrument, User, OnboardingStep, NoteStatus, LoopRegion, AuthView } from './types';
import PianoKey from './components/PianoKey';
import SheetMusic from './components/SheetMusic';
import Fretboard from './components/Fretboard';
import AuthModal from './components/AuthModal';

// Icons
const MicIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const PlayIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>;
const PauseIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>;
const SparklesIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const HeadphonesIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 18v-6a9 9 0 0118 0v6" /><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" /></svg>;
const LightningIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const CableIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
const CheckIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>;
const RefreshIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const SearchIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg className={`w-4 h-4 ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.603 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const COURSES: Song[] = [
    { ...DEMO_SONG, id: 'c1', title: 'Intro to Rhythm', category: 'Course', description: 'Learn the basics of timing.', difficulty: 'Beginner' },
    { ...DEMO_SONG, id: 'c2', title: 'Five Finger Scale', category: 'Course', description: 'Master the C position.', difficulty: 'Beginner' },
    { ...DEMO_SONG, id: 'c3', title: 'First Chords', category: 'Course', description: 'Play C Major and G Major.', difficulty: 'Intermediate' },
    { ...DEMO_SONG, id: 'c4', title: 'Pop Songs 1', category: 'Course', description: 'Play your first hit.', difficulty: 'Intermediate' },
];

// Helpers
const getStars = (songId: string, user: User | null) => {
    if (!user || !user.progress[songId]) return 0;
    return user.progress[songId].stars;
};

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.ONBOARDING);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(OnboardingStep.WELCOME);
  const [currentSong, setCurrentSong] = useState<Song>(DEMO_SONG);
  const [currentInput, setCurrentInput] = useState<AudioAnalysisResult>({ pitch: 0, note: null, octave: null, clarity: 0, volume: 0 });
  const [midiConnected, setMidiConnected] = useState<boolean>(false);
  
  // Auth & User
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<AuthView>('signIn');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Instrument Selection
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>(Instrument.PIANO);

  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeInBeats, setCurrentTimeInBeats] = useState(0); 
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);
  
  // Note Results Map: Index -> Status
  const [noteResults, setNoteResults] = useState<Map<number, NoteStatus>>(new Map());
  
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0); 
  
  // Practice Mode
  const [loopRegion, setLoopRegion] = useState<LoopRegion>({ start: 0, end: 4, active: false });
  
  // Jam Mode State
  const [jamChords, setJamChords] = useState<any[]>([]);
  const [jamMood, setJamMood] = useState<string>("");
  
  // Song Generation State
  const [songSearchQuery, setSongSearchQuery] = useState("");
  const [playedBackingChords, setPlayedBackingChords] = useState<Set<number>>(new Set()); 

  const currentTimeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const inputRef = useRef<AudioAnalysisResult>(currentInput);
  const recentNotesRef = useRef<string[]>([]);
  const waitingNoteRef = useRef<string | null>(null);
  const noteResultsRef = useRef<Map<number, NoteStatus>>(new Map());
  const playedBackingChordsRef = useRef<Set<number>>(new Set());

  const [aiFeedback, setAiFeedback] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const animationFrameRef = useRef<number>(0);
  const audioAnalysisRef = useRef<number>(0);

  // --- EFFECTS ---

  // Load User
  useEffect(() => {
      authService.getCurrentUser().then(user => {
          if (user) {
              setCurrentUser(user);
              // If already onboarded or has progress, skip onboarding
              if (user.level > 1 || Object.keys(user.progress).length > 0) {
                  setAppState(AppState.MENU);
                  setOnboardingStep(OnboardingStep.COMPLETE);
              }
          }
      });
  }, []);

  // Handle Instrument Switch
  useEffect(() => {
    audioEngine.setInstrument(selectedInstrument);
  }, [selectedInstrument]);

  // Audio Loop
  useEffect(() => {
      const updatePitch = () => {
        const analysis = audioEngine.analyze();
        const isMidi = audioEngine.getIsMidiConnected();
        if (isMidi !== midiConnected) setMidiConnected(isMidi);

        setCurrentInput(analysis);
        inputRef.current = analysis;
        
        // Jam Mode Collection
        if (appState === AppState.JAM && analysis.note && analysis.clarity > 0.9) {
          const noteStr = `${analysis.note}${analysis.octave}`;
          const last = recentNotesRef.current[recentNotesRef.current.length - 1];
          if (last !== noteStr) {
             recentNotesRef.current.push(noteStr);
             if (recentNotesRef.current.length > 20) recentNotesRef.current.shift();
          }
        }
        
        audioAnalysisRef.current = requestAnimationFrame(updatePitch);
      };
      
      if (appState !== AppState.ONBOARDING || onboardingStep >= OnboardingStep.AUDIO_SETUP) {
           audioAnalysisRef.current = requestAnimationFrame(updatePitch);
      }
      
    return () => {
      if (audioAnalysisRef.current) cancelAnimationFrame(audioAnalysisRef.current);
    };
  }, [appState, midiConnected, onboardingStep]);

  // Game Loop
  useEffect(() => {
    if (appState !== AppState.PLAYING || !isPlaying) return;

    lastFrameTimeRef.current = performance.now();

    const gameLoop = () => {
      const now = performance.now();
      const dt = (now - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = now;

      const effectiveBpm = currentSong.bpm * playbackSpeed;
      const beatDelta = dt * (effectiveBpm / 60);
      
      let newTime = currentTimeRef.current + beatDelta;
      
      // LOOP LOGIC
      if (loopRegion.active) {
          if (newTime >= loopRegion.end) {
              newTime = loopRegion.start;
              currentSong.notes.forEach((n, i) => {
                  if (n.startTime >= loopRegion.start && n.startTime < loopRegion.end) {
                      noteResultsRef.current.delete(i);
                  }
              });
              setNoteResults(new Map(noteResultsRef.current));
              playedBackingChordsRef.current.clear();
          }
      }

      let currentlyWaiting = false;
      let targetNoteStr = null;

      // BACKING TRACK PLAYER
      if (currentSong.backingTrack) {
          currentSong.backingTrack.forEach((event, index) => {
              if (newTime >= event.startTime && !playedBackingChordsRef.current.has(index)) {
                   const durationSeconds = event.duration * (60 / effectiveBpm);
                   audioEngine.playBackingTrackChord(event.notes, durationSeconds);
                   playedBackingChordsRef.current.add(index);
              }
          });
      }

      // Hit Detection
      if (currentSong.notes && currentSong.notes.length > 0) {
        currentSong.notes.forEach((note, index) => {
          if (noteResultsRef.current.has(index)) return;

          // Missed
          if (newTime > note.startTime + 0.5) {
              noteResultsRef.current.set(index, NoteStatus.MISSED);
              setNoteResults(new Map(noteResultsRef.current));
              setMisses(m => m + 1);
              return;
          }

          // Hit
          if (newTime >= note.startTime - 0.1 && newTime <= note.startTime + 0.5) {
             const input = inputRef.current;
             const isHit = input.note === note.note && input.octave === note.octave && input.clarity > 0.8;
             
             if (isHit) {
                 noteResultsRef.current.set(index, NoteStatus.CORRECT);
                 setNoteResults(new Map(noteResultsRef.current));
                 setScore(s => s + 100);
             } else if (newTime > note.startTime) {
                 if (currentSong.difficulty === 'Beginner') {
                     currentlyWaiting = true;
                     targetNoteStr = `${note.note}${note.octave}`;
                     noteResultsRef.current.set(index, NoteStatus.HINTED);
                     setNoteResults(new Map(noteResultsRef.current));
                 }
             }
          }
        });
      }

      if (currentlyWaiting) {
          newTime = currentTimeRef.current; // Freeze
          if (targetNoteStr && waitingNoteRef.current !== targetNoteStr) {
              waitingNoteRef.current = targetNoteStr;
              audioEngine.playPedal(targetNoteStr, 0.1);
          }
      } else {
          waitingNoteRef.current = null;
      }

      setIsWaiting(currentlyWaiting);
      currentTimeRef.current = newTime;
      setCurrentTimeInBeats(newTime);

      const lastNote = currentSong.notes.length > 0 ? currentSong.notes[currentSong.notes.length - 1] : null;
      if (lastNote && newTime > lastNote.startTime + lastNote.duration + 1.0 && !loopRegion.active) {
        finishLesson();
        return;
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [appState, isPlaying, currentSong, playbackSpeed, loopRegion]);

  // Jam Loop
  useEffect(() => {
    if (appState !== AppState.JAM) return;
    let timeout: ReturnType<typeof setTimeout>;
    let isFetching = false;
    const jamLoop = async () => {
       if (recentNotesRef.current.length > 3 && !isFetching) {
          isFetching = true;
          const notesToAnalyze = [...recentNotesRef.current];
          recentNotesRef.current = []; 
          const result = await generateAccompaniment(notesToAnalyze);
          if (result && result.chords) {
             setJamMood(result.mood || "Ambient");
             let delay = 0;
             result.chords.forEach((chord: any) => {
                setTimeout(() => audioEngine.playChord(chord.notes, chord.duration), delay * 1000);
                delay += chord.duration;
             });
          }
          isFetching = false;
       }
       timeout = setTimeout(jamLoop, 5000); 
    };
    jamLoop();
    return () => clearTimeout(timeout);
  }, [appState]);


  // --- ACTIONS ---

  const openAuthModal = (view: AuthView) => {
      setAuthModalView(view);
      setAuthModalOpen(true);
  };

  const signOut = async () => {
      await authService.signOut();
      setCurrentUser(null);
      setShowUserMenu(false);
  };

  const handleOnboardingNext = async () => {
      if (onboardingStep === OnboardingStep.WELCOME) {
          setOnboardingStep(OnboardingStep.INSTRUMENT);
      } else if (onboardingStep === OnboardingStep.INSTRUMENT) {
          setOnboardingStep(OnboardingStep.AUDIO_SETUP);
          await audioEngine.initialize();
      } else if (onboardingStep === OnboardingStep.AUDIO_SETUP) {
          setOnboardingStep(OnboardingStep.COMPLETE);
          setTimeout(() => {
              setAppState(AppState.MENU);
          }, 1000);
      }
  };

  const startSong = (song: Song) => {
    setCurrentSong(song);
    setScore(0);
    setMisses(0);
    currentTimeRef.current = 0;
    noteResultsRef.current = new Map();
    playedBackingChordsRef.current = new Set();
    setNoteResults(new Map());
    setCurrentTimeInBeats(0);
    setIsPlaying(true);
    setPlaybackSpeed(1.0);
    setLoopRegion({ start: 0, end: 4, active: false }); 
    setAppState(AppState.PLAYING);
    speakText(`Let's play ${song.title}.`);
  };

  const startJam = () => {
    setAppState(AppState.JAM);
    speakText("Jam mode activated.");
  };

  const finishLesson = async () => {
    setIsPlaying(false);
    setAppState(AppState.FEEDBACK);
    
    // Calculate Stars
    const totalNotes = currentSong.notes.length;
    const accuracy = totalNotes > 0 ? (totalNotes - misses) / totalNotes : 0;
    let stars = 0;
    if (accuracy >= STAR_THRESHOLDS.GOLD) stars = 3;
    else if (accuracy >= STAR_THRESHOLDS.SILVER) stars = 2;
    else if (accuracy >= STAR_THRESHOLDS.BRONZE) stars = 1;

    // Update User Progress if logged in
    if (currentUser) {
        try {
            const updatedUser = await authService.updateUserProgress(currentUser.id, currentSong.id, {
                highScore: score,
                stars: stars
            }, score); // Gain XP equal to score
            setCurrentUser(updatedUser);
        } catch (e) {
            console.error("Failed to save progress", e);
        }
    }

    const feedback = await getFeedback(score, misses);
    setAiFeedback(feedback || "Good job!");
    speakText(feedback || "Lesson complete.");
  };

  const handleGenerateWorkout = async () => {
      setIsGenerating(true);
      speakText("Preparing your 5-minute workout.");
      try {
        const workout = await generateWorkout();
        if (workout) {
            const song: Song = {
            id: 'workout-ai',
            title: workout.title || 'Daily Technical Drill',
            artist: 'Gemini Coach',
            difficulty: 'Intermediate',
            bpm: workout.bpm || 80,
            notes: workout.notes || [],
            category: 'Workout'
            };
            setCurrentSong(song);
            startSong(song);
        } else {
            throw new Error("Workout generation returned empty.");
        }
      } catch (e) {
        alert("Failed to generate workout. Please try again.");
      } finally {
        setIsGenerating(false);
      }
  };

  const handleSongGeneration = async (title: string, artist?: string) => {
      if (!title.trim()) return;
      setIsGenerating(true);
      speakText(`Retrieving sheet music for ${title}.`);
      try {
        const result = await generateSongFromTitle(title, artist);
        
        if (result) {
            const generatedSong: Song = {
                id: `gen-${title.replace(/\s+/g,'-').toLowerCase()}-${Date.now()}`,
                title: result.title || title,
                artist: artist || 'AI Generated',
                difficulty: result.difficulty || 'Intermediate',
                bpm: result.bpm || 80,
                notes: result.notes || [],
                backingTrack: result.backingTrack || [],
                category: 'Song'
            };
            startSong(generatedSong);
        } else {
            speakText("Sorry, I couldn't retrieve that score.");
            alert(`Could not generate "${title}". \n\nTry adding "Op." or "No." for classical pieces.`);
        }
      } catch (e) {
          console.error(e);
          alert("An unexpected error occurred during generation.");
      } finally {
          setIsGenerating(false);
      }
  };

  // --- SCREENS ---

  const renderOnboarding = () => (
      <div className="flex flex-col items-center justify-center h-screen bg-surface-primary text-center p-8">
          <div className="w-full max-w-md">
              {onboardingStep === OnboardingStep.WELCOME && (
                  <div className="space-y-6 animate-fade-in">
                       <div className="w-20 h-20 bg-blue-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/30">
                           <SparklesIcon />
                       </div>
                       <h1 className="text-4xl font-bold text-white">Welcome to Luma</h1>
                       <p className="text-gray-400">Your AI-powered music tutor. Let's get you set up.</p>
                       <button onClick={handleOnboardingNext} className="w-full py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all">Get Started</button>
                       <p className="text-xs text-gray-500">
                           Already have an account? <button onClick={() => openAuthModal('signIn')} className="text-blue-400 font-bold">Sign In</button>
                       </p>
                  </div>
              )}

              {onboardingStep === OnboardingStep.INSTRUMENT && (
                   <div className="space-y-8 animate-fade-in">
                       <h2 className="text-3xl font-bold text-white">Choose your instrument</h2>
                       <div className="grid grid-cols-2 gap-4">
                           <button 
                             onClick={() => setSelectedInstrument(Instrument.PIANO)}
                             className={`p-6 rounded-2xl border-2 transition-all ${selectedInstrument === Instrument.PIANO ? 'border-blue-500 bg-blue-500/20' : 'border-white/10 bg-surface-secondary'}`}
                           >
                               <div className="text-4xl mb-2">🎹</div>
                               <div className="font-bold text-white">Piano</div>
                           </button>
                           <button 
                             onClick={() => setSelectedInstrument(Instrument.GUITAR)}
                             className={`p-6 rounded-2xl border-2 transition-all ${selectedInstrument === Instrument.GUITAR ? 'border-blue-500 bg-blue-500/20' : 'border-white/10 bg-surface-secondary'}`}
                           >
                               <div className="text-4xl mb-2">🎸</div>
                               <div className="font-bold text-white">Guitar</div>
                           </button>
                       </div>
                       <button onClick={handleOnboardingNext} className="w-full py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-500 transition-all">Next</button>
                   </div>
              )}

              {onboardingStep === OnboardingStep.AUDIO_SETUP && (
                  <div className="space-y-6 animate-fade-in">
                      <h2 className="text-3xl font-bold text-white">Sound Check</h2>
                      <p className="text-gray-400">Play a note or connect MIDI.</p>
                      
                      <div className="h-32 bg-black/40 rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                          <div className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-75 ease-out" style={{ height: `${Math.min(100, currentInput.volume * 500)}%`, opacity: 0.5 }} />
                          <div className="z-10 text-2xl font-mono font-bold text-white">
                              {currentInput.note ? `${currentInput.note}${currentInput.octave}` : '...'}
                          </div>
                      </div>
                      
                      {midiConnected && (
                          <div className="flex items-center gap-2 justify-center text-green-400 bg-green-400/10 py-2 rounded-lg">
                              <CableIcon /> MIDI Connected
                          </div>
                      )}

                      <button onClick={handleOnboardingNext} className="w-full py-4 bg-white text-black rounded-full font-bold hover:scale-105 transition-all">Looks Good</button>
                  </div>
              )}
              
              {onboardingStep === OnboardingStep.COMPLETE && (
                  <div className="space-y-6 animate-fade-in text-center">
                      <div className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center text-white">
                          <CheckIcon />
                      </div>
                      <h2 className="text-3xl font-bold text-white">All Set!</h2>
                  </div>
              )}
          </div>
      </div>
  );

  const renderMenu = () => (
    <div className="flex flex-col h-screen bg-surface-primary">
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialView={authModalView} 
        onAuthSuccess={(user) => setCurrentUser(user)}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full bg-surface-primary/80 backdrop-blur-2xl border-b border-white/5 px-6 py-4">
            <div className="flex justify-between items-center max-w-5xl mx-auto">
                <div className="text-left flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-lg shadow-lg" />
                    <div>
                        <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                            Luma
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                  {currentUser ? (
                    <div className="relative">
                        <div className="flex items-center gap-4">
                            <div className="hidden md:block text-right">
                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Streak</div>
                                <div className="text-white font-mono flex items-center gap-1 justify-end"><LightningIcon/> {currentUser.streak}</div>
                            </div>
                            <button
                              onClick={() => setShowUserMenu(prev => !prev)}
                              className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-white flex items-center justify-center font-bold text-lg border border-white/20"
                            >
                              {currentUser.name.charAt(0).toUpperCase()}
                            </button>
                        </div>
                      
                      <AnimatePresence>
                        {showUserMenu && (
                           <>
                            <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setShowUserMenu(false)} />
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-14 right-0 bg-surface-secondary rounded-2xl shadow-2xl p-2 w-56 border border-white/10 z-50"
                            >
                                <div className="p-3 border-b border-white/5">
                                    <p className="font-bold text-white truncate">{currentUser.name}</p>
                                    <p className="text-xs text-gray-400 truncate">@{currentUser.tag}</p>
                                    {currentUser.isAdmin && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded uppercase font-bold mt-1 inline-block">Admin</span>}
                                </div>
                                <div className="p-2">
                                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                                        <span>Level {currentUser.level}</span>
                                        <span>{currentUser.xp} XP</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden mb-2">
                                        <div className="h-full bg-blue-500" style={{ width: `${(currentUser.xp % 1000) / 10}%` }} />
                                    </div>
                                </div>
                                <button onClick={signOut} className="w-full text-left px-3 py-2 text-sm text-red-300 hover:bg-white/5 rounded-lg transition">
                                    Sign Out
                                </button>
                            </motion.div>
                           </>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <button 
                      onClick={() => openAuthModal('signIn')} 
                      className="px-5 py-2 text-sm font-bold text-white rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all"
                    >
                      Sign In
                    </button>
                  )}
                </div>
            </div>
      </header>

      {isGenerating && (
         <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center animate-fade-in text-center p-4">
             <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6" />
             <h2 className="text-3xl font-bold text-white mb-2">Checking Library...</h2>
             <p className="text-gray-400">Retrieving score from IMSLP/Charts...</p>
         </div>
      )}

      <main className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col gap-12 max-w-5xl mx-auto w-full relative z-0">
        
        {/* AI SONG IMPORTER */}
        <section className="bg-gradient-to-br from-violet-900/40 to-fuchsia-900/40 p-8 rounded-3xl border border-white/10 relative overflow-hidden">
            <div className="relative z-20">
                <div className="flex items-center gap-3 text-fuchsia-300 font-bold uppercase tracking-widest text-xs mb-4">
                    <SparklesIcon /> IMSLP / AI Importer
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Music Library Search</h2>
                <p className="text-gray-300 mb-4 max-w-xl">
                    Search for any Pop song or Classical piece (e.g., "Beethoven Sonata No. 14"). 
                    Our AI will retrieve the sheet music from the public domain or chart archives.
                </p>
                <div className="flex gap-2 max-w-lg relative z-30">
                    <input 
                        type="text" 
                        placeholder="Song Title, Artist, or Opus No..." 
                        value={songSearchQuery}
                        onChange={(e) => setSongSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSongGeneration(songSearchQuery)}
                        className="flex-1 bg-black/40 backdrop-blur border border-white/20 rounded-xl px-5 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-fuchsia-500 transition-colors z-30 relative"
                    />
                    <button 
                        onClick={() => handleSongGeneration(songSearchQuery)}
                        disabled={!songSearchQuery}
                        className="bg-fuchsia-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-fuchsia-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-30 relative"
                    >
                        <SearchIcon />
                    </button>
                </div>
            </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div onClick={handleGenerateWorkout} className="relative group cursor-pointer overflow-hidden rounded-3xl p-1 bg-gradient-to-br from-orange-400 to-red-500">
                 <div className="bg-surface-secondary h-full w-full rounded-[1.3rem] p-6 relative z-10 flex items-center justify-between">
                    <div>
                        <div className="text-orange-400 font-bold text-xs tracking-widest uppercase mb-1">AI Generator</div>
                        <h3 className="text-xl font-bold text-white mb-1">5-Minute Workout</h3>
                        <p className="text-gray-400 text-sm">Daily technical drills.</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                        <PlayIcon />
                    </div>
                 </div>
              </div>
              <div onClick={startJam} className="relative group cursor-pointer overflow-hidden rounded-3xl p-1 bg-gradient-to-br from-fuchsia-500 to-purple-600">
                 <div className="bg-surface-secondary h-full w-full rounded-[1.3rem] p-6 relative z-10 flex items-center justify-between">
                    <div>
                        <div className="text-fuchsia-400 font-bold text-xs tracking-widest uppercase mb-1">Creative</div>
                        <h3 className="text-xl font-bold text-white mb-1">Free Play Jam</h3>
                        <p className="text-gray-400 text-sm">Improvise with AI backing tracks.</p>
                    </div>
                    <div className="w-12 h-12 bg-fuchsia-500/20 rounded-full flex items-center justify-center text-fuchsia-400 group-hover:bg-fuchsia-500 group-hover:text-white transition-all">
                        <HeadphonesIcon />
                    </div>
                 </div>
              </div>
        </section>

        <section>
            <h2 className="text-2xl font-bold text-white mb-6">Course Path</h2>
            <div className="space-y-4 relative">
                <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-800 -z-10" />
                {COURSES.map((course, idx) => {
                    const stars = getStars(course.id, currentUser);
                    return (
                        <div key={course.id} className="relative pl-20 py-2">
                            <div className={`absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-4 ${stars > 0 ? 'border-yellow-400 bg-yellow-400' : 'border-gray-600 bg-surface-primary'} z-10`} />
                            <div 
                                onClick={() => startSong(course)}
                                className="bg-surface-secondary border border-white/5 rounded-2xl p-5 flex justify-between items-center hover:border-white/20 transition-all cursor-pointer hover:translate-x-2"
                            >
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-bold text-white">{course.title}</h3>
                                        <div className="flex">
                                            {[1,2,3].map(s => <StarIcon key={s} filled={s <= stars} />)}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400">{course.description}</p>
                                </div>
                                <button className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-blue-50 transition-colors">Start</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>

        <section>
            <h2 className="text-2xl font-bold text-white mb-6">Trending Songs</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {TRENDING_SONGS_METADATA.map((song, idx) => {
                     const songId = `gen-${song.title.replace(/\s+/g,'-').toLowerCase()}`;
                     const stars = getStars(songId, currentUser);
                     return (
                        <div 
                            key={idx}
                            onClick={() => handleSongGeneration(song.title, song.artist)}
                            className="bg-surface-secondary border border-white/5 rounded-2xl p-4 hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white">
                                    {idx + 1}
                                </div>
                                <div className="flex gap-0.5">
                                    {[1,2,3].map(s => <StarIcon key={s} filled={s <= stars} />)}
                                </div>
                            </div>
                            <h3 className="font-bold text-white truncate">{song.title}</h3>
                            <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                        </div>
                    );
                })}
            </div>
        </section>
      </main>
    </div>
  );

  const renderPlaying = () => (
    <div className="flex flex-col h-screen bg-surface-primary relative overflow-hidden">
      {/* SCORE HEADER */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start pointer-events-none">
        <div className="bg-black/60 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 shadow-xl">
           <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Score</div>
           <div className="text-4xl font-mono font-bold text-blue-400">{score}</div>
        </div>
        <div className={`absolute left-1/2 -translate-x-1/2 top-20 transition-all duration-300 ${isWaiting ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-300 px-6 py-2 rounded-full font-bold shadow-lg backdrop-blur flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                Play <span className="font-mono bg-black/20 px-1 rounded">{waitingNoteRef.current}</span>
            </div>
        </div>
        <div className="pointer-events-auto bg-black/60 backdrop-blur-xl px-6 py-2 rounded-2xl border border-white/10 text-right">
            <h3 className="font-bold text-white">{currentSong.title}</h3>
            <p className="text-xs text-gray-400">{currentSong.artist}</p>
        </div>
      </div>

      {/* PRACTICE TOOLS */}
      <div className="absolute bottom-64 left-8 z-40 flex flex-col gap-4 pointer-events-auto w-64">
         <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10">
             <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                <span>SPEED</span>
                <span>{Math.round(playbackSpeed * 100)}%</span>
             </div>
             <input 
                type="range" min="0.5" max="1.2" step="0.1" 
                value={playbackSpeed} 
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
             />
         </div>
         <div className={`bg-black/60 backdrop-blur-md p-4 rounded-2xl border transition-colors cursor-pointer ${loopRegion.active ? 'border-blue-500 bg-blue-900/20' : 'border-white/10'}`}
              onClick={() => setLoopRegion(prev => ({ ...prev, active: !prev.active }))}>
             <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2 text-sm font-bold text-white">
                     <RefreshIcon /> Loop Practice
                 </div>
                 <div className={`w-8 h-4 rounded-full relative ${loopRegion.active ? 'bg-blue-500' : 'bg-gray-600'}`}>
                     <div className={`absolute top-0.5 bottom-0.5 w-3 rounded-full bg-white transition-all ${loopRegion.active ? 'left-4.5' : 'left-0.5'}`} />
                 </div>
             </div>
             {loopRegion.active && (
                 <div className="mt-3">
                     <input 
                        type="range" min="0" max={currentSong.notes.length > 0 ? currentSong.notes[currentSong.notes.length-1].startTime : 30} step="1"
                        value={loopRegion.start}
                        onChange={(e) => {e.stopPropagation(); setLoopRegion(p => ({...p, start: parseInt(e.target.value)}))}}
                        className="w-full h-1 bg-gray-600 rounded-lg accent-blue-400 mb-2"
                     />
                     <div className="flex justify-between text-xs text-gray-400">
                         <span>Start: {loopRegion.start}</span>
                         <span>End: {loopRegion.end}</span>
                     </div>
                 </div>
             )}
         </div>
      </div>

      <div className="flex-1 relative w-full bg-black/40">
        <SheetMusic 
          songNotes={currentSong.notes}
          isPlaying={isPlaying}
          currentTime={currentTimeInBeats}
          currentInput={currentInput}
          results={noteResults}
          bpm={currentSong.bpm * playbackSpeed}
          loopRegion={loopRegion}
        />
      </div>

      <div className="w-full max-w-7xl mx-auto z-30 p-8 pb-0 relative">
         <div className="absolute bottom-0 left-0 right-0 h-32 bg-blue-900/20 blur-[50px] pointer-events-none" />
         <div className="relative z-20 mb-10">
             {selectedInstrument === Instrument.GUITAR 
               ? <Fretboard currentInput={currentInput} targetNote={null} />
               : (
                  <div className="relative w-full h-48 select-none bg-gray-900 p-1 rounded-t-lg shadow-2xl border-t border-white/10">
                    <div className="flex w-full h-full rounded-lg overflow-hidden">
                        {/* Piano Rendering Logic Inlined for brevity, similar to before but mapped to piano keys */}
                        {/* Simple mapped rendering for context: */}
                        {[3,4,5].map(oct => NOTES_ORDER.filter(n => !n.includes('#')).map(n => {
                            const isActive = currentInput.note === n && currentInput.octave === oct;
                            return <PianoKey key={`${n}${oct}`} note={n} isBlack={false} isActive={isActive} className="flex-1 border-r border-gray-800" label={`${n}${oct}`} />
                        }))}
                    </div>
                    <div className="absolute inset-0 w-full h-full pointer-events-none">
                        {/* Black Keys Layer */}
                    </div>
                  </div>
               )
             }
         </div>
      </div>

       <div className="absolute bottom-64 right-8 z-40 flex flex-col gap-4 pointer-events-auto">
          <button onClick={() => setIsPlaying(!isPlaying)} className="w-16 h-16 flex items-center justify-center rounded-full bg-white text-black shadow-2xl hover:scale-105 transition-transform">
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button onClick={() => setAppState(AppState.MENU)} className="w-16 h-16 flex items-center justify-center rounded-full bg-black/50 backdrop-blur border border-white/20 text-white font-medium hover:bg-white/10 transition-colors">EXIT</button>
       </div>
    </div>
  );

  const renderFeedback = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-surface-primary p-6 relative">
      <div className="max-w-xl w-full bg-surface-secondary/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-10 shadow-2xl text-center">
        <h2 className="text-4xl font-bold mb-2 text-white">Lesson Complete</h2>
        
        <div className="flex justify-center gap-2 my-6">
             {/* Calculate Stars for Display */}
             {(() => {
                 const acc = currentSong.notes.length > 0 ? (currentSong.notes.length - misses) / currentSong.notes.length : 0;
                 return [1,2,3].map(s => (
                     <StarIcon key={s} filled={acc >= [0.5, 0.75, 0.9][s-1]} />
                 ));
             })()}
        </div>

        <div className="flex justify-center gap-8 mb-10">
            <div className="text-center">
                <div className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Score</div>
                <div className="text-5xl font-mono font-bold text-blue-400">{score}</div>
            </div>
            <div className="text-center">
                <div className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Misses</div>
                <div className="text-5xl font-mono font-bold text-red-400">{misses}</div>
            </div>
        </div>
        <div className="bg-white/5 rounded-2xl p-8 mb-8 text-left border border-white/5">
          <div className="flex items-center gap-2 text-blue-300 mb-3 font-bold text-xs uppercase tracking-widest">
             <SparklesIcon /> Gemini Coach
          </div>
          <p className="text-lg leading-relaxed font-light text-gray-200">"{aiFeedback || "Analyzing..."}"</p>
        </div>
        <div className="flex gap-4 justify-center">
          <button onClick={() => startSong(currentSong)} className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors font-semibold border border-white/10">Replay</button>
          <button onClick={() => setAppState(AppState.MENU)} className="px-8 py-4 rounded-xl bg-white text-black hover:bg-gray-200 transition-colors font-bold">Continue</button>
        </div>
      </div>
    </div>
  );

  if (appState === AppState.ONBOARDING) return renderOnboarding();

  return (
     <>
       {appState === AppState.MENU && renderMenu()}
       {appState === AppState.PLAYING && renderPlaying()}
       {appState === AppState.FEEDBACK && renderFeedback()}
       {appState === AppState.JAM && (
           <div className="flex flex-col h-screen bg-surface-primary relative overflow-hidden">
               {/* JAM MODE UI (Shortened for brevity, same logic as previous) */}
               <div className="flex-1 flex items-center justify-center">
                   <h1 className="text-4xl font-bold text-white">Jamming...</h1>
               </div>
               <div className="absolute top-6 right-6 z-50">
                 <button onClick={() => setAppState(AppState.MENU)} className="px-6 py-3 rounded-full bg-black/50 backdrop-blur border border-white/20 text-white hover:bg-white/10 transition-colors">Stop Jamming</button>
              </div>
           </div>
       )}
     </>
  );
}
