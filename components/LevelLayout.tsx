
import React, { useRef, useState, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, SearchIcon } from './Icons';
import { Song, User } from '../types';
import { SchaumBookData, COURSES } from '../constants';
import SongListItem from './SongListItem';

interface LevelLayoutProps {
    book: SchaumBookData;
    currentUser: User;
    onClose: () => void;
    startSong: (song: Song) => void;
    children?: React.ReactNode; // Allow injecting custom content per level
}

export const LevelLayout: React.FC<LevelLayoutProps> = ({ book, currentUser, onClose, startSong, children }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll({ container: scrollContainerRef });

    // --- SCROLL ANIMATIONS ---
    const heroOpacity = useTransform(scrollY, [0, 250], [1, 0]);
    const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);
    const heroY = useTransform(scrollY, [0, 300], [0, -50]);
    
    const headerBgOpacity = useTransform(scrollY, [50, 150], [0, 1]);
    const headerBlur = useTransform(scrollY, [50, 150], [0, 12]);
    const headerY = useTransform(scrollY, [0, 100], [-10, 0]);

    const [listFilter, setListFilter] = useState<'Course' | 'Song'>('Course');
    
    const displayedSongs = useMemo(() => {
        return COURSES.filter(s => s.book === book.id && s.category === listFilter);
    }, [book.id, listFilter]);

    return (
        <motion.div 
            className="absolute inset-0 z-50 flex flex-col bg-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* --- STICKY TOP NAVIGATION --- */}
            <motion.div 
                className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center px-6 border-b border-transparent transition-colors"
                style={{ 
                    backgroundColor: useTransform(headerBgOpacity, opacity => `rgba(24, 24, 27, ${opacity * 0.9})`),
                    backdropFilter: useTransform(headerBlur, b => `blur(${b}px)`),
                    borderBottomColor: useTransform(headerBgOpacity, o => `rgba(255,255,255, ${o * 0.1})`),
                    y: headerY
                }}
            >
                <div className="max-w-6xl mx-auto w-full flex items-center gap-6">
                    <motion.button 
                        onClick={onClose}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all font-bold text-sm border border-white/5"
                    >
                        <ChevronLeftIcon /> Library
                    </motion.button>

                    <div className="flex items-center gap-4 border-l border-white/10 pl-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                {book.difficultyLabel}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-xl leading-none select-none" role="img" aria-label="Book Icon">{book.icon}</span>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-white font-bold text-lg leading-none">{book.title}</h3>
                                    <span className="text-white/50 text-sm hidden sm:inline-block font-medium">{book.subtitle}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* --- SCROLLABLE CONTENT --- */}
            <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 no-scrollbar"
            >
                {/* 1. HERO SECTION (Fades on Scroll) */}
                <motion.div 
                    className="w-full h-[400px] relative shrink-0 flex items-end pb-12 px-6"
                    style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
                >
                    {/* Background Card with Gradient */}
                    <motion.div 
                        layoutId={`card-container-${book.id}`}
                        layout={false}
                        className="absolute inset-0 z-0 rounded-b-[3rem] shadow-2xl"
                        style={{ background: book.gradient }}
                    >
                         <div className="absolute -right-[5%] -bottom-[20%] text-[20rem] opacity-10 select-none pointer-events-none rotate-12 blur-sm">
                            {book.icon}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </motion.div>

                    {/* Hero Info */}
                    <div className="relative z-10 max-w-6xl mx-auto w-full">
                        <motion.div 
                            layoutId={`book-icon-${book.id}`}
                            className="w-24 h-24 mb-6 rounded-3xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-5xl shadow-[inset_0_0_40px_rgba(255,255,255,0.1)] border border-white/20"
                        >
                            {book.icon}
                        </motion.div>
                        
                        <motion.h2 
                            layoutId={`book-title-${book.id}`}
                            className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-2 drop-shadow-lg"
                        >
                            {book.title}
                        </motion.h2>
                        <motion.p 
                            layoutId={`book-subtitle-${book.id}`}
                            className="text-xl md:text-2xl text-white/90 font-medium"
                        >
                            {book.subtitle}
                        </motion.p>
                        <p className="text-white/70 mt-2 max-w-md">{book.desc}</p>
                    </div>
                </motion.div>

                {/* 2. LIST CONTENT AREA */}
                <div className="relative z-20 min-h-screen bg-surface-primary dark:bg-zinc-50 -mt-8 rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t border-white/10 dark:border-gray-200">
                    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
                        
                        {/* Filter Tabs */}
                        <div className="sticky top-0 z-30 pt-4 pb-6 bg-surface-primary dark:bg-zinc-50">
                            <div className="flex items-center justify-between">
                                <div className="flex p-1 rounded-xl bg-surface-secondary dark:bg-gray-200 border border-white/10 dark:border-transparent">
                                    {(['Course', 'Song'] as const).map(f => (
                                        <button 
                                            key={f} 
                                            onClick={() => setListFilter(f)}
                                            className={`relative px-6 py-2.5 rounded-lg text-sm font-bold transition-all z-10 ${listFilter === f ? 'text-black' : 'text-gray-500 hover:text-white dark:hover:text-gray-800'}`}
                                        >
                                            {listFilter === f && (
                                                <motion.div 
                                                    layoutId="filter-pill"
                                                    className="absolute inset-0 bg-white shadow-sm rounded-lg -z-10"
                                                />
                                            )}
                                            {f === 'Course' ? 'Curriculum' : 'Bonus Tracks'}
                                        </button>
                                    ))}
                                </div>
                                <div className="text-sm text-gray-400 font-medium">
                                    {displayedSongs.length} Tracks
                                </div>
                            </div>
                        </div>

                        {/* Song List */}
                        <div className="space-y-4 pb-32">
                             <AnimatePresence mode="popLayout">
                                {displayedSongs.length > 0 ? (
                                    displayedSongs.map((song, i) => (
                                        <SongListItem 
                                            key={song.id} 
                                            song={song} 
                                            index={i} 
                                            stats={currentUser.progress[song.id]} 
                                            bookColor={book.accentColor} 
                                            onPlay={() => startSong(song)} 
                                        />
                                    ))
                                ) : (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-col items-center justify-center py-20 text-center opacity-60"
                                    >
                                        <div className="w-24 h-24 bg-surface-secondary dark:bg-gray-200 rounded-full flex items-center justify-center text-4xl mb-6">
                                            <SearchIcon />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white dark:text-gray-900 mb-2">No tracks here yet</h3>
                                        <p className="text-gray-500 max-w-sm mx-auto">
                                            Check back later or try generating a custom song in the Library tab.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            
                            {/* Inject Custom Level Content */}
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
