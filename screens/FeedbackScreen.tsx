import React from 'react';
import { RefreshIcon } from '../components/Icons';
import { AppState, Song } from '../types';

interface FeedbackScreenProps {
    score: number; // This is now a PERCENTAGE (0-100)
    misses: number;
    currentSong: Song;
    aiFeedback: string;
    startSong: (song: Song) => void;
    setAppState: (state: AppState) => void;
}

const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ score, misses, currentSong, aiFeedback, startSong, setAppState }) => {
  const totalNotes = currentSong.notes ? currentSong.notes.length : 0;
  const correctNotes = Math.max(0, totalNotes - misses); // Approximation if misses aren't strict, but logic in GameScreen handles misses

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-surface-primary text-white p-8">
        <div className="max-w-lg w-full text-center space-y-8">
            <div className={`w-32 h-32 mx-auto bg-gradient-to-br ${score >= 90 ? 'from-green-400 to-emerald-600' : score >= 70 ? 'from-yellow-400 to-orange-500' : 'from-gray-400 to-gray-600'} rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30 animate-scale-in`}>
                <span className="text-4xl font-bold">{score}%</span>
            </div>
            
            <div>
                <h2 className="text-4xl font-bold mb-2">{score >= 90 ? 'Masterful!' : score >= 70 ? 'Great Job!' : 'Keep Practicing'}</h2>
                <p className="text-xl text-text-secondary italic">"{aiFeedback}"</p>
            </div>

            <div className="grid grid-cols-3 gap-4 bg-white/5 dark:bg-surface-secondary rounded-2xl p-6 border border-white/10 dark:border-border-default">
                <div>
                    <p className="text-text-secondary text-xs uppercase font-bold">Accuracy</p>
                    <p className={`text-2xl font-mono ${score >= 90 ? 'text-green-400' : 'text-text-primary'}`}>{score}%</p>
                </div>
                <div>
                    <p className="text-text-secondary text-xs uppercase font-bold">Notes Hit</p>
                    <p className="text-2xl font-mono text-blue-400">{correctNotes}<span className="text-sm text-text-secondary">/{totalNotes}</span></p>
                </div>
                <div>
                    <p className="text-text-secondary text-xs uppercase font-bold">XP Gained</p>
                    <p className="text-2xl font-mono text-yellow-400">+{correctNotes * 10}</p>
                </div>
            </div>

            <div className="flex gap-4">
                <button onClick={() => startSong(currentSong)} className="flex-1 py-4 bg-white/10 dark:bg-surface-tertiary rounded-xl font-bold hover:bg-white/20 dark:hover:bg-surface-interactive transition-all flex items-center justify-center gap-2">
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