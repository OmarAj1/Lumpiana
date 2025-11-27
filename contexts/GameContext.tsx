
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, User, AppSettings, Song, OnboardingStep, Instrument, AuthView } from '../types';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';
import { DEMO_SONG } from '../constants';
import { audioEngine } from '../services/audioEngine';

interface GameContextType {
  appState: AppState;
  setAppState: (state: AppState) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  currentSong: Song;
  setCurrentSong: (song: Song) => void;
  onboardingStep: OnboardingStep;
  setOnboardingStep: (step: OnboardingStep) => void;
  selectedInstrument: Instrument;
  setSelectedInstrument: (inst: Instrument) => void;
  composedSongs: Song[];
  setComposedSongs: (songs: Song[]) => void;
  
  // Session Persistence
  lastSessionStats: { score: number, misses: number };
  setLastSessionStats: (stats: { score: number, misses: number }) => void;

  // Auth Modal State
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalView: AuthView;
  setAuthModalView: (view: AuthView) => void;
  
  // Actions
  signOut: () => void;
  toggleTheme: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>(AppState.ONBOARDING);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());
  const [currentSong, setCurrentSong] = useState<Song>(DEMO_SONG);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(OnboardingStep.WELCOME);
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument>(Instrument.PIANO);
  const [composedSongs, setComposedSongs] = useState<Song[]>([]);
  const [lastSessionStats, setLastSessionStats] = useState({ score: 0, misses: 0 });
  
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<AuthView>('signIn');

  // Initial Load
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
    setComposedSongs(storageService.getComposedSongs());
  }, []);

  // Settings Persistence & Audio Engine Sync
  useEffect(() => {
    storageService.saveSettings(settings);
    
    // Theme: settings.darkMode = true means user wants dark. So html should NOT have the 'dark' class.
    // settings.darkMode = false means user wants light. So html SHOULD have the 'dark' class.
    if (settings.darkMode) {
        document.documentElement.classList.remove('dark');
    } else {
        document.documentElement.classList.add('dark');
    }

    // Audio Engine Sync
    if (settings.pitchDetectionEnabled) {
       // Attempt to enable if allowed (requires user interaction context usually)
       // If it fails due to autoplay policy, it will just stay suspended until interaction
       audioEngine.setEnabled(true).catch(e => console.debug("Auto-start audio failed (waiting for interaction)", e));
    } else {
       audioEngine.setEnabled(false);
    }
    // New: Sync the synthesized piano sound state
    audioEngine.setSynthesizedPianoEnabled(!settings.enableTouchPiano);

  }, [settings]);

  const signOut = () => {
    authService.signOut();
    setCurrentUser(null);
    setAppState(AppState.ONBOARDING);
    setOnboardingStep(OnboardingStep.WELCOME);
  };

  const toggleTheme = () => {
      setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  return (
    <GameContext.Provider value={{
      appState, setAppState,
      currentUser, setCurrentUser,
      settings, setSettings,
      currentSong, setCurrentSong,
      onboardingStep, setOnboardingStep,
      selectedInstrument, setSelectedInstrument,
      composedSongs, setComposedSongs,
      lastSessionStats, setLastSessionStats,
      isAuthModalOpen, setAuthModalOpen,
      authModalView, setAuthModalView,
      signOut, toggleTheme
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within a GameProvider");
  return context;
};