
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LightningIcon, CogIcon, PlayIcon, SearchIcon, StarIcon, SparklesIcon, CheckIcon } from '../components/Icons';
import Mascot from '../components/Mascot';
import { AppState, User, Song, SongStats } from '../types';
import { COURSES } from '../constants';
import { LearningScreen } from './LearningScreen';

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

const MenuScreen: React.FC<MenuScreenProps> = ({
    currentUser, setShowUserMenu, showUserMenu, signOut, setAppState, speakText,
    activeTab, setActiveTab, startSong, startJam, handleGenerateWorkout, isGenerating,
    songSearchQuery, setSongSearchQuery, handleSongGeneration, composedSongs, parallax,
    isDark, handleGenerateLesson
}) => {
  
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Container Variants
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
  const [lessonGenre, setLessonGenre] = useState('Jazz');
  const [lessonLevel, setLessonLevel] = useState('Beginner');

  const getPlayedSongs = () => {
    const allSongs = [...COURSES, ...composedSongs];
    return Object.keys(currentUser.progress).map(songId => {
        const song = allSongs.find(s => s.id === songId);
        const stats = currentUser.progress[songId];
        return { song, stats, id: songId };
    }).filter(item => item.stats.timesPlayed > 0).sort((a, b) => b.stats.highScore - a.stats.highScore);
  };

  const playedSongsList = getPlayedSongs();

  return (
    <div className="h-screen bg-surface-primary dark:bg-dark-surface-secondary text-white dark:text-black font-sans flex flex-col overflow-hidden selection:bg-blue-500/30 relative">
      
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
                            <div className="text-center text-gray-500 py-10"><p>No songs played yet.</p></div>
                        ) : (
                            playedSongsList.map((item, idx) => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-surface-secondary/50 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                                            {item.stats.stars > 0 ? '★' : idx + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{item.song?.title || "Unknown"}</h3>
                                            <p className="text-xs text-gray-400">{item.song?.artist}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-mono font-bold text-green-400">{item.stats.highScore}%</div>
                                        <div className="flex justify-end gap-1 mt-1">{[1,2,3].map(s => <StarIcon key={s} filled={s <= item.stats.stars} />)}</div>
                                    </div>
                                    {item.song && <button onClick={() => { setShowHistoryModal(false); startSong(item.song!); }} className="ml-4 p-3 bg-blue-600 rounded-lg hover:bg-blue-500"><PlayIcon /></button>}
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* NAVIGATION BAR */}
      <AnimatePresence>
        <motion.header 
            initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }}
            className="sticky top-0 z-50 w-full border-b border-white/10 dark:border-gray-200 bg-surface-primary/80 dark:bg-white/80 backdrop-blur-xl"
        >
            <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Mascot onClick={() => speakText(`Welcome back, ${currentUser.name}!`)} />
                    <span className="font-bold text-lg tracking-tight">Luma</span>
                </div>

                <div className="hidden md:flex items-center bg-surface-secondary dark:bg-gray-100 rounded-full p-1 border border-white/5 dark:border-gray-200">
                    {['home', 'learning', 'library'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab ? 'bg-white dark:bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white dark:hover:text-black'}`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button onClick={() => setShowUserMenu(prev => !prev)} className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/20 flex items-center justify-center text-sm font-bold shadow-inner">
                            {currentUser.name.charAt(0).toUpperCase()}
                        </button>
                        {showUserMenu && (
                            <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="absolute top-12 right-0 w-64 bg-surface-secondary dark:bg-white rounded-2xl shadow-2xl border border-white/10 dark:border-gray-200 z-50 p-2">
                                <div className="p-4 border-b border-white/5 dark:border-gray-100 mb-2">
                                    <p className="font-bold text-white dark:text-black">{currentUser.name}</p>
                                    <div className="mt-2 flex gap-2 text-xs"><span className="px-2 py-1 bg-white/5 rounded">Lvl {currentUser.level}</span></div>
                                </div>
                                {currentUser.isAdmin && <button onClick={() => setAppState(AppState.SETTINGS)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 dark:hover:bg-gray-100 text-sm"><CogIcon /> Settings</button>}
                                <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 text-sm">Sign Out</button>
                            </motion.div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.header>
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto scroll-smooth relative z-10 no-scrollbar">
        <div className="max-w-6xl mx-auto px-6 py-8 h-full">
            <AnimatePresence mode="wait">
                
                {/* --- DASHBOARD --- */}
                {activeTab === 'home' && (
                    <motion.div key="home" variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className="space-y-8">
                        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-[#0A84FF] text-white p-8 md:p-12 shadow-2xl">
                            <div className="relative z-10 max-w-xl">
                                <h2 className="text-4xl font-bold tracking-tight mb-4">Good afternoon, {currentUser.name.split(' ')[0]}.</h2>
                                <p className="text-blue-100 text-lg mb-8">You've maintained a {currentUser.streak} day streak.</p>
                                <div className="flex gap-4">
                                    <button onClick={() => setActiveTab('learning')} className="px-6 py-3 bg-white text-blue-600 rounded-full font-bold hover:bg-blue-50 transition-colors shadow-lg">Resume Learning</button>
                                    <button onClick={startJam} className="px-6 py-3 bg-blue-700 text-white rounded-full font-bold hover:bg-blue-800 transition-colors border border-blue-500">Jam Session</button>
                                </div>
                            </div>
                            <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <motion.div variants={itemVariants} className="p-6 rounded-3xl bg-surface-secondary dark:bg-white border border-white/5 dark:border-gray-200 shadow-sm">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500"><LightningIcon/></div>
                                    <h3 className="font-bold text-gray-400 text-sm uppercase">Streak</h3>
                                </div>
                                <p className="text-3xl font-bold">{currentUser.streak} days</p>
                            </motion.div>
                            <motion.div variants={itemVariants} onClick={() => setShowHistoryModal(true)} className="cursor-pointer p-6 rounded-3xl bg-surface-secondary dark:bg-white border border-white/5 dark:border-gray-200 shadow-sm hover:border-blue-500 transition-colors">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-2 bg-green-500/20 rounded-lg text-green-500"><CheckIcon/></div>
                                    <h3 className="font-bold text-gray-400 text-sm uppercase">Mastered</h3>
                                </div>
                                <p className="text-3xl font-bold">{Object.values(currentUser.progress).filter((p: SongStats) => p.stars === 3).length}</p>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {/* --- LEARNING PATH --- */}
                {activeTab === 'learning' && (
                    <LearningScreen 
                        currentUser={currentUser}
                        startSong={startSong}
                    />
                )}

                {/* --- LIBRARY (Search & Generate) --- */}
                {activeTab === 'library' && (
                    <motion.div key="library" variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className="space-y-8 pb-20">
                        <div className="bg-surface-secondary dark:bg-white p-1.5 rounded-2xl border border-white/10 dark:border-gray-200 flex items-center shadow-lg">
                            <div className="pl-4 text-gray-400"><SearchIcon /></div>
                            <input 
                                type="text" value={songSearchQuery} onChange={(e) => setSongSearchQuery(e.target.value)}
                                placeholder="Search any song title, artist, or classical piece..."
                                className="w-full bg-transparent border-none focus:ring-0 text-lg px-4 py-2 placeholder-gray-500 text-white dark:text-black"
                            />
                            <button onClick={() => handleSongGeneration(songSearchQuery)} disabled={isGenerating || !songSearchQuery.trim()} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50">
                                {isGenerating ? 'Thinking...' : 'Import'}
                            </button>
                        </div>

                        {/* AI Lesson Generator */}
                        <div className="bg-surface-secondary dark:bg-white rounded-3xl p-8 border border-white/10 dark:border-gray-200 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                            <div className="relative z-10 flex flex-col md:flex-row gap-8">
                                <div className="md:w-1/3 space-y-4">
                                    <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center"><SparklesIcon /></div>
                                    <h3 className="text-2xl font-bold text-white dark:text-black">Custom AI Lesson</h3>
                                    <p className="text-gray-500 leading-relaxed">Tell Gemini what you want to practice.</p>
                                    <button onClick={() => handleGenerateLesson && handleGenerateLesson(lessonLevel, lessonGenre)} disabled={isGenerating} className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">{isGenerating ? 'Designing...' : 'Generate Now'}</button>
                                </div>
                                <div className="md:w-2/3 flex flex-col gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Difficulty</label>
                                        <div className="grid grid-cols-3 gap-3">{levels.map(lvl => <button key={lvl} onClick={() => setLessonLevel(lvl)} className={`py-3 px-4 rounded-xl text-sm font-bold border ${lessonLevel === lvl ? 'bg-purple-600 border-purple-600 text-white' : 'bg-surface-tertiary text-gray-400 border-transparent'}`}>{lvl}</button>)}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Style</label>
                                        <div className="grid grid-cols-4 gap-3">{genres.map(g => <button key={g} onClick={() => setLessonGenre(g)} className={`py-3 px-4 rounded-xl text-sm font-bold border ${lessonGenre === g ? 'bg-blue-600 border-blue-600 text-white' : 'bg-surface-tertiary text-gray-400 border-transparent'}`}>{g}</button>)}</div>
                                    </div>
                                </div>
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
