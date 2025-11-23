
import React from 'react';
import { useGame } from '../contexts/GameContext';
import { AppState } from '../types';
import { useAppLogic } from '../hooks/useAppLogic';

// Screens
import LandingScreen from '../screens/LandingScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import MenuScreen from '../screens/MenuScreen';
import GameScreen from '../screens/GameScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import JamScreen from '../screens/JamScreen';
import SettingsScreen from '../screens/SettingsScreen';

interface AppRouterProps {
    logic: ReturnType<typeof useAppLogic>;
}

const AppRouter: React.FC<AppRouterProps> = ({ logic }) => {
    const ctx = useGame();
    const { 
        appState, setAppState, currentUser, setCurrentUser, 
        settings, setSettings, onboardingStep,
        selectedInstrument, setSelectedInstrument, composedSongs,
        currentSong, lastSessionStats,
        isAuthModalOpen, setAuthModalOpen, authModalView, signOut, toggleTheme
    } = ctx;

    if (!currentUser && appState === AppState.MENU) {
        return (
            <LandingScreen 
                isAuthModalOpen={isAuthModalOpen}
                setAuthModalOpen={setAuthModalOpen}
                authModalView={authModalView}
                openAuthModal={logic.openAuthModal}
                setCurrentUser={setCurrentUser}
                setAppState={setAppState}
            />
        );
    }
    
    switch (appState) {
        case AppState.ONBOARDING: 
            return (
                <OnboardingScreen 
                    onboardingStep={onboardingStep}
                    handleOnboardingNext={logic.handleOnboardingNext}
                    selectedInstrument={selectedInstrument}
                    setSelectedInstrument={setSelectedInstrument}
                    micError="" 
                    midiConnected={false}
                    openAuthModal={logic.openAuthModal}
                    isAuthModalOpen={isAuthModalOpen}
                    setAuthModalOpen={setAuthModalOpen}
                    authModalView={authModalView}
                    setCurrentUser={setCurrentUser}
                    setAppState={setAppState}
                />
            );

        case AppState.MENU: 
            return (
                <MenuScreen 
                    currentUser={currentUser!}
                    setShowUserMenu={logic.setShowUserMenu}
                    showUserMenu={logic.showUserMenu}
                    signOut={signOut}
                    setAppState={setAppState}
                    speakText={logic.safeSpeak}
                    activeTab={logic.activeTab}
                    setActiveTab={logic.setActiveTab}
                    startSong={logic.startSong}
                    startJam={() => setAppState(AppState.JAM)}
                    handleGenerateWorkout={logic.handleGenerateWorkout}
                    isGenerating={logic.isGenerating}
                    songSearchQuery={logic.songSearchQuery}
                    setSongSearchQuery={logic.setSongSearchQuery}
                    handleSongGeneration={logic.handleSongGeneration}
                    composedSongs={composedSongs}
                    parallax={logic.parallax}
                    isDark={settings.darkMode}
                    toggleTheme={toggleTheme}
                    handleGenerateLesson={logic.handleGenerateLesson}
                />
            );

        case AppState.PLAYING: 
            return <GameScreen />;

        case AppState.FEEDBACK: 
            return (
                <FeedbackScreen 
                    score={lastSessionStats.score} 
                    misses={lastSessionStats.misses}
                    currentSong={currentSong}
                    aiFeedback={lastSessionStats.misses === 0 ? "Perfect run!" : "Good effort, try again!"}
                    startSong={logic.startSong}
                    setAppState={setAppState}
                />
            );

        case AppState.JAM: 
            return (
                <JamScreen 
                    setAppState={setAppState}
                    jamMood="Chill"
                />
            );

        case AppState.SETTINGS: 
            return (
                <SettingsScreen 
                    setAppState={setAppState}
                    settings={settings}
                    setSettings={setSettings}
                    currentInput={{ activeNotes: [], volume: 0, snr: 0, clarity: 0, harmonicity: 0, spectralCentroid: 0, source: 'none' }} 
                />
            );

        default: 
            return (
                <LandingScreen 
                    isAuthModalOpen={isAuthModalOpen}
                    setAuthModalOpen={setAuthModalOpen}
                    authModalView={authModalView}
                    openAuthModal={logic.openAuthModal}
                    setCurrentUser={setCurrentUser}
                    setAppState={setAppState}
                />
            );
    }
};

export default AppRouter;
