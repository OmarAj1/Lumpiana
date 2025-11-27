import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  motion, 
  AnimatePresence, 
  useMotionValue, 
  useTransform, 
  useSpring, 
  PanInfo
} from 'framer-motion';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  CheckIcon, 
  LightningIcon,
  HeadphonesIcon
} from '../components/Icons'; 
import { User, Song, SchaumBook, SongStats } from '../types';
import { COURSES, SCHAUM_BOOKS, SchaumBookData } from '../constants';
import { LevelLayout, LevelLayoutProps } from '../components/LevelLayout'; // Import LevelLayoutProps
import TiltCard from '../components/TiltCard'; // Import TiltCard

// ==========================================
// 1. HELPERS
// ==========================================

const calculateBookProgress = (bookId: string, userProgress: Record<string, SongStats>): number => {
    const songs = COURSES.filter(s => s.book === bookId && s.category === 'Song');
    if (songs.length === 0) return 0;
    const totalPossibleStars = songs.length * 3;
    let earnedStars = 0;
    songs.forEach(s => {
        const stats = userProgress[s.id];
        if (stats) earnedStars += stats.stars;
    });
    return Math.round((earnedStars / totalPossibleStars) * 100);
};

// ==========================================
// 2. VISUAL COMPONENTS
// ==========================================

const AtmosphericBackground = React.memo(({ activeBook }: { activeBook: SchaumBookData }) => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute inset-0 bg-surface-primary transition-colors duration-1000 ease-in-out" />
            
            {/* Primary Blob */}
            <motion.div 
                className="absolute top-[-20%] left-[-10%] w-[90vw] h-[90vw] rounded-full opacity-20 blur-[150px]"
                animate={{ backgroundColor: activeBook.accentColor }}
                transition={{ duration: 1.5 }}
            />
            
            {/* Secondary Blob */}
            <motion.div 
                className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full opacity-15 blur-[120px]"
                animate={{ backgroundColor: activeBook.darkColor }}
                transition={{ duration: 1.5 }}
            />

            {/* Particles */}
            <ParticleSystem particles={activeBook.particles} />

            {/* Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay" />
        </div>
    );
});

const ParticleSystem = React.memo(({ particles }: { particles: string[] }) => {
    const items = useMemo(() => {
        return Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            char: particles[i % particles.length],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            duration: 15 + Math.random() * 20,
            delay: Math.random() * 5
        }));
    }, [particles]);

    return (
        <>
            {items.map(p => (
                <motion.div
                    key={p.id}
                    className="absolute text-2xl opacity-10 select-none"
                    style={{ left: p.left, top: p.top }}
                    animate={{
                        y: [0, -100, 0],
                        x: [0, 30, -30, 0],
                        opacity: [0.1, 0.4, 0.1],
                        rotate: [0, 180],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "linear"
                    }}
                >
                    {p.char}
                </motion.div>
            ))}
        </>
    );
});


// ==========================================
// 3. INDIVIDUAL LEVEL SCREENS
// ==========================================

// Fix: Explicitly type props for LevelLayout wrapper components
interface LevelLayoutWrapperProps extends LevelLayoutProps {
    // No additional props specific to the wrapper needed if it only adds a hardcoded className
}

// Fix: Destructure className from props to avoid passing it twice via spread, then merge
const LevelPreAScreen = (props: LevelLayoutWrapperProps) => (
    <LevelLayout {...props} className={`${props.className || ''} level-pre-a`}>
        {/* Example: Custom banner for beginners */}
        <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl">
             <h4 className="font-bold text-green-400 text-sm mb-1">🌱 Start Here</h4>
             <p className="text-sm text-white/70">These songs are designed for absolute beginners. No experience needed!</p>
        </div>
    </LevelLayout>
);

const LevelGrade1Screen = (props: LevelLayoutWrapperProps) => <LevelLayout {...props} className={`${props.className || ''} level-grade-1`} />;
const LevelGrade1HalfScreen = (props: LevelLayoutWrapperProps) => <LevelLayout {...props} className={`${props.className || ''} level-grade-1-half`} />;
const LevelGrade2Screen = (props: LevelLayoutWrapperProps) => <LevelLayout {...props} className={`${props.className || ''} level-grade-2`} />;
const LevelGrade2HalfScreen = (props: LevelLayoutWrapperProps) => <LevelLayout {...props} className={`${props.className || ''} level-grade-2-half`} />;
const LevelVirtuosoScreen = (props: LevelLayoutWrapperProps) => <LevelLayout {...props} className={`${props.className || ''} level-virtuoso`} />;

// ==========================================
// 4. MAIN LEARNING ROUTER
// ==========================================

interface LearningScreenProps {
    currentUser: User;
    startSong: (song: Song) => void;
}

export const LearningScreen: React.FC<LearningScreenProps> = ({ currentUser, startSong }) => {
    // --- STATE ---
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedBookId, setSelectedBookId] = useState<SchaumBook | null>(null);
    const [viewMode, setViewMode] = useState<'carousel' | 'detail'>('carousel');
    
    // --- DERIVED DATA ---
    const activeBook = SCHAUM_BOOKS[activeIndex];
    const selectedBook = useMemo(() => SCHAUM_BOOKS.find(b => b.id === selectedBookId), [selectedBookId]);
    
    const progressMap = useMemo(() => {
        const map: Record<string, number> = {};
        SCHAUM_BOOKS.forEach(b => map[b.id] = calculateBookProgress(b.id, currentUser.progress));
        return map;
    }, [currentUser]);

    // --- CAROUSEL NAVIGATION ---
    const handleNext = useCallback(() => setActiveIndex(prev => (prev + 1) % SCHAUM_BOOKS.length), []);
    const handlePrev = useCallback(() => setActiveIndex(prev => (prev - 1 + SCHAUM_BOOKS.length) % SCHAUM_BOOKS.length), []);
    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.x < -50) handleNext();
        else if (info.offset.x > 50) handlePrev();
    };

    const handleSelectBook = useCallback(() => {
        setSelectedBookId(SCHAUM_BOOKS[activeIndex].id);
        setViewMode('detail');
    }, [activeIndex]);

    const handleCloseDetail = useCallback(() => {
        setViewMode('carousel');
        setTimeout(() => setSelectedBookId(null), 500); 
    }, []);

    // --- KEYBOARD SUPPORT ---
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (viewMode === 'detail') {
                if (e.key === 'Escape') handleCloseDetail();
                return;
            }
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Enter') handleSelectBook();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [viewMode, handleNext, handlePrev, handleSelectBook, handleCloseDetail]);

    // --- ROUTER LOGIC ---
    const renderDetailView = () => {
        if (!selectedBook) return null;
        
        const commonProps: LevelLayoutWrapperProps = { // Fix: Pass LevelLayoutWrapperProps instead of LevelLayoutProps
            book: selectedBook,
            currentUser,
            startSong,
            onClose: handleCloseDetail
        };

        switch (selectedBook.id) {
            case 'Pre-A': return <LevelPreAScreen {...commonProps} />;
            case 'A': return <LevelGrade1Screen {...commonProps} />;
            case 'B': return <LevelGrade1HalfScreen {...commonProps} />;
            case 'C': return <LevelGrade2Screen {...commonProps} />;
            case 'D': return <LevelGrade2HalfScreen {...commonProps} />;
            case 'Virtuoso': return <LevelVirtuosoScreen {...commonProps} />;
            default: return <LevelLayout {...commonProps} />;
        }
    };

    return (
        <div className="relative w-full h-full overflow-hidden flex flex-col font-sans">
            <AtmosphericBackground activeBook={selectedBook || activeBook} />

            <AnimatePresence mode="wait">
                {viewMode === 'carousel' && (
                    <motion.div 
                        key="carousel-container"
                        className="relative z-10 flex-1 flex flex-col items-center justify-center py-4 select-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
                    >
                        <div className="text-center mb-4 md:mb-8 z-20 px-6">
                            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 dark:border-border-default backdrop-blur-sm mb-4">
                                <HeadphonesIcon />
                                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Course Library</span>
                            </motion.div>
                            {/* REDUCED TITLE SIZE HERE */}
                            <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-2xl md:text-4xl font-black text-text-primary mb-2 tracking-tight">
                                Learning Path
                            </motion.h1>
                        </div>

                        <div className="relative w-full max-w-[1400px] h-[450px] md:h-[600px] flex items-center justify-center perspective-[2000px] touch-pan-y">
                            <button onClick={handlePrev} className="hidden md:flex absolute left-8 z-50 w-14 h-14 rounded-full bg-surface-secondary/80 hover:bg-white/10 dark:hover:bg-surface-tertiary border border-white/10 dark:border-border-default backdrop-blur-md items-center justify-center text-text-primary transition-all hover:scale-110 active:scale-95"><ChevronLeftIcon /></button>
                            <button onClick={handleNext} className="hidden md:flex absolute right-8 z-50 w-14 h-14 rounded-full bg-surface-secondary/80 hover:bg-white/10 dark:hover:bg-surface-tertiary border border-white/10 dark:border-border-default backdrop-blur-md items-center justify-center text-text-primary transition-all hover:scale-110 active:scale-95"><ChevronRightIcon /></button>

                            {SCHAUM_BOOKS.map((book, index) => {
                                let offset = index - activeIndex;
                                const total = SCHAUM_BOOKS.length;
                                if (offset > total / 2) offset -= total;
                                if (offset < -total / 2) offset += total;
                                if (Math.abs(offset) > 2) return null;
                                const isActive = offset === 0;

                                return (
                                    <motion.div
                                        key={book.id}
                                        className="absolute w-[85vw] max-w-[320px] md:max-w-[420px] aspect-[3/4.5] touch-none"
                                        style={{
                                            transformStyle: "preserve-3d",
                                            willChange: "transform",
                                            pointerEvents: isActive ? 'auto' : 'none',
                                            zIndex: 100 - Math.abs(offset),
                                        }}
                                        initial={false}
                                        animate={{
                                            x: `${offset * 65}%`,
                                            scale: isActive ? 1 : 0.85,
                                            opacity: isActive ? 1 : 0.4,
                                            rotateY: isActive ? 0 : offset * -25 
                                        }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        drag={isActive ? "x" : false} 
                                        dragConstraints={{ left: 0, right: 0 }}
                                        dragElastic={0.1}
                                        onDragEnd={isActive ? handleDragEnd : undefined}
                                    >
                                        <TiltCard 
                                            book={book} 
                                            isActive={isActive}
                                            progress={progressMap[book.id]}
                                            onClick={handleSelectBook}
                                        />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {viewMode === 'detail' && (
                    <motion.div 
                        key="detail-container"
                        className="absolute inset-0 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {renderDetailView()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};