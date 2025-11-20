
import React from 'react';
import { RefreshIcon } from '../components/Icons';
import { AppState, Song } from '../types';

interface FeedbackScreenProps {
    score: number;
    misses: number;
    currentSong: Song;
    aiFeedback: string;
    startSong: (song: Song) => void;
    setAppState: (state: AppState) => void;
}

const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ score, misses, currentSong, aiFeedback, startSong, setAppState }) => {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-surface-primary text-white p-8">
        <div className="max-w-lg w-full text-center space-y-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30 animate-scale-in">
                <span className="text-5xl font-bold">{Math.round((score / (currentSong.notes.length * 100)) * 100)}%</span>
            </div>
            
            <div>
                <h2 className="text-4xl font-bold mb-2">Lesson Complete!</h2>
                <p className="text-xl text-gray-300 italic">"{aiFeedback}"</p>
            </div>

            <div className="grid grid-cols-3 gap-4 bg-white/5 rounded-2xl p-6 border border-white/10">
                <div>
                    <p className="text-gray-500 text-xs uppercase font-bold">Score</p>
                    <p className="text-2xl font-mono">{score}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-xs uppercase font-bold">Misses</p>
                    <p className="text-2xl font-mono text-red-400">{misses}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-xs uppercase font-bold">XP Gained</p>
                    <p className="text-2xl font-mono text-yellow-400">+{score}</p>
                </div>
            </div>

            <div className="flex gap-4">
                <button onClick={() => startSong(currentSong)} className="flex-1 py-4 bg-white/10 rounded-xl font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                    <RefreshIcon /> Replay
                </button>
                <button onClick={() => setAppState(AppState.MENU)} className="flex-1 py-4 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-all">
                    Continue
                </button>
            </div>
        </div>
    </div>
  );
};

export default FeedbackScreen;
    