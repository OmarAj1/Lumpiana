import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, PlayIcon, StarIcon } from './Icons';
import { Song, SongStats } from '../types';

interface SongListItemProps {
    song: Song;
    index: number;
    stats?: SongStats;
    bookColor: string;
    onPlay: () => void;
}

const SongListItem: React.FC<SongListItemProps> = ({ song, index, stats, bookColor, onPlay }) => {
    const isMastered = stats?.stars === 3;
    const hasPlayed = (stats?.timesPlayed || 0) > 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.05 }}
            className="group relative flex items-center gap-4 p-4 rounded-2xl bg-surface-secondary border border-border-default hover:border-transparent overflow-hidden transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl"
            onClick={onPlay}
        >
            <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"
                style={{ backgroundColor: bookColor }}
            />
            
            <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{ 
                    backgroundColor: isMastered ? bookColor : `${bookColor}20`, 
                    color: isMastered ? '#fff' : bookColor,
                    border: `1px solid ${bookColor}40`
                }}
            >
                {isMastered ? <CheckIcon /> : (index + 1)}
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-text-primary text-lg truncate group-hover:translate-x-1 transition-transform">
                    {song.title}
                </h4>
                <div className="flex items-center gap-2 text-sm text-text-secondary mt-1">
                    <span>{song.artist}</span>
                    {hasPlayed && (
                        <>
                            <span className="w-1 h-1 rounded-full bg-gray-600" />
                            <div className="flex items-center gap-0.5 text-yellow-500">
                                <span className="font-mono font-bold">{stats?.highScore}%</span>
                                {[1,2,3].map(s => <StarIcon key={s} filled={s <= (stats?.stars || 0)} />)}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                    <PlayIcon />
                </div>
            </div>
        </motion.div>
    );
};

export default SongListItem;