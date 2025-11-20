
import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { AppState, Song, OnboardingStep, Instrument, AuthView } from '../types';
import { generateSongFromTitle, generateWorkout, speakText } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { toast } from 'react-toastify';

export const useAppLogic = () => {
    const ctx = useGame();
    const { 
        appState, setAppState, settings, setComposedSongs,
        setCurrentSong, setOnboardingStep, onboardingStep, 
        setAuthModalView, setAuthModalOpen
    } = ctx;

    // --- LOCAL UI STATE ---
    const [activeTab, setActiveTab] = useState('home');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [songSearchQuery, setSongSearchQuery] = useState('');
    const [parallax, setParallax] = useState({ x: 0, y: 0 });

    // --- EFFECTS ---
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;
            setParallax({ x, y });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // --- HANDLERS ---

    const safeSpeak = (text: string) => {
        if (settings.enableVoiceFeedback) speakText(text);
    };

    const handleOnboardingNext = () => {
        if (onboardingStep === 0) setOnboardingStep(1);
        else if (onboardingStep === 1) setOnboardingStep(2);
        else if (onboardingStep === 2) { 
            setOnboardingStep(3); 
            setTimeout(() => setAppState(AppState.MENU), 1000); 
        }
    };

    const handleSongGeneration = async (title: string, artist?: string) => {
        if (!title.trim()) return;
        setIsGenerating(true);
        if (settings.enableVoiceFeedback) speakText("Searching the archives.");
        
        try {
            const song = await generateSongFromTitle(title, artist);
            if (song) {
                song.id = `gen-${Date.now()}`;
                song.category = 'Song';
                // Save if settings allow
                if (settings.autoSaveSongs) {
                    storageService.saveComposedSong(song);
                    setComposedSongs(storageService.getComposedSongs());
                }
                setCurrentSong(song);
                setAppState(AppState.PLAYING);
                toast.success(`Generated "${song.title}"!`);
            } else {
                toast.error("Could not generate song. Try a different title.");
                if (settings.enableVoiceFeedback) speakText("I couldn't find that one.");
            }
        } catch (e) {
            toast.error("Generation failed.");
        } finally {
            setIsGenerating(false);
            setSongSearchQuery('');
        }
    };

    const handleGenerateWorkout = async (difficulty?: string) => {
        setIsGenerating(true);
        try {
            const workout = await generateWorkout(difficulty);
            if (workout) {
                workout.id = `workout-${Date.now()}`;
                workout.category = 'Workout';
                setCurrentSong(workout);
                setAppState(AppState.PLAYING);
                toast.success("Workout Ready!");
            } else {
                toast.error("Failed to create workout.");
            }
        } catch (e) {
            toast.error("Error generating workout.");
        } finally {
            setIsGenerating(false);
        }
    };

    const startSong = (song: Song) => {
        setCurrentSong(song);
        setAppState(AppState.PLAYING);
    };

    const openAuthModal = (view: AuthView) => {
        setAuthModalView(view);
        setAuthModalOpen(true);
    };

    return {
        // State
        activeTab, setActiveTab,
        showUserMenu, setShowUserMenu,
        isGenerating,
        songSearchQuery, setSongSearchQuery,
        parallax,
        
        // Handlers
        handleOnboardingNext,
        handleSongGeneration,
        handleGenerateWorkout,
        startSong,
        openAuthModal,
        safeSpeak
    };
};
