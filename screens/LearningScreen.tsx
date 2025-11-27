
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
import { LevelLayout } from '../components/LevelLayout';

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
            <div className="absolute inset-0 bg-surface-primary dark:bg-zinc-50 transition-colors duration-1000 ease-in-out" />
            
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

interface TiltCardProps {
    book: SchaumBookData;
    isActive: boolean;
    progress: number;
    onClick: () => void;
}

const TiltCard = ({ book, isActive, progress, onClick }: TiltCardProps) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const scale = useMotionValue(1);

    const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseY = useSpring(y, { stiffness: 300, damping: 30 });
    const scaleSpring = useSpring(scale, { stiffness: 300, damping: 25 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [12, -12]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-12, 12]);
    
    const sheenX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
    const sheenY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);
    const sheenOpacity = useTransform(scaleSpring, [1, 1.05], [0, 0.6]);
    const contentZ = useTransform(scaleSpring, [1, 1.05], [0, 30]);

    useEffect(() => {
        if (!isActive) {
            mouseX.jump(0);
            mouseY.jump(0);
            scaleSpring.jump(1);
        }
    }, [isActive, mouseX, mouseY, scaleSpring]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isActive) return;
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    return (
        <div 
            className="relative w-full h-full cursor-pointer touch-none"
            onMouseMove={isActive ? handleMouseMove : undefined}
            onMouseEnter={() => isActive && scale.set(1.05)}
            onMouseLeave={() => { x.set(0); y.set(0); scale.set(1); }}
            onClick={onClick}
            style={{ perspective: 1200 }} 
        >
            <div className="absolute inset-0 z-0 pointer-events-auto" />
            <motion.div 
                layoutId={isActive ? `card-container-${book.id}` : undefined}
                layout={false}
                transformTemplate={(_, generated) => generated}
                className="w-full h-full rounded-[2.5rem] relative preserve-3d border border-white/10 dark:border-white/50 bg-surface-secondary overflow-hidden pointer-events-none"
                style={{ 
                    rotateX: isActive ? rotateX : 0, 
                    rotateY: isActive ? rotateY : 0,
                    scale: isActive ? scaleSpring : 1, 
                    background: book.gradient,
                    boxShadow: isActive ? `0 25px 50px -12px ${book.shadow}` : `0 10px 30px -10px rgba(0,0,0,0.3)`,
                    transformStyle: "preserve-3d",
                    willChange: "transform"
                }}
            >
                <motion.div 
                    className="absolute inset-0 z-30 pointer-events-none mix-blend-overlay"
                    style={{
                        background: `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255,255,255,0.5) 0%, transparent 50%)`,
                        opacity: isActive ? sheenOpacity : 0 
                    }}
                />
                <motion.div 
                    className="relative z-20 flex flex-col h-full p-8 justify-between text-white"
                    style={{ z: contentZ, transformStyle: "preserve-3d" }}
                >
                    <div className="flex justify-between items-start">
                        <motion.div 
                            layoutId={isActive ? `book-icon-${book.id}` : undefined}
                            className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-[inset_0_0_20px_rgba(255,255,255,0.2)] border border-white/20"
                        >
                            {book.icon}
                        </motion.div>
                        <div className="px-3 py-1.5 bg-black/30 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 shadow-lg flex items-center gap-1">
                            {isActive ? <span className="animate-pulse text-green-400">●</span> : null}
                            {book.difficultyLabel}
                        </div>
                    </div>
                    <div className="space-y-2 mt-4">
                        <motion.h2 layoutId={isActive ? `book-title-${book.id}` : undefined} className="text-4xl md:text-5xl font-black tracking-tighter drop-shadow-xl">{book.title}</motion.h2>
                        <motion.p layoutId={isActive ? `book-subtitle-${book.id}` : undefined} className="text-lg font-medium text-white/90 tracking-tight">{book.subtitle}</motion.p>
                    </div>
                    <div className="space-y-3 mt-auto">
                        <div className="flex justify-between items-end text-xs font-bold uppercase tracking-wider text-white/90">
                            <span className="flex items-center gap-1">{progress === 100 ? <CheckIcon /> : <LightningIcon />}{progress === 100 ? 'Mastered' : 'Progress'}</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-md border border-white/5">
                            <motion.div 
                                className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1.2, ease: "circOut", delay: 0.2 }}
                            />
                        </div>
                        <motion.div className="h-8 overflow-hidden" animate={{ opacity: isActive ? 1 : 0.5 }}>
                            <p className="text-xs text-white/70 font-medium leading-relaxed truncate">{book.desc}</p>
                        </motion.div>
                    </div>
                </motion.div>
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
            </motion.div>
        </div>
    );
};

// ==========================================
// 3. INDIVIDUAL LEVEL SCREENS
// ==========================================
// This structure allows for easy customization of specific levels in the future.

const LevelPreAScreen = (props: any) => (
    <LevelLayout {...props}>
        {/* Example: Custom banner for beginners */}
        <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl">
             <h4 className="font-bold text-green-400 text-sm mb-1">🌱 Start Here</h4>
             <p className="text-sm text-white/70">These songs are designed for absolute beginners. No experience needed!</p>
        </div>
    </LevelLayout>
);

const LevelGrade1Screen = (props: any) => <LevelLayout {...props} />;
const LevelGrade1HalfScreen = (props: any) => <LevelLayout {...props} />;
const LevelGrade2Screen = (props: any) => <LevelLayout {...props} />;
const LevelGrade2HalfScreen = (props: any) => <LevelLayout {...props} />;
const LevelVirtuosoScreen = (props: any) => <LevelLayout {...props} />;

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
        
        const commonProps = {
            key: "detail-view",
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
                            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4">
                                <HeadphonesIcon />
                                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Course Library</span>
                            </motion.div>
                            <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-3xl md:text-5xl font-black text-white dark:text-gray-900 mb-2 tracking-tight">
                                Learning Path
                            </motion.h1>
                        </div>

                        <div className="relative w-full max-w-[1400px] h-[450px] md:h-[600px] flex items-center justify-center perspective-[2000px] touch-pan-y">
                            <button onClick={handlePrev} className="hidden md:flex absolute left-8 z-50 w-14 h-14 rounded-full bg-surface-secondary/80 hover:bg-white/10 border border-white/10 backdrop-blur-md items-center justify-center text-white transition-all hover:scale-110 active:scale-95"><ChevronLeftIcon /></button>
                            <button onClick={handleNext} className="hidden md:flex absolute right-8 z-50 w-14 h-14 rounded-full bg-surface-secondary/80 hover:bg-white/10 border border-white/10 backdrop-blur-md items-center justify-center text-white transition-all hover:scale-110 active:scale-95"><ChevronRightIcon /></button>

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
                                            onClick={() => {
                                                if (isActive) handleSelectBook();
                                                else if (offset > 0) handleNext();
                                                else handlePrev();
                                            }}
                                        />
                                    </motion.div>
                                );
                            })}
                        </div>
                        <div className="flex gap-4 mt-8 md:mt-12">
                            {SCHAUM_BOOKS.map((b, i) => (
                                <button key={b.id} onClick={() => setActiveIndex(i)} className={`h-1.5 rounded-full transition-all duration-500 ease-out ${i === activeIndex ? 'w-12 opacity-100' : 'w-2 opacity-30 hover:opacity-60 bg-gray-400'}`} style={{ backgroundColor: i === activeIndex ? b.accentColor : undefined }} />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* === DETAIL VIEW ROUTER === */}
                {viewMode === 'detail' && renderDetailView()}
            </AnimatePresence>
        </div>
    );
};
