
import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { AppState, Song, OnboardingStep, Instrument, AuthView } from '../types';
import { generateSongFromTitle, generateWorkout, generateLesson, speakText } from '../services/geminiService';
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
    const [generationStatus, setGenerationStatus] = useState('');
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
        setGenerationStatus('Searching Archives...');
        if (settings.enableVoiceFeedback) speakText("Searching the archives.");
        
        try {
            // Simulated Streaming Steps for UX
            setTimeout(() => setGenerationStatus('Composing Melody...'), 2000);
            setTimeout(() => setGenerationStatus('Arranging Harmonies...'), 4500);
            setTimeout(() => setGenerationStatus('Finalizing Sheet Music...'), 7000);

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
            setGenerationStatus('');
            setSongSearchQuery('');
        }
    };

    const handleGenerateWorkout = async (difficulty?: string) => {
        setIsGenerating(true);
        setGenerationStatus(`Creating ${difficulty || 'Technical'} Workout...`);
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
            setGenerationStatus('');
        }
    };

    const handleGenerateLesson = async (level: string, genre: string) => {
        setIsGenerating(true);
        setGenerationStatus(`Designing ${level} ${genre} Lesson...`);
        try {
            const lessonData = await generateLesson(level, genre);
            if (lessonData) {
                const lesson: Song = {
                    id: `lesson-${Date.now()}`,
                    title: lessonData.title || `${genre} Lesson`,
                    artist: 'Luma AI',
                    difficulty: 'Intermediate', // Default type, not complexity
                    bpm: lessonData.bpm || 80,
                    category: 'Course',
                    notes: lessonData.notes,
                    description: lessonData.description
                };
                setCurrentSong(lesson);
                setAppState(AppState.PLAYING);
                toast.success(`${genre} Lesson Ready!`);
            } else {
                toast.error("Failed to generate lesson.");
            }
        } catch (e) {
            toast.error("Error generating lesson.");
        } finally {
            setIsGenerating(false);
            setGenerationStatus('');
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
        isGenerating, generationStatus,
        songSearchQuery, setSongSearchQuery,
        parallax,
        
        // Handlers
        handleOnboardingNext,
        handleSongGeneration,
        handleGenerateWorkout,
        handleGenerateLesson,
        startSong,
        openAuthModal,
        safeSpeak
    };
};
