
import React, { useState, useEffect, useRef } from 'react';
import { audioEngine } from './services/audioEngine';
import { authService } from './services/authService';
import { storageService } from './services/storageService';
import { getFeedback, speakText, generateAccompaniment, generateWorkout, generateSongFromTitle, stopSpeech } from './services/geminiService';
import { DEMO_SONG, STAR_THRESHOLDS } from './constants';
import { AppState, Song, AudioAnalysisResult, Instrument, User, OnboardingStep, NoteStatus, LoopRegion, AuthView, AppSettings } from './types';

// Screens
import LandingScreen from './screens/LandingScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import MenuScreen from './screens/MenuScreen';
import GameScreen from './screens/GameScreen';
import FeedbackScreen from './screens/FeedbackScreen';
import JamScreen from './screens/JamScreen';
import SettingsScreen from './screens/SettingsScreen';

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.ONBOARDING);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(OnboardingStep.WELCOME);
  const [currentSong, setCurrentSong] = useState<Song>(DEMO_SONG);
  const [currentInput, setCurrentInput] = useState<AudioAnalysisResult>({ pitch: 0, note: null, octave: null, clarity: 0, volume: 0 });
  const [midiConnected, setMidiConnected] = useState<boolean>(false);
  const [micError, setMicError] = useState<string>("");
  
  // Auth & User
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<AuthView>('signIn');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // App Settings & Persistence
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());
  const [composedSongs, setComposedSongs] = useState<Song[]>([]);

  // UI State
  const [activeTab, setActiveTab] = useState('home');
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

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
  const consecutiveHitFramesRef = useRef(0);

  const [aiFeedback, setAiFeedback] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const animationFrameRef = useRef<number>(0);
  const audioAnalysisRef = useRef<number>(0);

  // --- EFFECTS ---

  // Apply Dark Mode Setting
  useEffect(() => {
      if (settings.darkMode) {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }
  }, [settings.darkMode]);

  // Apply Audio Sensitivity Setting
  useEffect(() => {
      audioEngine.setSensitivity(settings.micSensitivity);
  }, [settings.micSensitivity]);

  // Parallax Mouse Tracker
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        setParallax({
            x: (e.clientX - window.innerWidth / 2) / 50,
            y: (e.clientY - window.innerHeight / 2) / 50
        });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Load User & Data
  useEffect(() => {
      authService.getCurrentUser().then(user => {
          if (user) {
              setCurrentUser(user);
              if (user.level > 1 || Object.keys(user.progress).length > 0) {
                  setAppState(AppState.MENU);
                  setOnboardingStep(OnboardingStep.COMPLETE);
              }
          }
      });
      // Load Composed Songs
      setComposedSongs(storageService.getComposedSongs());
  }, []);

  // Save settings when changed
  useEffect(() => {
      storageService.saveSettings(settings);
  }, [settings]);

  // Handle Instrument Switch
  useEffect(() => {
    audioEngine.setInstrument(selectedInstrument);
  }, [selectedInstrument]);

  // Stop speech on unmount or state change
  useEffect(() => {
      return () => stopSpeech();
  }, [appState]);

  // Audio Loop
  useEffect(() => {
      const updatePitch = () => {
        const analysis = audioEngine.analyze();
        const isMidi = audioEngine.getIsMidiConnected();
        if (isMidi !== midiConnected) setMidiConnected(isMidi);

        setCurrentInput(analysis);
        inputRef.current = analysis;
        
        // Jam Mode Collection
        if (appState === AppState.JAM && analysis.note && analysis.clarity > 0.8) {
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
      let targetNoteStr: string | null = null;

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

      // Strict Wait & Hit Detection
      if (currentSong.notes && currentSong.notes.length > 0) {
        for (let index = 0; index < currentSong.notes.length; index++) {
            const note = currentSong.notes[index];
            // STRICT CHECK: Only skip if explicitly CORRECT. HINTED/MISSED must re-eval to hold lock.
            if (noteResultsRef.current.get(index) === NoteStatus.CORRECT) continue;

            // If the time has come to play this note
            if (newTime >= note.startTime) {
                const input = inputRef.current;
                
                // Lowered default threshold to catch acoustic piano attacks better
                const requiredClarity = settings.strictMode ? 0.95 : 0.75;

                const isMatchingNote = input.note === note.note && 
                                     input.octave === note.octave && 
                                     input.clarity > requiredClarity;

                if (isMatchingNote) {
                    consecutiveHitFramesRef.current += 1;
                } else {
                    consecutiveHitFramesRef.current = 0;
                }

                // Require only 1 frame for instant response (crucial for staccato notes)
                const isHit = isMatchingNote && consecutiveHitFramesRef.current >= 1;

                if (isHit) {
                    noteResultsRef.current.set(index, NoteStatus.CORRECT);
                    setNoteResults(new Map(noteResultsRef.current));
                    setScore(s => s + 100);
                    
                    consecutiveHitFramesRef.current = 0; 

                    // NOTE: Lyrics control remains separate from Voice Feedback
                    if (note.lyrics && settings.enableTTS) {
                        const utterance = new SpeechSynthesisUtterance(note.lyrics);
                        utterance.rate = 1.2;
                        window.speechSynthesis.speak(utterance);
                    }

                    currentlyWaiting = false;
                } else {
                    // BLOCKING: Clamp time exactly to note start
                    newTime = note.startTime; 
                    currentlyWaiting = true;
                    targetNoteStr = `${note.note}${note.octave}`;
                    noteResultsRef.current.set(index, NoteStatus.HINTED);
                    setNoteResults(new Map(noteResultsRef.current));
                    break; 
                }
            }
        }
      }

      if (currentlyWaiting) {
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
  }, [appState, isPlaying, currentSong, playbackSpeed, loopRegion, settings]);

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

  const handleSpeak = (text: string) => {
      if (settings.enableVoiceFeedback) {
          speakText(text);
      }
  };

  const toggleTheme = () => {
      setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const openAuthModal = (view: AuthView) => {
      setAuthModalView(view);
      setAuthModalOpen(true);
  };

  const signOut = async () => {
      await authService.signOut();
      setCurrentUser(null);
      setShowUserMenu(false);
      setAppState(AppState.ONBOARDING);
      setOnboardingStep(OnboardingStep.WELCOME);
  };

  const handleOnboardingNext = async () => {
      if (onboardingStep === OnboardingStep.WELCOME) {
          setOnboardingStep(OnboardingStep.INSTRUMENT);
      } else if (onboardingStep === OnboardingStep.INSTRUMENT) {
          setOnboardingStep(OnboardingStep.AUDIO_SETUP);
          try {
            await audioEngine.initialize();
            if (!audioEngine.micEnabled && !audioEngine.getIsMidiConnected()) {
                setMicError("Microphone access denied. Please check your browser permissions or connect a MIDI device.");
            } else {
                setMicError("");
            }
          } catch (e) {
             console.error(e);
             setMicError("Failed to initialize audio. Please refresh and try again.");
          }
      } else if (onboardingStep === OnboardingStep.AUDIO_SETUP) {
          setOnboardingStep(OnboardingStep.COMPLETE);
          setTimeout(() => {
            setAppState(AppState.MENU);
          }, 1000);
      }
  };

  const startSong = (song: Song) => {
    stopSpeech();
    setCurrentSong(song);
    setScore(0);
    setMisses(0);
    currentTimeRef.current = 0;
    noteResultsRef.current = new Map();
    playedBackingChordsRef.current = new Set();
    setNoteResults(new Map());
    setCurrentTimeInBeats(0);
    setIsPlaying(true);
    
    // Apply Settings Defaults
    setPlaybackSpeed(settings.defaultSpeed);
    setLoopRegion({ start: 0, end: 4, active: settings.enableLooping }); 
    
    setAppState(AppState.PLAYING);
  };

  const startJam = () => {
    stopSpeech();
    setAppState(AppState.JAM);
  };

  const finishLesson = async () => {
    setIsPlaying(false);
    setAppState(AppState.FEEDBACK);
    
    const totalNotes = currentSong.notes.length;
    let hits = 0;
    noteResultsRef.current.forEach(val => { if (val === NoteStatus.CORRECT) hits++; });
    
    const accuracy = totalNotes > 0 ? hits / totalNotes : 0;
    
    let stars = 0;
    if (accuracy >= STAR_THRESHOLDS.GOLD) stars = 3;
    else if (accuracy >= STAR_THRESHOLDS.SILVER) stars = 2;
    else if (accuracy >= STAR_THRESHOLDS.BRONZE) stars = 1;

    if (currentUser) {
        try {
            const updatedUser = await authService.updateUserProgress(currentUser.id, currentSong.id, {
                highScore: score,
                stars: stars
            }, score);
            setCurrentUser(updatedUser);
        } catch (e) {
            console.error("Failed to save progress", e);
        }
    }

    const feedback = await getFeedback(score, totalNotes - hits);
    setAiFeedback(feedback || "Good job!");
    handleSpeak(feedback || "Lesson complete."); // Keep this one as it's valuable feedback
  };

  const handleGenerateWorkout = async () => {
      stopSpeech();
      setIsGenerating(true);
      try {
        const workout = await generateWorkout();
        if (workout) {
            const song: Song = {
                id: `workout-${Date.now()}`,
                title: workout.title || 'Daily Technical Drill',
                artist: 'Gemini Coach',
                difficulty: 'Intermediate',
                bpm: workout.bpm || 80,
                notes: workout.notes || [],
                category: 'Workout'
            };
            if (settings.autoSaveSongs) {
                storageService.saveComposedSong(song);
                setComposedSongs(storageService.getComposedSongs());
            }
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
      stopSpeech();
      setIsGenerating(true);
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
            
            if (settings.autoSaveSongs) {
                storageService.saveComposedSong(generatedSong);
                setComposedSongs(storageService.getComposedSongs());
            }

            startSong(generatedSong);
        } else {
            alert(`Could not generate "${title}".`);
        }
      } catch (e) {
          console.error(e);
          alert("An unexpected error occurred during generation.");
      } finally {
          setIsGenerating(false);
      }
  };

  // --- RENDER SWITCH ---
  
  if (!currentUser && appState === AppState.MENU) {
      return <LandingScreen 
                isAuthModalOpen={isAuthModalOpen} setAuthModalOpen={setAuthModalOpen}
                authModalView={authModalView} openAuthModal={openAuthModal}
                setCurrentUser={setCurrentUser} setAppState={setAppState}
             />;
  }

  switch (appState) {
    case AppState.ONBOARDING: 
        return <OnboardingScreen 
            onboardingStep={onboardingStep} handleOnboardingNext={handleOnboardingNext}
            selectedInstrument={selectedInstrument} setSelectedInstrument={setSelectedInstrument}
            micError={micError} currentInput={currentInput} midiConnected={midiConnected}
            openAuthModal={openAuthModal} isAuthModalOpen={isAuthModalOpen} setAuthModalOpen={setAuthModalOpen}
            authModalView={authModalView} setCurrentUser={setCurrentUser} setAppState={setAppState}
        />;
    
    case AppState.MENU: 
        return currentUser ? <MenuScreen 
            currentUser={currentUser} setShowUserMenu={setShowUserMenu} showUserMenu={showUserMenu}
            signOut={signOut} setAppState={setAppState} speakText={handleSpeak}
            activeTab={activeTab} setActiveTab={setActiveTab} startSong={startSong}
            startJam={startJam} handleGenerateWorkout={handleGenerateWorkout} isGenerating={isGenerating}
            songSearchQuery={songSearchQuery} setSongSearchQuery={setSongSearchQuery} handleSongGeneration={handleSongGeneration}
            composedSongs={composedSongs} parallax={parallax}
            isDark={settings.darkMode} toggleTheme={toggleTheme}
        /> : null;
    
    case AppState.PLAYING: 
        return <GameScreen 
            setAppState={setAppState} currentSong={currentSong} playbackSpeed={playbackSpeed}
            setPlaybackSpeed={setPlaybackSpeed} score={score} selectedInstrument={selectedInstrument}
            currentInput={currentInput} waitingNote={waitingNoteRef.current} isPlaying={isPlaying}
            currentTimeInBeats={currentTimeInBeats} noteResults={noteResults}
            loopRegion={loopRegion} setLoopRegion={setLoopRegion} settings={settings} isWaiting={isWaiting}
        />;
    
    case AppState.FEEDBACK: 
        return <FeedbackScreen 
            score={score} misses={misses} currentSong={currentSong} 
            aiFeedback={aiFeedback} startSong={startSong} setAppState={setAppState}
        />;
    
    case AppState.JAM: 
        return <JamScreen setAppState={setAppState} jamMood={jamMood} />;
    
    case AppState.SETTINGS: 
        return <SettingsScreen setAppState={setAppState} settings={settings} setSettings={setSettings} currentInput={currentInput} />;
    
    default: 
        return <LandingScreen 
            isAuthModalOpen={isAuthModalOpen} setAuthModalOpen={setAuthModalOpen}
            authModalView={authModalView} openAuthModal={openAuthModal}
            setCurrentUser={setCurrentUser} setAppState={setAppState}
        />;
  }
}
