

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LightningIcon, CogIcon, PlayIcon, SearchIcon, HeadphonesIcon, StarIcon, SparklesIcon, CheckIcon } from '../components/Icons';
import Mascot from '../components/Mascot';
import { AppState, User, Song, SongStats } from '../types';
import { COURSES, TRENDING_SONGS_METADATA } from '../constants';

interface MenuScreenProps {
    currentUser: User;
    setShowUserMenu: React.Dispatch<React.SetStateAction<boolean>>;
    showUserMenu: boolean;
    signOut: () => void;
    setAppState: (state: AppState) => void;
    speakText: (text: string) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    startSong: (song: Song) => void;
    startJam: () => void;
    handleGenerateWorkout: (difficulty?: string) => void;
    isGenerating: boolean;
    songSearchQuery: string;
    setSongSearchQuery: (q: string) => void;
    handleSongGeneration: (title: string, artist?: string) => void;
    composedSongs: Song[];
    parallax: { x: number, y: number };
    isDark: boolean;
    toggleTheme: () => void;
    handleGenerateLesson?: (level: string, genre: string) => void;
}

const STAGE_CONFIG: Record<number, { title: string, description: string, color: string }> = {
    1: { title: "Beginner", description: "Rhythm & Hand Position", color: "bg-blue-500" },
    2: { title: "Early Intermediate", description: "Hands Together", color: "bg-indigo-500" },
    3: { title: "Intermediate", description: "Scales & Arpeggios", color: "bg-violet-500" },
    4: { title: "Advanced", description: "Complex Harmonies", color: "bg-purple-500" },
    5: { title: "Expert", description: "Virtuoso Technique", color: "bg-fuchsia-500" },
    6: { title: "Master", description: "Concert Performance", color: "bg-rose-500" }
};

const MenuScreen: React.FC<MenuScreenProps> = ({
    currentUser, setShowUserMenu, showUserMenu, signOut, setAppState, speakText,
    activeTab, setActiveTab, startSong, startJam, handleGenerateWorkout, isGenerating,
    songSearchQuery, setSongSearchQuery, handleSongGeneration, composedSongs, parallax,
    isDark, handleGenerateLesson
}) => {
  
  const [lessonGenre, setLessonGenre] = useState('Jazz');
  const [lessonLevel, setLessonLevel] = useState('Beginner');
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Helper to find song details for history
  const getPlayedSongs = () => {
    const allSongs = [...COURSES, ...composedSongs];
    const played = Object.keys(currentUser.progress).map(songId => {
        const song = allSongs.find(s => s.id === songId);
        const stats = currentUser.progress[songId];
        return { song, stats, id: songId };
    }).filter(item => item.stats.timesPlayed > 0);
    
    // Sort by recent play or high score (here we do stars descending)
    return played.sort((a, b) => b.stats.highScore - a.stats.highScore);
  };

  const playedSongsList = getPlayedSongs();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const genres = ['Jazz', 'Classical', 'Pop', 'Blues'];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="h-screen bg-surface-primary dark:bg-dark-surface-secondary text-white dark:text-black font-sans flex flex-col overflow-hidden selection:bg-blue-500/30">
      
      {/* HISTORY MODAL */}
      <AnimatePresence>
        {showHistoryModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowHistoryModal(false)} 
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-2xl bg-surface-primary border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
                >
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-surface-secondary">
                        <h2 className="text-2xl font-bold flex items-center gap-2"><CheckIcon /> Play History</h2>
                        <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-white/10 rounded-full">✕</button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {playedSongsList.length === 0 ? (
                            <div className="text-center text-gray-500 py-10">
                                <p>No songs played yet. Go practice!</p>
                            </div>
                        ) : (
                            playedSongsList.map((item, idx) => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-surface-secondary/50 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                                            {item.stats.stars > 0 ? '★' : idx + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{item.song?.title || "Unknown Song"}</h3>
                                            <p className="text-xs text-gray-400">{item.song?.artist || "Unknown Artist"}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-mono font-bold text-green-400">
                                            {item.stats.highScore}%
                                        </div>
                                        <div className="flex justify-end gap-1 mt-1">
                                            {[1,2,3].map(s => <StarIcon key={s} filled={s <= item.stats.stars} />)}
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-1">{item.stats.timesPlayed} plays</p>
                                    </div>
                                    {item.song && (
                                        <button 
                                            onClick={() => { setShowHistoryModal(false); startSong(item.song!); }}
                                            className="ml-4 p-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
                                        >
                                            <PlayIcon />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 dark:border-gray-200 bg-surface-primary/80 dark:bg-white/80 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white dark:bg-black rounded-lg flex items-center justify-center">
                        <div className="w-4 h-4 bg-blue-500 rounded-full" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">Luma</span>
                </div>

                {/* Desktop Tabs */}
                <div className="hidden md:flex items-center bg-surface-secondary dark:bg-gray-100 rounded-full p-1 border border-white/5 dark:border-gray-200">
                    {['home', 'learning', 'library'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                                activeTab === tab 
                                ? 'bg-white dark:bg-white text-black shadow-sm' 
                                : 'text-gray-400 hover:text-white dark:hover:text-black'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-4">
                    <div className="hidden sm:block">
                       {isGenerating && <span className="text-xs animate-pulse text-blue-400 mr-2">Creating Lesson...</span>}
                    </div>
                    <Mascot onClick={() => speakText(`Keep up the great work, ${currentUser.name}!`)} />
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(prev => !prev)}
                            className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/20 flex items-center justify-center text-sm font-bold shadow-inner"
                        >
                            {currentUser.name.charAt(0).toUpperCase()}
                        </button>
                        
                        <AnimatePresence>
                            {showUserMenu && (
                                <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                    className="absolute top-12 right-0 w-64 bg-surface-secondary dark:bg-white rounded-2xl shadow-2xl border border-white/10 dark:border-gray-200 overflow-hidden z-50"
                                >
                                    <div className="p-4 border-b border-white/5 dark:border-gray-100">
                                        <p className="font-bold text-white dark:text-black">{currentUser.name}</p>
                                        <p className="text-xs text-gray-500">@{currentUser.tag}</p>
                                        <div className="mt-3 flex items-center gap-2 text-xs font-mono text-gray-400">
                                            <span className="px-2 py-1 bg-white/5 rounded">Lvl {currentUser.level}</span>
                                            <span className="px-2 py-1 bg-white/5 rounded">{currentUser.xp} XP</span>
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        {currentUser.isAdmin && (
                                            <button onClick={() => setAppState(AppState.SETTINGS)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 dark:hover:bg-gray-100 text-sm transition-colors text-left">
                                                <CogIcon /> Settings
                                            </button>
                                        )}
                                        <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 text-sm transition-colors text-left mt-1">
                                            Sign Out
                                        </button>
                                    </div>
                                </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
          </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-6xl mx-auto px-6 py-8">
            <AnimatePresence mode="wait">
                
                {/* --- DASHBOARD --- */}
                {activeTab === 'home' && (
                    <motion.div key="home" variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className="space-y-8">
                        {/* Hero Card */}
                        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-[#0A84FF] text-white p-8 md:p-12 shadow-2xl">
                            <div className="relative z-10 max-w-xl">
                                <h2 className="text-4xl font-bold tracking-tight mb-4">Good afternoon, {currentUser.name.split(' ')[0]}.</h2>
                                <p className="text-blue-100 text-lg mb-8">You've maintained a {currentUser.streak} day streak. Ready to continue your training?</p>
                                <div className="flex gap-4">
                                    <button onClick={() => setActiveTab('learning')} className="px-6 py-3 bg-white text-blue-600 rounded-full font-bold hover:bg-blue-50 transition-colors shadow-lg">
                                        Resume Learning
                                    </button>
                                    <button onClick={startJam} className="px-6 py-3 bg-blue-700 text-white rounded-full font-bold hover:bg-blue-800 transition-colors border border-blue-500">
                                        Jam Session
                                    </button>
                                </div>
                            </div>
                            {/* Abstract BG */}
                            <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                        </motion.div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-surface-secondary dark:bg-white border border-white/5 dark:border-gray-200 shadow-sm">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500"><LightningIcon/></div>
                                    <h3 className="font-bold text-gray-400 text-sm uppercase">Daily Streak</h3>
                                </div>
                                <p className="text-3xl font-bold">{currentUser.streak} <span className="text-base font-normal text-gray-500">days</span></p>
                            </motion.div>
                            <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-surface-secondary dark:bg-white border border-white/5 dark:border-gray-200 shadow-sm">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-2 bg-purple-500/20 rounded-lg text-purple-500"><SparklesIcon/></div>
                                    <h3 className="font-bold text-gray-400 text-sm uppercase">Total XP</h3>
                                </div>
                                <p className="text-3xl font-bold">{currentUser.xp.toLocaleString()}</p>
                            </motion.div>
                            
                            {/* CLICKABLE SONGS MASTERED STAT */}
                            <motion.div 
                                variants={itemVariants} 
                                onClick={() => setShowHistoryModal(true)}
                                className="group cursor-pointer p-6 rounded-3xl bg-surface-secondary dark:bg-white border border-white/5 dark:border-gray-200 shadow-sm hover:border-blue-500 transition-colors relative"
                            >
                                <div className="absolute top-4 right-4 text-gray-600 group-hover:text-blue-500">↗</div>
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-2 bg-green-500/20 rounded-lg text-green-500"><CheckIcon/></div>
                                    <h3 className="font-bold text-gray-400 text-sm uppercase">Songs Mastered</h3>
                                </div>
                                <p className="text-3xl font-bold">
                                    {Object.values(currentUser.progress).filter((p: SongStats) => p.stars === 3).length}
                                    <span className="text-sm font-normal text-gray-500 ml-2 group-hover:text-blue-400">View All</span>
                                </p>
                            </motion.div>
                        </div>

                        {/* AI Workout */}
                        <motion.div variants={itemVariants}>
                            <h3 className="text-xl font-bold mb-4">Recommended for You</h3>
                            <div 
                                onClick={() => handleGenerateWorkout('general')}
                                className="group cursor-pointer p-6 rounded-3xl bg-surface-secondary dark:bg-white border border-white/5 dark:border-gray-200 hover:border-blue-500/50 transition-all relative overflow-hidden"
                            >
                                <div className="flex justify-between items-center relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                            <LightningIcon />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold">Daily Technical Workout</h4>
                                            <p className="text-gray-500">5-minute AI generated drill focusing on finger independence.</p>
                                        </div>
                                    </div>
                                    <div className="px-4 py-2 bg-white/10 rounded-full text-sm font-bold text-white group-hover:bg-blue-600 transition-colors">
                                        Start
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* --- LEARNING PATH --- */}
                {activeTab === 'learning' && (
                    <motion.div key="learning" variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className="space-y-4 pb-20">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-2">Your Learning Path</h2>
                            <p className="text-gray-500">Follow the structured curriculum to achieve mastery.</p>
                        </div>

                        <div className="relative max-w-3xl mx-auto">
                            {/* Connecting Line */}
                            <div className="absolute left-[28px] top-0 bottom-0 w-0.5 bg-white/10 dark:bg-gray-200" />

                            {[1, 2, 3, 4, 5, 6].map((stage) => {
                                const isLocked = currentUser.level < stage;
                                const config = STAGE_CONFIG[stage];
                                const songs = COURSES.filter(s => s.stage === stage);

                                return (
                                    <motion.div variants={itemVariants} key={stage} className={`relative pl-20 py-6 ${isLocked ? 'opacity-50 grayscale' : ''}`}>
                                        {/* Timeline Node */}
                                        <div className={`absolute left-0 top-8 w-14 h-14 rounded-2xl border-4 border-surface-primary dark:border-white flex items-center justify-center z-10 font-bold text-xl shadow-xl ${isLocked ? 'bg-surface-tertiary text-gray-500' : 'bg-white text-black'}`}>
                                            {stage}
                                        </div>

                                        <div className="bg-surface-secondary dark:bg-white border border-white/5 dark:border-gray-200 p-6 rounded-3xl hover:shadow-xl transition-shadow duration-300">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white mb-2 ${config.color}`}>
                                                        {isLocked ? 'Locked' : 'Current Stage'}
                                                    </div>
                                                    <h3 className="text-2xl font-bold">{config.title}</h3>
                                                    <p className="text-gray-500">{config.description}</p>
                                                </div>
                                                <button 
                                                    disabled={isLocked}
                                                    onClick={() => handleGenerateWorkout(config.title)}
                                                    className="p-3 bg-white/5 rounded-xl hover:bg-blue-600 hover:text-white transition-colors text-gray-400"
                                                    title="Generate Warmup"
                                                >
                                                    <SparklesIcon />
                                                </button>
                                            </div>

                                            <div className="space-y-1">
                                                {songs.map(song => (
                                                    <div 
                                                        key={song.id}
                                                        onClick={() => !isLocked && startSong(song)}
                                                        className={`group flex items-center justify-between p-3 rounded-xl transition-colors ${isLocked ? 'cursor-not-allowed' : 'hover:bg-white/5 dark:hover:bg-gray-5 cursor-pointer'}`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-8 h-8 rounded-full bg-surface-tertiary dark:bg-gray-100 flex items-center justify-center text-xs text-gray-500 group-hover:bg-white group-hover:text-black transition-colors">
                                                                <PlayIcon />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm">{song.title}</p>
                                                                <p className="text-xs text-gray-500">{song.artist}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-0.5">
                                                            {[1,2,3].map(s => (
                                                                <StarIcon key={s} filled={s <= (currentUser.progress[song.id]?.stars || 0)} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* --- LIBRARY --- */}
                {activeTab === 'library' && (
                    <motion.div key="library" variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className="space-y-8 pb-20">
                        <div className="bg-surface-secondary dark:bg-white p-1.5 rounded-2xl border border-white/10 dark:border-gray-200 flex items-center shadow-lg">
                            <div className="pl-4 text-gray-400"><SearchIcon /></div>
                            <input 
                                type="text" 
                                value={songSearchQuery}
                                onChange={(e) => setSongSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSongGeneration(songSearchQuery)}
                                placeholder="Search any song title, artist, or classical piece..."
                                className="w-full bg-transparent border-none focus:ring-0 text-lg px-4 py-2 placeholder-gray-500 text-white dark:text-black"
                            />
                            <button 
                                onClick={() => handleSongGeneration(songSearchQuery)}
                                disabled={isGenerating || !songSearchQuery.trim()}
                                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50"
                            >
                                {isGenerating ? 'Thinking...' : 'Import'}
                            </button>
                        </div>

                        {/* NEW: AI LESSON GENERATOR - REDESIGNED */}
                        <div className="bg-surface-secondary dark:bg-white rounded-3xl p-8 border border-white/10 dark:border-gray-200 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                            
                            <div className="relative z-10 flex flex-col md:flex-row gap-8">
                                <div className="md:w-1/3 space-y-4">
                                    <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center">
                                        <SparklesIcon />
                                    </div>
                                    <h3 className="text-2xl font-bold">Custom AI Lesson</h3>
                                    <p className="text-gray-500 leading-relaxed">
                                        Tell Gemini what you want to practice. It will generate a custom exercise with full sheet music and fingerings in seconds.
                                    </p>
                                    <button 
                                        onClick={() => handleGenerateLesson && handleGenerateLesson(lessonLevel, lessonGenre)}
                                        disabled={isGenerating}
                                        className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-600/20 active:scale-95 disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
                                    >
                                        {isGenerating ? 'Designing Lesson...' : 'Generate Now'} <SparklesIcon />
                                    </button>
                                </div>

                                <div className="md:w-2/3 flex flex-col gap-6">
                                    {/* Level Selection */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Difficulty Level</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {levels.map(level => (
                                                <button
                                                    key={level}
                                                    onClick={() => setLessonLevel(level)}
                                                    className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border ${
                                                        lessonLevel === level 
                                                        ? 'bg-purple-600 border-purple-600 text-white shadow-lg' 
                                                        : 'bg-surface-tertiary dark:bg-gray-100 border-transparent text-gray-400 hover:bg-surface-primary dark:hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Genre Selection */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Musical Style</label>
                                        <div className="grid grid-cols-4 gap-3">
                                            {genres.map(genre => (
                                                <button
                                                    key={genre}
                                                    onClick={() => setLessonGenre(genre)}
                                                    className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border ${
                                                        lessonGenre === genre 
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                                                        : 'bg-surface-tertiary dark:bg-gray-100 border-transparent text-gray-400 hover:bg-surface-primary dark:hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {genre}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold mb-4 px-2">Trending Now</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {TRENDING_SONGS_METADATA.map((song, i) => (
                                    <div 
                                        key={i}
                                        onClick={() => handleSongGeneration(song.title, song.artist)}
                                        className="group p-4 bg-surface-secondary dark:bg-white border border-white/5 dark:border-gray-200 rounded-2xl hover:border-blue-500/30 transition-all cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-transparent transition-all duration-500" />
                                        <div className="flex items-center gap-4 relative z-10">
                                            <span className="text-2xl font-bold text-white/10 dark:text-black/10">#{i + 1}</span>
                                            <div>
                                                <h4 className="font-bold group-hover:text-blue-500 transition-colors truncate pr-4">{song.title}</h4>
                                                <p className="text-sm text-gray-500">{song.artist}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default MenuScreen;
