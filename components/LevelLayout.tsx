import React, { useRef, useState, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, HeadphonesIcon, SearchIcon } from './Icons';
import { Song, User } from '../types';
import { SchaumBookData, COURSES } from '../constants';
import SongListItem from './SongListItem';

export interface LevelLayoutProps {
    book: SchaumBookData;
    currentUser: User;
    onClose: () => void;
    startSong: (song: Song) => void;
    children?: React.ReactNode; // Allow injecting custom content per level
    className?: string; // Add className prop for proper prop drilling
}

// Helper function to convert hex to rgba
const hexToRgba = (hex: string, alpha: number) => {
    if (!hex || hex.length !== 7 || hex[0] !== '#') {
        // Fallback to a default color if hex is invalid
        hex = '#60a5fa'; // Default blue
    }
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const LevelLayout = ({ book, currentUser, onClose, startSong, children, className }: LevelLayoutProps) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll({ container: scrollContainerRef });

    // --- SCROLL ANIMATIONS ---
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
    const heroScale = useTransform(scrollY, [0, 400], [1, 0.9]);
    const heroY = useTransform(scrollY, [0, 400], [0, -100]);
    
    // Sticky Header Border Logic - uses book's accent color
    const stickyBorderColor = useTransform(scrollY, [350, 450], [
        hexToRgba(book.accentColor, 0),   // Start with transparent border
        hexToRgba(book.accentColor, 0.05)  // End with 5% opaque accent color border
    ]);

    // New: Sticky header content animation
    const stickyIconOpacity = useTransform(scrollY, [250, 400], [0, 1]);
    const stickyTitleOpacity = useTransform(scrollY, [300, 450], [0, 1]);
    const stickyIconScale = useTransform(scrollY, [250, 400], [0.8, 1]); // Raw scale factor for size animation
    const stickyTitleY = useTransform(scrollY, [300, 450], [10, 0]); // Slide in from bottom

    // New: Derive width, height, and font-size from stickyIconScale
    const stickyIconWidth = useTransform(stickyIconScale, s => `${s * 32}px`);
    const stickyIconHeight = useTransform(stickyIconScale, s => `${s * 32}px`);
    const stickyIconFontSize = useTransform(stickyIconScale, s => `${s * 16}px`);

    const [listFilter, setListFilter] = useState<'Course' | 'Song'>('Course');
    
    const displayedSongs = useMemo(() => {
        return COURSES.filter(s => s.book === book.id && s.category === listFilter);
    }, [book.id, listFilter]);

    return (
        <motion.div 
            className={`absolute inset-0 z-50 flex flex-col bg-transparent ${className || ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* --- SCROLLABLE CONTENT --- */}
            <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 no-scrollbar bg-surface-primary"
            >
                {/* 1. HERO SECTION (Fades on Scroll) */}
                <motion.div 
                    className="w-full h-[500px] relative shrink-0 flex items-end pb-24 px-6 overflow-hidden"
                    style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
                >
                    {/* Background Card with Gradient */}
                    <motion.div 
                        layoutId={`card-container-${book.id}`}
                        layout={false}
                        className="absolute inset-0 z-0 shadow-2xl origin-bottom"
                        style={{ background: book.gradient }}
                    >
                         <div className="absolute -right-[5%] -bottom-[20%] text-[25rem] opacity-10 select-none pointer-events-none rotate-12 blur-sm">
                            {book.icon}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </motion.div>

                    {/* Hero Info */}
                    <div className="relative z-10 max-w-6xl mx-auto w-full mb-8">
                        <motion.div 
                            layoutId={`book-icon-${book.id}`}
                            className="w-24 h-24 mb-6 rounded-3xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-5xl shadow-[inset_0_0_40px_rgba(255,255,255,0.1)] border border-white/20"
                        >
                            {book.icon}
                        </motion.div>
                        
                        <motion.h2 
                            layoutId={`book-title-${book.id}`}
                            className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-2 drop-shadow-lg"
                        >
                            {book.title}
                        </motion.h2>
                        <motion.p 
                            layoutId={`book-subtitle-${book.id}`}
                            className="text-2xl md:text-3xl text-white/90 font-medium"
                        >
                            {book.subtitle}
                        </motion.p>
                        <p className="text-white/70 mt-4 max-w-lg text-lg leading-relaxed">{book.desc}</p>
                        {/* Inject Custom Level Content here */}
                        {children}
                    </div>
                </motion.div>

                {/* 2. STICKY NAV BAR & LIST CONTENT */}
                <div className="relative z-20 flex-1 -mt-12 bg-surface-primary rounded-t-3xl shadow-xl overflow-hidden">
                    {/* UNIFIED STICKY HEADER: [Back] [Book Info] [Tabs] [Count] */}
                    <motion.div 
                        className="sticky top-0 z-40 py-3 px-6 flex items-center shadow-lg transition-all duration-300 ease-in-out bg-surface-primary/80 backdrop-blur-2xl"
                        style={{ 
                            borderBottom: '1px solid',
                            borderBottomColor: stickyBorderColor, // Themed border color
                            WebkitBackdropFilter: "blur(20px)", // For Safari
                        }}
                    >
                        <div className="max-w-6xl mx-auto w-full flex items-center gap-4">
                            {/* Back Button */}
                            <button 
                                onClick={onClose}
                                className="px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 transition-colors group text-text-secondary hover:bg-white/10 dark:hover:bg-surface-interactive active:scale-95 shrink-0"
                                title="Go Back"
                            >
                                <ChevronLeftIcon className="w-5 h-5 group-hover:text-text-primary" /> 
                                <span className="group-hover:text-text-primary">Back</span>
                            </button>

                            {/* Book Icon & Title (Animated) */}
                            <motion.div 
                                className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
                                style={{ opacity: stickyIconOpacity }}
                            >
                                <motion.div 
                                    className="rounded-lg flex items-center justify-center shrink-0"
                                    style={{
                                        background: `${book.accentColor}20`,
                                        color: book.accentColor,
                                        width: stickyIconWidth, // Use derived motion value
                                        height: stickyIconHeight, // Use derived motion value
                                        fontSize: stickyIconFontSize, // Use derived motion value
                                        border: `1px solid ${book.accentColor}40`
                                    }}
                                >
                                    {book.icon}
                                </motion.div>
                                <motion.span 
                                    className="text-lg font-bold text-text-primary truncate"
                                    style={{ opacity: stickyTitleOpacity, y: stickyTitleY }}
                                >
                                    {book.title}
                                </motion.span>
                            </motion.div>

                            {/* Tabs and Track Count (Pushed to right) */}
                            <div className="flex-1 flex justify-end items-center gap-4 ml-auto"> {/* Use ml-auto to push to right */}
                                {/* Tabs */}
                                <div className="flex p-1.5 rounded-full bg-white/5 dark:bg-surface-interactive border border-border-default shadow-inner">
                                    {(['Course', 'Song'] as const).map(f => (
                                        <button 
                                            key={f} 
                                            onClick={() => setListFilter(f)}
                                            className={`relative px-5 py-2 rounded-full text-sm font-extrabold transition-all z-10 ${listFilter === f ? 'text-black' : 'text-text-secondary hover:text-text-primary'}`}
                                        >
                                            {listFilter === f && (
                                                <motion.div 
                                                    layoutId="filter-pill"
                                                    className="absolute inset-0 bg-white dark:bg-surface-primary shadow-sm rounded-full -z-10"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                            {f === 'Course' ? 'Curriculum' : 'Bonus Tracks'}
                                        </button>
                                    ))}
                                </div>

                                {/* Track Count */}
                                <div className="text-sm font-semibold text-text-secondary flex items-center gap-2 shrink-0">
                                    <HeadphonesIcon className="w-4 h-4 text-text-secondary" />
                                    {displayedSongs.length} Tracks
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Song List */}
                    <div className="space-y-3 px-4 md:px-0 py-8 pb-32">
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
                                        <div className="w-24 h-24 bg-surface-secondary rounded-full flex items-center justify-center text-4xl mb-6">
                                            <SearchIcon />
                                        </div>
                                        <h3 className="text-2xl font-bold text-text-primary mb-2">No tracks here yet</h3>
                                        <p className="text-text-secondary max-w-sm mx-auto">
                                            Check back later or try generating a custom song in the Library tab.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
};