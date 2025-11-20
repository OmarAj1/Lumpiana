
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LightningIcon, CogIcon, PlayIcon, CheckIcon, SearchIcon, HeadphonesIcon, StarIcon } from '../components/Icons';
import ThemeToggle from '../components/ThemeToggle';
import Mascot from '../components/Mascot';
import { AppState, User, Song } from '../types';
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
    handleGenerateWorkout: () => void;
    isGenerating: boolean;
    songSearchQuery: string;
    setSongSearchQuery: (q: string) => void;
    handleSongGeneration: (title: string, artist?: string) => void;
    composedSongs: Song[];
    parallax: { x: number, y: number };
    isDark: boolean;
    toggleTheme: () => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({
    currentUser, setShowUserMenu, showUserMenu, signOut, setAppState, speakText,
    activeTab, setActiveTab, startSong, startJam, handleGenerateWorkout, isGenerating,
    songSearchQuery, setSongSearchQuery, handleSongGeneration, composedSongs, parallax,
    isDark, toggleTheme
}) => {
  return (
    <div className="h-screen bg-surface-primary dark:bg-dark-surface-primary text-text-primary dark:text-dark-text-primary font-sans flex flex-col transition-colors duration-300 overflow-hidden relative">
      
      <motion.div 
        className="absolute inset-0 pointer-events-none opacity-20"
        animate={{ x: parallax.x, y: parallax.y }}
        transition={{ type: 'spring', stiffness: 100, damping: 30 }}
      >
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/30 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/30 blur-[100px] rounded-full" />
      </motion.div>

      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full max-w-5xl mx-auto px-4 pt-4">
          <div className="w-full bg-surface-primary/80 dark:bg-dark-surface-primary/80 p-4 rounded-2xl shadow-2xl backdrop-blur-xl border border-border-primary dark:border-dark-border-primary flex justify-between items-center">
                <div className="text-left">
                    <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-start to-brand-end dark:from-dark-brand-start dark:to-dark-brand-end">
                        Luma
                    </h1>
                </div>
                <div className="flex items-center gap-4 relative z-50">
                  <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
                  <div className="relative">
                    <div className="flex items-center gap-4">
                            <div className="hidden md:block text-right">
                            <div className="text-[10px] text-text-secondary dark:text-dark-text-secondary font-bold uppercase tracking-wider">Streak</div>
                            <div className="font-mono flex items-center gap-1 justify-end text-sm"><LightningIcon/> {currentUser.streak}</div>
                        </div>
                        <button
                            onClick={() => setShowUserMenu(prev => !prev)}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-start to-brand-end text-white flex items-center justify-center font-bold text-lg border border-white/20 shadow-lg"
                        >
                            {currentUser.name.charAt(0).toUpperCase()}
                        </button>
                    </div>
                    <AnimatePresence>
                        {showUserMenu && (
                           <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-14 right-0 bg-surface-secondary dark:bg-dark-surface-secondary rounded-xl shadow-2xl p-2 w-56 border border-white/10 z-50"
                            >
                                <div className="p-3 border-b border-white/5">
                                    <p className="font-bold truncate text-white dark:text-black">{currentUser.name}</p>
                                    <p className="text-xs text-gray-400 truncate">@{currentUser.tag}</p>
                                </div>
                                {currentUser.isAdmin && (
                                    <button onClick={() => setAppState(AppState.SETTINGS)} className="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-white/5 rounded-lg transition mt-1 flex items-center gap-2">
                                        <CogIcon /> Settings
                                    </button>
                                )}
                                <button onClick={signOut} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/5 rounded-lg transition mt-1">
                                    Sign Out
                                </button>
                            </motion.div>
                           </>
                        )}
                    </AnimatePresence>
                  </div>
                  <Mascot onClick={() => speakText("Welcome back!")} />
                </div>
            </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24 z-10 scroll-smooth">
        <div className="max-w-5xl mx-auto space-y-8">
            
            {/* TABS */}
            <div className="flex gap-4 border-b border-white/10 pb-1 mb-6 overflow-x-auto">
                {['home', 'library', 'composed', 'create'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all relative whitespace-nowrap ${
                            activeTab === tab 
                            ? 'text-white dark:text-blue-600' 
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-300 dark:hover:text-gray-600'
                        }`}
                    >
                        {tab}
                        {activeTab === tab && <motion.div layoutId="activeTab" className="absolute bottom-[-5px] left-0 right-0 h-0.5 bg-blue-500" />}
                    </button>
                ))}
            </div>

            {/* CONTENT */}
            <AnimatePresence mode="wait">
                {activeTab === 'home' && (
                    <motion.div 
                        key="home" 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        {/* HERO */}
                        <section className="relative rounded-3xl overflow-hidden h-64 flex items-center px-8 border border-white/10 shadow-2xl group">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 opacity-80 group-hover:opacity-90 transition-opacity" />
                            <img src="https://images.unsplash.com/photo-1552422535-c45813c61732?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" alt="Piano" />
                            <div className="relative z-10 max-w-lg">
                                <h2 className="text-4xl font-extrabold text-white mb-2">Continue Learning</h2>
                                <p className="text-blue-100 mb-6">Pick up where you left off with {COURSES[0].title}.</p>
                                <button onClick={() => startSong(COURSES[0])} className="px-6 py-3 bg-white text-blue-600 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                                    <PlayIcon /> Resume Lesson
                                </button>
                            </div>
                        </section>

                        {/* LEARNING PATH */}
                        <section>
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><CheckIcon/> Your Path</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {COURSES.map((course, idx) => {
                                    const stats = currentUser.progress[course.id];
                                    const stars = stats?.stars || 0;
                                    return (
                                        <motion.div 
                                            key={course.id}
                                            whileHover={{ y: -5 }}
                                            className="bg-surface-secondary/60 dark:bg-white/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-blue-500/50 transition-all cursor-pointer group"
                                            onClick={() => startSong(course)}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {[1,2,3].map(s => <StarIcon key={s} filled={s <= stars} />)}
                                                </div>
                                            </div>
                                            <h4 className="font-bold text-lg truncate">{course.title}</h4>
                                            <p className="text-xs text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                                            <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500" style={{ width: `${(stars/3)*100}%` }} />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </section>
                        
                         {/* WORKOUTS */}
                         <section className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-3xl p-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-orange-400 mb-1">Daily Workout</h3>
                                <p className="text-sm text-gray-400">5-minute technical drill generated by AI.</p>
                            </div>
                            <button onClick={handleGenerateWorkout} disabled={isGenerating} className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold shadow-lg transition-all disabled:opacity-50">
                                {isGenerating ? 'Generating...' : 'Start Workout'}
                            </button>
                        </section>
                    </motion.div>
                )}

                {activeTab === 'library' && (
                    <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                         {/* SEARCH / IMPORT */}
                         <div className="relative z-20">
                            <div className="bg-surface-secondary/80 border border-white/10 rounded-2xl p-1 flex items-center focus-within:ring-2 ring-blue-500/50 transition-all">
                                <div className="p-3 text-gray-400"><SearchIcon /></div>
                                <input 
                                    type="text" 
                                    value={songSearchQuery}
                                    onChange={(e) => setSongSearchQuery(e.target.value)}
                                    placeholder="Search specific song or paste IMSLP / Spotify link..." 
                                    className="bg-transparent w-full text-white placeholder-gray-500 focus:outline-none h-10"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSongGeneration(songSearchQuery)}
                                />
                                <button 
                                    onClick={() => handleSongGeneration(songSearchQuery)}
                                    disabled={!songSearchQuery.trim() || isGenerating}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGenerating ? 'Searching...' : 'Import'}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 pl-2">
                                * Supports popular songs & classical pieces via AI transcription.
                            </p>
                         </div>

                         {/* TRENDING */}
                         <div>
                             <h3 className="text-xl font-bold text-white mb-4">Trending Now</h3>
                             <div className="space-y-2">
                                 {TRENDING_SONGS_METADATA.map((song, i) => (
                                     <div 
                                        key={i} 
                                        onClick={() => handleSongGeneration(song.title, song.artist)}
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/5 group"
                                     >
                                         <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-gray-500 font-bold group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                             {i + 1}
                                         </div>
                                         <div className="flex-1">
                                             <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{song.title}</h4>
                                             <p className="text-sm text-gray-500">{song.artist}</p>
                                         </div>
                                         <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                                             <PlayIcon />
                                         </button>
                                     </div>
                                 ))}
                             </div>
                         </div>
                    </motion.div>
                )}

                {activeTab === 'composed' && (
                    <motion.div key="composed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">Previously Composed</h3>
                            <span className="text-xs text-gray-500">{composedSongs.length} Songs</span>
                        </div>
                        
                        {composedSongs.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-xl">
                                <p>No songs composed yet.</p>
                                <button onClick={() => setActiveTab('library')} className="text-blue-400 mt-2 hover:underline">Go to Library to Generate</button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {composedSongs.map((song, i) => (
                                    <div 
                                        key={song.id} 
                                        onClick={() => startSong(song)}
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/5 group"
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                                            AI
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-white">{song.title}</h4>
                                            <p className="text-sm text-gray-500">{song.artist} • {song.bpm} BPM</p>
                                        </div>
                                        <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                                            <PlayIcon />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
                
                {activeTab === 'create' && (
                     <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-20">
                        <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full mx-auto flex items-center justify-center shadow-2xl shadow-pink-500/30 mb-6 animate-bounce">
                            <HeadphonesIcon />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Jam Mode</h2>
                        <p className="text-gray-400 max-w-md mx-auto mb-8">
                            Play freely and let Luma generate an ambient backing track that adapts to your mood and chords in real-time.
                        </p>
                        <button onClick={startJam} className="px-8 py-4 bg-white text-pink-600 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl">
                            Start Jamming
                        </button>
                     </motion.div>
                )}
            </AnimatePresence>

        </div>
      </main>
    </div>
  );
};

export default MenuScreen;
