
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LightningIcon, CogIcon, PlayIcon, CheckIcon, SearchIcon, HeadphonesIcon, StarIcon, SparklesIcon } from '../components/Icons';
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
    handleGenerateWorkout: (difficulty?: string) => void;
    isGenerating: boolean;
    songSearchQuery: string;
    setSongSearchQuery: (q: string) => void;
    handleSongGeneration: (title: string, artist?: string) => void;
    composedSongs: Song[];
    parallax: { x: number, y: number };
    isDark: boolean;
    toggleTheme: () => void;
}

const STAGE_CONFIG: Record<number, { title: string, difficulty: string, description: string }> = {
    1: { title: "Beginner", difficulty: "very simple 5-finger patterns and note recognition", description: "Master the basics of rhythm and hand placement." },
    2: { title: "Early Intermediate", difficulty: "basic chords and hand independence", description: "Introduction to two-handed playing." },
    3: { title: "Intermediate", difficulty: "scales, arpeggios, and dynamics", description: "Expand your range and expression." },
    4: { title: "Advanced Intermediate", difficulty: "complex syncopation and 4-note chords", description: "Tackle challenging rhythms and harmonies." },
    5: { title: "Advanced", difficulty: "rapid scale runs and virtuoso techniques", description: "Professional level technical skills." },
    6: { title: "Master", difficulty: "concert level performance", description: "Complete mastery of the instrument." }
};

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
                  {/* Theme Toggle moved to Settings, Removed from Header as requested */}
                  <div className="relative">
                    <div className="flex items-center gap-4">
                            <div className="hidden md:block text-right">
                            <div className="text-[10px] text-text-secondary dark:text-dark-text-secondary font-bold uppercase tracking-wider">Level {currentUser.level}</div>
                            <div className="font-mono flex items-center gap-1 justify-end text-sm text-yellow-400"><LightningIcon/> {currentUser.streak} Day Streak</div>
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
                                <div className="p-2">
                                    <p className="text-xs text-gray-500">XP: <span className="text-white dark:text-black font-mono">{currentUser.xp}</span></p>
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
                  <Mascot onClick={() => speakText(`You are currently level ${currentUser.level}. Keep going!`)} />
                </div>
            </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24 z-10 scroll-smooth">
        <div className="max-w-5xl mx-auto space-y-8">
            
            {/* TABS */}
            <div className="flex gap-4 border-b border-white/10 pb-1 mb-6 overflow-x-auto">
                {['home', 'learning', 'library', 'composed', 'create'].map(tab => (
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
                        {/* DASHBOARD HERO */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <h2 className="text-3xl font-extrabold mb-2">Welcome Back, {currentUser.name}</h2>
                                    <p className="text-blue-100 mb-6">You're on a {currentUser.streak} day streak! Continue your journey to mastery.</p>
                                    <button onClick={() => setActiveTab('learning')} className="px-6 py-3 bg-white text-blue-600 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
                                        Go to Learning Path
                                    </button>
                                </div>
                                <div className="absolute right-[-20px] bottom-[-20px] opacity-20 rotate-12">
                                    <div className="w-40 h-40 bg-white rounded-full blur-2xl" />
                                </div>
                            </div>

                            <div className="bg-surface-secondary/50 dark:bg-white/50 backdrop-blur border border-white/10 rounded-3xl p-8 flex flex-col justify-center">
                                <h3 className="text-gray-400 font-bold uppercase text-sm mb-2">Current Level</h3>
                                <div className="flex items-end gap-4">
                                    <span className="text-6xl font-extrabold text-white dark:text-blue-600">{currentUser.level}</span>
                                    <div className="pb-2 text-gray-400">
                                        <p className="text-sm">Total XP: {currentUser.xp}</p>
                                        <div className="w-32 h-2 bg-gray-700 rounded-full mt-1 overflow-hidden">
                                            <div className="h-full bg-green-400" style={{ width: `${(currentUser.xp % 1000) / 10}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RECENT ACTIVITY */}
                        <section>
                             <h3 className="text-xl font-bold text-white dark:text-gray-800 mb-4">Quick Actions</h3>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                 <button onClick={() => startJam()} className="p-4 bg-pink-500/10 border border-pink-500/20 rounded-2xl hover:bg-pink-500/20 transition-colors text-left group">
                                     <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform"><HeadphonesIcon/></div>
                                     <p className="font-bold text-pink-400">Jam Session</p>
                                     <p className="text-xs text-gray-500">Free play with AI</p>
                                 </button>
                                 <button onClick={() => handleGenerateWorkout('general')} className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl hover:bg-orange-500/20 transition-colors text-left group">
                                     <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform"><LightningIcon/></div>
                                     <p className="font-bold text-orange-400">Daily Workout</p>
                                     <p className="text-xs text-gray-500">Technical drill</p>
                                 </button>
                             </div>
                        </section>
                    </motion.div>
                )}

                {activeTab === 'learning' && (
                    <motion.div 
                        key="learning" 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="space-y-12 py-8 relative"
                    >
                        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500/0 via-blue-500/50 to-blue-500/0 -translate-x-1/2 pointer-events-none" />

                        {[1, 2, 3, 4, 5, 6].map((stageNum) => {
                            const isLocked = currentUser.level < stageNum; // Simple lock logic
                            const config = STAGE_CONFIG[stageNum];
                            const stageSongs = COURSES.filter(c => c.stage === stageNum);

                            return (
                                <div key={stageNum} className={`relative flex flex-col md:flex-row gap-8 ${stageNum % 2 === 0 ? 'md:flex-row-reverse' : ''} items-center`}>
                                    
                                    {/* NODE MARKER */}
                                    <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-4 border-surface-primary dark:border-white z-10 flex items-center justify-center bg-surface-primary dark:bg-white">
                                        <div className={`w-4 h-4 rounded-full ${isLocked ? 'bg-gray-600' : 'bg-blue-500 animate-pulse'}`} />
                                    </div>

                                    {/* CONTENT CARD */}
                                    <div className={`w-full md:w-[calc(50%-3rem)] ml-16 md:ml-0 ${isLocked ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                                        <div className="bg-surface-secondary dark:bg-white/80 backdrop-blur-xl border border-white/10 dark:border-gray-200 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-blue-500/50 transition-all">
                                            {isLocked && (
                                                <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center">
                                                    <span className="px-4 py-2 bg-black/80 rounded-full text-xs font-bold text-white border border-white/20">LOCKED • Level {stageNum} Required</span>
                                                </div>
                                            )}
                                            
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-1">Stage {stageNum}</h4>
                                                    <h3 className="text-2xl font-extrabold text-white dark:text-gray-900">{config.title}</h3>
                                                </div>
                                                <div className="text-4xl text-white/10 dark:text-black/5 font-black absolute top-4 right-4">
                                                    {stageNum}
                                                </div>
                                            </div>
                                            
                                            <p className="text-gray-400 dark:text-gray-600 mb-6 text-sm">{config.description}</p>

                                            {/* Stage Specific Trainer */}
                                            <button 
                                                onClick={() => handleGenerateWorkout(config.difficulty)}
                                                disabled={isGenerating}
                                                className="w-full py-3 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all"
                                            >
                                                {isGenerating ? 'Generating...' : (
                                                    <>
                                                        <SparklesIcon /> Start AI Training
                                                    </>
                                                )}
                                            </button>

                                            {/* Curated Songs List */}
                                            <div className="space-y-2">
                                                <h5 className="text-xs font-bold text-gray-500 uppercase">Curated Repertoire</h5>
                                                {stageSongs.length > 0 ? stageSongs.map(song => {
                                                    const stats = currentUser.progress[song.id];
                                                    return (
                                                        <div 
                                                            key={song.id} 
                                                            onClick={() => startSong(song)}
                                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 dark:hover:bg-black/5 cursor-pointer transition-colors"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-gray-700 dark:bg-gray-200 flex items-center justify-center text-xs font-bold text-white dark:text-gray-700">
                                                                <PlayIcon />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold text-sm text-white dark:text-gray-800 truncate">{song.title}</p>
                                                                <p className="text-xs text-gray-500 truncate">{song.artist}</p>
                                                            </div>
                                                            <div className="flex text-yellow-400">
                                                                {[1,2,3].map(s => <StarIcon key={s} filled={s <= (stats?.stars || 0)} />)}
                                                            </div>
                                                        </div>
                                                    );
                                                }) : (
                                                    <p className="text-xs text-gray-500 italic">No songs available.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                )}

                {activeTab === 'library' && (
                    <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                         {/* SEARCH / IMPORT */}
                         <div className="relative z-20">
                            <div className="bg-surface-secondary/80 dark:bg-white border border-white/10 dark:border-gray-200 rounded-2xl p-1 flex items-center focus-within:ring-2 ring-blue-500/50 transition-all shadow-lg">
                                <div className="p-3 text-gray-400"><SearchIcon /></div>
                                <input 
                                    type="text" 
                                    value={songSearchQuery}
                                    onChange={(e) => setSongSearchQuery(e.target.value)}
                                    placeholder="Search specific song or paste IMSLP / Spotify link..." 
                                    className="bg-transparent w-full text-white dark:text-gray-900 placeholder-gray-500 focus:outline-none h-10"
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
                             <h3 className="text-xl font-bold text-white dark:text-gray-800 mb-4">Trending Now</h3>
                             <div className="space-y-2">
                                 {TRENDING_SONGS_METADATA.map((song, i) => (
                                     <div 
                                        key={i} 
                                        onClick={() => handleSongGeneration(song.title, song.artist)}
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 dark:hover:bg-gray-100 cursor-pointer transition-colors border border-transparent hover:border-white/5 group"
                                     >
                                         <div className="w-12 h-12 rounded-lg bg-gray-800 dark:bg-gray-200 flex items-center justify-center text-gray-500 font-bold group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                             {i + 1}
                                         </div>
                                         <div className="flex-1">
                                             <h4 className="font-bold text-white dark:text-gray-900 group-hover:text-blue-400 transition-colors">{song.title}</h4>
                                             <p className="text-sm text-gray-500">{song.artist}</p>
                                         </div>
                                         <button className="w-8 h-8 rounded-full border border-white/20 dark:border-gray-300 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
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
                            <h3 className="text-xl font-bold text-white dark:text-gray-800">Previously Composed</h3>
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
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 dark:hover:bg-gray-100 cursor-pointer transition-colors border border-transparent hover:border-white/5 group"
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                                            AI
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-white dark:text-gray-900">{song.title}</h4>
                                            <p className="text-sm text-gray-500">{song.artist} • {song.bpm} BPM</p>
                                        </div>
                                        <button className="w-8 h-8 rounded-full border border-white/20 dark:border-gray-300 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
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
                        <h2 className="text-3xl font-bold text-white dark:text-gray-900 mb-4">Jam Mode</h2>
                        <p className="text-gray-400 max-w-md mx-auto mb-8">
                            Play freely and let Luma generate an ambient backing track that adapts to your mood and chords in real-time.
                        </p>
                        <button onClick={startJam} className="px-8 py-4 bg-white text-pink-600 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl border border-gray-200">
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
