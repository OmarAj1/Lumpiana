import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { CheckIcon, LightningIcon } from './Icons';
import { SchaumBookData } from '../constants';

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
                className="w-full h-full rounded-[2.5rem] relative preserve-3d border border-border-default rounded-3xl bg-surface-secondary overflow-hidden pointer-events-none"
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

export default TiltCard;